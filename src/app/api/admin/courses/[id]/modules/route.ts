import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/courses/[id]/modules - Get all modules for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
          include: {
            _count: {
              select: { materials: true, videos: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        orderIndex: m.orderIndex,
        lessonsCount: m.lessons.length,
        lessons: m.lessons.map(l => ({
          id: l.id,
          title: l.title,
          description: l.description,
          orderIndex: l.orderIndex,
          lessonType: l.lessonType,
          duration: l.duration,
          videoUrl: l.videoUrl,
          isPreview: l.isPreview,
          materialsCount: l._count.materials,
          videosCount: l._count.videos,
        }))
      }))
    })
  } catch (error) {
    console.error("Get modules error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch modules" },
      { status: 500 }
    )
  }
}

// POST /api/admin/courses/[id]/modules - Create a new module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Module title is required" },
        { status: 400 }
      )
    }

    // Get the highest orderIndex
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { orderIndex: "desc" }
    })

    const orderIndex = (lastModule?.orderIndex ?? -1) + 1

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        description: description || null,
        orderIndex,
      }
    })

    return NextResponse.json({
      success: true,
      data: { module },
      message: "Module created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create module error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 }
    )
  }
}
