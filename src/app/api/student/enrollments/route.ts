import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/enrollments - Get user's enrolled courses
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") // all, in_progress, completed
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
            category: true,
            shortDescription: true,
            durationHours: true,
            difficultyLevel: true,
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
      orderBy: { enrolledAt: "desc" }
    })

    // Filter by category if specified
    let filteredEnrollments = enrollments
    if (category && category !== "all") {
      filteredEnrollments = enrollments.filter(
        e => e.course.category?.name === category
      )
    }

    // Calculate progress and add metadata
    const enrollmentsWithProgress = await Promise.all(
      filteredEnrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course.modules.reduce(
          (acc, mod) => acc + mod.lessons.length,
          0
        )
        
        const completedLessons = await prisma.learningProgress.count({
          where: {
            userId,
            courseId: enrollment.courseId,
            completed: true
          }
        })

        // Calculate actual progress
        const actualProgress = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100)
          : enrollment.progressPercent

        return {
          id: enrollment.id,
          courseId: enrollment.courseId,
          course: {
            ...enrollment.course,
            totalLessons,
            completedLessons
          },
          progressPercent: actualProgress,
          completed: enrollment.completed,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt
        }
      })
    )

    // Pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedEnrollments = enrollmentsWithProgress.slice(start, end)

    // Get unique categories from enrollments
    const categorySet = new Set<string>()
    enrollments.forEach(e => {
      if (e.course.category?.name) categorySet.add(e.course.category.name)
    })
    const categories = Array.from(categorySet)

    return NextResponse.json({
      success: true,
      data: {
        enrollments: paginatedEnrollments,
        pagination: {
          page,
          limit,
          total: filteredEnrollments.length,
          totalPages: Math.ceil(filteredEnrollments.length / limit)
        },
        filters: { categories }
      }
    })
  } catch (error) {
    console.error("Enrollments API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}
