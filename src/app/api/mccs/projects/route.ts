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

// Schema for mini project
const miniProjectSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().min(0).default(0),
  scenario: z.string().max(5000).optional(),
  objectives: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  workflowSteps: z.array(z.object({
    step: z.number(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  starterFilesUrl: z.string().url().optional().nullable(),
  referenceFilesUrl: z.string().url().optional().nullable(),
  rubrics: z.array(z.object({
    criterion: z.string(),
    points: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  passingScore: z.number().min(0).max(100).default(70),
  evaluationCriteria: z.string().max(2000).optional(),
  environmentSetup: z.string().max(2000).optional(),
  technicalRequirements: z.object({
    tools: z.array(z.string()).optional(),
    packages: z.array(z.string()).optional(),
    environment: z.string().optional(),
  }).optional(),
  estimatedHours: z.number().min(0).optional(),
  difficulty: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  deadline: z.string().datetime().optional().nullable(),
})

// GET /api/mccs/projects - List mini projects
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
    const courseId = searchParams.get("courseId")

    const where: Record<string, unknown> = {}
    if (courseId) where.courseId = courseId

    const projects = await prisma.miniProject.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: [{ courseId: 'asc' }, { orderIndex: 'asc' }]
    })

    return NextResponse.json({
      success: true,
      data: {
        projects: projects.map(p => ({
          ...p,
          submissionCount: p._count.submissions,
        }))
      }
    })

  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch projects"
    }, { status: 500 })
  }
}

// POST /api/mccs/projects - Create mini project
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
    const validationResult = miniProjectSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    // Get next order index if not provided
    let orderIndex = validationResult.data.orderIndex
    if (orderIndex === 0) {
      const lastProject = await prisma.miniProject.findFirst({
        where: { courseId: validationResult.data.courseId },
        orderBy: { orderIndex: 'desc' }
      })
      orderIndex = lastProject ? lastProject.orderIndex + 1 : 0
    }

    const project = await prisma.miniProject.create({
      data: {
        ...validationResult.data,
        orderIndex,
      },
      include: {
        course: { select: { id: true, title: true } }
      }
    })

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "MCCS_PROJECTS",
          userId: auth.userId,
          details: { projectId: project.id, courseId: project.courseId, title: project.title },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { project },
      message: "Mini project created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create project" },
      { status: 500 }
    )
  }
}
