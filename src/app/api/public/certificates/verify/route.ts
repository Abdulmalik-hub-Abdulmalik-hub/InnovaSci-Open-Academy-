import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';

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

    const normalizedCode = code.toUpperCase()

    // First check IssuedCertificate table for new records
    const issuedCert = await prisma.issuedCertificate.findUnique({
      where: { certificateCode: normalizedCode },
      include: {
        student: {
          select: {
            id: true,
            email: true,
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
      }
    })

    // If found in IssuedCertificate, return those details
    if (issuedCert) {
      const isRevoked = !!issuedCert.revokedAt
      
      return NextResponse.json({
        success: true,
        data: {
          valid: !isRevoked,
          status: isRevoked ? "REVOKED" : "ACTIVE",
          certificateId: issuedCert.id,
          certificateCode: issuedCert.certificateCode,
          verificationUrl: issuedCert.verificationUrl,
          pdfUrl: issuedCert.pdfUrl,
          issuedAt: issuedCert.issuedAt.toISOString(),
          studentName: issuedCert.student.profile?.fullName || issuedCert.student.email,
          // Note: studentAvatar is safe to expose as it's already public
          studentAvatar: issuedCert.student.profile?.avatarUrl,
          courseName: issuedCert.course.title,
          courseThumbnail: issuedCert.course.thumbnailUrl,
          revoked: isRevoked,
          revokedAt: issuedCert.revokedAt?.toISOString() || null,
          revokeReason: issuedCert.revokeReason,
          source: "issued_certificates",
        }
      })
    }

    // Fallback to legacy Certificate table
    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: normalizedCode },
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

    // Return certificate details from legacy table
    return NextResponse.json({
      success: true,
      data: {
        valid: certificate.status === "ACTIVE",
        status: certificate.status,
        certificateId: certificate.id,
        verificationCode: certificate.verificationCode,
        verificationUrl: certificate.verificationUrl,
        pdfUrl: certificate.pdfUrl,
        issuedAt: certificate.issuedAt.toISOString(),
        studentName: certificate.user.profile?.fullName || certificate.user.email,
        studentAvatar: certificate.user.profile?.avatarUrl,
        courseName: certificate.course.title,
        courseThumbnail: certificate.course.thumbnailUrl,
        revoked: certificate.status === "REVOKED",
        source: "certificates_legacy",
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