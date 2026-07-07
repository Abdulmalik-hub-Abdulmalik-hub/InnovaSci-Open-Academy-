import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/mccs/courses - Get all courses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const categoryId = searchParams.get("categoryId") || ""
  const status = searchParams.get("status") || ""

  try {
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (status && status !== "all") {
      where.status = status
    }

    const [courses, total, categories] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: true,
          modules: {
            include: {
              lessons: {
                where: { isActive: true }
              }
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.course.count({ where }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { orderIndex: 'asc' }
      })
    ])

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      status: course.status,
      category: course.category?.name || null,
      categoryId: course.categoryId,
      price: Number(course.price),
      isFree: course.isFree,
      isActive: course.isActive,
      thumbnailUrl: course.thumbnailUrl,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      stats: {
        enrollments: course._count.enrollments,
        modules: course.modules.length,
        lessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters: {
          categories
        }
      }
    })
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch courses"
    }, { status: 500 })
  }
}

// POST /api/mccs/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, categoryId, shortDescription, fullDescription, price, isFree, status } = body

    if (!title || !slug || !categoryId) {
      return NextResponse.json({
        success: false,
        error: "Title, slug, and category are required"
      }, { status: 400 })
    }

    // Check slug uniqueness
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return NextResponse.json({
        success: false,
        error: "A course with this slug already exists"
      }, { status: 409 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        categoryId,
        shortDescription: shortDescription || "",
        fullDescription: fullDescription || "",
        price: isFree ? 0 : (price || 0),
        isFree: isFree ?? true,
        status: status || "DRAFT",
        isActive: true,
        language: "English",
        durationHours: 0,
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          status: course.status,
          category: course.category?.name || null,
        }
      },
      message: "Course created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create course"
    }, { status: 500 })
  }
}
