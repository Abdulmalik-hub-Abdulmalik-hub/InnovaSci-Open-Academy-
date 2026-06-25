import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/courses - Get all courses with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const category = searchParams.get("category") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }
    
    if (status !== "all") {
      where.status = status
    }
    
    if (category) {
      where.category = category
    }

    // Fetch courses and count in parallel
    const [courses, total, categories] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          modules: {
            include: {
              _count: {
                select: { lessons: true }
              }
            }
          },
          _count: {
            select: { enrollments: true, wishlists: true }
          },
          enrollments: {
            where: { completed: true },
            select: { id: true }
          }
        }
      }),
      prisma.course.count({ where }),
      prisma.course.findMany({
        select: { category: true },
        distinct: ["category"],
        where: { category: { not: null } }
      })
    ])

    // Transform data
    const transformedCourses = courses.map((course: {
      id: string;
      title: string;
      slug: string;
      category: string | null;
      subcategory: string | null;
      shortDescription: string | null;
      price: unknown;
      isFree: boolean;
      status: string;
      thumbnailUrl: string | null;
      difficultyLevel: string | null;
      durationHours: number | null;
      language: string | null;
      createdAt: Date;
      updatedAt: Date;
      modules: { _count: { lessons: number } }[];
      enrollments: unknown[];
      _count: { enrollments: number; wishlists: number };
    }) => {
      const totalLessons = course.modules.reduce((acc, m) => acc + m._count.lessons, 0)
      const completedEnrollments = course.enrollments.length
      
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        category: course.category,
        subcategory: course.subcategory,
        shortDescription: course.shortDescription,
        price: Number(course.price),
        isFree: course.isFree,
        status: course.status,
        thumbnailUrl: course.thumbnailUrl,
        difficultyLevel: course.difficultyLevel,
        durationHours: course.durationHours,
        language: course.language,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        stats: {
          enrollments: course._count.enrollments,
          completed: completedEnrollments,
          wishlists: course._count.wishlists,
          modules: course.modules.length,
          lessons: totalLessons,
        }
      }
    })

    // Get unique categories
    const uniqueCategories = categories
      .map((c: { category: string | null }) => c.category)
      .filter(Boolean)
      .sort()

    return NextResponse.json({
      success: true,
      data: {
        courses: transformedCourses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters: {
          categories: uniqueCategories
        }
      }
    })
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

// POST /api/admin/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, slug, category, subcategory, shortDescription, fullDescription,
      learningOutcomes, prerequisites, targetAudience, difficultyLevel,
      language, durationHours, thumbnailUrl, promoVideoUrl, price, isFree, status
    } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course with this slug already exists" },
        { status: 409 }
      )
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        category: category || null,
        subcategory: subcategory || null,
        shortDescription: shortDescription || null,
        fullDescription: fullDescription || null,
        learningOutcomes: learningOutcomes || null,
        prerequisites: prerequisites || null,
        targetAudience: targetAudience || null,
        difficultyLevel: difficultyLevel || null,
        language: language || "English",
        durationHours: durationHours || null,
        thumbnailUrl: thumbnailUrl || null,
        promoVideoUrl: promoVideoUrl || null,
        price: price || 0,
        isFree: isFree ?? true,
        status: status || "draft",
      }
    })

    return NextResponse.json({
      success: true,
      data: { course },
      message: "Course created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    )
  }
}
