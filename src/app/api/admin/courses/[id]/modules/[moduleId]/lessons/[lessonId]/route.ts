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

// PUT /api/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId] - Update a lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id: courseId, moduleId, lessonId } = await params
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

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true }
    })

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      )
    }

    if (lesson.moduleId !== moduleId || lesson.courseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Lesson does not belong to this module/course" },
        { status: 400 }
      )
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: title !== undefined ? title.trim() : lesson.title,
        description: description !== undefined ? description?.trim() : lesson.description,
        lessonType: lessonType || lesson.lessonType,
        duration: duration !== undefined ? (duration || null) : lesson.duration,
        videoUrl: videoUrl !== undefined ? (videoUrl?.trim() || null) : lesson.videoUrl,
        isPreview: isPreview !== undefined ? isPreview : lesson.isPreview,
        isExercise: isExercise !== undefined ? isExercise : lesson.isExercise,
        exerciseDescription: exerciseDescription !== undefined ? (exerciseDescription?.trim() || null) : lesson.exerciseDescription,
        exerciseFilesUrl: exerciseFilesUrl !== undefined ? (exerciseFilesUrl?.trim() || null) : lesson.exerciseFilesUrl,
        solutionVideoUrl: solutionVideoUrl !== undefined ? (solutionVideoUrl?.trim() || null) : lesson.solutionVideoUrl,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "LESSONS",
          userId: auth.userId,
          details: {
            lessonId,
            title: updatedLesson.title,
            moduleId,
            courseId,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLesson.id,
        title: updatedLesson.title,
        description: updatedLesson.description,
        lessonType: updatedLesson.lessonType,
        duration: updatedLesson.duration,
        videoUrl: updatedLesson.videoUrl,
        isPreview: updatedLesson.isPreview,
        isExercise: updatedLesson.isExercise,
        exerciseDescription: updatedLesson.exerciseDescription,
        exerciseFilesUrl: updatedLesson.exerciseFilesUrl,
        solutionVideoUrl: updatedLesson.solutionVideoUrl,
        orderIndex: updatedLesson.orderIndex,
      },
      message: "Lesson updated successfully"
    })
  } catch (error) {
    console.error("Update lesson error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update lesson" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId] - Delete a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id: courseId, moduleId, lessonId } = await params

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true }
    })

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      )
    }

    if (lesson.moduleId !== moduleId || lesson.courseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Lesson does not belong to this module/course" },
        { status: 400 }
      )
    }

    await prisma.lesson.delete({
      where: { id: lessonId }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "LESSONS",
          userId: auth.userId,
          details: {
            lessonId,
            title: lesson.title,
            moduleId,
            moduleTitle: lesson.module?.title,
            courseId,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully"
    })
  } catch (error) {
    console.error("Delete lesson error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete lesson" },
      { status: 500 }
    )
  }
}
