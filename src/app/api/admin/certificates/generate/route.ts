import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

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

// POST /api/admin/certificates/generate - Generate a certificate for a student
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, courseId } = body

    // Validation
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "userId and courseId are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            fullName: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, slug: true }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })

    if (existingCert) {
      return NextResponse.json(
        { success: false, error: "Certificate already exists for this user and course", data: { certificate: existingCert } },
        { status: 409 }
      )
    }

    // Check if user is enrolled and has completed the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "User is not enrolled in this course" },
        { status: 400 }
      )
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(16).toString("hex").toUpperCase()

    // In production, generate PDF and upload to storage
    // For now, we'll create a placeholder URL
    const certificateDir = path.join(process.cwd(), "public", "uploads", "certificates")
    await mkdir(certificateDir, { recursive: true })
    
    // Generate a simple HTML certificate that can be converted to PDF
    const certificateHtml = generateCertificateHtml({
      studentName: user.profile?.fullName || user.email || "Student",
      courseName: course.title,
      verificationCode,
      issuedAt: new Date(),
    })
    
    // Save HTML certificate (in production, convert to PDF)
    const certFilename = `${verificationCode}.html`
    const certPath = path.join(certificateDir, certFilename)
    await writeFile(certPath, certificateHtml)
    
    const certificateUrl = `/uploads/certificates/${certFilename}`

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateUrl,
        verificationCode,
        status: "ACTIVE",
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

    // Create IssuedCertificate record for tracking
    const year = new Date().getFullYear()
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase()
    const certificateCode = `CERT-${year}-${randomSuffix}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://innovasci.com"
    const verificationUrl = `${appUrl}/verify/${certificateCode}`
    const pdfUrl = certificateUrl // In production, this would be a PDF URL from cloud storage

    const issuedCertificate = await prisma.issuedCertificate.create({
      data: {
        certificateId: certificate.id,
        studentId: userId,
        courseId,
        certificateCode,
        pdfUrl,
        verificationUrl,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } }
          }
        },
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "CERTIFICATES",
          userId: auth.userId,
          details: {
            certificateId: certificate.id,
            issuedCertificateId: issuedCertificate.id,
            certificateCode,
            verificationCode,
            studentName: user.profile?.fullName || user.email,
            courseName: course.title,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        certificate: {
          id: certificate.id,
          verificationCode: certificate.verificationCode,
          certificateUrl: certificate.certificateUrl,
          status: certificate.status,
          issuedAt: certificate.issuedAt.toISOString(),
          user: {
            id: certificate.user.id,
            name: certificate.user.profile?.fullName,
            email: certificate.user.email,
          },
          course: certificate.course,
        },
        issuedCertificate: {
          id: issuedCertificate.id,
          certificateCode: issuedCertificate.certificateCode,
          verificationUrl: issuedCertificate.verificationUrl,
          pdfUrl: issuedCertificate.pdfUrl,
          issuedAt: issuedCertificate.issuedAt.toISOString(),
        }
      },
      message: "Certificate generated successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Generate certificate error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate" },
      { status: 500 }
    )
  }
}

// Generate HTML certificate template
function generateCertificateHtml(data: {
  studentName: string
  courseName: string
  verificationCode: string
  issuedAt: Date
}): string {
  const formattedDate = data.issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Georgia', serif; 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .certificate {
      width: 800px;
      background: #fff;
      border: 4px solid #7C3AED;
      padding: 60px;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 2px solid #2563EB;
      pointer-events: none;
    }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 14px; color: #7C3AED; font-weight: bold; letter-spacing: 4px; }
    h1 { font-size: 42px; color: #1a1a2e; margin: 20px 0; font-weight: normal; }
    .subtitle { color: #666; font-size: 16px; letter-spacing: 2px; }
    .body { text-align: center; margin: 40px 0; }
    .present { font-size: 18px; color: #666; margin-bottom: 10px; }
    .name { font-size: 36px; color: #7C3AED; margin: 20px 0; font-style: italic; }
    .course-text { font-size: 18px; color: #666; margin-bottom: 10px; }
    .course-name { font-size: 28px; color: #1a1a2e; margin-bottom: 30px; }
    .date { font-size: 14px; color: #666; }
    .footer { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .signature { text-align: center; }
    .sig-line { 
      width: 200px; 
      border-bottom: 1px solid #333; 
      margin-bottom: 5px;
    }
    .sig-name { font-size: 14px; color: #333; }
    .verify { text-align: right; }
    .verify-code { 
      font-family: monospace; 
      font-size: 12px; 
      color: #7C3AED;
      background: #f3f4f6;
      padding: 5px 10px;
      border-radius: 4px;
    }
    .verify-text { font-size: 11px; color: #666; margin-top: 5px; }
    @media print {
      body { background: white; padding: 0; }
      .certificate { box-shadow: none; border: 4px solid #7C3AED; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">INNOVASCI OPEN ACADEMY</div>
      <h1>Certificate of Completion</h1>
      <p class="subtitle">This certificate is proudly presented to</p>
    </div>
    
    <div class="body">
      <p class="present">This certifies that</p>
      <p class="name">${data.studentName}</p>
      <p class="course-text">has successfully completed the course</p>
      <p class="course-name">${data.courseName}</p>
      <p class="date">Issued on ${formattedDate}</p>
    </div>
    
    <div class="footer">
      <div class="signature">
        <div class="sig-line"></div>
        <p class="sig-name">Academic Director</p>
      </div>
      <div class="verify">
        <p class="verify-code">${data.verificationCode}</p>
        <p class="verify-text">Verify at innovasci.com/verify</p>
      </div>
    </div>
  </div>
</body>
</html>`
}