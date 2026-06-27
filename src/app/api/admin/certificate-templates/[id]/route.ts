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

// GET /api/admin/certificate-templates/[id] - Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    const template = await prisma.certificateTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        backgroundUrl: template.backgroundUrl,
        width: template.width,
        height: template.height,
        fields: {
          studentName: { x: template.studentNameX, y: template.studentNameY, size: template.studentNameSize, font: template.studentNameFont },
          courseName: { x: template.courseNameX, y: template.courseNameY, size: template.courseNameSize, font: template.courseNameFont },
          issueDate: { x: template.issueDateX, y: template.issueDateY, size: template.issueDateSize, font: template.issueDateFont },
          certificateId: { x: template.certificateIdX, y: template.certificateIdY, size: template.certificateIdSize, font: template.certificateIdFont }
        },
        textColor: template.textColor,
        isActive: template.isActive,
        coursesCount: template._count.courses,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error("Get template error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate template" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/certificate-templates/[id] - Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Check if template exists
    const existing = await prisma.certificateTemplate.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      )
    }

    const {
      name,
      description,
      backgroundUrl,
      width,
      height,
      fields,
      textColor,
      isActive
    } = body

    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (backgroundUrl !== undefined) updateData.backgroundUrl = backgroundUrl
    if (width !== undefined) updateData.width = width
    if (height !== undefined) updateData.height = height
    if (textColor !== undefined) updateData.textColor = textColor
    if (isActive !== undefined) updateData.isActive = isActive

    // Update field positions if provided
    if (fields) {
      if (fields.studentName) {
        if (fields.studentName.x !== undefined) updateData.studentNameX = fields.studentName.x
        if (fields.studentName.y !== undefined) updateData.studentNameY = fields.studentName.y
        if (fields.studentName.size !== undefined) updateData.studentNameSize = fields.studentName.size
        if (fields.studentName.font !== undefined) updateData.studentNameFont = fields.studentName.font
      }
      if (fields.courseName) {
        if (fields.courseName.x !== undefined) updateData.courseNameX = fields.courseName.x
        if (fields.courseName.y !== undefined) updateData.courseNameY = fields.courseName.y
        if (fields.courseName.size !== undefined) updateData.courseNameSize = fields.courseName.size
        if (fields.courseName.font !== undefined) updateData.courseNameFont = fields.courseName.font
      }
      if (fields.issueDate) {
        if (fields.issueDate.x !== undefined) updateData.issueDateX = fields.issueDate.x
        if (fields.issueDate.y !== undefined) updateData.issueDateY = fields.issueDate.y
        if (fields.issueDate.size !== undefined) updateData.issueDateSize = fields.issueDate.size
        if (fields.issueDate.font !== undefined) updateData.issueDateFont = fields.issueDate.font
      }
      if (fields.certificateId) {
        if (fields.certificateId.x !== undefined) updateData.certificateIdX = fields.certificateId.x
        if (fields.certificateId.y !== undefined) updateData.certificateIdY = fields.certificateId.y
        if (fields.certificateId.size !== undefined) updateData.certificateIdSize = fields.certificateId.size
        if (fields.certificateId.font !== undefined) updateData.certificateIdFont = fields.certificateId.font
      }
    }

    const template = await prisma.certificateTemplate.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        backgroundUrl: template.backgroundUrl,
        fields: {
          studentName: { x: template.studentNameX, y: template.studentNameY, size: template.studentNameSize, font: template.studentNameFont },
          courseName: { x: template.courseNameX, y: template.courseNameY, size: template.courseNameSize, font: template.courseNameFont },
          issueDate: { x: template.issueDateX, y: template.issueDateY, size: template.issueDateSize, font: template.issueDateFont },
          certificateId: { x: template.certificateIdX, y: template.certificateIdY, size: template.certificateIdSize, font: template.certificateIdFont }
        }
      }
    })
  } catch (error) {
    console.error("Update template error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update certificate template" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/certificate-templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if template is in use
    const coursesUsing = await prisma.course.count({
      where: { certificateTemplateId: id }
    })

    if (coursesUsing > 0) {
      return NextResponse.json(
        { success: false, error: `Template is used by ${coursesUsing} course(s). Remove it from courses first.` },
        { status: 400 }
      )
    }

    await prisma.certificateTemplate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully"
    })
  } catch (error) {
    console.error("Delete template error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete certificate template" },
      { status: 500 }
    )
  }
}