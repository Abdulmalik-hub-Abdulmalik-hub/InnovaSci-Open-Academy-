import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, createdResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"
import { Prisma } from "@prisma/client"

// Validation schema for creating a scholarship
const createScholarshipSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().optional(),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  objectives: z.string().optional(),
  eligibility: z.string().optional(),
  benefits: z.string().optional(),
  typeId: z.string().min(1, "Scholarship type is required"),
  awardAmount: z.number().optional(),
  currency: z.string().default("USD"),
  coverageType: z.enum(["FULL", "PARTIAL", "TUITION_WAIVER", "FINANCIAL_AID"]).default("PARTIAL"),
  maxRecipients: z.number().int().positive().optional(),
  totalBudget: z.number().optional(),
  openingDate: z.string().datetime().optional(),
  closingDate: z.string().datetime().optional(),
  announcementDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]).default("DRAFT"),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FEATURED"]).default("PUBLIC"),
  isFeatured: z.boolean().default(false),
  allowLateApplications: z.boolean().default(false),
  selectionMethod: z.enum(["COMMITTEE", "AUTOMATIC", "INTERVIEW", "COMBINED"]).default("COMMITTEE"),
  sponsorId: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  bannerUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  requiredDocuments: z.array(z.string()).optional(),
  minGPA: z.number().optional(),
  requiredDocumentsList: z.string().optional(),
  applicableDomains: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  applicableDifficulties: z.array(z.string()).optional(),
  nationality: z.string().optional(),
  eligibleCountries: z.string().optional(),
  gender: z.string().optional(),
  minAge: z.number().int().optional(),
  maxAge: z.number().int().optional(),
  educationLevel: z.string().optional(),
  requiredCertifications: z.string().optional(),
  requireInterview: z.boolean().default(false),
  interviewDate: z.string().datetime().optional(),
  interviewLocation: z.string().optional(),
  autoEnroll: z.boolean().default(false),
  autoGrantMembership: z.boolean().default(false),
  membershipPlan: z.string().optional(),
  autoGrantDomainAccess: z.boolean().default(false),
  autoGrantCategoryAccess: z.boolean().default(false),
})

// GET - List all scholarships with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const visibility = searchParams.get("visibility")
    const typeId = searchParams.get("typeId")
    const sponsorId = searchParams.get("sponsorId")
    const search = searchParams.get("search")
    const isFeatured = searchParams.get("isFeatured")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Build where clause
    const where: Prisma.ScholarshipWhereInput = {}
    
    if (status) where.status = status
    if (visibility) where.visibility = visibility
    if (typeId) where.typeId = typeId
    if (sponsorId) where.sponsorId = sponsorId
    if (isFeatured === "true") where.isFeatured = true
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count
    const total = await prisma.scholarship.count({ where })

    // Get scholarships with pagination
    const scholarships = await prisma.scholarship.findMany({
      where,
      include: {
        type: true,
        sponsor: true,
        _count: {
          select: {
            applications: true,
            awards: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Transform data for response
    const formattedScholarships = scholarships.map((scholarship) => ({
      ...scholarship,
      awardAmount: scholarship.awardAmount ? Number(scholarship.awardAmount) : null,
      totalBudget: scholarship.totalBudget ? Number(scholarship.totalBudget) : null,
      budgetUsed: scholarship.budgetUsed ? Number(scholarship.budgetUsed) : null,
      minGPA: scholarship.minGPA ? Number(scholarship.minGPA) : null,
      applicationCount: scholarship._count.applications,
      awardCount: scholarship._count.awards,
      applicableDomains: scholarship.applicableDomains ? JSON.parse(scholarship.applicableDomains as string) : [],
      applicableCategories: scholarship.applicableCategories ? JSON.parse(scholarship.applicableCategories as string) : [],
      applicableDifficulties: scholarship.applicableDifficulties ? JSON.parse(scholarship.applicableDifficulties as string) : [],
      requiredDocuments: scholarship.requiredDocuments ? JSON.parse(scholarship.requiredDocuments as string) : [],
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
    console.error("Error fetching scholarships:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// POST - Create a new scholarship
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const validatedData = createScholarshipSchema.parse(body)

    // Check if slug already exists
    const existingSlug = await prisma.scholarship.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return errorResponse("A scholarship with this slug already exists", ErrorCodes.CONFLICT, 409)
    }

    // Check if type exists
    const scholarshipType = await prisma.scholarshipType.findUnique({
      where: { id: validatedData.typeId },
    })

    if (!scholarshipType) {
      return errorResponse("Invalid scholarship type", ErrorCodes.NOT_FOUND, 404)
    }

    // Create scholarship
    const scholarship = await prisma.scholarship.create({
      data: {
        name: validatedData.name,
        shortName: validatedData.shortName,
        slug: validatedData.slug,
        description: validatedData.description,
        objectives: validatedData.objectives,
        eligibility: validatedData.eligibility,
        benefits: validatedData.benefits,
        typeId: validatedData.typeId,
        awardAmount: validatedData.awardAmount ? new Prisma.Decimal(validatedData.awardAmount) : null,
        currency: validatedData.currency,
        coverageType: validatedData.coverageType,
        maxRecipients: validatedData.maxRecipients,
        totalBudget: validatedData.totalBudget ? new Prisma.Decimal(validatedData.totalBudget) : null,
        openingDate: validatedData.openingDate ? new Date(validatedData.openingDate) : null,
        closingDate: validatedData.closingDate ? new Date(validatedData.closingDate) : null,
        announcementDate: validatedData.announcementDate ? new Date(validatedData.announcementDate) : null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        status: validatedData.status,
        visibility: validatedData.visibility,
        isFeatured: validatedData.isFeatured,
        allowLateApplications: validatedData.allowLateApplications,
        selectionMethod: validatedData.selectionMethod,
        sponsorId: validatedData.sponsorId,
        seoTitle: validatedData.seoTitle,
        seoDescription: validatedData.seoDescription,
        seoKeywords: validatedData.seoKeywords,
        bannerUrl: validatedData.bannerUrl,
        thumbnailUrl: validatedData.thumbnailUrl,
        icon: validatedData.icon,
        color: validatedData.color,
        requiredDocuments: validatedData.requiredDocuments ? JSON.stringify(validatedData.requiredDocuments) : undefined,
        minGPA: validatedData.minGPA ? new Prisma.Decimal(validatedData.minGPA) : null,
        requiredDocumentsList: validatedData.requiredDocumentsList,
        applicableDomains: validatedData.applicableDomains ? JSON.stringify(validatedData.applicableDomains) : undefined,
        applicableCategories: validatedData.applicableCategories ? JSON.stringify(validatedData.applicableCategories) : undefined,
        applicableDifficulties: validatedData.applicableDifficulties ? JSON.stringify(validatedData.applicableDifficulties) : undefined,
        nationality: validatedData.nationality,
        eligibleCountries: validatedData.eligibleCountries,
        gender: validatedData.gender,
        minAge: validatedData.minAge,
        maxAge: validatedData.maxAge,
        educationLevel: validatedData.educationLevel,
        requiredCertifications: validatedData.requiredCertifications,
        requireInterview: validatedData.requireInterview,
        interviewDate: validatedData.interviewDate ? new Date(validatedData.interviewDate) : null,
        interviewLocation: validatedData.interviewLocation,
        autoEnroll: validatedData.autoEnroll,
        autoGrantMembership: validatedData.autoGrantMembership,
        membershipPlan: validatedData.membershipPlan,
        autoGrantDomainAccess: validatedData.autoGrantDomainAccess,
        autoGrantCategoryAccess: validatedData.autoGrantCategoryAccess,
        publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        type: true,
        sponsor: true,
      },
    })

    return createdResponse(scholarship, "Scholarship created successfully")
  } catch (error) {
    console.error("Error creating scholarship:", error)
    
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
