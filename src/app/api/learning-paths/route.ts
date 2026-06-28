import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/learning-paths - Get all published learning paths with courses
export async function GET() {
  try {
    const learningPaths = await prisma.learningPath.findMany({
      where: {
        isPublished: true
      },
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
          orderBy: {
            orderIndex: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transform response
    const transformedPaths = learningPaths.map((path: any) => ({
      id: path.id,
      title: path.title,
      slug: path.slug,
      subtitle: path.subtitle,
      description: path.description,
      thumbnailUrl: path.thumbnailUrl,
      difficultyLevel: path.difficultyLevel,
      estimatedHours: path.estimatedHours,
      totalCourses: path.pathCourses.length,
      requiredCourses: path.pathCourses.filter((pc: any) => pc.isRequired).length,
      courses: path.pathCourses.map((pc: any) => ({
        id: pc.course.id,
        title: pc.course.title,
        slug: pc.course.slug,
        thumbnailUrl: pc.course.thumbnailUrl,
        price: pc.course.price,
        isFree: pc.course.isFree,
        orderIndex: pc.orderIndex,
        isRequired: pc.isRequired,
        stepTitle: pc.stepTitle,
        totalLessons: pc.course._count.lessons,
        durationHours: pc.course.durationHours
      }))
    }))

    return NextResponse.json({ learningPaths: transformedPaths })
  } catch (error) {
    console.error("Error fetching learning paths:", error)
    return NextResponse.json(
      { error: "Failed to fetch learning paths" },
      { status: 500 }
    )
  }
}