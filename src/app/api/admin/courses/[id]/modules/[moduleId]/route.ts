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

// GET /api/admin/courses/[id]/modules/[moduleId] - Get single module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id: courseId, moduleId } = await params

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
          include: {
            materials: true,
            videos: true,
          }
        }
      }
    })

    if (!module) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    if (module.courseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Module does not belong to this course" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        lessonsCount: module.lessons.length,
        lessons: module.lessons.map(l => ({
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
          materials: l.materials,
          videos: l.videos,
        }))
      }
    })
  } catch (error) {
    console.error("Get module error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch module" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/courses/[id]/modules/[moduleId] - Update module
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id: courseId, moduleId } = await params
    const body = await request.json()
    const { title, description } = body

    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    })

    if (!module) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    if (module.courseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Module does not belong to this course" },
        { status: 400 }
      )
    }

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title: title !== undefined ? title.trim() : module.title,
        description: description !== undefined ? description?.trim() : module.description,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "MODULES",
          userId: auth.userId,
          details: {
            moduleId,
            title: updatedModule.title,
            changes: { title, description },
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedModule.id,
        title: updatedModule.title,
        description: updatedModule.description,
        orderIndex: updatedModule.orderIndex,
      },
      message: "Module updated successfully"
    })
  } catch (error) {
    console.error("Update module error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update module" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/courses/[id]/modules/[moduleId] - Delete module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id: courseId, moduleId } = await params

    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    })

    if (!module) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    if (module.courseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Module does not belong to this course" },
        { status: 400 }
      )
    }

    await prisma.module.delete({
      where: { id: moduleId }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "MODULES",
          userId: auth.userId,
          details: {
            moduleId,
            title: module.title,
            courseId,
            lessonsDeleted: 0, // Could count actual lessons
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully"
    })
  } catch (error) {
    console.error("Delete module error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete module" },
      { status: 500 }
    )
  }
}