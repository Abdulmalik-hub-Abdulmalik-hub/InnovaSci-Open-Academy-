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

// Schema for creating/updating exercises
const exerciseSchema = z.object({
  lessonId: z.string().uuid().optional().nullable(),
  moduleId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().min(0).default(0),
  instructions: z.string().min(1, "Instructions are required"),
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
  passingScore: z.number().min(0).max(100).default(70),
  environmentType: z.string().optional(),
  setupInstructions: z.string().optional(),
  estimatedTime: z.number().min(0).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
})

// GET /api/mccs/exercises - List exercises
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
    const moduleId = searchParams.get("moduleId")
    const lessonId = searchParams.get("lessonId")
    const isPublished = searchParams.get("isPublished")

    const where: Record<string, unknown> = {}
    if (courseId) where.courseId = courseId
    if (moduleId) where.moduleId = moduleId
    if (lessonId) where.lessonId = lessonId
    if (isPublished !== null && isPublished !== undefined) {
      where.isPublished = isPublished === "true"
    }

    const exercises = await prisma.practicalExercise.findMany({
      where,
      include: {
        lesson: { select: { id: true, title: true } },
        module: { select: { id: true, title: true } },
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
        exercises: exercises.map(ex => ({
          ...ex,
          submissionCount: ex._count.submissions,
        }))
      }
    })

  } catch (error) {
    console.error("Error fetching exercises:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch exercises"
    }, { status: 500 })
  }
}

// POST /api/mccs/exercises - Create exercise
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
    const validationResult = exerciseSchema.safeParse(body)

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
      const lastExercise = await prisma.practicalExercise.findFirst({
        where: { courseId: validationResult.data.courseId },
        orderBy: { orderIndex: 'desc' }
      })
      orderIndex = lastExercise ? lastExercise.orderIndex + 1 : 0
    }

    const exercise = await prisma.practicalExercise.create({
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
          module: "MCCS_EXERCISES",
          userId: auth.userId,
          details: { exerciseId: exercise.id, courseId: exercise.courseId, title: exercise.title },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { exercise },
      message: "Exercise created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating exercise:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create exercise" },
      { status: 500 }
    )
  }
}
