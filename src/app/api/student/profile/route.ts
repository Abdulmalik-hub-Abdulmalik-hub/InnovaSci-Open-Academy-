import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/profile - Get current user's profile with stats
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"

    // Fetch user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        enrollments: {
          select: {
            id: true,
            courseId: true,
            completed: true,
            progressPercent: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Count completed courses (100% progress)
    const coursesCompleted = user.enrollments.filter(
      e => e.completed || e.progressPercent === 100
    ).length

    // Calculate total hours learned using efficient aggregation
    // Sum duration of all lessons marked as COMPLETED for this user
    const completedProgress = await prisma.userLectureProgress.findMany({
      where: {
        userId,
        completed: true
      },
      include: {
        lesson: {
          select: {
            duration: true,
            courseId: true
          }
        }
      }
    })

    // Sum up durations (duration is in seconds, convert to hours)
    const totalSeconds = completedProgress.reduce((acc, progress) => {
      return acc + (progress.lesson.duration || 0)
    }, 0)
    const totalHoursLearned = Math.round((totalSeconds / 3600) * 10) / 10

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          role: user.role
        },
        profile: user.profile ? {
          id: user.profile.id,
          fullName: user.profile.fullName,
          username: user.profile.username,
          bio: user.profile.bio,
          avatarUrl: user.profile.avatarUrl,
          phone: user.profile.phone,
          country: user.profile.country,
          city: user.profile.city,
          gender: user.profile.gender
        } : null,
        stats: {
          coursesCompleted,
          totalHoursLearned,
          memberSince: user.createdAt
        }
      }
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// PUT /api/student/profile - Update profile (displayName, bio, avatar)
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const body = await request.json()
    const { fullName, bio, avatarUrl } = body

    // Validate inputs
    if (fullName && fullName.length > 100) {
      return NextResponse.json(
        { success: false, error: "Display name must be 100 characters or less" },
        { status: 400 }
      )
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { success: false, error: "Bio must be 500 characters or less" },
        { status: 400 }
      )
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName: fullName || undefined,
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined
      },
      create: {
        userId,
        fullName: fullName || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl
        }
      }
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

// POST /api/student/profile/avatar - Upload avatar image
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only JPEG, PNG, GIF, and WebP images are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (500KB max)
    const maxSize = 500 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Image must be under 500KB" },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: "Storage not configured" },
        { status: 500 }
      )
    }

    // Lazy import createServerClient
    const { createServerClient } = await import("@/lib/supabase")
    
    // Upload to Supabase Storage
    const supabase = createServerClient()
    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `avatars/${userId}_${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true
      })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to upload image" },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

    const avatarUrl = urlData.publicUrl

    // Update profile with avatar URL
    await prisma.profile.upsert({
      where: { userId },
      update: { avatarUrl },
      create: { userId, avatarUrl }
    })

    return NextResponse.json({
      success: true,
      data: { avatarUrl }
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload avatar" },
      { status: 500 }
    )
  }
}