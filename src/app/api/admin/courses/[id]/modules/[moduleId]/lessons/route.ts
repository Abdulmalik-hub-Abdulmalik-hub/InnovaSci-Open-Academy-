import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/admin/courses/[id]/modules/[moduleId]/lessons - Create a new lesson
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: courseId, moduleId } = await params
    const body = await request.json()
    const { title, description, lessonType, duration, videoUrl, isPreview } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Lesson title is required" },
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
        moduleId: moduleId || null,
        title,
        description: description || null,
        lessonType: lessonType || "video",
        duration: duration || null,
        videoUrl: videoUrl || null,
        isPreview: isPreview ?? false,
        orderIndex,
      }
    })

    return NextResponse.json({
      success: true,
      data: { lesson },
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
