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

// GET /api/admin/videos - List all videos
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const skip = (page - 1) * limit

    const where = lessonId ? { lessonId } : {}

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              module: {
                select: {
                  id: true,
                  title: true,
                  course: {
                    select: {
                      id: true,
                      title: true,
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.video.count({ where })
    ])

    const formattedVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      videoUrl: v.videoUrl,
      duration: v.duration,
      provider: v.provider,
      storageType: v.storageType,
      orderIndex: v.orderIndex,
      createdAt: v.createdAt.toISOString(),
      lesson: v.lesson ? {
        id: v.lesson.id,
        title: v.lesson.title,
        module: v.lesson.module ? {
          id: v.lesson.module.id,
          title: v.lesson.module.title,
          course: v.lesson.module.course ? {
            id: v.lesson.module.course.id,
            title: v.lesson.module.course.title,
          } : null
        } : null
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        videos: formattedVideos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error("Get videos error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch videos" },
      { status: 500 }
    )
  }
}

// POST /api/admin/videos - Upload/create a new video
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    // Handle multipart form data for file upload
    const formData = await request.formData()
    const lessonId = formData.get("lessonId") as string
    const title = formData.get("title") as string
    const videoUrl = formData.get("videoUrl") as string // For external URLs
    const provider = formData.get("provider") as string || "url" // url, youtube, vimeo, s3, mux
    const storageType = formData.get("storageType") as string || "external"
    const file = formData.get("file") as File | null

    // Validation
    const errors: string[] = []
    
    if (!lessonId) {
      errors.push("Lesson ID is required")
    }
    
    if (!title || title.trim().length < 2) {
      errors.push("Title must be at least 2 characters")
    }

    if (!videoUrl && !file) {
      errors.push("Either video URL or video file is required")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      )
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, title: true, courseId: true }
    })

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      )
    }

    let finalVideoUrl = videoUrl
    let finalProvider = provider
    let finalStorageType = storageType

    // Handle file upload if provided
    if (file) {
      // Validate file type
      const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Invalid video file type. Allowed: MP4, WebM, MOV, AVI" },
          { status: 400 }
        )
      }

      // Max 500MB file size
      const maxSize = 500 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: "Video file too large. Maximum size is 500MB" },
          { status: 400 }
        )
      }

      // In production, upload to S3/Cloudinary here
      // For now, we'll save to local storage
      const { writeFile, mkdir } = await import("fs/promises")
      const path = await import("path")
      const crypto = await import("crypto")
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "videos")
      await mkdir(uploadDir, { recursive: true })
      
      const ext = path.extname(file.name)
      const filename = `${crypto.randomUUID()}${ext}`
      const filepath = path.join(uploadDir, filename)
      
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filepath, buffer)
      
      finalVideoUrl = `/uploads/videos/${filename}`
      finalProvider = "local"
      finalStorageType = "local"
    }

    // Get the next order index
    const lastVideo = await prisma.video.findFirst({
      where: { lessonId },
      orderBy: { orderIndex: "desc" }
    })
    const orderIndex = (lastVideo?.orderIndex ?? -1) + 1

    // Create video record
    const video = await prisma.video.create({
      data: {
        lessonId,
        title: title.trim(),
        videoUrl: finalVideoUrl,
        provider: finalProvider,
        storageType: finalStorageType,
        orderIndex,
      }
    })

    // Update lesson's videoUrl if it's the first video
    if (!lesson.courseId) {
      await prisma.lesson.update({
        where: { id: lessonId },
        data: { videoUrl: finalVideoUrl }
      })
    }

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "VIDEOS",
          userId: auth.userId,
          details: {
            videoId: video.id,
            title: video.title,
            lessonId,
            provider: finalProvider,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl,
        duration: video.duration,
        provider: video.provider,
        storageType: video.storageType,
        orderIndex: video.orderIndex,
      },
      message: "Video uploaded successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create video error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create video" },
      { status: 500 }
    )
  }
}