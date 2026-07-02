import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/student/wishlist - Get user's wishlist courses
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  console.log("===========================================")
  console.log("[WISHLIST API] GET request received")
  console.log("[WISHLIST API] URL:", request.url)
  console.log("[WISHLIST API] Method:", request.method)
  
  try {
    // Get userId from session or header
    const session = await getServerSession(authOptions)
    console.log("[WISHLIST API] Session:", session ? `User: ${session.user?.email}, ID: ${session.user?.id}` : "No session")
    
    const headerUserId = request.headers.get("x-user-id")
    console.log("[WISHLIST API] x-user-id header:", headerUserId || "Not provided")
    
    const userId = session?.user?.id || headerUserId || "demo-user-id"
    console.log("[WISHLIST API] Final userId:", userId)
    
    // Validate UUID format (only if it's not the demo user)
    if (userId !== "demo-user-id") {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        console.log("[WISHLIST API] ERROR: Invalid UUID format:", userId)
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid user session",
            technicalError: `Invalid user ID format: ${userId}`
          },
          { status: 401 }
        )
      }
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    console.log("[WISHLIST API] Pagination - page:", page, "limit:", limit)

    console.log("[WISHLIST API] Executing Prisma query: prisma.wishlist.findMany...")
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
    console.log("[WISHLIST API] Query SUCCESS. Found items:", wishlistItems.length)

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

    console.log("[WISHLIST API] Returning success with", paginatedWishlist.length, "items")
    console.log("===========================================")
    
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
  } catch (error: any) {
    console.error("===========================================")
    console.error("[WISHLIST API] ERROR CAUGHT!")
    console.error("[WISHLIST API] Request URL:", request.url)
    console.error("[WISHLIST API] Error name:", error?.name)
    console.error("[WISHLIST API] Error message:", error?.message)
    console.error("[WISHLIST API] Prisma Error code:", error?.code)
    console.error("[WISHLIST API] Full stack trace:")
    console.error(error?.stack)
    console.error("===========================================")
    
    // Check for specific Prisma errors
    if (error?.code === 'P1001') {
      console.error("[WISHLIST API] Returning HTTP 503 - Database server not reachable")
      return NextResponse.json(
        { 
          success: false, 
          error: "Database server not reachable",
          technicalError: "Cannot connect to database server. Please check DATABASE_URL configuration."
        },
        { status: 503 }
      )
    }
    
    if (error?.code === 'P2025') {
      console.error("[WISHLIST API] Returning HTTP 500 - Table not found")
      return NextResponse.json(
        { 
          success: false, 
          error: "Database table not found",
          technicalError: "The wishlists table does not exist. Please run: npx prisma db push"
        },
        { status: 500 }
      )
    }
    
    console.error("[WISHLIST API] Returning HTTP 500 - Internal error")
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch wishlist",
        technicalError: `${error?.code || 'ERROR'}: ${error?.message}`,
        errorDetails: {
          message: error?.message,
          code: error?.code,
          stack: error?.stack
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/student/wishlist - Toggle course in wishlist
export async function POST(request: NextRequest) {
  console.log("[WISHLIST API] POST request received")
  
  try {
    // Get userId from session or header
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || request.headers.get("x-user-id") || "demo-user-id"
    console.log("[WISHLIST API] POST userId:", userId)
    
    // Validate UUID format (only if it's not the demo user)
    if (userId !== "demo-user-id") {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid user session",
            technicalError: `Invalid user ID format: ${userId}`
          },
          { status: 401 }
        )
      }
    }
    
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
  } catch (error: any) {
    console.error("[WISHLIST API] POST ERROR:", error?.message)
    console.error("[WISHLIST API] POST Error code:", error?.code)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update wishlist",
        technicalError: `${error?.code || 'ERROR'}: ${error?.message}`,
        errorDetails: {
          message: error?.message,
          code: error?.code,
          stack: error?.stack?.substring(0, 500)
        }
      },
      { status: 500 }
    )
  }
}