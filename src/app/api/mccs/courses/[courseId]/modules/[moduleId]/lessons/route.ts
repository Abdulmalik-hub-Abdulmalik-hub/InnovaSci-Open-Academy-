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

// Schema for lesson creation
const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  lessonType: z.enum(["VIDEO", "TEXT", "QUIZ", "EXERCISE", "LIVE", "RESOURCE"]),
  videoUrl: z.string().url().optional().nullable(),
  videoDuration: z.number().min(0).optional(),
  videoProvider: z.string().optional(),
  isPreview: z.boolean().default(false),
  isFree: z.boolean().default(false),
  isActive: z.boolean().default(true),
  content: z.string().optional(),
  contentUrl: z.string().url().optional().nullable(),
})

// Schema for reordering lessons
const reorderLessonsSchema = z.object({
  lessonIds: z.array(z.string().uuid()),
})

// GET /api/mccs/courses/[courseId]/modules/[moduleId]/lessons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  const { courseId, moduleId } = await params;
  
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
    const lessons = await prisma.lesson.findMany({
      where: { courseId, moduleId },
      include: {
        practicalExercises: {
          where: { isPublished: true }
        },
        materials: true,
        videos: true,
      },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        lessons: lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          lessonType: lesson.lessonType,
          videoUrl: lesson.videoUrl,
          videoDuration: lesson.videoDuration,
          videoProvider: lesson.videoProvider,
          isPreview: lesson.isPreview,
          isFree: lesson.isFree,
          isActive: lesson.isActive,
          content: lesson.content,
          contentUrl: lesson.contentUrl,
          practicalExercises: lesson.practicalExercises.length,
          materials: lesson.materials.length,
          videos: lesson.videos.length,
        }))
      }
    })

  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch lessons"
    }, { status: 500 })
  }
}

// POST /api/mccs/courses/[courseId]/modules/[moduleId]/lessons
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  const { courseId, moduleId } = await params;
  
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
    // Verify course and module exist
    const [course, module] = await Promise.all([
      prisma.course.findUnique({ where: { id: courseId }, select: { id: true, status: true } }),
      prisma.module.findUnique({ where: { id: moduleId, courseId }, select: { id: true } })
    ])

    if (!course || !module) {
      return NextResponse.json(
        { success: false, error: "Course or module not found" },
        { status: 404 }
      )
    }

    if (course.status === "PUBLISHED") {
      return NextResponse.json({
        success: false,
        error: "Cannot add lessons to a published course"
      }, { status: 400 })
    }

    const body = await request.json()
    const validationResult = createLessonSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    // Get next order index
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId, moduleId },
      orderBy: { orderIndex: 'desc' }
    })
    const orderIndex = lastLesson ? lastLesson.orderIndex + 1 : 0

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        moduleId,
        ...validationResult.data,
        orderIndex,
      }
    })

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "MCCS_LESSONS",
          userId: auth.userId,
          details: { lessonId: lesson.id, courseId, moduleId, title: lesson.title },
        },
      })
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: { lesson },
      message: "Lesson created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create lesson" },
      { status: 500 }
    )
  }
}

// PUT /api/mccs/courses/[courseId]/modules/[moduleId]/lessons - Reorder lessons
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  const { courseId, moduleId } = await params;
  
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
    const validationResult = reorderLessonsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { lessonIds } = validationResult.data

    // Verify lessons belong to this module
    const existingLessons = await prisma.lesson.findMany({
      where: { id: { in: lessonIds }, moduleId, courseId },
      select: { id: true }
    })

    if (existingLessons.length !== lessonIds.length) {
      return NextResponse.json({
        success: false,
        error: "Some lessons do not belong to this module"
      }, { status: 400 })
    }

    // Update order indices atomically
    await prisma.$transaction(
      lessonIds.map((lessonId, index) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { orderIndex: index }
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: "Lessons reordered successfully"
    })

  } catch (error) {
    console.error("Error reordering lessons:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to reorder lessons" },
      { status: 500 }
    )
  }
}
