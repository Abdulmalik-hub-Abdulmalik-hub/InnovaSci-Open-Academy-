import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';

// Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return { authorized: true } // Demo mode
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        
        if (user && user.role === "ADMIN" && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id }
        }
      }
    }
    
    return { authorized: false, error: "Invalid or expired authentication token" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// GET /api/admin/courses - List all courses
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/courses"
  
  // Check DATABASE_URL first
  if (!process.env.DATABASE_URL) {
    console.error(`[${endpoint}] DATABASE_URL not configured`)
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const category = searchParams.get("category") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }
    if (status && status !== "all") {
      where.status = status
    }
    if (category) {
      where.categoryId = category
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: true,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.course.count({ where })
    ])

    // Get categories for filter dropdown
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { orderIndex: 'asc' }
    })

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      category: course.category?.name || null,
      status: course.status,
      difficultyLevel: course.difficultyLevel,
      price: Number(course.price),
      isFree: course.isFree,
      isActive: course.isActive,
      thumbnailUrl: course.thumbnailUrl,
      introVideoUrl: course.introVideoUrl,
      certificateTemplateId: course.certificateTemplateId,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      stats: {
        enrollments: course._count.enrollments,
        completed: 0,
        wishlists: 0,
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
    console.error(`[${endpoint}] Courses API error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch courses",
      code: error instanceof Error && error.message.includes("DATABASE_URL") ? "DATABASE_NOT_READY" : "QUERY_FAILED",
      data: {
        courses: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        filters: { categories: [] }
      }
    }, { status: 503 })
  }
}

// POST /api/admin/courses - Create new course
export async function POST(request: NextRequest) {
  const endpoint = "/api/admin/courses"
  
  // Check DATABASE_URL first
  if (!process.env.DATABASE_URL) {
    console.error(`[${endpoint}] DATABASE_URL not configured`)
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {

    const body = await request.json()
    const {
      title,
      slug,
      categoryId,
      subcategory,
      shortDescription,
      fullDescription,
      learningOutcomes,
      prerequisites,
      targetAudience,
      difficultyLevel,
      language,
      durationHours,
      thumbnailUrl,
      promoVideoUrl,
      introVideoUrl,
      price,
      isFree,
      status,
      certificateTemplateId
    } = body

    // Validation
    const errors: string[] = []
    
    if (!title || title.trim().length < 3) {
      errors.push("Title must be at least 3 characters")
    }
    
    if (!slug) {
      errors.push("Slug is required")
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push("Slug must be lowercase alphanumeric with hyphens only")
    }
    
    if (!introVideoUrl) {
      errors.push("Introduction Video URL is required")
    }
    
    if (!categoryId) {
      errors.push("Category is required")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: "A course with this slug already exists" },
        { status: 409 }
      )
    }

    // Validate status
    if (status && !["draft", "published", "archived"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be: draft, published, or archived" },
        { status: 400 }
      )
    }

    // Validate difficulty level
    if (difficultyLevel && !["Beginner", "Intermediate", "Advanced"].includes(difficultyLevel)) {
      return NextResponse.json(
        { success: false, error: "Invalid difficulty level" },
        { status: 400 }
      )
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        slug: slug.toLowerCase(),
        categoryId: categoryId || null,
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
        introVideoUrl: introVideoUrl || null,
        price: price || 0,
        isFree: isFree !== undefined ? isFree : true,
        isActive: true, // Default to active
        status: status || "draft",
        certificateTemplateId: certificateTemplateId || null,
      },
      include: {
        category: true,
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
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "COURSES",
          userId: auth.userId,
          details: {
            courseId: course.id,
            title: course.title,
            slug: course.slug,
            status: course.status,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          category: course.category?.name || null,
          status: course.status,
          price: Number(course.price),
          isFree: course.isFree,
          thumbnailUrl: course.thumbnailUrl,
          createdAt: course.createdAt.toISOString(),
          stats: {
            enrollments: course._count.enrollments,
            completed: 0,
            wishlists: 0,
            modules: 0,
            lessons: 0,
          }
        }
      },
      message: "Course created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create course" },
      { status: 500 }
    )
  }
}
