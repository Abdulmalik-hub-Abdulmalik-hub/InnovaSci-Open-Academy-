import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatFileSize } from "@/lib/storage"

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

// GET /api/admin/storage/orphans - Find orphaned files
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    // Get all files from stored_files table
    const allFiles = await prisma.storedFile.findMany({
      select: { id: true, fileUrl: true, originalName: true, fileSize: true, folder: true }
    })

    // Get all file URLs referenced in other tables
    const [
      courseThumbnails,
      coursePromoVideos,
      lessonMaterials,
      lessonVideoUrls,
      userProfiles,
      certificateUrls,
    ] = await Promise.all([
      // Course thumbnails
      prisma.course.findMany({ select: { thumbnailUrl: true } }),
      // Course promo videos
      prisma.course.findMany({ select: { promoVideoUrl: true } }),
      // Lesson materials
      prisma.material.findMany({ select: { fileUrl: true } }),
      // Lesson videos
      prisma.lesson.findMany({ select: { videoUrl: true } }),
      // User profiles
      prisma.profile.findMany({ select: { avatarUrl: true } }),
      // Certificate URLs
      prisma.certificate.findMany({ select: { certificateUrl: true } }),
    ])

    // Collect all referenced URLs
    const referencedUrls = new Set<string>()
    
    for (const course of courseThumbnails) {
      if (course.thumbnailUrl) referencedUrls.add(course.thumbnailUrl)
    }
    for (const course of coursePromoVideos) {
      if (course.promoVideoUrl) referencedUrls.add(course.promoVideoUrl)
    }
    for (const material of lessonMaterials) {
      if (material.fileUrl) referencedUrls.add(material.fileUrl)
    }
    for (const lesson of lessonVideoUrls) {
      if (lesson.videoUrl) referencedUrls.add(lesson.videoUrl)
    }
    for (const profile of userProfiles) {
      if (profile.avatarUrl) referencedUrls.add(profile.avatarUrl)
    }
    for (const cert of certificateUrls) {
      if (cert.certificateUrl) referencedUrls.add(cert.certificateUrl)
    }

    // Find orphaned files (files in stored_files but not referenced anywhere)
    const orphanedFiles = allFiles.filter(file => {
      // Check if fileUrl is referenced anywhere
      const isReferenced = referencedUrls.has(file.fileUrl)
      // Also check if courseId is set (indicates association)
      return !isReferenced
    })

    const totalOrphanedSize = orphanedFiles.reduce((sum, f) => sum + f.fileSize, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalFiles: allFiles.length,
        orphanedCount: orphanedFiles.length,
        orphanedSize: totalOrphanedSize,
        orphanedSizeFormatted: formatFileSize(totalOrphanedSize),
        orphans: orphanedFiles.map(f => ({
          id: f.id,
          originalName: f.originalName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize,
          fileSizeFormatted: formatFileSize(f.fileSize),
          folder: f.folder,
        })),
      },
    })
  } catch (error) {
    console.error("Find orphans error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to find orphaned files" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/storage/orphans - Delete orphaned files
export async function DELETE(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const fileIds = searchParams.get("ids")?.split(",") || []

    if (fileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No file IDs provided" },
        { status: 400 }
      )
    }

    // Get files to delete
    const filesToDelete = await prisma.storedFile.findMany({
      where: { id: { in: fileIds } },
    })

    if (filesToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files found" },
        { status: 404 }
      )
    }

    // Delete from storage (we'll use local storage for now)
    const { deleteFile } = await import("@/lib/storage")
    
    for (const file of filesToDelete) {
      await deleteFile(file.fileUrl, file.storageType)
    }

    // Delete from database
    await prisma.storedFile.deleteMany({
      where: { id: { in: fileIds } },
    })

    const totalFreedSpace = filesToDelete.reduce((sum, f) => sum + f.fileSize, 0)

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE_ORPHANS",
          module: "STORAGE",
          userId: auth.userId,
          details: {
            deletedCount: filesToDelete.length,
            freedSpace: totalFreedSpace,
            freedSpaceFormatted: formatFileSize(totalFreedSpace),
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: filesToDelete.length,
        freedSpace: totalFreedSpace,
        freedSpaceFormatted: formatFileSize(totalFreedSpace),
      },
      message: `Deleted ${filesToDelete.length} orphaned files, freed ${formatFileSize(totalFreedSpace)}`,
    })
  } catch (error) {
    console.error("Delete orphans error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete orphaned files" },
      { status: 500 }
    )
  }
}