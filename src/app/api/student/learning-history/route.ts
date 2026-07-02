import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/student/learning-history - Get user's learning history with progress
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  console.log("===========================================")
  console.log("[LEARNING-HISTORY API] GET request received")
  console.log("[LEARNING-HISTORY API] URL:", request.url)
  console.log("[LEARNING-HISTORY API] Method:", request.method)
  
  try {
    // Get userId from session
    const session = await getServerSession(authOptions)
    console.log("[LEARNING-HISTORY API] Session:", session ? `User: ${session.user?.email}, ID: ${session.user?.id}` : "No session")
    
    if (!session?.user?.id) {
      console.log("[LEARNING-HISTORY API] ERROR: No valid session found")
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication required",
          technicalError: "Please log in to access your learning history"
        },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    console.log("[LEARNING-HISTORY API] userId:", userId)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    console.log("[LEARNING-HISTORY API] Pagination - page:", page, "limit:", limit)

    console.log("[LEARNING-HISTORY API] Executing Prisma query: prisma.userLectureProgress.findMany...")
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
    console.log("[LEARNING-HISTORY API] Found progress records:", userProgress.length)

    // Get unique course IDs from progress
    const courseIds = Array.from(new Set(userProgress.map(p => p.courseId)))
    console.log("[LEARNING-HISTORY API] Unique course IDs:", courseIds.length)

    if (courseIds.length === 0) {
      console.log("[LEARNING-HISTORY API] No progress found, returning empty history")
      console.log("===========================================")
      return NextResponse.json({
        success: true,
        data: {
          history: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        }
      })
    }

    console.log("[LEARNING-HISTORY API] Executing Prisma query: prisma.course.findMany...")
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
    console.log("[LEARNING-HISTORY API] Found courses:", courses.length)

    console.log("[LEARNING-HISTORY API] Executing Prisma query: prisma.userLectureProgress.groupBy...")
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
    console.log("[LEARNING-HISTORY API] Completed counts:", completedCounts.length)

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

    console.log("[LEARNING-HISTORY API] Returning success with", paginatedHistory.length, "items")
    console.log("===========================================")
    
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
  } catch (error: any) {
    console.error("===========================================")
    console.error("[LEARNING-HISTORY API] ERROR CAUGHT!")
    console.error("[LEARNING-HISTORY API] Request URL:", request.url)
    console.error("[LEARNING-HISTORY API] Error name:", error?.name)
    console.error("[LEARNING-HISTORY API] Error message:", error?.message)
    console.error("[LEARNING-HISTORY API] Prisma Error code:", error?.code)
    console.error("[LEARNING-HISTORY API] Full stack trace:")
    console.error(error?.stack)
    console.error("===========================================")
    
    // Check for specific Prisma errors
    if (error?.code === 'P2025') {
      console.error("[LEARNING-HISTORY API] Returning HTTP 500 - Table not found")
      return NextResponse.json(
        { 
          success: false, 
          error: "Database table not found",
          technicalError: "The userLectureProgress table does not exist. Please run: npx prisma db push"
        },
        { status: 500 }
      )
    }
    
    console.error("[LEARNING-HISTORY API] Returning HTTP 500 - Internal error")
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch learning history",
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