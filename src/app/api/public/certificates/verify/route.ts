import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/certificates/verify - Verify a certificate by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Verification code is required" },
        { status: 400 }
      )
    }

    // Find certificate by verification code
    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: code.toUpperCase() },
      include: {
        user: {
          include: {
            profile: {
              select: {
                fullName: true,
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
      }
    })

    if (!certificate) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          message: "Certificate not found"
        }
      })
    }

    // Return certificate details if valid
    return NextResponse.json({
      success: true,
      data: {
        valid: certificate.status === "issued",
        status: certificate.status,
        verificationCode: certificate.verificationCode,
        issuedAt: certificate.issuedAt.toISOString(),
        student: certificate.user.profile?.fullName || certificate.user.email,
        courseName: certificate.course.title,
        revoked: certificate.status === "revoked",
      }
    })
  } catch (error) {
    console.error("Verify certificate error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to verify certificate" },
      { status: 500 }
    )
  }
}