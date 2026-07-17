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

// GET /api/admin/scholarship-sponsors - List all sponsors
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/scholarship-sponsors"

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
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    let where: any = {}
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [sponsors, total] = await Promise.all([
      prisma.scholarshipSponsor.findMany({
        where,
        include: {
          assignedStaff: {
            select: {
              id: true,
              user: {
                select: { email: true, profile: { select: { fullName: true } } }
              }
            }
          },
          _count: {
            select: { scholarships: true, applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scholarshipSponsor.count({ where })
    ])

    const formattedSponsors = sponsors.map(s => ({
      id: s.id,
      name: s.name,
      shortName: s.shortName,
      slug: s.slug,
      type: s.type,
      logoUrl: s.logoUrl,
      bannerUrl: s.bannerUrl,
      website: s.website,
      description: s.description,
      contactName: s.contactName,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      contactPosition: s.contactPosition,
      address: s.address,
      city: s.city,
      country: s.country,
      status: s.status,
      isVerified: s.isVerified,
      totalBudget: s.totalBudget ? Number(s.totalBudget) : null,
      usedBudget: s.usedBudget ? Number(s.usedBudget) : null,
      currency: s.currency,
      assignedStaff: s.assignedStaff ? {
        id: s.assignedStaff.id,
        name: s.assignedStaff.user.profile?.fullName,
        email: s.assignedStaff.user.email,
      } : null,
      scholarshipCount: s._count.scholarships,
      applicationCount: s._count.applications,
      canViewAnalytics: s.canViewAnalytics,
      canDownloadReports: s.canDownloadReports,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        sponsors: formattedSponsors,
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
      error: "Failed to fetch sponsors",
      details: error?.message
    }, { status: 500 })
  }
}

// POST /api/admin/scholarship-sponsors - Create new sponsor
export async function POST(request: NextRequest) {
  const endpoint = "/api/admin/scholarship-sponsors"

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
      type,
      logoUrl,
      bannerUrl,
      website,
      description,
      contactName,
      contactEmail,
      contactPhone,
      contactPosition,
      address,
      city,
      country,
      status,
      isVerified,
      totalBudget,
      currency,
      canViewAnalytics,
      canDownloadReports,
      assignedStaffId,
      seoTitle,
      seoDescription,
    } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Sponsor type is required" },
        { status: 400 }
      )
    }

    const slug = generateSlug(name)

    // Check if slug already exists
    const existing = await prisma.scholarshipSponsor.findFirst({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A sponsor with this name already exists" },
        { status: 409 }
      )
    }

    const sponsor = await prisma.scholarshipSponsor.create({
      data: {
        name: name.trim(),
        shortName: shortName?.trim() || null,
        slug,
        type,
        logoUrl: logoUrl?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        contactName: contactName?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        contactPosition: contactPosition?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || null,
        status: status || "ACTIVE",
        isVerified: isVerified || false,
        totalBudget: totalBudget ? new Decimal(totalBudget) : null,
        usedBudget: new Decimal(0),
        currency: currency || "USD",
        canViewAnalytics: canViewAnalytics || false,
        canDownloadReports: canDownloadReports || false,
        assignedStaffId: assignedStaffId || null,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: { sponsor },
      message: "Sponsor created successfully"
    }, { status: 201 })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to create sponsor",
      details: error?.message
    }, { status: 500 })
  }
}
