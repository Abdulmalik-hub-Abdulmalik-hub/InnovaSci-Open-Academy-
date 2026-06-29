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

// POST /api/admin/courses/[id]/modules/[moduleId]/lessons - Create a new lesson
export async function POST(
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
    const { 
      title, 
      description, 
      lessonType, 
      duration, 
      videoUrl, 
      isPreview,
      isExercise,
      exerciseDescription,
      exerciseFilesUrl,
      solutionVideoUrl
    } = body

    // Validation
    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Lesson title must be at least 2 characters" },
        { status: 400 }
      )
    }

    // Validate lesson type
    const validLessonTypes = ["video", "reading", "exercise"]
    if (lessonType && !validLessonTypes.includes(lessonType)) {
      return NextResponse.json(
        { success: false, error: `Invalid lesson type. Must be one of: ${validLessonTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // If isExercise is true, exerciseDescription is required
    if (isExercise && !exerciseDescription?.trim()) {
      return NextResponse.json(
        { success: false, error: "Exercise description is required when marking as exercise" },
        { status: 400 }
      )
    }

    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { id: true, title: true, courseId: true }
    })

    if (!module) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    // Verify module belongs to the course
    if (module.courseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Module does not belong to this course" },
        { status: 400 }
      )
    }

    // Get the highest orderIndex for this module
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: "desc" }
    })

    const orderIndex = (lastLesson?.orderIndex ?? -1) + 1

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        moduleId: moduleId,
        title: title.trim(),
        description: description?.trim() || null,
        lessonType: lessonType || "video",
        duration: duration || null,
        videoUrl: videoUrl || null,
        isPreview: isPreview ?? false,
        orderIndex,
        // Exercise fields
        isExercise: isExercise ?? false,
        exerciseDescription: exerciseDescription?.trim() || null,
        exerciseFilesUrl: exerciseFilesUrl || null,
        solutionVideoUrl: solutionVideoUrl || null,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "LESSONS",
          userId: auth.userId,
          details: {
            lessonId: lesson.id,
            title: lesson.title,
            moduleId,
            moduleTitle: module.title,
            courseId,
            isExercise: lesson.isExercise,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        lessonType: lesson.lessonType,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl,
        isPreview: lesson.isPreview,
        orderIndex: lesson.orderIndex,
        isExercise: lesson.isExercise,
        exerciseDescription: lesson.exerciseDescription,
        exerciseFilesUrl: lesson.exerciseFilesUrl,
        solutionVideoUrl: lesson.solutionVideoUrl,
        materialsCount: 0,
        videosCount: 0,
      },
      message: "Lesson created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create lesson error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500 }
    )
  }
}
