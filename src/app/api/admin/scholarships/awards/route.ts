import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, createdResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { Prisma } from "@prisma/client"
import { z } from "zod"

// Validation schema for creating award
const createAwardSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  coverageType: z.enum(["FULL", "PARTIAL", "TUITION_WAIVER", "FINANCIAL_AID"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  durationMonths: z.number().int().positive().optional(),
  notes: z.string().optional(),
})

// GET - List all awards
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
    const scholarshipId = searchParams.get("scholarshipId")
    const sponsorId = searchParams.get("sponsorId")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Build where clause
    const where: Prisma.ScholarshipAwardWhereInput = {}
    
    if (status) where.status = status
    if (scholarshipId) where.scholarshipId = scholarshipId
    if (sponsorId) where.sponsorId = sponsorId

    // Get total count
    const total = await prisma.scholarshipAward.count({ where })

    // Get awards
    const awards = await prisma.scholarshipAward.findMany({
      where,
      include: {
        scholarship: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: { select: { name: true } },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        sponsor: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    const formattedAwards = awards.map((award) => ({
      ...award,
      amount: Number(award.amount),
    }))

    return successResponse({
      awards: formattedAwards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching awards:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// POST - Create an award (approve an application)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const validatedData = createAwardSchema.parse(body)

    // Get the application
    const application = await prisma.scholarshipApplication.findUnique({
      where: { id: validatedData.applicationId },
      include: { scholarship: true },
    })

    if (!application) {
      return errorResponse("Application not found", ErrorCodes.NOT_FOUND, 404)
    }

    if (application.status !== "APPROVED") {
      return errorResponse("Application must be approved before creating an award", ErrorCodes.BAD_REQUEST, 400)
    }

    // Check if award already exists for this application
    const existingAward = await prisma.scholarshipAward.findUnique({
      where: { applicationId: validatedData.applicationId },
    })

    if (existingAward) {
      return errorResponse("An award already exists for this application", ErrorCodes.CONFLICT, 409)
    }

    // Generate award number
    const awardNumber = `AWARD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create the award
    const award = await prisma.scholarshipAward.create({
      data: {
        awardNumber,
        scholarshipId: application.scholarshipId,
        applicationId: validatedData.applicationId,
        userId: application.userId,
        email: application.email,
        firstName: application.firstName,
        lastName: application.lastName,
        amount: new Prisma.Decimal(validatedData.amount),
        currency: validatedData.currency,
        coverageType: validatedData.coverageType,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        durationMonths: validatedData.durationMonths,
        notes: validatedData.notes,
        sponsorId: application.scholarship.sponsorId,
        acceptanceDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
      include: {
        scholarship: {
          select: {
            name: true,
            slug: true,
            autoEnroll: true,
            autoGrantMembership: true,
            membershipPlan: true,
            autoGrantDomainAccess: true,
            autoGrantCategoryAccess: true,
          },
        },
      },
    })

    // Update scholarship current recipients
    await prisma.scholarship.update({
      where: { id: application.scholarshipId },
      data: {
        currentRecipients: { increment: 1 },
        budgetUsed: { increment: new Prisma.Decimal(validatedData.amount) },
      },
    })

    // TODO: Auto-enrollment if configured
    // if (award.scholarship.autoEnroll && award.userId) {
    //   await handleAutoEnrollment(award);
    // }

    return createdResponse(award, "Award created successfully")
  } catch (error) {
    console.error("Error creating award:", error)
    
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
