import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"

const trackSchema = z.object({
  applicationNumber: z.string().optional(),
  trackingNumber: z.string().optional(),
  email: z.string().email("Valid email is required"),
})

// POST - Track application status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = trackSchema.parse(body)

    if (!validatedData.applicationNumber && !validatedData.trackingNumber) {
      return errorResponse(
        "Either application number or tracking number is required",
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Build where clause
    const where: any = {
      email: validatedData.email.toLowerCase(),
    }

    if (validatedData.applicationNumber) {
      where.applicationNumber = validatedData.applicationNumber
    }

    if (validatedData.trackingNumber) {
      where.trackingNumber = validatedData.trackingNumber
    }

    // Find application
    const application = await prisma.scholarshipApplication.findFirst({
      where,
      include: {
        scholarship: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: {
              select: {
                name: true,
                icon: true,
                color: true,
              },
            },
            awardAmount: true,
            currency: true,
            coverageType: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: "desc" },
          take: 10,
        },
      },
    })

    if (!application) {
      return errorResponse(
        "No application found with the provided information",
        ErrorCodes.NOT_FOUND,
        404
      )
    }

    // Format status history
    const statusHistory = application.statusHistory.map((status) => ({
      status: status.status,
      notes: status.notes,
      changedAt: status.changedAt,
    }))

    // Get next steps based on status
    let nextSteps = ""
    switch (application.status) {
      case "SUBMITTED":
        nextSteps = "Your application is being reviewed by our committee. You will be notified if selected for the next stage."
        break
      case "UNDER_REVIEW":
        nextSteps = "Your application is under review. We may contact you for additional information if needed."
        break
      case "INTERVIEW":
        nextSteps = "Congratulations! You have been selected for an interview. You will receive an email with interview details shortly."
        break
      case "ADDITIONAL_INFO":
        nextSteps = "We need additional information from you. Please check your email for details."
        break
      case "APPROVED":
        nextSteps = "Congratulations! Your application has been approved. You will receive an award letter via email."
        break
      case "REJECTED":
        nextSteps = "Thank you for your interest. Unfortunately, your application was not selected this time. We encourage you to apply for future opportunities."
        break
      case "WITHDRAWN":
        nextSteps = "Your application has been withdrawn."
        break
      default:
        nextSteps = ""
    }

    return successResponse({
      application: {
        applicationNumber: application.applicationNumber,
        trackingNumber: application.trackingNumber,
        status: application.status,
        submittedAt: application.submittedAt,
        lastStatusChange: application.lastStatusChange,
        scholarship: {
          name: application.scholarship.name,
          slug: application.scholarship.slug,
          type: application.scholarship.type,
          awardAmount: application.scholarship.awardAmount ? Number(application.scholarship.awardAmount) : null,
          currency: application.scholarship.currency,
          coverageType: application.scholarship.coverageType,
        },
        statusHistory,
        nextSteps,
      },
    })

  } catch (error) {
    console.error("Error tracking application:", error)
    
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

// GET - Get tracking page info
export async function GET() {
  return successResponse({
    message: "Use POST to track your application status",
    requiredFields: ["email"],
    optionalFields: ["applicationNumber", "trackingNumber"],
  })
}
