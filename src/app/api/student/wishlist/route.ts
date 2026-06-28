import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/wishlist - Get user's wishlist courses
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // Get user's wishlist courses
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            category: true,
            shortDescription: true,
            durationHours: true,
            difficultyLevel: true,
            price: true,
            isFree: true,
            modules: {
              include: {
                lessons: {
                  select: { id: true }
                }
              }
            }
          }
        }
      },
      orderBy: { addedAt: "desc" }
    })

    // Calculate total lessons for each course
    const wishlistWithMeta = wishlistItems.map(item => ({
      id: item.id,
      courseId: item.course.id,
      addedAt: item.addedAt,
      course: {
        ...item.course,
        totalLessons: item.course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)
      }
    }))

    // Pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedWishlist = wishlistWithMeta.slice(start, end)

    return NextResponse.json({
      success: true,
      data: {
        wishlist: paginatedWishlist,
        pagination: {
          page,
          limit,
          total: wishlistItems.length,
          totalPages: Math.ceil(wishlistItems.length / limit)
        }
      }
    })
  } catch (error) {
    console.error("Wishlist API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

// POST /api/student/wishlist - Toggle course in wishlist
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    })

    let result
    if (existingItem) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: { id: existingItem.id }
      })
      result = { action: "removed", inWishlist: false }
    } else {
      // Add to wishlist
      const newItem = await prisma.wishlist.create({
        data: {
          userId,
          courseId
        }
      })
      result = { action: "added", inWishlist: true, id: newItem.id }
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error("Wishlist toggle error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update wishlist" },
      { status: 500 }
    )
  }
}