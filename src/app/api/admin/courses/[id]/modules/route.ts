import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

// GET /api/admin/courses/[id]/modules - Get all modules for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id: courseId } = await params

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
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
          include: {
            _count: {
              select: { materials: true, videos: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        courseId,
        courseTitle: course.title,
        modules: modules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          orderIndex: m.orderIndex,
          lessonsCount: m.lessons.length,
          lessons: m.lessons.map(l => ({
            id: l.id,
            title: l.title,
            description: l.description,
            orderIndex: l.orderIndex,
            lessonType: l.lessonType,
            duration: l.duration,
            videoUrl: l.videoUrl,
            isPreview: l.isPreview,
            isExercise: l.isExercise,
            exerciseDescription: l.exerciseDescription,
            exerciseFilesUrl: l.exerciseFilesUrl,
            solutionVideoUrl: l.solutionVideoUrl,
            materialsCount: l._count.materials,
            videosCount: l._count.videos,
          }))
        }))
      }
    })
  } catch (error) {
    console.error("Get modules error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch modules" },
      { status: 500 }
    )
  }
}

// POST /api/admin/courses/[id]/modules - Create a new module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { title, description } = body

    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Module title must be at least 2 characters" },
        { status: 400 }
      )
    }

    // Check if course exists
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

    // Get the highest orderIndex
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { orderIndex: "desc" }
    })

    const orderIndex = (lastModule?.orderIndex ?? -1) + 1

    const module = await prisma.module.create({
      data: {
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        orderIndex,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "MODULES",
          userId: auth.userId,
          details: {
            moduleId: module.id,
            title: module.title,
            courseId,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        lessonsCount: 0,
        lessons: [],
      },
      message: "Module created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create module error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/courses/[id]/modules - Reorder modules
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { moduleIds } = body // Array of module IDs in new order

    if (!Array.isArray(moduleIds)) {
      return NextResponse.json(
        { success: false, error: "moduleIds must be an array" },
        { status: 400 }
      )
    }

    // Update order for each module
    await Promise.all(
      moduleIds.map((moduleId: string, index: number) =>
        prisma.module.update({
          where: { id: moduleId },
          data: { orderIndex: index },
        })
      )
    )

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "REORDER",
          module: "MODULES",
          userId: auth.userId,
          details: {
            courseId,
            moduleIds,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Modules reordered successfully"
    })

  } catch (error) {
    console.error("Reorder modules error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reorder modules" },
      { status: 500 }
    )
  }
}
