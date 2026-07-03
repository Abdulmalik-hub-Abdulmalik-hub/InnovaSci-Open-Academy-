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

// GET /api/admin/courses/[id] - Get single course with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
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
      categoryId: course.categoryId,
      category: course.category ? {
        id: course.category.id,
        name: course.category.name,
        slug: course.category.slug,
        icon: course.category.icon,
        color: course.category.color,
      } : null,
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
      introVideoUrl: course.introVideoUrl,
      price: Number(course.price),
      isFree: course.isFree,
      status: course.status,
      certificateTemplateId: course.certificateTemplateId,
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
  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

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

    // Validate status if provided
    if (body.status && !["draft", "published", "archived"].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    // Validate slug if provided
    if (body.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
      return NextResponse.json(
        { success: false, error: "Invalid slug format" },
        { status: 400 }
      )
    }

    // Check if new slug already exists
    if (body.slug && body.slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug: body.slug }
      })
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "A course with this slug already exists" },
          { status: 409 }
        )
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: {
        title: body.title ?? existingCourse.title,
        slug: body.slug ? body.slug.toLowerCase() : existingCourse.slug,
        category: body.category !== undefined ? body.category : existingCourse.category,
        subcategory: body.subcategory !== undefined ? body.subcategory : existingCourse.subcategory,
        shortDescription: body.shortDescription !== undefined ? body.shortDescription : existingCourse.shortDescription,
        fullDescription: body.fullDescription !== undefined ? body.fullDescription : existingCourse.fullDescription,
        learningOutcomes: body.learningOutcomes !== undefined ? body.learningOutcomes : existingCourse.learningOutcomes,
        prerequisites: body.prerequisites !== undefined ? body.prerequisites : existingCourse.prerequisites,
        targetAudience: body.targetAudience !== undefined ? body.targetAudience : existingCourse.targetAudience,
        difficultyLevel: body.difficultyLevel !== undefined ? body.difficultyLevel : existingCourse.difficultyLevel,
        language: body.language ?? existingCourse.language,
        durationHours: body.durationHours !== undefined ? body.durationHours : existingCourse.durationHours,
        thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl : existingCourse.thumbnailUrl,
        promoVideoUrl: body.promoVideoUrl !== undefined ? body.promoVideoUrl : existingCourse.promoVideoUrl,
        introVideoUrl: body.introVideoUrl !== undefined ? body.introVideoUrl : existingCourse.introVideoUrl,
        price: body.price !== undefined ? body.price : existingCourse.price,
        isFree: body.isFree !== undefined ? body.isFree : existingCourse.isFree,
        status: body.status ?? existingCourse.status,
        certificateTemplateId: body.certificateTemplateId !== undefined ? body.certificateTemplateId : existingCourse.certificateTemplateId,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "COURSES",
          userId: auth.userId,
          details: {
            courseId: course.id,
            title: course.title,
            changes: body,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

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
  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

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

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "COURSES",
          userId: auth.userId,
          details: {
            courseId: id,
            title: course.title,
            slug: course.slug,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

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
