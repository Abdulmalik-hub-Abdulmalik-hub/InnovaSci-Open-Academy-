import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';

// Helper to check if error is a Prisma initialization error
function isPrismaInitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('prismaclientinitializationerror') ||
      message.includes('database_url') ||
      message.includes("can't reach database") ||
      message.includes('connection refused') ||
      message.includes('invalid datasource url')
    )
  }
  return false
}

// GET /api/student/learning-paths - Get user's learning paths with progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please log in." },
        { status: 401 }
      )
    }
    
    const userId = session.user.id

    // Fetch all published learning paths with pathCourses
    const learningPaths = await prisma.learningPath.findMany({
      where: { isPublished: true },
      include: {
        pathCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
                price: true,
                isFree: true,
                durationHours: true,
                _count: {
                  select: { lessons: true }
                }
              }
            }
          },
          orderBy: { orderIndex: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Get enrollment data for each course
    const courseIds = learningPaths.flatMap(p => p.pathCourses.map(c => c.courseId))
    const enrolledCourses = await prisma.enrollment.findMany({
      where: {
        userId,
        courseId: { in: courseIds }
      }
    })

    const enrolledMap = new Map(enrolledCourses.map(e => [e.courseId, e]))

    // Transform paths with progress
    const learningPathsWithProgress = learningPaths.map((path: any) => {
      const coursesWithStatus = path.pathCourses.map((lpCourse: any) => {
        const enrollment = enrolledMap.get(lpCourse.courseId)
        return {
          id: lpCourse.course.id,
          title: lpCourse.course.title,
          slug: lpCourse.course.slug,
          thumbnailUrl: lpCourse.course.thumbnailUrl,
          price: lpCourse.course.price,
          isFree: lpCourse.course.isFree,
          orderIndex: lpCourse.orderIndex,
          isRequired: lpCourse.isRequired,
          stepTitle: lpCourse.stepTitle,
          totalLessons: lpCourse.course._count.lessons,
          durationHours: lpCourse.course.durationHours,
          enrolled: !!enrollment,
          progressPercent: enrollment?.progressPercent || 0,
          completed: !!enrollment?.completedAt
        }
      })

      const completedCount = coursesWithStatus.filter((c: any) => c.completed).length
      const totalCount = coursesWithStatus.length
      const enrolledCount = coursesWithStatus.filter((c: any) => c.enrolled).length
      const overallProgress = totalCount > 0 
        ? Math.round((completedCount / totalCount) * 100)
        : 0

      return {
        id: path.id,
        title: path.title,
        slug: path.slug,
        subtitle: path.subtitle,
        description: path.description,
        thumbnailUrl: path.thumbnailUrl,
        difficultyLevel: path.difficultyLevel,
        estimatedHours: path.estimatedHours,
        courses: coursesWithStatus,
        stats: {
          totalCourses: totalCount,
          completedCourses: completedCount,
          enrolledCourses: enrolledCount,
          overallProgress,
          isCompleted: completedCount === totalCount && totalCount > 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { learningPaths: learningPathsWithProgress }
    })
  } catch (error) {
    console.error("Learning paths API error:", error)
    
    // Provide specific error message for database connection issues
    if (isPrismaInitError(error)) {
      return NextResponse.json(
        { success: false, error: "Database connection unavailable. Please check server configuration." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch learning paths" },
      { status: 500 }
    )
  }
}
