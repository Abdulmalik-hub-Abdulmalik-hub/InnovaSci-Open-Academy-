import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { hasPermission } from "@/lib/permissions"

// Validation schemas
const createScholarshipSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["FORCEWORK", "MERIT", "NEED_BASED", "RESEARCH_INNOVATION", "SPECIAL_NEED", "COMMUNITY_IMPACT", "FOUNDER", "SPONSORED", "ZAKAT_WAQF", "TUITION_WAIVER", "PARTIAL", "FULL", "FINANCIAL_AID"]),
  description: z.string().optional(),
  objectives: z.string().optional(),
  eligibility: z.string().optional(),
  benefits: z.string().optional(),
  coverage: z.string().optional(),
  awardAmount: z.number().optional(),
  currency: z.string().default("USD"),
  availableSlots: z.number().optional(),
  openingDate: z.string().datetime().optional(),
  closingDate: z.string().datetime().optional(),
  applicationDeadline: z.string().datetime().optional(),
  selectionMethod: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED", "DISABLED"]).default("DRAFT"),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FEATURED"]).default("PUBLIC"),
  isFeatured: z.boolean().default(false),
  bannerUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  sponsorId: z.string().optional(),
  domainIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  difficultyLevels: z.array(z.string()).optional(),
  certificateIds: z.array(z.string()).optional(),
  planIds: z.array(z.string()).optional(),
  autoEnroll: z.boolean().default(false),
  createAccount: z.boolean().default(true),
  assignMembership: z.boolean().default(false),
  assignDomain: z.boolean().default(false),
  assignCategory: z.boolean().default(false),
  assignCourse: z.boolean().default(false),
  waiverFees: z.boolean().default(false),
  requireInterview: z.boolean().default(false),
  scoringRubricId: z.string().optional(),
  benefitsConfig: z.any().optional(),
})

const updateScholarshipSchema = createScholarshipSchema.partial()

// GET /api/admin/scholarships - List all scholarships
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "scholarships:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const sponsorId = searchParams.get("sponsorId")
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (status) where.status = status
    if (type) where.type = type
    if (featured === "true") where.isFeatured = true
    if (sponsorId) where.sponsorId = sponsorId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }
    
    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sponsor: true,
          domains: { include: { domain: true } },
          categories: { include: { category: true } },
          _count: {
            select: { applications: true }
          }
        }
      }),
      prisma.scholarship.count({ where })
    ])
    
    return NextResponse.json({
      scholarships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/scholarships - Create a new scholarship
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "scholarships:create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = createScholarshipSchema.parse(body)
    
    // Check if slug already exists
    const existingSlug = await prisma.scholarship.findUnique({
      where: { slug: validatedData.slug }
    })
    
    if (existingSlug) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }
    
    // Create scholarship with relations
    const scholarship = await prisma.scholarship.create({
      data: {
        name: validatedData.name,
        shortName: validatedData.shortName,
        slug: validatedData.slug,
        type: validatedData.type,
        description: validatedData.description,
        objectives: validatedData.objectives,
        eligibility: validatedData.eligibility,
        benefits: validatedData.benefits,
        coverage: validatedData.coverage,
        awardAmount: validatedData.awardAmount,
        currency: validatedData.currency,
        availableSlots: validatedData.availableSlots,
        openingDate: validatedData.openingDate ? new Date(validatedData.openingDate) : null,
        closingDate: validatedData.closingDate ? new Date(validatedData.closingDate) : null,
        applicationDeadline: validatedData.applicationDeadline ? new Date(validatedData.applicationDeadline) : null,
        selectionMethod: validatedData.selectionMethod,
        status: validatedData.status,
        visibility: validatedData.visibility,
        isFeatured: validatedData.isFeatured,
        bannerUrl: validatedData.bannerUrl,
        thumbnailUrl: validatedData.thumbnailUrl,
        color: validatedData.color,
        icon: validatedData.icon,
        seoTitle: validatedData.seoTitle,
        seoDescription: validatedData.seoDescription,
        seoKeywords: validatedData.seoKeywords,
        sponsorId: validatedData.sponsorId,
        autoEnroll: validatedData.autoEnroll,
        createAccount: validatedData.createAccount,
        assignMembership: validatedData.assignMembership,
        assignDomain: validatedData.assignDomain,
        assignCategory: validatedData.assignCategory,
        assignCourse: validatedData.assignCourse,
        waiverFees: validatedData.waiverFees,
        requireInterview: validatedData.requireInterview,
        scoringRubricId: validatedData.scoringRubricId,
        benefitsConfig: validatedData.benefitsConfig,
        domains: validatedData.domainIds ? {
          create: validatedData.domainIds.map((id: string) => ({
            domainId: id
          }))
        } : undefined,
        categories: validatedData.categoryIds ? {
          create: validatedData.categoryIds.map((id: string) => ({
            categoryId: id
          }))
        } : undefined,
        difficulties: validatedData.difficultyLevels ? {
          create: validatedData.difficultyLevels.map((level: string) => ({
            difficultyLevel: level
          }))
        } : undefined,
        certificates: validatedData.certificateIds ? {
          create: validatedData.certificateIds.map((id: string) => ({
            certificateId: id
          }))
        } : undefined,
        plans: validatedData.planIds ? {
          create: validatedData.planIds.map((id: string) => ({
            planId: id
          }))
        } : undefined,
      },
      include: {
        sponsor: true,
        domains: { include: { domain: true } },
        categories: { include: { category: true } },
        difficulties: true,
        certificates: true,
        plans: true,
      }
    })
    
    return NextResponse.json(scholarship, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating scholarship:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
