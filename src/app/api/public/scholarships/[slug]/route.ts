import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/public/scholarships/[slug] - Get single public scholarship
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const endpoint = "/api/public/scholarships/[slug]"
  const { slug } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing"
    }, { status: 503 })
  }

  try {
    const now = new Date()

    const scholarship = await prisma.scholarship.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        visibility: { in: ["PUBLIC", "FEATURED"] },
      },
      include: {
        scholarshipType: true,
        sponsorLinks: {
          where: { status: "ACTIVE" },
          include: {
            sponsor: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
                website: true,
                description: true,
              }
            }
          }
        },
        reviewRubric: {
          select: {
            criteria: true,
          }
        },
      }
    })

    if (!scholarship) {
      return NextResponse.json(
        { success: false, error: "Scholarship not found" },
        { status: 404 }
      )
    }

    // Check if application is open
    let isOpen = true
    let statusMessage = ""

    if (scholarship.applicationStatus !== "OPEN") {
      isOpen = false
      statusMessage = "Applications are currently closed"
    } else if (scholarship.openingDate && now < scholarship.openingDate) {
      isOpen = false
      statusMessage = `Applications open on ${scholarship.openingDate.toLocaleDateString()}`
    } else if (scholarship.closingDate && now > scholarship.closingDate) {
      isOpen = false
      statusMessage = "Application deadline has passed"
    }

    // Increment view count
    await prisma.scholarship.update({
      where: { id: scholarship.id },
      data: { viewCount: { increment: 1 } }
    })

    // Format response
    const formattedScholarship = {
      id: scholarship.id,
      name: scholarship.name,
      shortName: scholarship.shortName,
      slug: scholarship.slug,
      description: scholarship.description,
      objectives: scholarship.objectives,
      eligibility: scholarship.eligibility,
      benefits: scholarship.benefits,
      coverage: scholarship.coverage,
      scholarshipType: scholarship.scholarshipType,
      awardAmount: scholarship.awardAmount ? Number(scholarship.awardAmount) : null,
      currency: scholarship.currency,
      coverageType: scholarship.coverageType,
      availableSlots: scholarship.availableSlots,
      openingDate: scholarship.openingDate?.toISOString(),
      closingDate: scholarship.closingDate?.toISOString(),
      resultsDate: scholarship.resultsDate?.toISOString(),
      selectionMethod: scholarship.selectionMethod,
      isFeatured: scholarship.isFeatured,
      thumbnailUrl: scholarship.thumbnailUrl,
      bannerUrl: scholarship.bannerUrl,
      icon: scholarship.icon,
      color: scholarship.color,
      viewCount: scholarship.viewCount + 1,
      applicationCount: scholarship.applicationCount,
      requiredDocuments: scholarship.requiredDocuments,
      customQuestions: scholarship.customQuestions,
      requireInterview: scholarship.requireInterview,
      // Sponsors
      sponsors: scholarship.sponsorLinks.map(l => ({
        ...l.sponsor,
        contributedAmount: l.contributedAmount ? Number(l.contributedAmount) : null,
        fundedSlots: l.fundedSlots,
        isPrimary: l.isPrimary,
      })),
      // Application status
      isOpen,
      statusMessage,
      daysRemaining: scholarship.closingDate 
        ? Math.max(0, Math.ceil((new Date(scholarship.closingDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null,
      slotsRemaining: scholarship.availableSlots 
        ? Math.max(0, scholarship.availableSlots - scholarship.applicationCount)
        : null,
    }

    return NextResponse.json({
      success: true,
      data: { scholarship: formattedScholarship }
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
