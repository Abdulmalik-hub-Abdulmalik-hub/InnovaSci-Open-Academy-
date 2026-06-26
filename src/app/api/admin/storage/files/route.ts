import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadFile, scanLocalStorage, formatFileSize, generateSignedUrl } from "@/lib/storage"

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

// GET /api/admin/storage/files - List all files
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const folder = searchParams.get("folder")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (type) where.fileType = type
    if (folder) where.folder = folder

    const [files, total, storageInfo] = await Promise.all([
      prisma.storedFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.storedFile.count({ where }),
      scanLocalStorage(),
    ])

    // Generate signed URLs for S3 files
    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        id: file.id,
        originalName: file.originalName,
        storedName: file.storedName,
        fileUrl: file.storageType === "s3" 
          ? await generateSignedUrl(file.fileUrl) 
          : file.fileUrl,
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
        createdAt: file.createdAt.toISOString(),
      }))
    )

    return NextResponse.json({
      success: true,
      data: {
        files: filesWithUrls,
        storage: {
          localFiles: storageInfo.files.length,
          localSize: storageInfo.totalSize,
          localSizeFormatted: formatFileSize(storageInfo.totalSize),
          totalDbRecords: total,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get files error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 }
    )
  }
}

// POST /api/admin/storage/files - Upload files
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const folder = formData.get("folder") as string | null
    const tagsStr = formData.get("tags") as string | null
    const courseId = formData.get("courseId") as string | null

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      )
    }

    const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : []
    const results = []

    for (const file of files) {
      const uploadResult = await uploadFile(file)

      if (!uploadResult.success) {
        results.push({
          originalName: file.name,
          success: false,
          error: uploadResult.error,
        })
        continue
      }

      // Save to database
      const storedFile = await prisma.storedFile.create({
        data: {
          originalName: file.name,
          storedName: uploadResult.fileName!,
          fileUrl: uploadResult.fileUrl!,
          fileSize: uploadResult.fileSize!,
          mimeType: file.type,
          fileType: uploadResult.fileType!,
          storageType: uploadResult.storageType || "local",
          folder: folder || null,
          tags,
          courseId: courseId || null,
          uploadedBy: auth.userId,
        },
      })

      results.push({
        id: storedFile.id,
        originalName: file.name,
        storedName: storedFile.storedName,
        fileUrl: storedFile.fileUrl,
        fileSize: storedFile.fileSize,
        fileSizeFormatted: formatFileSize(storedFile.fileSize),
        fileType: storedFile.fileType,
        storageType: storedFile.storageType,
        folder: storedFile.folder,
        success: true,
      })
    }

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPLOAD",
          module: "STORAGE",
          userId: auth.userId,
          details: {
            filesCount: files.length,
            successful: results.filter(r => r.success).length,
            folder,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    const successCount = results.filter(r => r.success).length
    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          total: files.length,
          successful: successCount,
          failed: files.length - successCount,
        },
      },
      message: `Uploaded ${successCount} of ${files.length} files`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 }
    )
  }
}