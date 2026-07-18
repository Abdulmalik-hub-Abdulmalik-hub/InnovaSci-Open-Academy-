import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { z } from "zod"
import { sendScholarshipDecisionEmail } from "@/lib/email"

const decisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
  createAward: z.boolean().default(false),
  awardAmount: z.number().optional(),
  awardStartDate: z.string().datetime().optional(),
  awardEndDate: z.string().datetime().optional(),
})

// POST /api/admin/applications/[id]/decision - Make final decision on application
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Only SUPER_ADMIN or those with approve permission can make final decisions
    const canApprove = hasPermission(session.user.role as string, "applications:approve") || 
                       session.user.role === "SUPER_ADMIN"
    
    if (!canApprove) {
      return NextResponse.json({ error: "Forbidden - Only Super Admin can make final decisions" }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = decisionSchema.parse(body)
    
    const application = await prisma.scholarshipApplication.findUnique({
      where: { id: params.id },
      include: {
        scholarship: {
          include: {
            plans: true,
            domains: { include: { domain: true } },
            categories: { include: { category: true } },
          }
        }
      }
    })
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    if (application.status !== "UNDER_REVIEW" && application.status !== "INTERVIEW") {
      return NextResponse.json({ 
        error: "Application must be under review or interview stage to make a decision" 
      }, { status: 400 })
    }
    
    // Update application status
    const updatedApplication = await prisma.scholarshipApplication.update({
      where: { id: params.id },
      data: {
        status: validatedData.decision,
        decisionDate: new Date(),
        decisionBy: session.user.id,
        decisionNotes: validatedData.notes,
      }
    })
    
    // Create status history entry
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: params.id,
        previousStatus: application.status,
        newStatus: validatedData.decision,
        changedBy: session.user.id,
        changedByName: session.user.name || session.user.email,
        notes: validatedData.notes
      }
    })
    
    // Send notification email
    try {
      await sendScholarshipDecisionEmail({
        to: application.email,
        applicationNumber: application.applicationNumber,
        trackingNumber: application.trackingNumber,
        scholarshipName: application.scholarship.name,
        decision: validatedData.decision,
        notes: validatedData.notes,
      })
      
      // Record notification
      await prisma.applicationNotification.create({
        data: {
          applicationId: params.id,
          type: validatedData.decision,
          title: `Application ${validatedData.decision === "APPROVED" ? "Approved" : "Rejected"}`,
          message: `Your application for ${application.scholarship.name} has been ${validatedData.decision.toLowerCase()}.`,
          channel: "EMAIL",
          sentAt: new Date()
        }
      })
    } catch (emailError) {
      console.error("Error sending decision email:", emailError)
    }
    
    // Create award if approved and requested
    let award = null
    if (validatedData.decision === "APPROVED" && validatedData.createAward) {
      // Generate award number
      const awardCount = await prisma.scholarshipAward.count()
      const awardNumber = `AWARD-${String(awardCount + 1).padStart(6, "0")}`
      
      award = await prisma.scholarshipAward.create({
        data: {
          awardNumber,
          applicationId: params.id,
          scholarshipId: application.scholarshipId,
          recipientName: `${application.firstName} ${application.lastName}`,
          recipientEmail: application.email,
          userId: application.userId,
          amount: validatedData.awardAmount,
          currency: application.scholarship.currency,
          startDate: validatedData.awardStartDate ? new Date(validatedData.awardStartDate) : null,
          endDate: validatedData.awardEndDate ? new Date(validatedData.awardEndDate) : null,
          acceptanceDeadline: validatedData.awardStartDate 
            ? new Date(new Date(validatedData.awardStartDate).getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days
            : null,
          benefits: {
            plans: application.scholarship.plans.map(p => p.planId),
            domains: application.scholarship.domains.map(d => d.domainId),
            categories: application.scholarship.categories.map(c => c.categoryId),
          }
        }
      })
      
      // Update application with award
      await prisma.scholarshipApplication.update({
        where: { id: params.id },
        data: {
          awardId: award.id,
          status: "AWARDED"
        }
      })
      
      // If auto-enroll is enabled, create enrollment records
      if (application.scholarship.autoEnroll) {
        const enrollmentRecords = []
        
        // Membership/Plan enrollments
        for (const plan of application.scholarship.plans) {
          enrollmentRecords.push({
            awardId: award.id,
            type: "PLAN",
            planId: plan.planId,
            status: "PENDING",
            durationDays: plan.duration,
          })
        }
        
        // Domain access
        if (application.scholarship.assignDomain) {
          for (const sd of application.scholarship.domains) {
            enrollmentRecords.push({
              awardId: award.id,
              type: "DOMAIN",
              domainId: sd.domainId,
              status: "PENDING",
            })
          }
        }
        
        // Category access
        if (application.scholarship.assignCategory) {
          for (const sc of application.scholarship.categories) {
            enrollmentRecords.push({
              awardId: award.id,
              type: "CATEGORY",
              categoryId: sc.categoryId,
              status: "PENDING",
            })
          }
        }
        
        if (enrollmentRecords.length > 0) {
          await prisma.scholarshipEnrollment.createMany({
            data: enrollmentRecords
          })
        }
      }
    }
    
    return NextResponse.json({
      application: updatedApplication,
      award,
      message: `Application ${validatedData.decision === "APPROVED" ? "approved" : "rejected"} successfully`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error making decision:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
