import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/certificates - Get user's certificates
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const certificates = await prisma.issuedCertificate.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            category: true
          }
        }
      },
      orderBy: { issuedAt: "desc" }
    })

    // Pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedCertificates = certificates.slice(start, end)

    return NextResponse.json({
      success: true,
      data: {
        certificates: paginatedCertificates.map(cert => ({
          id: cert.id,
          verificationCode: cert.certificateCode,
          certificateUrl: cert.pdfUrl,
          issuedAt: cert.issuedAt,
          course: cert.course
        })),
        pagination: {
          page,
          limit,
          total: certificates.length,
          totalPages: Math.ceil(certificates.length / limit)
        }
      }
    })
  } catch (error) {
    console.error("Certificates API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    )
  }
}
