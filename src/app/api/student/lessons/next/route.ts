import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/lessons/next - Get the next lesson after the current one
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const { searchParams } = new URL(request.url)
    const currentLessonId = searchParams.get("lessonId")
    const courseId = searchParams.get("courseId")

    if (!currentLessonId || !courseId) {
      return NextResponse.json(
        { success: false, error: "lessonId and courseId are required" },
        { status: 400 }
      )
    }

    // Get the current lesson with its module and order
    const currentLesson = await prisma.lesson.findFirst({
      where: { id: currentLessonId },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    })

    if (!currentLesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      )
    }

    // Get all modules for this course ordered by orderIndex
    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" }
        }
      }
    })

    // Flatten all lessons with their module info
    const allLessons = modules.flatMap(module => 
      module.lessons.map(lesson => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
        moduleOrder: module.orderIndex
      }))
    )

    // Find current lesson index
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId)

    if (currentIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Lesson not found in course" },
        { status: 404 }
      )
    }

    // Check if there's a next lesson
    if (currentIndex >= allLessons.length - 1) {
      return NextResponse.json({
        success: true,
        data: {
          hasNextLesson: false,
          nextLesson: null,
          isLastLesson: true
        }
      })
    }

    // Get the next lesson
    const nextLesson = allLessons[currentIndex + 1]

    // Check if user has access (enrolled in course or lesson is preview)
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })

    if (!enrollment && !nextLesson.isPreview) {
      return NextResponse.json(
        { success: false, error: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        hasNextLesson: true,
        nextLesson: {
          id: nextLesson.id,
          title: nextLesson.title,
          description: nextLesson.description,
          duration: nextLesson.duration,
          lessonType: nextLesson.lessonType,
          videoUrl: nextLesson.videoUrl,
          isPreview: nextLesson.isPreview,
          moduleId: nextLesson.moduleId,
          moduleTitle: nextLesson.moduleTitle,
          orderIndex: nextLesson.orderIndex
        },
        isLastLesson: false
      }
    })
  } catch (error) {
    console.error("Next lesson API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch next lesson" },
      { status: 500 }
    )
  }
}