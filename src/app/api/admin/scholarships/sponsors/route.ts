import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, createdResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const createSponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  type: z.enum(["COMPANY", "NGO", "FOUNDATION", "GOVERNMENT", "INDIVIDUAL", "ISLAMIC_ORG"]),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  totalContributed: z.number().optional(),
  currency: z.string().default("USD"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
  isVerified: z.boolean().default(false),
  bannerColor: z.string().optional(),
  tagline: z.string().optional(),
  agreementUrl: z.string().url().optional(),
  terms: z.string().optional(),
  receiveReports: z.boolean().default(true),
  reportFrequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]).default("MONTHLY"),
})

// GET - List all sponsors
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Build where clause
    const where: Prisma.SponsorWhereInput = {}
    
    if (type) where.type = type
    if (status) where.status = status
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortName: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count
    const total = await prisma.sponsor.count({ where })

    // Get sponsors
    const sponsors = await prisma.sponsor.findMany({
      where,
      include: {
        _count: {
          select: {
            scholarships: true,
            scholarshipsSponsored: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    const formattedSponsors = sponsors.map((sponsor) => ({
      ...sponsor,
      totalContributed: sponsor.totalContributed ? Number(sponsor.totalContributed) : null,
      scholarshipCount: sponsor._count.scholarships,
      awardCount: sponsor._count.scholarshipsSponsored,
    }))

    return successResponse({
      sponsors: formattedSponsors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// POST - Create a new sponsor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const validatedData = createSponsorSchema.parse(body)

    // Check if slug already exists
    const existing = await prisma.sponsor.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existing) {
      return errorResponse("A sponsor with this slug already exists", ErrorCodes.CONFLICT, 409)
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name: validatedData.name,
        shortName: validatedData.shortName,
        slug: validatedData.slug,
        type: validatedData.type,
        logoUrl: validatedData.logoUrl,
        website: validatedData.website,
        description: validatedData.description,
        contactName: validatedData.contactName,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        address: validatedData.address,
        totalContributed: validatedData.totalContributed ? new Prisma.Decimal(validatedData.totalContributed) : null,
        currency: validatedData.currency,
        status: validatedData.status,
        isVerified: validatedData.isVerified,
        bannerColor: validatedData.bannerColor,
        tagline: validatedData.tagline,
        agreementUrl: validatedData.agreementUrl,
        terms: validatedData.terms,
        receiveReports: validatedData.receiveReports,
        reportFrequency: validatedData.reportFrequency,
      },
    })

    return createdResponse(sponsor, "Sponsor created successfully")
  } catch (error) {
    console.error("Error creating sponsor:", error)
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        error.errors.map((e) => e.message).join(", "),
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }
    
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
