import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/courses/[slug]/curriculum - Get course curriculum with enrollment status
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    // Get course with modules and lessons
    const course = await prisma.course.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        isFree: true,
        price: true,
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Check if user is enrolled (if userId provided)
    let isEnrolled = false
    let enrollment = null
    
    if (userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      })
      isEnrolled = !!enrollment
    }

    // If course is free, it's accessible to everyone
    const isAccessible = course.isFree || isEnrolled

    // Get curriculum
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

    // If enrolled or course is free, return full curriculum
    // If not enrolled, mark non-free lessons as locked
    const curriculum = {
      modules: modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        lessons: module.lessons.map(lesson => ({
          ...lesson,
          isAccessible: lesson.isFree || isAccessible,
        })),
      })),
      totalLessons,
      totalDuration,
    }

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          isFree: course.isFree,
          price: course.price,
        },
        isEnrolled: isAccessible,
        enrollment: enrollment ? {
          progressPercent: enrollment.progressPercent,
          completed: enrollment.completed,
          enrolledAt: enrollment.enrolledAt,
        } : null,
        curriculum,
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