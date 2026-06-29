import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/courses/[slug]/curriculum - Get course curriculum with modules and lessons
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const course = await prisma.course.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        introVideoUrl: true,
        isFree: true,
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Get all modules with lessons for this course
    const modules = await prisma.module.findMany({
      where: { courseId: course.id },
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            orderIndex: true,
            lessonType: true,
            duration: true,
            videoUrl: true,
            isPreview: true,
            isFree: true,
            // Include exercise fields
            isExercise: true,
            exerciseDescription: true,
            exerciseFilesUrl: true,
            solutionVideoUrl: true,
          },
        },
      },
    })

    // Calculate total duration
    const totalDuration = modules.reduce((acc, module) => {
      return acc + module.lessons.reduce((lessonAcc, lesson) => {
        return lessonAcc + (lesson.duration || 0)
      }, 0)
    }, 0)

    const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0)

    // Format for course player page
    const formattedModules = modules.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      orderIndex: m.orderIndex,
      lessonsCount: m.lessons.length,
      lessons: m.lessons.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        orderIndex: l.orderIndex,
        lessonType: l.lessonType,
        duration: l.duration,
        videoUrl: l.videoUrl,
        isPreview: l.isPreview,
        completed: false, // Will be set based on enrollment
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        id: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        introVideoUrl: course.introVideoUrl,
        totalLessons,
        completedLessons: 0,
        curriculum: {
          modules: formattedModules,
          totalLessons,
          totalDuration,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching curriculum:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch curriculum" },
      { status: 500 }
    )
  }
}