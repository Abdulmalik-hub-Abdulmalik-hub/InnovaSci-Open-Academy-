import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Force dynamic rendering
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

// Schema for difficulty level capstone
const difficultyCapstoneSchema = z.object({
  difficultyLevelId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().max(5000).optional(),
  orderIndex: z.number().min(0).default(0),
  requiredCourses: z.number().min(1).default(1),
  requiredCourseIds: z.array(z.string().uuid()).optional(),
  projectTitle: z.string().max(200).optional(),
  projectDescription: z.string().max(5000).optional(),
  projectRequirements: z.string().max(5000).optional(),
  starterFilesUrl: z.string().url().optional().nullable(),
  referenceMaterialsUrl: z.string().url().optional().nullable(),
  rubrics: z.array(z.object({
    criterion: z.string(),
    points: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  passingScore: z.number().min(0).max(100).default(70),
  certificateTemplateId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
})

// GET /api/mccs/capstones/difficulty-level - List difficulty level capstones
export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const difficultyLevelId = searchParams.get("difficultyLevelId")
    const categoryId = searchParams.get("categoryId")

    // Get difficulty levels with capstones
    const where: Record<string, unknown> = { isActive: true }
    if (difficultyLevelId) where.difficultyLevelId = difficultyLevelId

    const capstones = await prisma.difficultyLevelCapstone.findMany({
      where,
      include: {
        difficultyLevel: {
          include: {
            category: true
          }
        },
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: [{ difficultyLevelId: 'asc' }, { orderIndex: 'asc' }]
    })

    // If categoryId is provided, filter by it
    let filteredCapstones = capstones
    if (categoryId) {
      filteredCapstones = capstones.filter(
        c => c.difficultyLevel?.categoryId === categoryId
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        capstones: filteredCapstones.map(c => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          orderIndex: c.orderIndex,
          difficultyLevel: c.difficultyLevel ? {
            id: c.difficultyLevel.id,
            name: c.difficultyLevel.name,
            category: c.difficultyLevel.category?.name
          } : null,
          requiredCourses: c.requiredCourses,
          projectTitle: c.projectTitle,
          isActive: c.isActive,
          courses: c.courses.map(cc => ({
            id: cc.course.id,
            title: cc.course.title,
            slug: cc.course.slug,
            thumbnailUrl: cc.course.thumbnailUrl,
            isRequired: cc.isRequired,
            status: cc.course.status
          })),
          submissionCount: c._count.submissions,
        }))
      }
    })

  } catch (error) {
    console.error("Error fetching capstones:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch capstones"
    }, { status: 500 })
  }
}

// POST /api/mccs/capstones/difficulty-level - Create difficulty level capstone
export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validationResult = difficultyCapstoneSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const data = validationResult.data

    // Verify slug uniqueness
    const existingSlug = await prisma.difficultyLevelCapstone.findUnique({
      where: { slug: data.slug }
    })

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Slug already in use" },
        { status: 409 }
      )
    }

    // Get next order index
    const lastCapstone = await prisma.difficultyLevelCapstone.findFirst({
      where: { difficultyLevelId: data.difficultyLevelId },
      orderBy: { orderIndex: 'desc' }
    })
    const orderIndex = lastCapstone ? lastCapstone.orderIndex + 1 : 0

    // Create capstone with transaction
    const capstone = await prisma.$transaction(async (tx) => {
      const newCapstone = await tx.difficultyLevelCapstone.create({
        data: {
          difficultyLevelId: data.difficultyLevelId,
          title: data.title,
          slug: data.slug,
          description: data.description,
          orderIndex,
          requiredCourses: data.requiredCourses,
          projectTitle: data.projectTitle,
          projectDescription: data.projectDescription,
          projectRequirements: data.projectRequirements,
          starterFilesUrl: data.starterFilesUrl,
          referenceMaterialsUrl: data.referenceMaterialsUrl,
          rubrics: data.rubrics,
          passingScore: data.passingScore,
          certificateTemplateId: data.certificateTemplateId,
          isActive: data.isActive,
        }
      })

      // Add required courses if provided
      if (data.requiredCourseIds && data.requiredCourseIds.length > 0) {
        await tx.difficultyLevelCapstoneCourse.createMany({
          data: data.requiredCourseIds.map((courseId, index) => ({
            capstoneId: newCapstone.id,
            courseId,
            isRequired: true,
            orderIndex: index,
          }))
        })
      }

      return newCapstone
    })

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "MCCS_CAPSTONES",
          userId: auth.userId,
          details: { 
            capstoneId: capstone.id, 
            type: "DIFFICULTY_LEVEL",
            difficultyLevelId: capstone.difficultyLevelId,
            title: capstone.title 
          },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { capstone },
      message: "Difficulty Level Capstone created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating capstone:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create capstone" },
      { status: 500 }
    )
  }
}
