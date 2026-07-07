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

// Schema for updating exercises
const updateExerciseSchema = z.object({
  lessonId: z.string().uuid().optional().nullable(),
  moduleId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Title is required").max(200).optional(),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().min(0).optional(),
  instructions: z.string().min(1, "Instructions are required").optional(),
  hints: z.array(z.object({
    level: z.number(),
    text: z.string(),
  })).optional(),
  starterFilesUrl: z.string().url().optional().nullable(),
  solutionFilesUrl: z.string().url().optional().nullable(),
  solutionVideoUrl: z.string().url().optional().nullable(),
  rubrics: z.array(z.object({
    criterion: z.string(),
    points: z.number().min(0),
    description: z.string().optional(),
  })).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  environmentType: z.string().optional(),
  setupInstructions: z.string().optional(),
  estimatedTime: z.number().min(0).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
})

// GET /api/mccs/exercises/[id]
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
    const exercise = await prisma.practicalExercise.findUnique({
      where: { id },
      include: {
        lesson: { select: { id: true, title: true } },
        module: { select: { id: true, title: true } },
        course: { select: { id: true, title: true } },
        _count: {
          select: { submissions: true }
        }
      }
    })

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: "Exercise not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { exercise }
    })

  } catch (error) {
    console.error("Error fetching exercise:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch exercise"
    }, { status: 500 })
  }
}

// PUT /api/mccs/exercises/[id]
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
    // Verify exercise exists
    const existing = await prisma.practicalExercise.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Exercise not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validationResult = updateExerciseSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const exercise = await prisma.practicalExercise.update({
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
          module: "MCCS_EXERCISES",
          userId: auth.userId,
          details: { exerciseId: exercise.id, title: exercise.title },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { exercise },
      message: "Exercise updated successfully"
    })

  } catch (error) {
    console.error("Error updating exercise:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update exercise" },
      { status: 500 }
    )
  }
}

// DELETE /api/mccs/exercises/[id]
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
    const existing = await prisma.practicalExercise.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Exercise not found" },
        { status: 404 }
      )
    }

    // Delete submissions first
    await prisma.exerciseSubmission.deleteMany({
      where: { exerciseId: id }
    })

    // Delete the exercise
    await prisma.practicalExercise.delete({
      where: { id }
    })

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "MCCS_EXERCISES",
          userId: auth.userId,
          details: { exerciseId: id, title: existing.title },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: "Exercise deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting exercise:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete exercise" },
      { status: 500 }
    )
  }
}
