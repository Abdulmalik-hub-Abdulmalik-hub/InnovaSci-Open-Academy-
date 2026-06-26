import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/storage"

// Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    console.log("[Materials API] No auth header - running in demo mode")
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

// GET /api/admin/materials/[id] - Get single material
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = params

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!material) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: material.id,
        title: material.title,
        type: material.type,
        fileUrl: material.fileUrl,
        visibility: material.visibility,
        downloadAllowed: material.downloadAllowed,
        createdAt: material.createdAt.toISOString(),
        lesson: material.lesson
          ? {
              id: material.lesson.id,
              title: material.lesson.title,
              courseId: material.lesson.courseId,
              courseTitle: material.lesson.module?.course?.title || null,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Get material error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch material" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/materials/[id] - Update material
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = params
    const body = await request.json()
    const { title, type, visibility, downloadAllowed } = body

    // Check if material exists
    const existing = await prisma.material.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      )
    }

    // Update material
    const material = await prisma.material.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        type: type ?? existing.type,
        visibility: visibility ?? existing.visibility,
        downloadAllowed: downloadAllowed ?? existing.downloadAllowed,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "MATERIALS",
          details: {
            materialId: material.id,
            title: material.title,
            changes: { title, type, visibility, downloadAllowed },
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        material: {
          id: material.id,
          title: material.title,
          type: material.type,
          fileUrl: material.fileUrl,
          visibility: material.visibility,
          downloadAllowed: material.downloadAllowed,
          createdAt: material.createdAt.toISOString(),
          lesson: material.lesson
            ? {
                id: material.lesson.id,
                title: material.lesson.title,
                courseId: material.lesson.courseId,
              }
            : null,
        },
      },
      message: "Material updated successfully",
    })
  } catch (error) {
    console.error("Update material error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update material" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/materials/[id] - Delete material
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = params

    // Get material first to delete the file
    const material = await prisma.material.findUnique({
      where: { id },
    })

    if (!material) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      )
    }

    // Delete the physical file
    await deleteFile(material.fileUrl)

    // Delete from database
    await prisma.material.delete({
      where: { id },
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "MATERIALS",
          details: {
            materialId: id,
            title: material.title,
            fileUrl: material.fileUrl,
            fileType: material.type,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Material deleted successfully",
    })
  } catch (error) {
    console.error("Delete material error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete material" },
      { status: 500 }
    )
  }
}