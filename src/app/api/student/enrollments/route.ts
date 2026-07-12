import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    const where: any = { userId }

    if (status === "completed") {
      where.completed = true
    } else if (status === "in_progress") {
      where.completed = false
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            categoryId: true,
            shortDescription: true,
            durationHours: true,
            difficultyLevel: true,
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: "desc" }
    })

    // Filter by category if specified
    let filteredEnrollments = enrollments
    if (category && category !== "all") {
      filteredEnrollments = enrollments.filter(
        e => e.course.category?.name === category
      )
    }

    // Get unique categories
    const categorySet = new Set<string>()
    enrollments.forEach(e => {
      if (e.course.category?.name) {
        categorySet.add(e.course.category.name)
      }
    })
    const categories = Array.from(categorySet)

    // Format enrollments with progress
    const enrollmentsWithProgress = filteredEnrollments.map(enrollment => ({
      id: enrollment.id,
      courseId: enrollment.courseId,
      course: enrollment.course,
      progressPercent: enrollment.progressPercent,
      completed: enrollment.completed,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt
    }))

    // Pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedEnrollments = enrollmentsWithProgress.slice(start, end)

    // Return data in original format
    return NextResponse.json({
      success: true,
      data: paginatedEnrollments,
      pagination: {
        page,
        limit,
        total: filteredEnrollments.length,
        totalPages: Math.ceil(filteredEnrollments.length / limit)
      },
      filters: { categories }
    })
  } catch (error) {
    console.error("Enrollments API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}
