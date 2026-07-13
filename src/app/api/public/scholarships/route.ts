import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"

// GET - List public scholarships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const typeId = searchParams.get("typeId")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")

    // Build where clause - only show published, public scholarships
    const where: any = {
      status: "PUBLISHED",
      visibility: { in: ["PUBLIC", "FEATURED"] },
    }

    // Check if application window is open
    const now = new Date()
    where.OR = [
      { closingDate: { gte: now } },
      { allowLateApplications: true },
      { closingDate: null },
    ]

    if (typeId) where.typeId = typeId
    if (featured === "true") where.isFeatured = true

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { shortName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ]
    }

    // Get total count
    const total = await prisma.scholarship.count({ where })

    // Get scholarships
    const scholarships = await prisma.scholarship.findMany({
      where,
      select: {
        id: true,
        name: true,
        shortName: true,
        slug: true,
        description: true,
        type: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        awardAmount: true,
        currency: true,
        coverageType: true,
        maxRecipients: true,
        currentRecipients: true,
        openingDate: true,
        closingDate: true,
        isFeatured: true,
        thumbnailUrl: true,
        bannerUrl: true,
        icon: true,
        color: true,
        benefits: true,
        eligibility: true,
        selectionMethod: true,
        requireInterview: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { closingDate: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Transform data
    const formattedScholarships = scholarships.map((s) => ({
      ...s,
      awardAmount: s.awardAmount ? Number(s.awardAmount) : null,
      applicationCount: s._count.applications,
      remainingSlots: s.maxRecipients ? s.maxRecipients - s.currentRecipients : null,
      applicationUrl: `/scholarships/apply/${s.slug}`,
      trackingUrl: `/scholarships/track`,
      shareUrl: `${process.env.APP_URL || ""}/scholarships/apply/${s.slug}`,
    }))

    return successResponse({
      scholarships: formattedScholarships,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching public scholarships:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
