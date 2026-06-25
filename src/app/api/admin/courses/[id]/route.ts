import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/courses/[id] - Get single course with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
              include: {
                materials: true,
                videos: true,
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true,
            wishlists: true,
          }
        },
        enrollments: {
          where: { completed: true },
          select: { id: true }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Transform data
    const transformedCourse = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      subcategory: course.subcategory,
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      learningOutcomes: course.learningOutcomes,
      prerequisites: course.prerequisites,
      targetAudience: course.targetAudience,
      difficultyLevel: course.difficultyLevel,
      language: course.language,
      durationHours: course.durationHours,
      thumbnailUrl: course.thumbnailUrl,
      promoVideoUrl: course.promoVideoUrl,
      price: Number(course.price),
      isFree: course.isFree,
      status: course.status,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      modules: course.modules.map((m: { 
        id: string; 
        title: string; 
        description: string | null; 
        orderIndex: number; 
        lessons: {
          id: string;
          title: string;
          description: string | null;
          orderIndex: number;
          lessonType: string;
          duration: number | null;
          videoUrl: string | null;
          isPreview: boolean;
          materials: unknown[];
          videos: unknown[];
        }[]
      }) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        orderIndex: m.orderIndex,
        lessons: m.lessons.map(l => ({
          id: l.id,
          title: l.title,
          description: l.description,
          orderIndex: l.orderIndex,
          lessonType: l.lessonType,
          duration: l.duration,
          videoUrl: l.videoUrl,
          isPreview: l.isPreview,
          materials: l.materials,
          videos: l.videos,
        })),
      })),
      stats: {
        enrollments: course._count.enrollments,
        completed: course.enrollments.length,
        wishlists: course._count.wishlists,
      }
    }

    return NextResponse.json({
      success: true,
      data: transformedCourse
    })
  } catch (error) {
    console.error("Get course error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: {
        title: body.title ?? existingCourse.title,
        slug: body.slug ?? existingCourse.slug,
        category: body.category ?? existingCourse.category,
        subcategory: body.subcategory ?? existingCourse.subcategory,
        shortDescription: body.shortDescription ?? existingCourse.shortDescription,
        fullDescription: body.fullDescription ?? existingCourse.fullDescription,
        learningOutcomes: body.learningOutcomes ?? existingCourse.learningOutcomes,
        prerequisites: body.prerequisites ?? existingCourse.prerequisites,
        targetAudience: body.targetAudience ?? existingCourse.targetAudience,
        difficultyLevel: body.difficultyLevel ?? existingCourse.difficultyLevel,
        language: body.language ?? existingCourse.language,
        durationHours: body.durationHours ?? existingCourse.durationHours,
        thumbnailUrl: body.thumbnailUrl ?? existingCourse.thumbnailUrl,
        promoVideoUrl: body.promoVideoUrl ?? existingCourse.promoVideoUrl,
        price: body.price ?? existingCourse.price,
        isFree: body.isFree ?? existingCourse.isFree,
        status: body.status ?? existingCourse.status,
      }
    })

    return NextResponse.json({
      success: true,
      data: { course },
      message: "Course updated successfully"
    })

  } catch (error) {
    console.error("Update course error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Delete course (cascade will handle related records)
    await prisma.course.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully"
    })

  } catch (error) {
    console.error("Delete course error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    )
  }
}
