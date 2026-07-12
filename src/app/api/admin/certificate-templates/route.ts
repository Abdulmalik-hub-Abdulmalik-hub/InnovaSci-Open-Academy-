import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic';

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
    const type = searchParams.get("type") // Filter by type: CATEGORY, DOMAIN

    const where: Record<string, unknown> = {}
    if (!includeInactive) {
      where.isActive = true
    }
    if (type && (type === "CATEGORY" || type === "DOMAIN")) {
      where.type = type
    }

    const templates = await prisma.certificateTemplate.findMany({
      where,
      include: {
        _count: {
          select: { 
            courses: true 
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const formattedTemplates = templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: t.type,
      backgroundUrl: t.backgroundUrl,
      width: t.width,
      height: t.height,
      // Field positions
      fields: {
        studentName: { x: t.studentNameX, y: t.studentNameY, size: t.studentNameSize, font: t.studentNameFont },
        certificateType: { x: t.certificateTypeX, y: t.certificateTypeY, size: t.certificateTypeSize || 32, font: t.certificateTypeFont || "Georgia" },
        issueDate: { x: t.issueDateX, y: t.issueDateY, size: t.issueDateSize, font: t.issueDateFont },
        certificateId: { x: t.certificateIdX, y: t.certificateIdY, size: t.certificateIdSize, font: t.certificateIdFont }
      },
      // Additional fields for category/domain certificates
      domainName: t.domainNameX ? { x: t.domainNameX, y: t.domainNameY, size: t.domainNameSize, font: t.domainNameFont } : null,
      categoryName: t.categoryNameX ? { x: t.categoryNameX, y: t.categoryNameY, size: t.categoryNameSize, font: t.categoryNameFont } : null,
      // Signatures
      ceoSignature: t.ceoSignatureX ? {
        x: t.ceoSignatureX, y: t.ceoSignatureY, 
        width: t.ceoSignatureWidth, height: t.ceoSignatureHeight
      } : null,
      academicDirectorSignature: t.academicDirectorSignatureX ? {
        x: t.academicDirectorSignatureX, y: t.academicDirectorSignatureY,
        width: t.academicDirectorSignatureWidth, height: t.academicDirectorSignatureHeight
      } : null,
      // Official seal
      officialSeal: t.officialSealX ? {
        x: t.officialSealX, y: t.officialSealY,
        width: t.officialSealWidth, height: t.officialSealHeight
      } : null,
      textColor: t.textColor,
      isActive: t.isActive,
      categoryCount: 0, // Will be populated from category certificates
      domainCount: 0,   // Will be populated from domain certificates
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: { templates: formattedTemplates }
    })
  } catch (error) {
    console.error("Get templates error:", error)
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
      type = "CATEGORY", // Default to CATEGORY for new templates
      backgroundUrl,
      width = 1200,
      height = 900,
      textColor = "#1a1a2e",
      ceoSignatureUrl,
      academicDirectorSignatureUrl,
      officialSealUrl,
    } = body

    if (!name || !backgroundUrl) {
      return NextResponse.json(
        { success: false, error: "Name and background URL are required" },
        { status: 400 }
      )
    }

    // Validate type
    if (type !== "CATEGORY" && type !== "DOMAIN") {
      return NextResponse.json(
        { success: false, error: "Type must be CATEGORY or DOMAIN" },
        { status: 400 }
      )
    }

    const template = await prisma.certificateTemplate.create({
      data: {
        name,
        description,
        type,
        backgroundUrl,
        width,
        height,
        studentNameX: 0.5,
        studentNameY: 0.35,
        studentNameSize: 48,
        studentNameFont: "Georgia",
        certificateTypeX: 0.5,
        certificateTypeY: 0.25,
        certificateTypeSize: 24,
        certificateTypeFont: "Georgia",
        courseNameX: 0.5,
        courseNameY: 0.5,
        courseNameSize: 32,
        courseNameFont: "Georgia",
        issueDateX: 0.5,
        issueDateY: 0.75,
        issueDateSize: 20,
        issueDateFont: "Georgia",
        certificateIdX: 0.5,
        certificateIdY: 0.85,
        certificateIdSize: 14,
        certificateIdFont: "Courier",
        textColor,
        // Signature positions
        ceoSignatureX: 0.3,
        ceoSignatureY: 0.8,
        ceoSignatureWidth: 150,
        ceoSignatureHeight: 50,
        academicDirectorSignatureX: 0.7,
        academicDirectorSignatureY: 0.8,
        academicDirectorSignatureWidth: 150,
        academicDirectorSignatureHeight: 50,
        // Official seal
        officialSealX: 0.85,
        officialSealY: 0.85,
        officialSealWidth: 80,
        officialSealHeight: 80,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        type: template.type,
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
