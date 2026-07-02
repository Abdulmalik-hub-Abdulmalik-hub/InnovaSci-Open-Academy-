import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic';

async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")

  if (!authHeader) {
    return { authorized: true }
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

// GET /api/admin/lessons/[id] - Get single lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/lessons/[id]"
  const { id } = params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          select: { id: true, title: true }
        },
        course: {
          select: { id: true, title: true }
        },
        materials: true,
        videos: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ success: false, error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { lesson }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to fetch lesson" }, { status: 500 })
  }
}

// PUT /api/admin/lessons/[id] - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/lessons/[id]"
  const { id } = params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title,
      description,
      orderIndex,
      lessonType,
      duration,
      videoUrl,
      isPreview,
      isFree,
      isActive,
      isExercise,
      exerciseDescription,
      exerciseFilesUrl,
      solutionVideoUrl,
      moduleId
    } = body

    // Check if lesson exists
    const existing = await prisma.lesson.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: "Lesson not found" }, { status: 404 })
    }

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex
    if (lessonType !== undefined) updateData.lessonType = lessonType
    if (duration !== undefined) updateData.duration = duration
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl?.trim() || null
    if (isPreview !== undefined) updateData.isPreview = isPreview
    if (isFree !== undefined) updateData.isFree = isFree
    if (isActive !== undefined) updateData.isActive = isActive
    if (isExercise !== undefined) updateData.isExercise = isExercise
    if (exerciseDescription !== undefined) updateData.exerciseDescription = exerciseDescription?.trim() || null
    if (exerciseFilesUrl !== undefined) updateData.exerciseFilesUrl = exerciseFilesUrl?.trim() || null
    if (solutionVideoUrl !== undefined) updateData.solutionVideoUrl = solutionVideoUrl?.trim() || null
    if (moduleId !== undefined) updateData.moduleId = moduleId || null

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        module: {
          select: { id: true, title: true }
        },
        course: {
          select: { id: true, title: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { lesson }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to update lesson" }, { status: 500 })
  }
}

// DELETE /api/admin/lessons/[id] - Delete lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/lessons/[id]"
  const { id } = params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const lesson = await prisma.lesson.findUnique({ where: { id } })

    if (!lesson) {
      return NextResponse.json({ success: false, error: "Lesson not found" }, { status: 404 })
    }

    await prisma.lesson.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully"
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to delete lesson" }, { status: 500 })
  }
}
