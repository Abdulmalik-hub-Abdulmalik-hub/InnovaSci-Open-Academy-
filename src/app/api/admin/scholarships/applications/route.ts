import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { Prisma } from "@prisma/client"

// GET - List all scholarship applications
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
    const reviewerId = searchParams.get("reviewerId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "submittedAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Build where clause
    const where: Prisma.ScholarshipApplicationWhereInput = {}

    if (status) where.status = status
    if (scholarshipId) where.scholarshipId = scholarshipId
    if (reviewerId) where.assignedReviewerId = reviewerId

    if (search) {
      where.OR = [
        { applicationNumber: { contains: search, mode: "insensitive" } },
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count
    const total = await prisma.scholarshipApplication.count({ where })

    // Get applications with pagination
    const applications = await prisma.scholarshipApplication.findMany({
      where,
      include: {
        scholarship: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            awardAmount: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true } },
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Transform data
    const formattedApplications = applications.map((app) => ({
      id: app.id,
      applicationNumber: app.applicationNumber,
      trackingNumber: app.trackingNumber,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      phone: app.phone,
      status: app.status,
      submittedAt: app.submittedAt,
      scholarship: app.scholarship,
      scholarshipId: app.scholarshipId,
      reviewScore: app.reviewScore ? Number(app.reviewScore) : null,
      reviewerRecommendation: app.reviewerRecommendation,
      hasUserAccount: !!app.userId,
      reviewsCount: app.reviews.length,
      latestReview: app.reviews[0] || null,
    }))

    return successResponse({
      applications: formattedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// PATCH - Bulk update application status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const { applicationIds, status, notes } = body

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return errorResponse("applicationIds is required", ErrorCodes.VALIDATION_ERROR, 400)
    }

    if (!status) {
      return errorResponse("status is required", ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Update applications
    await prisma.scholarshipApplication.updateMany({
      where: { id: { in: applicationIds } },
      data: {
        status,
        statusNotes: notes,
        lastStatusChange: new Date(),
      },
    })

    // Create status history for each application
    await prisma.scholarshipApplicationStatus.createMany({
      data: applicationIds.map((id: string) => ({
        applicationId: id,
        status,
        notes,
        changedBy: session.user.id,
      })),
    })

    return successResponse({ updated: applicationIds.length }, "Applications updated successfully")
  } catch (error) {
    console.error("Error updating applications:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
