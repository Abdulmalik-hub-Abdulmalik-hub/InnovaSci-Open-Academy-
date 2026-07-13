import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"

type RouteParams = { params: { slug: string } }

// GET - Get public scholarship details by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const scholarship = await prisma.scholarship.findFirst({
      where: {
        slug: params.slug,
        status: "PUBLISHED",
        visibility: { in: ["PUBLIC", "FEATURED"] },
      },
      include: {
        type: true,
        sponsor: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
          },
        },
        customQuestions: {
          where: { scholarshipId: undefined }, // Only get global questions
          orderBy: { orderIndex: "asc" },
        },
      },
    })

    if (!scholarship) {
      return errorResponse("Scholarship not found", ErrorCodes.NOT_FOUND, 404)
    }

    // Check if application window is open
    const now = new Date()
    let isOpen = true
    let message = ""

    if (scholarship.closingDate && scholarship.closingDate < now && !scholarship.allowLateApplications) {
      isOpen = false
      message = "Application deadline has passed"
    }

    if (scholarship.openingDate && scholarship.openingDate > now) {
      isOpen = false
      message = `Applications open on ${scholarship.openingDate.toLocaleDateString()}`
    }

    // Transform data
    const formattedScholarship = {
      ...scholarship,
      awardAmount: scholarship.awardAmount ? Number(scholarship.awardAmount) : null,
      minGPA: scholarship.minGPA ? Number(scholarship.minGPA) : null,
      requiredDocuments: scholarship.requiredDocuments ? JSON.parse(scholarship.requiredDocuments as string) : [],
      applicableDomains: scholarship.applicableDomains ? JSON.parse(scholarship.applicableDomains as string) : [],
      applicableCategories: scholarship.applicableCategories ? JSON.parse(scholarship.applicableCategories as string) : [],
      applicableDifficulties: scholarship.applicableDifficulties ? JSON.parse(scholarship.applicableDifficulties as string) : [],
      isOpen,
      statusMessage: message,
      applicationUrl: `/scholarships/apply/${scholarship.slug}`,
      shareUrl: `${process.env.APP_URL || ""}/scholarships/apply/${scholarship.slug}`,
    }

    return successResponse(formattedScholarship)
  } catch (error) {
    console.error("Error fetching scholarship:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
