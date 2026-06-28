import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/courses/[slug]/curriculum - Get course curriculum with modules and lessons
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const course = await prisma.course.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
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

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          isFree: course.isFree,
        },
        modules,
        totalLessons,
        totalDuration,
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