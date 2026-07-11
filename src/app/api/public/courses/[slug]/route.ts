import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/courses/[slug] - Get single course by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { enrollments: true, lessons: true }
        },
        category: {
          include: {
            domain: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                icon: true
              }
            }
          }
        },
        modules: {
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
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Calculate total duration
    const totalDuration = course.modules.reduce((acc, module) => {
      return acc + module.lessons.reduce((lessonAcc, lesson) => {
        return lessonAcc + (lesson.duration || 0)
      }, 0)
    }, 0)

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        categoryName: course.category?.name || null,
        categoryId: course.categoryId,
        domain: course.category?.domain ? {
          id: course.category.domain.id,
          name: course.category.domain.name,
          slug: course.category.domain.slug,
          color: course.category.domain.color,
          icon: course.category.domain.icon
        } : null,
        domainId: course.category?.domainId,
        totalLessons: course._count.lessons,
        totalEnrollments: course._count.enrollments,
        totalDuration,
        lessons: course.modules.flatMap(m => m.lessons),
        modules: course.modules.map(m => ({
          ...m,
          lessonCount: m.lessons.length,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}