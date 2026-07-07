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

// Schema for updating projects
const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().min(0).optional(),
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
  passingScore: z.number().min(0).max(100).optional(),
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
  isPublished: z.boolean().optional(),
  deadline: z.string().datetime().optional().nullable(),
})

// GET /api/mccs/projects/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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
    const project = await prisma.miniProject.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        _count: {
          select: { submissions: true }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { 
        project: {
          ...project,
          submissionCount: project._count.submissions,
        }
      }
    })

  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch project"
    }, { status: 500 })
  }
}

// PUT /api/mccs/projects/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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
    const existing = await prisma.miniProject.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validationResult = updateProjectSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const project = await prisma.miniProject.update({
      where: { id },
      data: validationResult.data,
      include: {
        course: { select: { id: true, title: true } }
      }
    })

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "MCCS_PROJECTS",
          userId: auth.userId,
          details: { projectId: project.id, title: project.title },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { project },
      message: "Project updated successfully"
    })

  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update project" },
      { status: 500 }
    )
  }
}

// DELETE /api/mccs/projects/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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
    const existing = await prisma.miniProject.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      )
    }

    // Delete submissions first
    await prisma.projectSubmission.deleteMany({
      where: { projectId: id }
    })

    // Delete the project
    await prisma.miniProject.delete({
      where: { id }
    })

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "MCCS_PROJECTS",
          userId: auth.userId,
          details: { projectId: id, title: existing.title },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete project" },
      { status: 500 }
    )
  }
}
