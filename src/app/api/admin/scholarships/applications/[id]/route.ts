import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { Prisma } from "@prisma/client"

type RouteParams = { params: { id: string } }

// GET - Get a single application
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const application = await prisma.scholarshipApplication.findUnique({
      where: { id: params.id },
      include: {
        scholarship: {
          include: {
            type: true,
            sponsor: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        statusHistory: {
          orderBy: { changedAt: "desc" },
          take: 20,
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    })

    if (!application) {
      return errorResponse("Application not found", ErrorCodes.NOT_FOUND, 404)
    }

    // Transform data
    const formattedApplication = {
      ...application,
      gpa: application.gpa ? Number(application.gpa) : null,
      householdIncome: application.householdIncome ? Number(application.householdIncome) : null,
      reviewScore: application.reviewScore ? Number(application.reviewScore) : null,
      interviewScore: application.interviewScore ? Number(application.interviewScore) : null,
      documents: application.documents ? JSON.parse(application.documents as string) : [],
    }

    return successResponse(formattedApplication)
  } catch (error) {
    console.error("Error fetching application:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// PATCH - Update application status or assign reviewer
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const { status, assignedReviewerId, statusNotes, reviewerNotes } = body

    // Check if application exists
    const existing = await prisma.scholarshipApplication.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return errorResponse("Application not found", ErrorCodes.NOT_FOUND, 404)
    }

    const updateData: Prisma.ScholarshipApplicationUpdateInput = {
      lastStatusChange: new Date(),
    }

    if (status !== undefined) {
      updateData.status = status
      if (statusNotes) updateData.statusNotes = statusNotes
    }

    if (assignedReviewerId !== undefined) {
      updateData.assignedReviewerId = assignedReviewerId
    }

    if (reviewerNotes !== undefined) {
      updateData.reviewerNotes = reviewerNotes
    }

    // Create status history entry if status is changing
    if (status && status !== existing.status) {
      await prisma.scholarshipApplicationStatus.create({
        data: {
          applicationId: params.id,
          status,
          notes: statusNotes,
          changedBy: session.user.id,
        },
      })
    }

    const application = await prisma.scholarshipApplication.update({
      where: { id: params.id },
      data: updateData,
      include: {
        scholarship: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return successResponse(application, "Application updated successfully")
  } catch (error) {
    console.error("Error updating application:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
