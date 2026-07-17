import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/public/scholarships/track - Track application status
export async function GET(request: NextRequest) {
  const endpoint = "/api/public/scholarships/track"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing"
    }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const applicationNumber = searchParams.get("applicationNumber")
    const email = searchParams.get("email")
    const trackingCode = searchParams.get("trackingCode")

    if (!applicationNumber && !email && !trackingCode) {
      return NextResponse.json(
        { success: false, error: "Please provide application number, tracking code, or email" },
        { status: 400 }
      )
    }

    let where: any = {}
    if (trackingCode) {
      where.trackingCode = trackingCode.toUpperCase()
    } else if (applicationNumber) {
      where.applicationNumber = applicationNumber.toUpperCase()
    } else if (email) {
      where.email = email.toLowerCase()
    }

    const application = await prisma.scholarshipApplication.findFirst({
      where,
      include: {
        scholarship: {
          select: {
            id: true,
            name: true,
            slug: true,
            scholarshipType: {
              select: { name: true, color: true }
            }
          }
        },
        documents: {
          select: {
            id: true,
            type: true,
            label: true,
            status: true,
            fileName: true,
          }
        },
        reviews: {
          select: {
            id: true,
            status: true,
            totalScore: true,
            recommendation: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found. Please check your details and try again." },
        { status: 404 }
      )
    }

    // Status timeline
    const statusTimeline = generateStatusTimeline(application.status, application.submittedAt, application.reviewedAt, application.decisionDate, application.awardAcceptedAt)

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          applicationNumber: application.applicationNumber,
          trackingCode: application.trackingCode,
          scholarship: application.scholarship,
          applicantName: `${application.firstName} ${application.lastName}`,
          email: application.email,
          status: application.status,
          subStatus: application.subStatus,
          decision: application.decision,
          reviewScore: application.reviewScore ? Number(application.reviewScore) : null,
          interviewScheduledAt: application.interviewScheduledAt?.toISOString(),
          interviewScore: application.interviewScore ? Number(application.interviewScore) : null,
          awardAmount: application.awardAmount ? Number(application.awardAmount) : null,
          awardLetterUrl: application.awardLetterUrl,
          awardAcceptedAt: application.awardAcceptedAt?.toISOString(),
          enrollmentStatus: application.enrollmentStatus,
          submittedAt: application.submittedAt?.toISOString(),
          createdAt: application.createdAt.toISOString(),
          documents: application.documents,
          review: application.reviews[0] || null,
          timeline: statusTimeline,
        }
      }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to track application",
      details: error?.message
    }, { status: 500 })
  }
}

// Helper to generate status timeline
function generateStatusTimeline(
  status: string,
  submittedAt: Date | null,
  reviewedAt: Date | null,
  decisionDate: Date | null,
  awardAcceptedAt: Date | null
) {
  const timeline = []

  // Step 1: Submitted
  timeline.push({
    step: "SUBMITTED",
    label: "Application Submitted",
    description: "Your application has been received",
    completed: true,
    date: submittedAt?.toISOString() || null,
  })

  // Step 2: Under Review
  if (["UNDER_REVIEW", "INTERVIEW", "APPROVED", "REJECTED", "WAITLISTED", "AWARDED", "ENROLLED"].includes(status)) {
    timeline.push({
      step: "UNDER_REVIEW",
      label: "Under Review",
      description: "Your application is being reviewed by our committee",
      completed: true,
      date: reviewedAt?.toISOString() || submittedAt?.toISOString() || null,
    })
  } else {
    timeline.push({
      step: "UNDER_REVIEW",
      label: "Under Review",
      description: "Your application is being reviewed by our committee",
      completed: false,
      date: null,
    })
  }

  // Step 3: Interview (if applicable)
  if (status === "INTERVIEW") {
    timeline.push({
      step: "INTERVIEW",
      label: "Interview Scheduled",
      description: "An interview has been scheduled for your application",
      completed: true,
      date: null,
    })
  }

  // Step 4: Decision
  if (["APPROVED", "AWARDED", "ENROLLED"].includes(status)) {
    timeline.push({
      step: "APPROVED",
      label: "Approved",
      description: "Congratulations! Your application has been approved",
      completed: true,
      date: decisionDate?.toISOString() || null,
    })
  } else if (["REJECTED", "WAITLISTED"].includes(status)) {
    timeline.push({
      step: status === "REJECTED" ? "REJECTED" : "WAITLISTED",
      label: status === "REJECTED" ? "Not Selected" : "Waitlisted",
      description: status === "REJECTED" 
        ? "Unfortunately, your application was not selected this time"
        : "You have been placed on the waitlist",
      completed: true,
      date: decisionDate?.toISOString() || null,
    })
  } else {
    timeline.push({
      step: "DECISION",
      label: "Decision",
      description: "Final decision on your application",
      completed: false,
      date: null,
    })
  }

  // Step 5: Award (if approved)
  if (status === "AWARDED") {
    timeline.push({
      step: "AWARDED",
      label: "Award Issued",
      description: "Your scholarship award has been issued",
      completed: true,
      date: decisionDate?.toISOString() || null,
    })
  } else if (status === "ENROLLED") {
    timeline.push({
      step: "AWARDED",
      label: "Award Issued",
      description: "Your scholarship award has been issued",
      completed: true,
      date: decisionDate?.toISOString() || null,
    })
    timeline.push({
      step: "ENROLLED",
      label: "Enrolled",
      description: "You have accepted your scholarship and are now enrolled",
      completed: true,
      date: awardAcceptedAt?.toISOString() || null,
    })
  }

  return timeline
}
