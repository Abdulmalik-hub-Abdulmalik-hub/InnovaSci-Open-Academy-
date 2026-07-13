import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"
import { Prisma } from "@prisma/client"

type RouteParams = { params: { id: string } }

// Validation schema for updating a scholarship
const updateScholarshipSchema = z.object({
  name: z.string().min(1).optional(),
  shortName: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  objectives: z.string().optional(),
  eligibility: z.string().optional(),
  benefits: z.string().optional(),
  typeId: z.string().optional(),
  awardAmount: z.number().optional(),
  currency: z.string().optional(),
  coverageType: z.enum(["FULL", "PARTIAL", "TUITION_WAIVER", "FINANCIAL_AID"]).optional(),
  maxRecipients: z.number().int().positive().optional(),
  totalBudget: z.number().optional(),
  openingDate: z.string().datetime().nullable().optional(),
  closingDate: z.string().datetime().nullable().optional(),
  announcementDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FEATURED"]).optional(),
  isFeatured: z.boolean().optional(),
  allowLateApplications: z.boolean().optional(),
  selectionMethod: z.enum(["COMMITTEE", "AUTOMATIC", "INTERVIEW", "COMBINED"]).optional(),
  sponsorId: z.string().nullable().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
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
  requireInterview: z.boolean().optional(),
  interviewDate: z.string().datetime().nullable().optional(),
  interviewLocation: z.string().optional(),
  autoEnroll: z.boolean().optional(),
  autoGrantMembership: z.boolean().optional(),
  membershipPlan: z.string().nullable().optional(),
  autoGrantDomainAccess: z.boolean().optional(),
  autoGrantCategoryAccess: z.boolean().optional(),
})

// GET - Get a single scholarship
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const scholarship = await prisma.scholarship.findUnique({
      where: { id: params.id },
      include: {
        type: true,
        sponsor: true,
        customQuestions: {
          orderBy: { orderIndex: "asc" },
        },
        reviewRubric: true,
        _count: {
          select: {
            applications: true,
            awards: true,
          },
        },
      },
    })

    if (!scholarship) {
      return errorResponse("Scholarship not found", ErrorCodes.NOT_FOUND, 404)
    }

    // Transform data
    const formattedScholarship = {
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
    }

    return successResponse(formattedScholarship)
  } catch (error) {
    console.error("Error fetching scholarship:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// PATCH - Update a scholarship
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const validatedData = updateScholarshipSchema.parse(body)

    // Check if scholarship exists
    const existing = await prisma.scholarship.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return errorResponse("Scholarship not found", ErrorCodes.NOT_FOUND, 404)
    }

    // Check if slug is being changed and if new slug already exists
    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const slugExists = await prisma.scholarship.findUnique({
        where: { slug: validatedData.slug },
      })
      if (slugExists) {
        return errorResponse("A scholarship with this slug already exists", ErrorCodes.CONFLICT, 409)
      }
    }

    // Build update data
    const updateData: Prisma.ScholarshipUpdateInput = {}

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.shortName !== undefined) updateData.shortName = validatedData.shortName
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.objectives !== undefined) updateData.objectives = validatedData.objectives
    if (validatedData.eligibility !== undefined) updateData.eligibility = validatedData.eligibility
    if (validatedData.benefits !== undefined) updateData.benefits = validatedData.benefits
    if (validatedData.typeId !== undefined) updateData.type = { connect: { id: validatedData.typeId } }
    if (validatedData.awardAmount !== undefined) updateData.awardAmount = new Prisma.Decimal(validatedData.awardAmount)
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency
    if (validatedData.coverageType !== undefined) updateData.coverageType = validatedData.coverageType
    if (validatedData.maxRecipients !== undefined) updateData.maxRecipients = validatedData.maxRecipients
    if (validatedData.totalBudget !== undefined) updateData.totalBudget = new Prisma.Decimal(validatedData.totalBudget)
    if (validatedData.openingDate !== undefined) updateData.openingDate = validatedData.openingDate ? new Date(validatedData.openingDate) : null
    if (validatedData.closingDate !== undefined) updateData.closingDate = validatedData.closingDate ? new Date(validatedData.closingDate) : null
    if (validatedData.announcementDate !== undefined) updateData.announcementDate = validatedData.announcementDate ? new Date(validatedData.announcementDate) : null
    if (validatedData.startDate !== undefined) updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null
    if (validatedData.endDate !== undefined) updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null
    if (validatedData.visibility !== undefined) updateData.visibility = validatedData.visibility
    if (validatedData.isFeatured !== undefined) updateData.isFeatured = validatedData.isFeatured
    if (validatedData.allowLateApplications !== undefined) updateData.allowLateApplications = validatedData.allowLateApplications
    if (validatedData.selectionMethod !== undefined) updateData.selectionMethod = validatedData.selectionMethod
    if (validatedData.sponsorId !== undefined) updateData.sponsor = validatedData.sponsorId ? { connect: { id: validatedData.sponsorId } } : { disconnect: true }
    if (validatedData.seoTitle !== undefined) updateData.seoTitle = validatedData.seoTitle
    if (validatedData.seoDescription !== undefined) updateData.seoDescription = validatedData.seoDescription
    if (validatedData.seoKeywords !== undefined) updateData.seoKeywords = validatedData.seoKeywords
    if (validatedData.bannerUrl !== undefined) updateData.bannerUrl = validatedData.bannerUrl
    if (validatedData.thumbnailUrl !== undefined) updateData.thumbnailUrl = validatedData.thumbnailUrl
    if (validatedData.icon !== undefined) updateData.icon = validatedData.icon
    if (validatedData.color !== undefined) updateData.color = validatedData.color
    if (validatedData.requiredDocuments !== undefined) updateData.requiredDocuments = JSON.stringify(validatedData.requiredDocuments)
    if (validatedData.minGPA !== undefined) updateData.minGPA = new Prisma.Decimal(validatedData.minGPA)
    if (validatedData.requiredDocumentsList !== undefined) updateData.requiredDocumentsList = validatedData.requiredDocumentsList
    if (validatedData.applicableDomains !== undefined) updateData.applicableDomains = JSON.stringify(validatedData.applicableDomains)
    if (validatedData.applicableCategories !== undefined) updateData.applicableCategories = JSON.stringify(validatedData.applicableCategories)
    if (validatedData.applicableDifficulties !== undefined) updateData.applicableDifficulties = JSON.stringify(validatedData.applicableDifficulties)
    if (validatedData.nationality !== undefined) updateData.nationality = validatedData.nationality
    if (validatedData.eligibleCountries !== undefined) updateData.eligibleCountries = validatedData.eligibleCountries
    if (validatedData.gender !== undefined) updateData.gender = validatedData.gender
    if (validatedData.minAge !== undefined) updateData.minAge = validatedData.minAge
    if (validatedData.maxAge !== undefined) updateData.maxAge = validatedData.maxAge
    if (validatedData.educationLevel !== undefined) updateData.educationLevel = validatedData.educationLevel
    if (validatedData.requiredCertifications !== undefined) updateData.requiredCertifications = validatedData.requiredCertifications
    if (validatedData.requireInterview !== undefined) updateData.requireInterview = validatedData.requireInterview
    if (validatedData.interviewDate !== undefined) updateData.interviewDate = validatedData.interviewDate ? new Date(validatedData.interviewDate) : null
    if (validatedData.interviewLocation !== undefined) updateData.interviewLocation = validatedData.interviewLocation
    if (validatedData.autoEnroll !== undefined) updateData.autoEnroll = validatedData.autoEnroll
    if (validatedData.autoGrantMembership !== undefined) updateData.autoGrantMembership = validatedData.autoGrantMembership
    if (validatedData.membershipPlan !== undefined) updateData.membershipPlan = validatedData.membershipPlan
    if (validatedData.autoGrantDomainAccess !== undefined) updateData.autoGrantDomainAccess = validatedData.autoGrantDomainAccess
    if (validatedData.autoGrantCategoryAccess !== undefined) updateData.autoGrantCategoryAccess = validatedData.autoGrantCategoryAccess

    // Handle status changes
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      if (validatedData.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
        updateData.publishedAt = new Date()
      }
      if (validatedData.status === "CLOSED" && existing.status !== "CLOSED") {
        updateData.closedAt = new Date()
      }
    }

    const scholarship = await prisma.scholarship.update({
      where: { id: params.id },
      data: updateData,
      include: {
        type: true,
        sponsor: true,
      },
    })

    return successResponse(scholarship, "Scholarship updated successfully")
  } catch (error) {
    console.error("Error updating scholarship:", error)
    
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

// DELETE - Delete a scholarship
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can delete scholarships", ErrorCodes.FORBIDDEN, 403)
    }

    // Check if scholarship exists
    const existing = await prisma.scholarship.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            applications: true,
            awards: true,
          },
        },
      },
    })

    if (!existing) {
      return errorResponse("Scholarship not found", ErrorCodes.NOT_FOUND, 404)
    }

    // Prevent deletion if scholarship has applications or awards
    if (existing._count.applications > 0 || existing._count.awards > 0) {
      return errorResponse(
        "Cannot delete scholarship with existing applications or awards. Archive it instead.",
        ErrorCodes.CONFLICT,
        409
      )
    }

    await prisma.scholarship.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Scholarship deleted successfully")
  } catch (error) {
    console.error("Error deleting scholarship:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
