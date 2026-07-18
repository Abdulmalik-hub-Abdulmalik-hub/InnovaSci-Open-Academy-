import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const trackSchema = z.object({
  trackingNumber: z.string().optional(),
  applicationNumber: z.string().optional(),
  email: z.string().email().optional(),
})

// POST /api/public/scholarships/track - Track application status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingNumber, applicationNumber, email } = body
    
    if (!trackingNumber && !applicationNumber) {
      return NextResponse.json({ 
        error: "Either tracking number or application number is required" 
      }, { status: 400 })
    }
    
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required to verify your identity" 
      }, { status: 400 })
    }
    
    // Find application
    const application = await prisma.scholarshipApplication.findFirst({
      where: {
        email: email.toLowerCase(),
        ...(trackingNumber ? { trackingNumber } : { applicationNumber }),
      },
      include: {
        scholarship: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnailUrl: true,
          }
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            createdAt: true,
          }
        }
      }
    })
    
    if (!application) {
      return NextResponse.json({ 
        error: "Application not found. Please check your tracking number and email." 
      }, { status: 404 })
    }
    
    // Get next steps based on status
    const nextSteps = getNextSteps(application.status)
    
    return NextResponse.json({
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        trackingNumber: application.trackingNumber,
        status: application.status,
        scholarship: application.scholarship,
        firstName: application.firstName,
        lastName: application.lastName,
        submittedAt: application.submittedAt,
        decisionDate: application.decisionDate,
      },
      nextSteps,
      recentUpdates: application.statusHistory.map(h => ({
        status: h.newStatus,
        date: h.createdAt,
        notes: h.notes,
      })),
      notifications: application.notifications,
    })
  } catch (error) {
    console.error("Error tracking application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getNextSteps(status: string): string[] {
  switch (status) {
    case "DRAFT":
      return [
        "Complete your application",
        "Review all required fields",
        "Submit your application before the deadline"
      ]
    case "SUBMITTED":
      return [
        "Your application is being reviewed",
        "You will be notified of any updates via email",
        "Check back for status updates"
      ]
    case "UNDER_REVIEW":
      return [
        "Your application is being evaluated by our review team",
        "Reviewers may request additional information",
        "You will be notified of any requests"
      ]
    case "INTERVIEW":
      return [
        "Congratulations! You have been shortlisted for an interview",
        "Check your email for interview details",
        "Prepare for your interview"
      ]
    case "APPROVED":
      return [
        "Congratulations! Your application has been approved",
        "Check your email for the award letter",
        "Complete the acceptance process"
      ]
    case "REJECTED":
      return [
        "Thank you for applying",
        "Your application was not successful this time",
        "We encourage you to apply for future opportunities"
      ]
    case "AWARDED":
      return [
        "Congratulations on receiving your award!",
        "Check your email for enrollment instructions",
        "Access your benefits through your dashboard"
      ]
    case "EXPIRED":
      return [
        "This application period has ended",
        "Check for new scholarship opportunities"
      ]
    case "WITHDRAWN":
      return [
        "This application has been withdrawn",
        "Apply for other opportunities"
      ]
    default:
      return ["Check back for updates"]
  }
}
