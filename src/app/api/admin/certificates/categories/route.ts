import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

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
        
        if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "ACTIVE") {
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

// GET /api/admin/certificates/categories - List all category certificates
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    // Get category certificates with related data
    const where = search
      ? {
          OR: [
            { certificateName: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { category: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}

    const [certificates, total, stats] = await Promise.all([
      prisma.categoryCertificate.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              domain: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  color: true,
                },
              },
              _count: {
                select: { courses: true },
              },
            },
          },
          _count: {
            select: { issued: true },
          },
        },
        orderBy: { orderIndex: "asc" },
        skip,
        take: limit,
      }),
      prisma.categoryCertificate.count({ where }),
      prisma.categoryIssuedCert.aggregate({
        _count: true,
        where: { status: "ACTIVE" },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        certificates: certificates.map(cert => ({
          id: cert.id,
          certificateName: cert.certificateName,
          description: cert.description,
          category: cert.category,
          courseCount: cert.category._count.courses,
          issuedCount: cert._count.issued,
          isActive: cert.isActive,
          orderIndex: cert.orderIndex,
          createdAt: cert.createdAt,
        })),
        stats: {
          totalCertificates: total,
          totalIssued: stats._count,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get category certificates error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch category certificates" },
      { status: 500 }
    )
  }
}

// POST /api/admin/certificates/categories - Create a new category certificate
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { categoryId, certificateName, description, requirements, templateData } = body

    if (!categoryId || !certificateName) {
      return NextResponse.json(
        { success: false, error: "Category ID and certificate name are required" },
        { status: 400 }
      )
    }

    // Check if certificate already exists for this category
    const existing = await prisma.categoryCertificate.findUnique({
      where: { categoryId },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Certificate already exists for this category" },
        { status: 400 }
      )
    }

    const certificate = await prisma.categoryCertificate.create({
      data: {
        categoryId,
        certificateName,
        description,
        requirements: requirements || {},
        templateData: templateData || {},
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: { certificate },
    })
  } catch (error) {
    console.error("Create category certificate error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create category certificate" },
      { status: 500 }
    )
  }
}
