import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
import { uploadFile, deleteFile } from "@/lib/storage"

// Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  // Get auth header
  const authHeader = request.headers.get("Authorization")
  
  // For demo mode without auth, allow access but log it
  if (!authHeader) {
    console.log("[Materials API] No auth header - running in demo mode")
    return { authorized: true }
  }
  
  // If auth is provided, validate it
  // In production, implement proper JWT/session validation here
  try {
    // Example: Check for Bearer token
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      // TODO: Implement proper token validation
      // For now, accept tokens in format: admin_<userId>
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        // Verify user exists and is admin
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

// GET /api/admin/materials - List all materials
export async function GET(request: NextRequest) {
  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const lessonId = searchParams.get("lessonId") || ""
    const type = searchParams.get("type") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (search) {
      where.title = { contains: search, mode: "insensitive" }
    }
    if (lessonId) {
      where.lessonId = lessonId
    }
    if (type) {
      where.type = type
    }

    const [materials, total, lessons] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              courseId: true,
              module: {
                select: {
                  id: true,
                  title: true,
                  course: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.material.count({ where }),
      prisma.lesson.findMany({
        select: { id: true, title: true },
        orderBy: { title: "asc" },
      }),
    ])

    const formattedMaterials = materials.map((material) => ({
      id: material.id,
      title: material.title,
      type: material.type,
      fileUrl: material.fileUrl,
      visibility: material.visibility,
      downloadAllowed: material.downloadAllowed,
      createdAt: material.createdAt.toISOString(),
      lesson: material.lesson
        ? {
            id: material.lesson.id,
            title: material.lesson.title,
            courseId: material.lesson.courseId,
            courseTitle: material.lesson.module?.course?.title || null,
          }
        : null,
    }))

    // Get unique file types for filtering
    const fileTypes = Array.from(new Set(materials.map((m) => m.type).filter(Boolean) as string[]))

    return NextResponse.json({
      success: true,
      data: {
        materials: formattedMaterials,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          lessons: lessons.map((l) => ({ id: l.id, title: l.title })),
          fileTypes,
        },
      },
    })
  } catch (error) {
    console.error("Materials API error:", error)
    return NextResponse.json({
      success: false,
      error: "Database not ready",
      data: {
        materials: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        filters: { lessons: [], fileTypes: [] },
      },
    })
  }
}

// POST /api/admin/materials - Upload new material
export async function POST(request: NextRequest) {
  // Check admin auth
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: "Database configuration missing" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null
    const lessonId = formData.get("lessonId") as string | null
    const type = formData.get("type") as string | null
    const visibility = formData.get("visibility") as string | null
    const downloadAllowed = formData.get("downloadAllowed") as string | null

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      )
    }

    if (!lessonId) {
      return NextResponse.json(
        { success: false, error: "Lesson ID is required" },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File is required" },
        { status: 400 }
      )
    }

    // Validate lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    })

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      )
    }

    // Upload file
    const uploadResult = await uploadFile(file, title)

    if (!uploadResult.success || !uploadResult.fileUrl) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || "Failed to upload file" },
        { status: 500 }
      )
    }

    // Determine file type from upload result or use provided type
    const fileType = uploadResult.fileType || type || "DOCUMENT"

    // Create material record
    const material = await prisma.material.create({
      data: {
        lessonId,
        title,
        type: fileType,
        fileUrl: uploadResult.fileUrl,
        visibility: visibility || "public",
        downloadAllowed: downloadAllowed !== "false",
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "MATERIALS",
          details: {
            materialId: material.id,
            title: material.title,
            fileUrl: material.fileUrl,
            fileType: material.type,
            lessonId: material.lessonId,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          material: {
            id: material.id,
            title: material.title,
            type: material.type,
            fileUrl: material.fileUrl,
            visibility: material.visibility,
            downloadAllowed: material.downloadAllowed,
            createdAt: material.createdAt.toISOString(),
            lesson: material.lesson
              ? {
                  id: material.lesson.id,
                  title: material.lesson.title,
                  courseId: material.lesson.courseId,
                }
              : null,
          },
        },
        message: "Material uploaded successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create material error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create material",
      },
      { status: 500 }
    )
  }
}