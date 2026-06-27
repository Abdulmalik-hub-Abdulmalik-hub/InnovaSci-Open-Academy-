import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/learning-paths - Get user's learning paths with progress
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"

    // Fetch all learning paths
    const learningPaths = await prisma.learningPath.findMany({
      include: {
        pathCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                slug: true,
                durationHours: true
              }
            }
          },
          orderBy: { orderIndex: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Get enrollment data for each course
    const learningPathsWithProgress = await Promise.all(
      learningPaths.map(async (path) => {
        const enrolledCourses = await prisma.enrollment.findMany({
          where: {
            userId,
            courseId: { in: path.pathCourses.map(c => c.courseId) }
          }
        })

        const enrolledMap = new Map(
          enrolledCourses.map(e => [e.courseId, e])
        )

        const coursesWithStatus = path.pathCourses.map(lpCourse => {
          const enrollment = enrolledMap.get(lpCourse.courseId)
          return {
            ...lpCourse.course,
            enrolled: !!enrollment,
            progressPercent: enrollment?.progressPercent || 0,
            completed: enrollment?.completed || false
          }
        })

        const completedCount = coursesWithStatus.filter(c => c.completed).length
        const totalCount = coursesWithStatus.length
        const overallProgress = totalCount > 0 
          ? Math.round(coursesWithStatus.reduce((acc, c) => acc + c.progressPercent, 0) / totalCount)
          : 0

        return {
          id: path.id,
          title: path.name,
          description: path.description,
          thumbnailUrl: path.thumbnailUrl,
          courses: coursesWithStatus,
          stats: {
            totalCourses: totalCount,
            completedCourses: completedCount,
            enrolledCourses: coursesWithStatus.filter(c => c.enrolled).length,
            overallProgress
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: { learningPaths: learningPathsWithProgress }
    })
  } catch (error) {
    console.error("Learning paths API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch learning paths" },
      { status: 500 }
    )
  }
}
