import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper to generate unique application number
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

// GET /api/admin/scholarships - List all scholarships
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/scholarships"

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
    const status = searchParams.get("status")
    const visibility = searchParams.get("visibility")
    const scholarshipTypeId = searchParams.get("scholarshipTypeId")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    let where: any = {}

    if (status) {
      where.status = status
    }
    if (visibility) {
      where.visibility = visibility
    }
    if (scholarshipTypeId) {
      where.scholarshipTypeId = scholarshipTypeId
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        include: {
          scholarshipType: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true,
            }
          },
          sponsorLinks: {
            include: {
              sponsor: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                }
              }
            }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scholarship.count({ where })
    ])

    const formattedScholarships = scholarships.map(s => ({
      id: s.id,
      name: s.name,
      shortName: s.shortName,
      slug: s.slug,
      description: s.description,
      scholarshipType: s.scholarshipType,
      status: s.status,
      visibility: s.visibility,
      applicationStatus: s.applicationStatus,
      awardAmount: s.awardAmount ? Number(s.awardAmount) : null,
      currency: s.currency,
      coverageType: s.coverageType,
      availableSlots: s.availableSlots,
      openingDate: s.openingDate?.toISOString(),
      closingDate: s.closingDate?.toISOString(),
      isFeatured: s.isFeatured,
      isHighlighted: s.isHighlighted,
      thumbnailUrl: s.thumbnailUrl,
      bannerUrl: s.bannerUrl,
      icon: s.icon,
      color: s.color,
      viewCount: s.viewCount,
      applicationCount: s.applicationCount,
      applicationCountActual: s._count.applications,
      sponsors: s.sponsorLinks.map(l => l.sponsor),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        scholarships: formattedScholarships,
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
      error: "Failed to fetch scholarships",
      details: error?.message
    }, { status: 500 })
  }
}

// POST /api/admin/scholarships - Create new scholarship
export async function POST(request: NextRequest) {
  const endpoint = "/api/admin/scholarships"

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
    const body = await request.json()
    const {
      name,
      shortName,
      scholarshipTypeId,
      description,
      objectives,
      eligibility,
      benefits,
      coverage,
      awardAmount,
      currency,
      coverageType,
      availableSlots,
      openingDate,
      closingDate,
      resultsDate,
      status,
      visibility,
      applicationStatus,
      selectionMethod,
      bannerUrl,
      thumbnailUrl,
      icon,
      color,
      seoTitle,
      seoDescription,
      seoKeywords,
      isFeatured,
      isHighlighted,
      applicableDomains,
      applicableCategories,
      applicableDifficulty,
      supportedCertificates,
      autoEnrollEnabled,
      autoMembershipTier,
      autoDomainAccess,
      autoCategoryAccess,
      assignedCategoryIds,
      assignedDomainIds,
      reviewRubricId,
      minScoreRequired,
      requireInterview,
      interviewQuestions,
      requiredDocuments,
      customQuestions,
      totalBudget,
      perStudentAmount,
      sponsorIds,
    } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      )
    }

    let slug = generateSlug(name)
    
    // Check if slug already exists
    const existing = await prisma.scholarship.findFirst({
      where: { OR: [{ slug }, { name }] }
    })

    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const scholarship = await prisma.scholarship.create({
      data: {
        name: name.trim(),
        shortName: shortName?.trim() || null,
        slug,
        scholarshipTypeId: scholarshipTypeId || null,
        description: description?.trim() || null,
        objectives: objectives?.trim() || null,
        eligibility: eligibility?.trim() || null,
        benefits: benefits?.trim() || null,
        coverage: coverage?.trim() || null,
        awardAmount: awardAmount ? new Decimal(awardAmount) : null,
        currency: currency || "USD",
        coverageType: coverageType || "PARTIAL",
        availableSlots: availableSlots || null,
        openingDate: openingDate ? new Date(openingDate) : null,
        closingDate: closingDate ? new Date(closingDate) : null,
        resultsDate: resultsDate ? new Date(resultsDate) : null,
        status: status || "DRAFT",
        visibility: visibility || "PUBLIC",
        applicationStatus: applicationStatus || "OPEN",
        selectionMethod: selectionMethod || "MERIT",
        bannerUrl: bannerUrl?.trim() || null,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        icon: icon?.trim() || null,
        color: color?.trim() || null,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        seoKeywords: seoKeywords || null,
        isFeatured: isFeatured || false,
        isHighlighted: isHighlighted || false,
        applicableDomains: applicableDomains || null,
        applicableCategories: applicableCategories || null,
        applicableDifficulty: applicableDifficulty || null,
        supportedCertificates: supportedCertificates || null,
        autoEnrollEnabled: autoEnrollEnabled || false,
        autoMembershipTier: autoMembershipTier || null,
        autoDomainAccess: autoDomainAccess || false,
        autoCategoryAccess: autoCategoryAccess || false,
        assignedCategoryIds: assignedCategoryIds || null,
        assignedDomainIds: assignedDomainIds || null,
        reviewRubricId: reviewRubricId || null,
        minScoreRequired: minScoreRequired || 0,
        requireInterview: requireInterview || false,
        interviewQuestions: interviewQuestions || null,
        requiredDocuments: requiredDocuments || null,
        customQuestions: customQuestions || null,
        totalBudget: totalBudget ? new Decimal(totalBudget) : null,
        perStudentAmount: perStudentAmount ? new Decimal(perStudentAmount) : null,
        createdBy: auth.userId,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    })

    // Create sponsor links if sponsorIds provided
    if (sponsorIds && Array.isArray(sponsorIds) && sponsorIds.length > 0) {
      await prisma.scholarshipSponsorLink.createMany({
        data: sponsorIds.map((sponsorId: string, index: number) => ({
          scholarshipId: scholarship.id,
          sponsorId,
          isPrimary: index === 0,
          status: "ACTIVE",
        }))
      })
    }

    // Log audit
    await prisma.scholarshipAuditLog.create({
      data: {
        entityType: "SCHOLARSHIP",
        entityId: scholarship.id,
        action: "CREATED",
        description: `Scholarship "${scholarship.name}" was created`,
        actorId: auth.userId,
        actorType: "ADMIN",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      }
    })

    return NextResponse.json({
      success: true,
      data: { scholarship },
      message: "Scholarship created successfully"
    }, { status: 201 })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to create scholarship",
      details: error?.message
    }, { status: 500 })
  }
}
