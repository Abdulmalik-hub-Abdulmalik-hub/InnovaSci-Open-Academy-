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

// GET /api/admin/certificates - List all certificates
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || ""
    const courseId = searchParams.get("courseId") || ""
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (status && status !== "all") {
      where.status = status
    }
    if (courseId) {
      where.courseId = courseId
    }
    if (search) {
      where.OR = [
        { verificationCode: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { course: { title: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        include: {
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                }
              }
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailUrl: true,
            }
          }
        },
        orderBy: { issuedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.certificate.count({ where })
    ])

    const formattedCertificates = certificates.map(cert => ({
      id: cert.id,
      verificationCode: cert.verificationCode,
      certificateUrl: cert.certificateUrl,
      status: cert.status,
      issuedAt: cert.issuedAt.toISOString(),
      user: {
        id: cert.user.id,
        name: cert.user.profile?.fullName,
        email: cert.user.email,
        avatarUrl: cert.user.profile?.avatarUrl,
      },
      course: cert.course,
    }))

    return NextResponse.json({
      success: true,
      data: {
        certificates: formattedCertificates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error("Get certificates error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    )
  }
}