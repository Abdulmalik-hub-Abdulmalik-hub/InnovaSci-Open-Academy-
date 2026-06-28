import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/learning-history - Get user's learning history with progress
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // Get all courses the user has any progress in
    const userProgress = await prisma.userLectureProgress.findMany({
      where: { userId },
      select: {
        courseId: true,
        lessonId: true,
        completed: true
      },
      orderBy: { updatedAt: "desc" }
    })

    // Get unique course IDs from progress
    const courseIds = Array.from(new Set(userProgress.map(p => p.courseId)))

    if (courseIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          history: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        }
      })
    }

    // Fetch all course data in one query
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        category: true,
        shortDescription: true,
        durationHours: true,
        difficultyLevel: true,
        lessons: {
          select: { id: true, orderIndex: true },
          orderBy: { orderIndex: "asc" }
        }
      }
    })

    // Count completed lessons per course in one query
    const completedCounts = await prisma.userLectureProgress.groupBy({
      by: ["courseId"],
      where: {
        userId,
        courseId: { in: courseIds },
        completed: true
      },
      _count: { lessonId: true }
    })

    // Create a map for quick lookup
    const completedMap = new Map(completedCounts.map(c => [c.courseId, c._count.lessonId]))

    // Get the next lesson for each course
    const progressMap = new Map(userProgress.map(p => [`${p.courseId}-${p.lessonId}`, p.completed]))

    // Build the history with all data
    const history = courses.map(course => {
      const totalLessons = course.lessons.length
      const completedLessons = completedMap.get(course.id) || 0
      const progressPercent = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0

      // Find the next uncompleted lesson
      let nextLesson = null
      let isCompleted = false

      if (totalLessons > 0) {
        const nextLessonData = course.lessons.find(lesson => {
          const progressKey = `${course.id}-${lesson.id}`
          return !progressMap.get(progressKey)
        })

        if (nextLessonData) {
          nextLesson = {
            id: nextLessonData.id,
            orderIndex: nextLessonData.orderIndex
          }
        } else {
          // All lessons completed
          isCompleted = true
          nextLesson = {
            id: course.lessons[course.lessons.length - 1].id,
            orderIndex: course.lessons[course.lessons.length - 1].orderIndex
          }
        }
      }

      // Get last activity time
      const lastActivity = userProgress
        .filter(p => p.courseId === course.id)
        .sort((a, b) => b.lessonId.localeCompare(a.lessonId))[0]

      return {
        courseId: course.id,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          thumbnailUrl: course.thumbnailUrl,
          category: course.category,
          shortDescription: course.shortDescription,
          durationHours: course.durationHours,
          difficultyLevel: course.difficultyLevel,
          totalLessons
        },
        completedLessons,
        progressPercent,
        isCompleted,
        nextLessonId: nextLesson?.id || null,
        lastActivity: lastActivity ? true : false
      }
    })

    // Sort by progress (most recent activity first)
    history.sort((a, b) => {
      if (a.progressPercent !== b.progressPercent) {
        return b.progressPercent - a.progressPercent
      }
      return 0
    })

    // Paginate
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedHistory = history.slice(start, end)

    return NextResponse.json({
      success: true,
      data: {
        history: paginatedHistory,
        pagination: {
          page,
          limit,
          total: history.length,
          totalPages: Math.ceil(history.length / limit)
        }
      }
    })
  } catch (error) {
    console.error("Learning History API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch learning history" },
      { status: 500 }
    )
  }
}