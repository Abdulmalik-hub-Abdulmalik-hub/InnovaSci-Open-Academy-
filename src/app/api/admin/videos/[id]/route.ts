import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, unlink } from "fs/promises"
import path from "path"

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

// GET /api/admin/videos/[id] - Get single video
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

    const video = await prisma.video.findUnique({
      where: { id },
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
      }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      )
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
        createdAt: video.createdAt.toISOString(),
        lesson: video.lesson ? {
          id: video.lesson.id,
          title: video.lesson.title,
          module: video.lesson.module ? {
            id: video.lesson.module.id,
            title: video.lesson.module.title,
            course: video.lesson.module.course ? {
              id: video.lesson.module.course.id,
              title: video.lesson.module.course.title,
            } : null
          } : null
        } : null
      }
    })
  } catch (error) {
    console.error("Get video error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch video" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/videos/[id] - Update video
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
    const { title, videoUrl, duration, provider, storageType, orderIndex } = body

    const video = await prisma.video.findUnique({
      where: { id }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      )
    }

    // Handle file upload if provided
    let finalVideoUrl = videoUrl ?? video.videoUrl
    let finalProvider = provider ?? video.provider
    let finalStorageType = storageType ?? video.storageType

    // Update video record
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : video.title,
        videoUrl: finalVideoUrl,
        duration: duration !== undefined ? duration : video.duration,
        provider: finalProvider,
        storageType: finalStorageType,
        orderIndex: orderIndex !== undefined ? orderIndex : video.orderIndex,
      }
    })

    // Update lesson's videoUrl if this is the first video
    if (finalVideoUrl && video.orderIndex === 0) {
      await prisma.lesson.update({
        where: { id: video.lessonId },
        data: { videoUrl: finalVideoUrl }
      })
    }

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "VIDEOS",
          userId: auth.userId,
          details: {
            videoId: id,
            title: updatedVideo.title,
            changes: body,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedVideo.id,
        title: updatedVideo.title,
        videoUrl: updatedVideo.videoUrl,
        duration: updatedVideo.duration,
        provider: updatedVideo.provider,
        storageType: updatedVideo.storageType,
        orderIndex: updatedVideo.orderIndex,
      },
      message: "Video updated successfully"
    })
  } catch (error) {
    console.error("Update video error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update video" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/videos/[id] - Delete video
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

    const video = await prisma.video.findUnique({
      where: { id }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      )
    }

    // Delete local file if exists
    if (video.storageType === "local" && video.videoUrl) {
      const filepath = path.join(process.cwd(), "public", video.videoUrl)
      try {
        await unlink(filepath)
      } catch (err) {
        console.warn("Failed to delete local file:", err)
      }
    }

    // Delete from database
    await prisma.video.delete({
      where: { id }
    })

    // If this was the first video, update lesson's videoUrl
    if (video.orderIndex === 0) {
      const nextVideo = await prisma.video.findFirst({
        where: { lessonId: video.lessonId },
        orderBy: { orderIndex: "asc" }
      })
      
      await prisma.lesson.update({
        where: { id: video.lessonId },
        data: { videoUrl: nextVideo?.videoUrl || null }
      })
    }

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "VIDEOS",
          userId: auth.userId,
          details: {
            videoId: id,
            title: video.title,
            lessonId: video.lessonId,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully"
    })
  } catch (error) {
    console.error("Delete video error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete video" },
      { status: 500 }
    )
  }
}