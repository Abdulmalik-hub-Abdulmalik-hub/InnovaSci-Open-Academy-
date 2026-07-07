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

// Schema for module creation
const createModuleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  isPreview: z.boolean().default(false),
})

// Schema for reordering modules
const reorderModulesSchema = z.object({
  moduleIds: z.array(z.string().uuid()),
})

// GET /api/mccs/courses/[courseId]/modules - Get all modules for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const endpoint = `/api/mccs/courses/${courseId}/modules`
  
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
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
          include: {
            practicalExercises: {
              where: { isPublished: true }
            }
          }
        },
        practicalExercises: {
          where: { isPublished: true }
        }
      },
      orderBy: { orderIndex: 'asc' }
    })

    const formattedModules = modules.map((module, index) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
      isPreview: module.isPreview,
      lessons: module.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.orderIndex,
        lessonType: lesson.lessonType,
        videoUrl: lesson.videoUrl,
        videoDuration: lesson.videoDuration,
        isPreview: lesson.isPreview,
        isFree: lesson.isFree,
        isActive: lesson.isActive,
        practicalExercises: lesson.practicalExercises.length,
      })),
      practicalExercises: module.practicalExercises.map(ex => ({
        id: ex.id,
        title: ex.title,
      })),
      stats: {
        lessons: module.lessons.length,
        exercises: module.practicalExercises.length,
        totalDuration: module.lessons.reduce((acc, l) => acc + (l.videoDuration || 0), 0),
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        courseId,
        courseTitle: course.title,
        modules: formattedModules
      }
    })

  } catch (error) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch modules"
    }, { status: 500 })
  }
}

// POST /api/mccs/courses/[courseId]/modules - Create a new module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const endpoint = `/api/mccs/courses/${courseId}/modules`
  
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
    // Verify course exists and is not published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true, title: true }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    if (course.status === "PUBLISHED") {
      return NextResponse.json({
        success: false,
        error: "Cannot add modules to a published course. Create a new version or unpublish first."
      }, { status: 400 })
    }

    const body = await request.json()
    const validationResult = createModuleSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { title, description, isPreview } = validationResult.data

    // Get the next order index
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' }
    })

    const orderIndex = lastModule ? lastModule.orderIndex + 1 : 0

    // Create module
    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        description,
        orderIndex,
        isPreview: isPreview || false,
      },
      include: {
        lessons: true,
        practicalExercises: true
      }
    })

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "MCCS_MODULES",
          userId: auth.userId,
          details: {
            moduleId: module.id,
            courseId,
            courseTitle: course.title,
            title: module.title,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        module: {
          id: module.id,
          title: module.title,
          description: module.description,
          orderIndex: module.orderIndex,
          isPreview: module.isPreview,
          lessons: [],
          stats: {
            lessons: 0,
            exercises: 0,
            totalDuration: 0,
          }
        }
      },
      message: "Module created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create module" },
      { status: 500 }
    )
  }
}

// PUT /api/mccs/courses/[courseId]/modules - Reorder modules (drag-and-drop)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const endpoint = `/api/mccs/courses/${courseId}/modules`
  
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
    const validationResult = reorderModulesSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { moduleIds } = validationResult.data

    // Verify all modules belong to this course
    const existingModules = await prisma.module.findMany({
      where: {
        id: { in: moduleIds },
        courseId
      },
      select: { id: true }
    })

    if (existingModules.length !== moduleIds.length) {
      return NextResponse.json({
        success: false,
        error: "Some modules do not belong to this course"
      }, { status: 400 })
    }

    // Use transaction to update all module order indices atomically
    await prisma.$transaction(
      moduleIds.map((moduleId, index) =>
        prisma.module.update({
          where: { id: moduleId },
          data: { orderIndex: index }
        })
      ),
      {
        timeout: 10000,
      }
    )

    // Fetch updated modules
    const updatedModules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          where: { isActive: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        modules: updatedModules.map(m => ({
          id: m.id,
          title: m.title,
          orderIndex: m.orderIndex,
          lessonsCount: m.lessons.length
        }))
      },
      message: "Modules reordered successfully"
    })

  } catch (error) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to reorder modules" },
      { status: 500 }
    )
  }
}
