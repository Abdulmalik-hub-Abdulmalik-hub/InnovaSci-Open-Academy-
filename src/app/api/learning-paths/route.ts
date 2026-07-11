import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route uses request.url for search params
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

// GET /api/learning-paths - Get all published learning paths with courses and full hierarchy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get("domainId")
    const categoryId = searchParams.get("categoryId")
    const difficultyLevel = searchParams.get("difficultyLevel")
    const searchQuery = searchParams.get("q")

    // Build where clause for learning paths
    const where: any = {
      isPublished: true,
      isActive: true
    }

    // If filtering by domain or category, we need to filter courses that belong to those
    if (domainId || categoryId || difficultyLevel || searchQuery) {
      where.pathCourses = {
        some: {
          course: {
            isActive: true,
            status: "published"
          }
        }
      }
      
      if (domainId) {
        where.pathCourses.some.course.category = {
          domainId: domainId
        }
      }
      
      if (categoryId) {
        where.pathCourses.some.course.categoryId = categoryId
      }
      
      if (difficultyLevel) {
        where.pathCourses.some.course.difficultyLevel = difficultyLevel
      }
      
      if (searchQuery) {
        where.pathCourses.some.course.OR = [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { shortDescription: { contains: searchQuery, mode: 'insensitive' } }
        ]
      }
    }

    const learningPaths = await prisma.learningPath.findMany({
      where,
      include: {
        pathCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortDescription: true,
                thumbnailUrl: true,
                price: true,
                isFree: true,
                durationHours: true,
                difficultyLevel: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
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
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transform response with full hierarchy
    const transformedPaths = learningPaths.map((path: any) => {
      // Extract unique domains and categories from courses
      const domainsMap = new Map()
      const categoriesMap = new Map()
      const difficultyLevelsSet = new Set()
      
      path.pathCourses.forEach((pc: any) => {
        const course = pc.course
        if (course.category?.domain) {
          domainsMap.set(course.category.domain.id, course.category.domain)
          difficultyLevelsSet.add(course.difficultyLevel)
        }
        if (course.category) {
          categoriesMap.set(course.category.id, course.category)
        }
      })
      
      return {
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
        domains: Array.from(domainsMap.values()),
        categories: Array.from(categoriesMap.values()),
        difficultyLevels: Array.from(difficultyLevelsSet),
        courses: path.pathCourses.map((pc: any) => ({
          id: pc.course.id,
          title: pc.course.title,
          slug: pc.course.slug,
          shortDescription: pc.course.shortDescription,
          thumbnailUrl: pc.course.thumbnailUrl,
          price: Number(pc.course.price),
          isFree: pc.course.isFree,
          orderIndex: pc.orderIndex,
          isRequired: pc.isRequired,
          stepTitle: pc.stepTitle,
          totalLessons: pc.course._count.lessons,
          durationHours: pc.course.durationHours,
          difficultyLevel: pc.course.difficultyLevel,
          enrollments: pc.course._count.enrollments,
          category: pc.course.category ? {
            id: pc.course.category.id,
            name: pc.course.category.name,
            slug: pc.course.category.slug,
            color: pc.course.category.color,
            domain: pc.course.category.domain
          } : null
        }))
      }
    })

    return NextResponse.json({ 
      success: true,
      data: { 
        learningPaths: transformedPaths,
        total: transformedPaths.length
      } 
    })
  } catch (error) {
    console.error("Error fetching learning paths:", error)
    
    // Provide specific error message for database connection issues
    if (isPrismaInitError(error)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Database connection unavailable. Please check server configuration.",
          data: { learningPaths: [] }
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch learning paths",
        data: { learningPaths: [] }
      },
      { status: 500 }
    )
  }
}