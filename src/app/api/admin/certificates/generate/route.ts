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

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "userId and courseId are required" },
        { status: 400 }
      )
    }

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { select: { fullName: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Get course with template
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        certificateTemplate: {
          select: {
            id: true, name: true, backgroundUrl: true,
            width: true, height: true,
            studentNameX: true, studentNameY: true, studentNameSize: true, studentNameFont: true,
            courseNameX: true, courseNameY: true, courseNameSize: true, courseNameFont: true,
            issueDateX: true, issueDateY: true, issueDateSize: true, issueDateFont: true,
            certificateIdX: true, certificateIdY: true, certificateIdSize: true, certificateIdFont: true,
            textColor: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    // Check existing certificate
    const existingCert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })

    if (existingCert) {
      return NextResponse.json(
        { success: false, error: "Certificate already exists", data: { certificate: existingCert } },
        { status: 409 }
      )
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })

    if (!enrollment) {
      return NextResponse.json({ success: false, error: "User is not enrolled" }, { status: 400 })
    }

    // Generate codes
    const verificationCode = crypto.randomBytes(16).toString("hex").toUpperCase()
    const year = new Date().getFullYear()
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase()
    const certificateCode = `CERT-${year}-${randomSuffix}`

    // Create certificate directory
    const certificateDir = path.join(process.cwd(), "public", "uploads", "certificates")
    await mkdir(certificateDir, { recursive: true })

    // Generate certificate HTML
    const studentName = user.profile?.fullName || user.email || "Student"
    let certificateHtml: string

    if (course.certificateTemplate) {
      // Use template-based generation
      const t = course.certificateTemplate
      certificateHtml = generateTemplateCertificateHtml({
        template: {
          backgroundUrl: t.backgroundUrl,
          width: t.width, height: t.height,
          textColor: t.textColor,
          studentNameX: t.studentNameX, studentNameY: t.studentNameY,
          studentNameSize: t.studentNameSize, studentNameFont: t.studentNameFont,
          courseNameX: t.courseNameX, courseNameY: t.courseNameY,
          courseNameSize: t.courseNameSize, courseNameFont: t.courseNameFont,
          issueDateX: t.issueDateX, issueDateY: t.issueDateY,
          issueDateSize: t.issueDateSize, issueDateFont: t.issueDateFont,
          certificateIdX: t.certificateIdX, certificateIdY: t.certificateIdY,
          certificateIdSize: t.certificateIdSize, certificateIdFont: t.certificateIdFont,
        },
        studentName,
        courseName: course.title,
        verificationCode,
        issuedAt: new Date()
      })
    } else {
      // Default template
      certificateHtml = generateDefaultCertificateHtml({
        studentName,
        courseName: course.title,
        verificationCode,
        issuedAt: new Date()
      })
    }

    // Save HTML certificate
    const certFilename = `${verificationCode}.html`
    await writeFile(path.join(certificateDir, certFilename), certificateHtml)
    const certificateUrl = `/uploads/certificates/${certFilename}`

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        userId, courseId, certificateUrl, verificationCode, status: "ACTIVE"
      }
    })

    // Create template snapshot for historical consistency
    const templateSnapshot = course.certificateTemplate ? {
      templateId: course.certificateTemplate.id,
      templateName: course.certificateTemplate.name,
      backgroundUrl: course.certificateTemplate.backgroundUrl,
      width: course.certificateTemplate.width,
      height: course.certificateTemplate.height,
      textColor: course.certificateTemplate.textColor,
      studentName: {
        x: course.certificateTemplate.studentNameX,
        y: course.certificateTemplate.studentNameY,
        size: course.certificateTemplate.studentNameSize,
        font: course.certificateTemplate.studentNameFont
      },
      courseName: {
        x: course.certificateTemplate.courseNameX,
        y: course.certificateTemplate.courseNameY,
        size: course.certificateTemplate.courseNameSize,
        font: course.certificateTemplate.courseNameFont
      },
      issueDate: {
        x: course.certificateTemplate.issueDateX,
        y: course.certificateTemplate.issueDateY,
        size: course.certificateTemplate.issueDateSize,
        font: course.certificateTemplate.issueDateFont
      },
      certificateId: {
        x: course.certificateTemplate.certificateIdX,
        y: course.certificateTemplate.certificateIdY,
        size: course.certificateTemplate.certificateIdSize,
        font: course.certificateTemplate.certificateIdFont
      }
    } : null

    // Create IssuedCertificate with template snapshot
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://innovasci.com"
    await prisma.issuedCertificate.create({
      data: {
        certificateId: certificate.id,
        studentId: userId, courseId,
        certificateCode,
        pdfUrl: certificateUrl,
        verificationUrl: `${appUrl}/verify/${certificateCode}`,
        templateSnapshot: templateSnapshot as any
      }
    })

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE", module: "CERTIFICATES", userId: auth.userId,
          details: { 
            certificateId: certificate.id, 
            certificateCode, 
            studentName, 
            courseName: course.title,
            templateUsed: course.certificateTemplate?.name || "Default"
          }
        }
      })
    } catch (e) { console.error("Audit log error:", e) }

    return NextResponse.json({
      success: true,
      data: { certificate: { id: certificate.id, verificationCode, certificateUrl } },
      message: "Certificate generated successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Generate certificate error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate certificate" }, { status: 500 })
  }
}

interface TemplateCertData {
  template: {
    backgroundUrl: string; width: number; height: number; textColor: string
    studentNameX: number; studentNameY: number; studentNameSize: number; studentNameFont: string
    courseNameX: number; courseNameY: number; courseNameSize: number; courseNameFont: string
    issueDateX: number; issueDateY: number; issueDateSize: number; issueDateFont: string
    certificateIdX: number; certificateIdY: number; certificateIdSize: number; certificateIdFont: string
  }
  studentName: string; courseName: string; verificationCode: string; issuedAt: Date
}

function generateTemplateCertificateHtml(data: TemplateCertData): string {
  const { template } = data
  const formattedDate = data.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Certificate</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Segoe UI,sans-serif;background:#f0f0f0;min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.certificate{position:relative;width:${template.width}px;height:${template.height}px;background-image:url('${template.backgroundUrl}');background-size:cover;background-position:center;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.field{position:absolute;color:${template.textColor};text-align:center;transform:translate(-50%,-50%)}
.student-name{left:${template.studentNameX*template.width}px;top:${template.studentNameY*template.height}px;font-family:${template.studentNameFont},serif;font-size:${template.studentNameSize}px;font-weight:bold}
.course-name{left:${template.courseNameX*template.width}px;top:${template.courseNameY*template.height}px;font-family:${template.courseNameFont},serif;font-size:${template.courseNameSize}px}
.issue-date{left:${template.issueDateX*template.width}px;top:${template.issueDateY*template.height}px;font-family:${template.issueDateFont},serif;font-size:${template.issueDateSize}px}
.certificate-id{left:${template.certificateIdX*template.width}px;top:${template.certificateIdY*template.height}px;font-family:${template.certificateIdFont},monospace;font-size:${template.certificateIdSize}px;color:#666}
@media print{body{background:white;padding:0}.certificate{box-shadow:none}}
</style></head><body>
<div class="certificate">
<div class="field student-name">${data.studentName}</div>
<div class="field course-name">${data.courseName}</div>
<div class="field issue-date">Issued: ${formattedDate}</div>
<div class="field certificate-id">ID: ${data.verificationCode}</div>
</div></body></html>`
}

interface DefaultCertData {
  studentName: string; courseName: string; verificationCode: string; issuedAt: Date
}

function generateDefaultCertificateHtml(data: DefaultCertData): string {
  const formattedDate = data.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Certificate</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,serif;background:linear-gradient(135deg,#1a1a2e,#16213e);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.certificate{width:800px;background:#fff;border:4px solid #7C3AED;padding:60px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.certificate::before{content:'';position:absolute;top:10px;left:10px;right:10px;bottom:10px;border:2px solid #2563EB;pointer-events:none}
.header{text-align:center;margin-bottom:40px}
.logo{font-size:14px;color:#7C3AED;font-weight:bold;letter-spacing:4px}
h1{font-size:42px;color:#1a1a2e;margin:20px 0;font-weight:normal}
.subtitle{color:#666;font-size:16px;letter-spacing:2px}
.body{text-align:center;margin:40px 0}
.present{font-size:18px;color:#666;margin-bottom:10px}
.name{font-size:36px;color:#7C3AED;margin:20px 0;font-style:italic}
.course-text{font-size:18px;color:#666;margin-bottom:10px}
.course-name{font-size:28px;color:#1a1a2e;margin-bottom:30px}
.date{font-size:14px;color:#666}
.footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:60px;padding-top:20px;border-top:1px solid #ddd}
.signature{text-align:center}
.sig-line{width:200px;border-bottom:1px solid #333;margin-bottom:5px}
.sig-name{font-size:14px;color:#333}
.verify{text-align:right}
.verify-code{font-family:monospace;font-size:12px;color:#7C3AED;background:#f3f4f6;padding:5px 10px;border-radius:4px}
.verify-text{font-size:11px;color:#666;margin-top:5px}
@media print{body{background:white;padding:0}.certificate{box-shadow:none;border:4px solid #7C3AED}}
</style></head><body>
<div class="certificate">
<div class="header"><div class="logo">INNOVASCI OPEN ACADEMY</div><h1>Certificate of Completion</h1><p class="subtitle">This certificate is proudly presented to</p></div>
<div class="body"><p class="present">This certifies that</p><p class="name">${data.studentName}</p><p class="course-text">has successfully completed the course</p><p class="course-name">${data.courseName}</p><p class="date">Issued on ${formattedDate}</p></div>
<div class="footer"><div class="signature"><div class="sig-line"></div><p class="sig-name">Academic Director</p></div><div class="verify"><p class="verify-code">${data.verificationCode}</p><p class="verify-text">Verify at innovasci.com/verify</p></div></div>
</div></body></html>`
}