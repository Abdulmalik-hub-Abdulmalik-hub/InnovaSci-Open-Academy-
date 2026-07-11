import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Helper to check if error is a Prisma initialization error
function isPrismaInitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('prismaclientinitializationerror') ||
      message.includes('database_url') ||
      message.includes("can't reach database") ||
      message.includes('connection refused') ||
      message.includes('invalid datasource url')
    )
  }
  return false
}

// GET /api/learning-paths/[slug] - Get single learning path with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const learningPath = await prisma.learningPath.findFirst({
      where: {
        slug: slug,
        isPublished: true,
        isActive: true
      },
      include: {
        pathCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortDescription: true,
                fullDescription: true,
                thumbnailUrl: true,
                price: true,
                isFree: true,
                durationHours: true,
                difficultyLevel: true,
                categoryId: true,
                introVideoUrl: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    color: true,
                    bannerUrl: true,
                    domain: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                        shortDescription: true,
                        fullDescription: true,
                        color: true,
                        icon: true,
                        bannerUrl: true
                      }
                    }
                  }
                },
                modules: {
                  where: { courseId: { not: undefined } },
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    orderIndex: true,
                    _count: {
                      select: { lessons: true }
                    }
                  },
                  orderBy: { orderIndex: "asc" }
                },
                _count: {
                  select: { 
                    lessons: true,
                    enrollments: true
                  }
                }
              }
            }
          },
          orderBy: {
            orderIndex: "asc"
          }
        }
      }
    })

    if (!learningPath) {
      return NextResponse.json(
        { 
          success: false,
          error: "Learning path not found" 
        },
        { status: 404 }
      )
    }

    // Extract unique domains and categories from courses
    const domainsMap = new Map()
    const categoriesMap = new Map()
    const difficultyLevelsSet = new Set()
    let totalLessons = 0
    let totalDuration = 0
    let totalEnrollments = 0
    
    learningPath.pathCourses.forEach((pc: any) => {
      const course = pc.course
      totalLessons += course._count.lessons
      totalDuration += course.durationHours || 0
      totalEnrollments += course._count.enrollments
      
      if (course.category?.domain) {
        domainsMap.set(course.category.domain.id, course.category.domain)
        difficultyLevelsSet.add(course.difficultyLevel)
      }
      if (course.category) {
        categoriesMap.set(course.category.id, {
          ...course.category,
          domain: course.category.domain
        })
      }
    })

    // Transform response with full hierarchy
    const transformedPath = {
      id: learningPath.id,
      title: learningPath.title,
      slug: learningPath.slug,
      subtitle: learningPath.subtitle,
      description: learningPath.description,
      thumbnailUrl: learningPath.thumbnailUrl,
      difficultyLevel: learningPath.difficultyLevel,
      estimatedHours: learningPath.estimatedHours,
      totalCourses: learningPath.pathCourses.length,
      requiredCourses: learningPath.pathCourses.filter((pc: any) => pc.isRequired).length,
      totalLessons,
      totalDuration,
      totalEnrollments,
      domains: Array.from(domainsMap.values()),
      categories: Array.from(categoriesMap.values()),
      difficultyLevels: Array.from(difficultyLevelsSet),
      courses: learningPath.pathCourses.map((pc: any) => {
        const course = pc.course
        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          shortDescription: course.shortDescription,
          thumbnailUrl: course.thumbnailUrl,
          price: Number(course.price),
          isFree: course.isFree,
          orderIndex: pc.orderIndex,
          isRequired: pc.isRequired,
          stepTitle: pc.stepTitle,
          totalLessons: course._count.lessons,
          durationHours: course.durationHours,
          difficultyLevel: course.difficultyLevel,
          enrollments: course._count.enrollments,
          introVideoUrl: course.introVideoUrl,
          modules: course.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            orderIndex: m.orderIndex,
            lessonsCount: m._count.lessons
          })),
          category: course.category ? {
            id: course.category.id,
            name: course.category.name,
            slug: course.category.slug,
            description: course.category.description,
            color: course.category.color,
            bannerUrl: course.category.bannerUrl,
            domain: course.category.domain
          } : null
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      data: { learningPath: transformedPath }
    })
  } catch (error) {
    console.error("Error fetching learning path:", error)
    
    if (isPrismaInitError(error)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Database connection unavailable. Please check server configuration."
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch learning path"
      },
      { status: 500 }
    )
  }
}
