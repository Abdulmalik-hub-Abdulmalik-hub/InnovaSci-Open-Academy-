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

// GET /api/admin/modules/[id] - Get single module with lessons
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/modules/[id]"
  const { id } = params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' }
        },
        course: {
          select: { id: true, title: true }
        }
      }
    })

    if (!module) {
      return NextResponse.json({ success: false, error: "Module not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { module }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to fetch module" }, { status: 500 })
  }
}

// PUT /api/admin/modules/[id] - Update module
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/modules/[id]"
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
    const { title, description, orderIndex, lessons } = body

    // Check if module exists
    const existing = await prisma.module.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: "Module not found" }, { status: 404 })
    }

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex

    // Update module
    const module = await prisma.module.update({
      where: { id },
      data: updateData,
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    // If lessons are provided, sync them
    if (lessons !== undefined && Array.isArray(lessons)) {
      // Delete existing lessons
      await prisma.lesson.deleteMany({
        where: { moduleId: id }
      })

      // Create new lessons
      if (lessons.length > 0) {
        await prisma.lesson.createMany({
          data: lessons.map((lesson: any, index: number) => ({
            courseId: existing.courseId,
            moduleId: id,
            title: lesson.title,
            description: lesson.description?.trim() || null,
            orderIndex: lesson.orderIndex ?? index,
            lessonType: lesson.lessonType || 'video',
            duration: lesson.duration || null,
            videoUrl: lesson.videoUrl?.trim() || null,
            isPreview: lesson.isPreview || false,
            isFree: lesson.isFree || false,
            isActive: lesson.isActive !== false,
            isExercise: lesson.isExercise || false,
            exerciseDescription: lesson.exerciseDescription?.trim() || null,
            exerciseFilesUrl: lesson.exerciseFilesUrl?.trim() || null,
            solutionVideoUrl: lesson.solutionVideoUrl?.trim() || null
          }))
        })

        // Refetch module with updated lessons
        const updatedModule = await prisma.module.findUnique({
          where: { id },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        })

        return NextResponse.json({
          success: true,
          data: { module: updatedModule }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: { module }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to update module" }, { status: 500 })
  }
}

// DELETE /api/admin/modules/[id] - Delete module
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/modules/[id]"
  const { id } = params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const module = await prisma.module.findUnique({
      where: { id },
      include: { _count: { select: { lessons: true } } }
    })

    if (!module) {
      return NextResponse.json({ success: false, error: "Module not found" }, { status: 404 })
    }

    // Delete module (lessons will be cascade deleted due to relation)
    await prisma.module.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully"
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to delete module" }, { status: 500 })
  }
}
