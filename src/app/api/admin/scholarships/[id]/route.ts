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

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/admin/scholarships/[id] - Get single scholarship
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const endpoint = "/api/admin/scholarships/[id]"
  const { id } = await params

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
    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        scholarshipType: true,
        sponsorLinks: {
          include: {
            sponsor: true,
          }
        },
        categories: {
          include: {
            category: true,
          }
        },
        reviewRubric: true,
        _count: {
          select: { applications: true }
        }
      }
    })

    if (!scholarship) {
      return NextResponse.json(
        { success: false, error: "Scholarship not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.scholarship.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: { scholarship }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch scholarship",
      details: error?.message
    }, { status: 500 })
  }
}

// PUT /api/admin/scholarships/[id] - Update scholarship
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const endpoint = "/api/admin/scholarships/[id]"
  const { id } = await params

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
    const existing = await prisma.scholarship.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, status: true }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Scholarship not found" },
        { status: 404 }
      )
    }

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

    // Track changes for audit
    const changes: any = {}
    if (name && name !== existing.name) changes.name = { old: existing.name, new: name }
    if (status && status !== existing.status) {
      changes.status = { old: existing.status, new: status }
      if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
        body.publishedAt = new Date()
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (shortName !== undefined) updateData.shortName = shortName?.trim() || null
    if (scholarshipTypeId !== undefined) updateData.scholarshipTypeId = scholarshipTypeId
    if (description !== undefined) updateData.description = description?.trim() || null
    if (objectives !== undefined) updateData.objectives = objectives?.trim() || null
    if (eligibility !== undefined) updateData.eligibility = eligibility?.trim() || null
    if (benefits !== undefined) updateData.benefits = benefits?.trim() || null
    if (coverage !== undefined) updateData.coverage = coverage?.trim() || null
    if (awardAmount !== undefined) updateData.awardAmount = awardAmount ? new Decimal(awardAmount) : null
    if (currency !== undefined) updateData.currency = currency
    if (coverageType !== undefined) updateData.coverageType = coverageType
    if (availableSlots !== undefined) updateData.availableSlots = availableSlots
    if (openingDate !== undefined) updateData.openingDate = openingDate ? new Date(openingDate) : null
    if (closingDate !== undefined) updateData.closingDate = closingDate ? new Date(closingDate) : null
    if (resultsDate !== undefined) updateData.resultsDate = resultsDate ? new Date(resultsDate) : null
    if (status !== undefined) updateData.status = status
    if (visibility !== undefined) updateData.visibility = visibility
    if (applicationStatus !== undefined) updateData.applicationStatus = applicationStatus
    if (selectionMethod !== undefined) updateData.selectionMethod = selectionMethod
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl?.trim() || null
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl?.trim() || null
    if (icon !== undefined) updateData.icon = icon?.trim() || null
    if (color !== undefined) updateData.color = color?.trim() || null
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle?.trim() || null
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription?.trim() || null
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (isHighlighted !== undefined) updateData.isHighlighted = isHighlighted
    if (applicableDomains !== undefined) updateData.applicableDomains = applicableDomains
    if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories
    if (applicableDifficulty !== undefined) updateData.applicableDifficulty = applicableDifficulty
    if (supportedCertificates !== undefined) updateData.supportedCertificates = supportedCertificates
    if (autoEnrollEnabled !== undefined) updateData.autoEnrollEnabled = autoEnrollEnabled
    if (autoMembershipTier !== undefined) updateData.autoMembershipTier = autoMembershipTier
    if (autoDomainAccess !== undefined) updateData.autoDomainAccess = autoDomainAccess
    if (autoCategoryAccess !== undefined) updateData.autoCategoryAccess = autoCategoryAccess
    if (assignedCategoryIds !== undefined) updateData.assignedCategoryIds = assignedCategoryIds
    if (assignedDomainIds !== undefined) updateData.assignedDomainIds = assignedDomainIds
    if (reviewRubricId !== undefined) updateData.reviewRubricId = reviewRubricId
    if (minScoreRequired !== undefined) updateData.minScoreRequired = minScoreRequired
    if (requireInterview !== undefined) updateData.requireInterview = requireInterview
    if (interviewQuestions !== undefined) updateData.interviewQuestions = interviewQuestions
    if (requiredDocuments !== undefined) updateData.requiredDocuments = requiredDocuments
    if (customQuestions !== undefined) updateData.customQuestions = customQuestions
    if (totalBudget !== undefined) updateData.totalBudget = totalBudget ? new Decimal(totalBudget) : null
    if (perStudentAmount !== undefined) updateData.perStudentAmount = perStudentAmount ? new Decimal(perStudentAmount) : null

    const scholarship = await prisma.scholarship.update({
      where: { id },
      data: updateData,
    })

    // Update sponsor links if sponsorIds provided
    if (sponsorIds !== undefined && Array.isArray(sponsorIds)) {
      // Remove existing links
      await prisma.scholarshipSponsorLink.deleteMany({
        where: { scholarshipId: id }
      })
      
      // Create new links
      if (sponsorIds.length > 0) {
        await prisma.scholarshipSponsorLink.createMany({
          data: sponsorIds.map((sponsorId: string, index: number) => ({
            scholarshipId: scholarship.id,
            sponsorId,
            isPrimary: index === 0,
            status: "ACTIVE",
          }))
        })
      }
    }

    // Log audit
    await prisma.scholarshipAuditLog.create({
      data: {
        entityType: "SCHOLARSHIP",
        entityId: scholarship.id,
        action: "UPDATED",
        description: `Scholarship "${scholarship.name}" was updated`,
        changes: Object.keys(changes).length > 0 ? changes : undefined,
        actorId: auth.userId,
        actorType: "ADMIN",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      }
    })

    return NextResponse.json({
      success: true,
      data: { scholarship },
      message: "Scholarship updated successfully"
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to update scholarship",
      details: error?.message
    }, { status: 500 })
  }
}

// DELETE /api/admin/scholarships/[id] - Delete scholarship
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const endpoint = "/api/admin/scholarships/[id]"
  const { id } = await params

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
    const existing = await prisma.scholarship.findUnique({
      where: { id },
      select: { id: true, name: true, _count: { select: { applications: true } } }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Scholarship not found" },
        { status: 404 }
      )
    }

    // Check if scholarship has applications
    if (existing._count.applications > 0) {
      // Archive instead of delete
      await prisma.scholarship.update({
        where: { id },
        data: { status: "ARCHIVED" }
      })

      // Log audit
      await prisma.scholarshipAuditLog.create({
        data: {
          entityType: "SCHOLARSHIP",
          entityId: id,
          action: "ARCHIVED",
          description: `Scholarship "${existing.name}" was archived (has ${existing._count.applications} applications)`,
          actorId: auth.userId,
          actorType: "ADMIN",
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        }
      })

      return NextResponse.json({
        success: true,
        message: "Scholarship archived (has existing applications)"
      })
    }

    // Delete completely if no applications
    await prisma.scholarship.delete({
      where: { id }
    })

    // Log audit
    await prisma.scholarshipAuditLog.create({
      data: {
        entityType: "SCHOLARSHIP",
        entityId: id,
        action: "DELETED",
        description: `Scholarship "${existing.name}" was permanently deleted`,
        actorId: auth.userId,
        actorType: "ADMIN",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      }
    })

    return NextResponse.json({
      success: true,
      message: "Scholarship deleted successfully"
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete scholarship",
      details: error?.message
    }, { status: 500 })
  }
}
