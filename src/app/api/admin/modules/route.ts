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

// GET /api/admin/modules - List modules for a course
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/modules"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ success: false, error: "courseId is required" }, { status: 400 })
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { modules }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to fetch modules" }, { status: 500 })
  }
}

// POST /api/admin/modules - Create module with optional lessons
export async function POST(request: NextRequest) {
  const endpoint = "/api/admin/modules"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { courseId, title, description, orderIndex, lessons } = body

    if (!courseId) {
      return NextResponse.json({ success: false, error: "courseId is required" }, { status: 400 })
    }

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Title must be at least 2 characters" }, { status: 400 })
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    // Get max orderIndex if not provided
    let finalOrderIndex = orderIndex
    if (finalOrderIndex === undefined) {
      const maxOrder = await prisma.module.aggregate({
        where: { courseId },
        _max: { orderIndex: true }
      })
      finalOrderIndex = (maxOrder._max.orderIndex || 0) + 1
    }

    // Create module with optional lessons
    const module = await prisma.module.create({
      data: {
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        orderIndex: finalOrderIndex,
        lessons: lessons && lessons.length > 0 ? {
          create: lessons.map((lesson: any, index: number) => ({
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
        } : undefined
      },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { module }
    }, { status: 201 })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to create module" }, { status: 500 })
  }
}
