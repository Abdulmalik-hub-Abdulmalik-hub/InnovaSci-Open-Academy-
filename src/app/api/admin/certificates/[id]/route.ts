import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import path from "path"

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

// GET /api/admin/certificates/[id] - Get single certificate
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

    const certificate = await prisma.certificate.findUnique({
      where: { id },
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
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: certificate.id,
        verificationCode: certificate.verificationCode,
        certificateUrl: certificate.certificateUrl,
        status: certificate.status,
        issuedAt: certificate.issuedAt.toISOString(),
        user: {
          id: certificate.user.id,
          name: certificate.user.profile?.fullName,
          email: certificate.user.email,
          avatarUrl: certificate.user.profile?.avatarUrl,
        },
        course: certificate.course,
      }
    })
  } catch (error) {
    console.error("Get certificate error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/certificates/[id] - Update certificate (revoke/reactivate)
export async function PUT(
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
    const { status } = body

    const certificate = await prisma.certificate.findUnique({
      where: { id }
    })

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      )
    }

    // Validate status
    if (status && !["issued", "revoked"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be 'issued' or 'revoked'" },
        { status: 400 }
      )
    }

    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        status: status || certificate.status,
      },
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
          }
        }
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: status === "revoked" ? "REVOKE" : "UPDATE",
          module: "CERTIFICATES",
          userId: auth.userId,
          details: {
            certificateId: id,
            verificationCode: certificate.verificationCode,
            oldStatus: certificate.status,
            newStatus: status,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCertificate.id,
        verificationCode: updatedCertificate.verificationCode,
        certificateUrl: updatedCertificate.certificateUrl,
        status: updatedCertificate.status,
        issuedAt: updatedCertificate.issuedAt.toISOString(),
        user: {
          id: updatedCertificate.user.id,
          name: updatedCertificate.user.profile?.fullName,
          email: updatedCertificate.user.email,
        },
        course: updatedCertificate.course,
      },
      message: status === "revoked" ? "Certificate revoked successfully" : "Certificate updated successfully"
    })
  } catch (error) {
    console.error("Update certificate error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update certificate" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/certificates/[id] - Delete certificate
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

    const certificate = await prisma.certificate.findUnique({
      where: { id }
    })

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      )
    }

    // Delete local file if exists
    if (certificate.certificateUrl) {
      const filepath = path.join(process.cwd(), "public", certificate.certificateUrl)
      try {
        await unlink(filepath)
      } catch (err) {
        console.warn("Failed to delete certificate file:", err)
      }
    }

    // Delete from database
    await prisma.certificate.delete({
      where: { id }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "CERTIFICATES",
          userId: auth.userId,
          details: {
            certificateId: id,
            verificationCode: certificate.verificationCode,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Certificate deleted successfully"
    })
  } catch (error) {
    console.error("Delete certificate error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete certificate" },
      { status: 500 }
    )
  }
}