import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/public/scholarships - List public scholarships
export async function GET(request: NextRequest) {
  const endpoint = "/api/public/scholarships"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing"
    }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    const now = new Date()

    let where: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
    }

    // Only show scholarships with open applications
    where.applicationStatus = "OPEN"
    where.OR = [
      { closingDate: null },
      { closingDate: { gte: now } }
    ]
    where.AND = [
      {
        OR: [
          { openingDate: null },
          { openingDate: { lte: now } }
        ]
      }
    ]

    if (type) where.scholarshipTypeId = type
    if (featured === "true") where.isFeatured = true
    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { shortName: { contains: search, mode: 'insensitive' } },
          ]
        }
      ]
    }

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        select: {
          id: true,
          name: true,
          shortName: true,
          slug: true,
          description: true,
          scholarshipType: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true,
            }
          },
          awardAmount: true,
          currency: true,
          coverageType: true,
          availableSlots: true,
          openingDate: true,
          closingDate: true,
          isFeatured: true,
          thumbnailUrl: true,
          bannerUrl: true,
          icon: true,
          color: true,
          applicationCount: true,
          sponsorLinks: {
            where: { status: "ACTIVE" },
            include: {
              sponsor: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                }
              }
            },
            take: 3,
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { closingDate: 'asc' }
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
      awardAmount: s.awardAmount ? Number(s.awardAmount) : null,
      currency: s.currency,
      coverageType: s.coverageType,
      availableSlots: s.availableSlots,
      openingDate: s.openingDate?.toISOString(),
      closingDate: s.closingDate?.toISOString(),
      isFeatured: s.isFeatured,
      thumbnailUrl: s.thumbnailUrl,
      bannerUrl: s.bannerUrl,
      icon: s.icon,
      color: s.color,
      applicationCount: s.applicationCount,
      sponsors: s.sponsorLinks.map(l => l.sponsor),
      isOpen: true,
      daysRemaining: s.closingDate ? Math.ceil((new Date(s.closingDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
    }))

    // Get available filters
    const [scholarshipTypes, stats] = await Promise.all([
      prisma.scholarshipType.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, icon: true, color: true },
        orderBy: { orderIndex: 'asc' }
      }),
      prisma.scholarship.aggregate({
        where: { status: "PUBLISHED", visibility: "PUBLIC", applicationStatus: "OPEN" },
        _count: true,
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        scholarships: formattedScholarships,
        filters: {
          types: scholarshipTypes,
        },
        stats: {
          totalScholarships: stats._count,
          availableNow: total,
        },
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
