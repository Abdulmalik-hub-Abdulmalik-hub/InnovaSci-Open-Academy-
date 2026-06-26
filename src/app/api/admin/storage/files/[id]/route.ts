import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { deleteFile, generateSignedUrl, formatFileSize } from "@/lib/storage"

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

// GET /api/admin/storage/files/[id] - Get single file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    const file = await prisma.storedFile.findUnique({
      where: { id }
    })

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      )
    }

    // Generate signed URL for S3 files
    const fileUrl = file.storageType === "s3"
      ? await generateSignedUrl(file.fileUrl)
      : file.fileUrl

    // Update last accessed
    await prisma.storedFile.update({
      where: { id },
      data: { lastAccessedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: file.id,
        originalName: file.originalName,
        storedName: file.storedName,
        fileUrl,
        originalUrl: file.fileUrl,
        fileSize: file.fileSize,
        fileSizeFormatted: formatFileSize(file.fileSize),
        mimeType: file.mimeType,
        fileType: file.fileType,
        storageType: file.storageType,
        folder: file.folder,
        tags: file.tags,
        courseId: file.courseId,
        isOrphaned: file.isOrphaned,
        lastAccessedAt: file.lastAccessedAt?.toISOString(),
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Get file error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch file" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/storage/files/[id] - Update file metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { folder, tags, courseId } = body

    const existingFile = await prisma.storedFile.findUnique({
      where: { id }
    })

    if (!existingFile) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      )
    }

    const updatedFile = await prisma.storedFile.update({
      where: { id },
      data: {
        folder: folder !== undefined ? folder : existingFile.folder,
        tags: tags !== undefined ? tags : existingFile.tags,
        courseId: courseId !== undefined ? courseId : existingFile.courseId,
        isOrphaned: courseId !== undefined ? false : existingFile.isOrphaned,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedFile.id,
        folder: updatedFile.folder,
        tags: updatedFile.tags,
        courseId: updatedFile.courseId,
        isOrphaned: updatedFile.isOrphaned,
      },
      message: "File updated successfully",
    })
  } catch (error) {
    console.error("Update file error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update file" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/storage/files/[id] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    const file = await prisma.storedFile.findUnique({
      where: { id }
    })

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      )
    }

    // Delete from storage (local or S3)
    await deleteFile(file.fileUrl, file.storageType)

    // Delete from database
    await prisma.storedFile.delete({
      where: { id }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "STORAGE",
          userId: auth.userId,
          details: {
            fileId: id,
            originalName: file.originalName,
            fileSize: file.fileSize,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Delete file error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    )
  }
}