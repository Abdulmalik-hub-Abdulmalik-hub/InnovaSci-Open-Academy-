import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// Force dynamic rendering
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

// Helper to generate application number
async function generateApplicationNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.scholarshipApplication.count()
  const sequence = String(count + 1).padStart(6, '0')
  return `SCH-${year}-${sequence}`
}

// Helper to generate tracking code
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// GET /api/admin/scholarship-applications - List all applications
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/scholarship-applications"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing"
    }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const scholarshipId = searchParams.get("scholarshipId")
    const status = searchParams.get("status")
    const country = searchParams.get("country")
    const gender = searchParams.get("gender")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    let where: any = {}
    if (scholarshipId) where.scholarshipId = scholarshipId
    if (status) where.status = status
    if (country) where.country = country
    if (gender) where.gender = gender
    if (search) {
      where.OR = [
        { applicationNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { trackingCode: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [applications, total] = await Promise.all([
      prisma.scholarshipApplication.findMany({
        where,
        include: {
          scholarship: {
            select: {
              id: true,
              name: true,
              slug: true,
              scholarshipType: { select: { name: true, color: true } }
            }
          },
          sponsor: {
            select: { id: true, name: true, logoUrl: true }
          },
          documents: {
            select: { id: true, type: true, status: true }
          },
          user: {
            select: { id: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scholarshipApplication.count({ where })
    ])

    const formattedApplications = applications.map(a => ({
      id: a.id,
      applicationNumber: a.applicationNumber,
      trackingCode: a.trackingCode,
      scholarship: a.scholarship,
      firstName: a.firstName,
      lastName: a.lastName,
      fullName: `${a.firstName} ${a.lastName}`,
      email: a.email,
      phone: a.phone,
      country: a.country,
      state: a.state,
      gender: a.gender,
      nationality: a.nationality,
      highestDegree: a.highestDegree,
      institution: a.institution,
      employmentStatus: a.employmentStatus,
      status: a.status,
      subStatus: a.subStatus,
      decision: a.decision,
      reviewScore: a.reviewScore ? Number(a.reviewScore) : null,
      awardAmount: a.awardAmount ? Number(a.awardAmount) : null,
      interviewScheduledAt: a.interviewScheduledAt?.toISOString(),
      submittedAt: a.submittedAt?.toISOString(),
      createdAt: a.createdAt.toISOString(),
      documentCount: a.documents.length,
      hasRegisteredAccount: !!a.user,
    }))

    return NextResponse.json({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch applications",
      details: error?.message
    }, { status: 500 })
  }
}

// POST /api/admin/scholarship-applications - Submit new application (public)
export async function POST(request: NextRequest) {
  const endpoint = "/api/admin/scholarship-applications"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing"
    }, { status: 503 })
  }

  try {
    const body = await request.json()
    const {
      scholarshipId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      nationality,
      state,
      country,
      highestDegree,
      institution,
      fieldOfStudy,
      graduationYear,
      gpa,
      employmentStatus,
      currentPosition,
      yearsExperience,
      researchInterests,
      linkedin,
      github,
      googleScholar,
      orcid,
      personalWebsite,
      statementOfPurpose,
      motivationLetter,
      financialNeedStatement,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      customResponses,
      userId,
    } = body

    // Validate required fields
    if (!scholarshipId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: "Scholarship ID, first name, last name, and email are required" },
        { status: 400 }
      )
    }

    // Verify scholarship exists and is accepting applications
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      select: { id: true, name: true, status: true, applicationStatus: true, closingDate: true }
    })

    if (!scholarship) {
      return NextResponse.json(
        { success: false, error: "Scholarship not found" },
        { status: 404 }
      )
    }

    if (scholarship.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: "This scholarship is not currently accepting applications" },
        { status: 400 }
      )
    }

    if (scholarship.applicationStatus !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "Applications are currently closed for this scholarship" },
        { status: 400 }
      )
    }

    // Check if closing date has passed
    if (scholarship.closingDate && new Date() > scholarship.closingDate) {
      return NextResponse.json(
        { success: false, error: "Application deadline has passed" },
        { status: 400 }
      )
    }

    // Check for duplicate application (same email, same scholarship)
    const existingApplication = await prisma.scholarshipApplication.findFirst({
      where: {
        scholarshipId,
        email: email.toLowerCase(),
        status: { notIn: ["WITHDRAWN"] }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "You have already submitted an application for this scholarship" },
        { status: 409 }
      )
    }

    // Generate reference numbers
    const applicationNumber = await generateApplicationNumber()
    const trackingCode = generateTrackingCode()

    // Create application
    const application = await prisma.scholarshipApplication.create({
      data: {
        applicationNumber,
        trackingCode,
        scholarshipId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        nationality: nationality?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || null,
        highestDegree: highestDegree?.trim() || null,
        institution: institution?.trim() || null,
        fieldOfStudy: fieldOfStudy?.trim() || null,
        graduationYear: graduationYear || null,
        gpa: gpa?.trim() || null,
        academicBackground: JSON.stringify({ fieldOfStudy, graduationYear, gpa }),
        employmentStatus: employmentStatus || null,
        currentPosition: currentPosition?.trim() || null,
        yearsExperience: yearsExperience || null,
        researchInterests: researchInterests || null,
        linkedin: linkedin?.trim() || null,
        github: github?.trim() || null,
        googleScholar: googleScholar?.trim() || null,
        orcid: orcid?.trim() || null,
        personalWebsite: personalWebsite?.trim() || null,
        statementOfPurpose: statementOfPurpose?.trim() || null,
        motivationLetter: motivationLetter?.trim() || null,
        financialNeedStatement: financialNeedStatement?.trim() || null,
        emergencyContactName: emergencyContactName?.trim() || null,
        emergencyContactPhone: emergencyContactPhone?.trim() || null,
        emergencyContactRelation: emergencyContactRelation?.trim() || null,
        customResponses: customResponses || null,
        status: "SUBMITTED",
        submittedAt: new Date(),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        userId: userId || null,
      }
    })

    // Update scholarship application count
    await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: { applicationCount: { increment: 1 } }
    })

    // Create notification record
    await prisma.scholarshipNotification.create({
      data: {
        recipientEmail: application.email,
        recipientName: `${application.firstName} ${application.lastName}`,
        userId: application.userId,
        title: "Application Submitted Successfully",
        message: `Your application (${applicationNumber}) for ${scholarship.name} has been received. Your tracking code is ${trackingCode}.`,
        type: "APPLICATION_SUBMITTED",
        applicationId: application.id,
        scholarshipId: scholarshipId,
        status: "PENDING",
      }
    })

    // Log audit
    await prisma.scholarshipAuditLog.create({
      data: {
        entityType: "APPLICATION",
        entityId: application.id,
        action: "CREATED",
        description: `New application ${applicationNumber} submitted for ${scholarship.name}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          applicationNumber: application.applicationNumber,
          trackingCode: application.trackingCode,
        }
      },
      message: "Application submitted successfully. You will receive a confirmation email shortly."
    }, { status: 201 })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to submit application",
      details: error?.message
    }, { status: 500 })
  }
}
