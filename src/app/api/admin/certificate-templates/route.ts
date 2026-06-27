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

// GET /api/admin/certificate-templates - List all templates
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    const templates = await prisma.certificateTemplate.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { courses: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const formattedTemplates = templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      backgroundUrl: t.backgroundUrl,
      width: t.width,
      height: t.height,
      // Field positions
      fields: {
        studentName: { x: t.studentNameX, y: t.studentNameY, size: t.studentNameSize, font: t.studentNameFont },
        courseName: { x: t.courseNameX, y: t.courseNameY, size: t.courseNameSize, font: t.courseNameFont },
        issueDate: { x: t.issueDateX, y: t.issueDateY, size: t.issueDateSize, font: t.issueDateFont },
        certificateId: { x: t.certificateIdX, y: t.certificateIdY, size: t.certificateIdSize, font: t.certificateIdFont }
      },
      textColor: t.textColor,
      isActive: t.isActive,
      coursesCount: t._count.courses,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: { templates: formattedTemplates }
    })
  } catch (error) {
    console.error("Get templates error:", error)
    // Return a more helpful error message
    const errorMessage = error instanceof Error ? error.message : "Database error"
    return NextResponse.json(
      { success: false, error: `Failed to fetch templates: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// POST /api/admin/certificate-templates - Create a new template
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const {
      name,
      description,
      backgroundUrl,
      width = 1200,
      height = 900,
      fields,
      textColor = "#1a1a2e"
    } = body

    if (!name || !backgroundUrl) {
      return NextResponse.json(
        { success: false, error: "Name and background URL are required" },
        { status: 400 }
      )
    }

    const template = await prisma.certificateTemplate.create({
      data: {
        name,
        description,
        backgroundUrl,
        width,
        height,
        studentNameX: fields?.studentName?.x ?? 0.5,
        studentNameY: fields?.studentName?.y ?? 0.35,
        studentNameSize: fields?.studentName?.size ?? 48,
        studentNameFont: fields?.studentName?.font ?? "Georgia",
        courseNameX: fields?.courseName?.x ?? 0.5,
        courseNameY: fields?.courseName?.y ?? 0.5,
        courseNameSize: fields?.courseName?.size ?? 32,
        courseNameFont: fields?.courseName?.font ?? "Georgia",
        issueDateX: fields?.issueDate?.x ?? 0.5,
        issueDateY: fields?.issueDate?.y ?? 0.65,
        issueDateSize: fields?.issueDate?.size ?? 24,
        issueDateFont: fields?.issueDate?.font ?? "Georgia",
        certificateIdX: fields?.certificateId?.x ?? 0.5,
        certificateIdY: fields?.certificateId?.y ?? 0.75,
        certificateIdSize: fields?.certificateId?.size ?? 18,
        certificateIdFont: fields?.certificateId?.font ?? "Courier",
        textColor
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        backgroundUrl: template.backgroundUrl
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Create template error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create certificate template" },
      { status: 500 }
    )
  }
}