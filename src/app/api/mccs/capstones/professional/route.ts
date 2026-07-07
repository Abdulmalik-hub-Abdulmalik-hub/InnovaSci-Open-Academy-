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

// Schema for professional capstone
const professionalCapstoneSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().max(5000).optional(),
  orderIndex: z.number().min(0).default(0),
  requiredDifficultyLevels: z.number().min(1).default(1),
  requiredCourses: z.number().min(1).default(1),
  projectTitle: z.string().max(200).optional(),
  projectDescription: z.string().max(5000).optional(),
  projectRequirements: z.string().max(5000).optional(),
  projectDeliverables: z.array(z.string()).optional(),
  starterFilesUrl: z.string().url().optional().nullable(),
  referenceMaterialsUrl: z.string().url().optional().nullable(),
  additionalResourcesUrl: z.string().url().optional().nullable(),
  rubrics: z.array(z.object({
    criterion: z.string(),
    points: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  passingScore: z.number().min(0).max(100).default(70),
  certificateTemplateId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
})

// GET /api/mccs/capstones/professional - List professional capstones
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
    const categoryId = searchParams.get("categoryId")

    const where: Record<string, unknown> = { isActive: true }
    if (categoryId) where.categoryId = categoryId

    const capstones = await prisma.professionalCapstone.findMany({
      where,
      include: {
        category: true,
        difficultyLevelCapstones: {
          include: {
            difficultyLevel: {
              include: {
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
                }
              }
            }
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: [{ categoryId: 'asc' }, { orderIndex: 'asc' }]
    })

    return NextResponse.json({
      success: true,
      data: {
        capstones: capstones.map(c => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          orderIndex: c.orderIndex,
          category: c.category ? {
            id: c.category.id,
            name: c.category.name,
          } : null,
          requiredDifficultyLevels: c.requiredDifficultyLevels,
          requiredCourses: c.requiredCourses,
          projectTitle: c.projectTitle,
          projectDescription: c.projectDescription,
          projectDeliverables: c.projectDeliverables,
          isActive: c.isActive,
          difficultyLevels: c.difficultyLevelCapstones.map(dlc => ({
            id: dlc.difficultyLevel.id,
            name: dlc.difficultyLevel.name,
            courses: dlc.difficultyLevel.courses.map(cc => ({
              id: cc.course.id,
              title: cc.course.title,
              slug: cc.course.slug,
              thumbnailUrl: cc.course.thumbnailUrl,
              status: cc.course.status
            }))
          })),
          submissionCount: c._count.submissions,
        }))
      }
    })

  } catch (error) {
    console.error("Error fetching professional capstones:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch capstones"
    }, { status: 500 })
  }
}

// POST /api/mccs/capstones/professional - Create professional capstone
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
    const validationResult = professionalCapstoneSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const data = validationResult.data

    // Verify slug uniqueness
    const existingSlug = await prisma.professionalCapstone.findUnique({
      where: { slug: data.slug }
    })

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Slug already in use" },
        { status: 409 }
      )
    }

    // Get next order index
    const lastCapstone = await prisma.professionalCapstone.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { orderIndex: 'desc' }
    })
    const orderIndex = lastCapstone ? lastCapstone.orderIndex + 1 : 0

    const capstone = await prisma.professionalCapstone.create({
      data: {
        categoryId: data.categoryId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        orderIndex,
        requiredDifficultyLevels: data.requiredDifficultyLevels,
        requiredCourses: data.requiredCourses,
        projectTitle: data.projectTitle,
        projectDescription: data.projectDescription,
        projectRequirements: data.projectRequirements,
        projectDeliverables: data.projectDeliverables,
        starterFilesUrl: data.starterFilesUrl,
        referenceMaterialsUrl: data.referenceMaterialsUrl,
        additionalResourcesUrl: data.additionalResourcesUrl,
        rubrics: data.rubrics,
        passingScore: data.passingScore,
        certificateTemplateId: data.certificateTemplateId,
        isActive: data.isActive,
      }
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
            type: "PROFESSIONAL",
            categoryId: capstone.categoryId,
            title: capstone.title 
          },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { capstone },
      message: "Professional Capstone created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating professional capstone:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create capstone" },
      { status: 500 }
    )
  }
}
