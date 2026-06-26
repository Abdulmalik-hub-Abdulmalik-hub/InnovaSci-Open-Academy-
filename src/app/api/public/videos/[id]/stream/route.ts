import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Generate a signed URL that expires after a specified time
function generateSignedUrl(videoUrl: string, expiresIn: number = 3600): string {
  const expiry = Math.floor(Date.now() / 1000) + expiresIn
  const signature = crypto
    .createHmac("sha256", process.env.VIDEO_SIGNING_SECRET || "default-secret-key")
    .update(`${videoUrl}:${expiry}`)
    .digest("hex")
  
  const separator = videoUrl.includes("?") ? "&" : "?"
  return `${videoUrl}${separator}expires=${expiry}&signature=${signature}`
}

// Check if user is enrolled in the course
async function checkEnrollment(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  })
  return !!enrollment
}

// Check if user is admin
async function checkAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  return user?.role === "ADMIN"
}

// GET /api/public/videos/[id]/stream - Get signed URL for video streaming
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user from auth header
    const authHeader = request.headers.get("Authorization")
    let userId: string | null = null
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      userId = token.startsWith("user_") ? token.substring(5) : null
    }

    // Fetch video with lesson and course info
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            courseId: true,
            isPreview: true,
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

    // If video is a preview, allow access without authentication
    if (video.lesson?.isPreview) {
      return NextResponse.json({
        success: true,
        data: {
          videoUrl: video.videoUrl,
          duration: video.duration,
          provider: video.provider,
          signed: false,
        }
      })
    }

    // For non-preview videos, require authentication
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access this video" },
        { status: 401 }
      )
    }

    // Check enrollment or admin status
    const isAdmin = await checkAdmin(userId)
    const isEnrolled = await checkEnrollment(userId, video.lesson?.courseId || "")

    if (!isAdmin && !isEnrolled) {
      return NextResponse.json(
        { success: false, error: "You must be enrolled in this course to access this video" },
        { status: 403 }
      )
    }

    // Generate signed URL for secure access (expires in 1 hour)
    const signedVideoUrl = generateSignedUrl(video.videoUrl, 3600)

    return NextResponse.json({
      success: true,
      data: {
        videoUrl: signedVideoUrl,
        duration: video.duration,
        provider: video.provider,
        signed: true,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      }
    })
  } catch (error) {
    console.error("Video stream error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to get video" },
      { status: 500 }
    )
  }
}