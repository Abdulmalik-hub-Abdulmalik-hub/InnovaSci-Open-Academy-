import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/courses - List all courses
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }).catch(() => [])

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      status: course.status,
      difficultyLevel: course.difficultyLevel,
      price: course.price,
      isFree: course.isFree,
      thumbnailUrl: course.thumbnailUrl,
      enrollments: course._count.enrollments,
      totalLessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      createdAt: course.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedCourses,
      total: formattedCourses.length
    })
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json({
      success: false,
      error: "Database not ready",
      data: [],
      total: 0
    })
  }
}
