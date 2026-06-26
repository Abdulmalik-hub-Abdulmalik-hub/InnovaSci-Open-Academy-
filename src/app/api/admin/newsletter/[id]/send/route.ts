import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { wrapInEmailTemplate, addUnsubscribeFooter, sendBatchEmails } from "@/lib/email"

// Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return { authorized: true } // Demo mode
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        
        if (user && user.role === "ADMIN" && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id }
        }
      }
    }
    
    return { authorized: false, error: "Invalid or expired authentication token" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// POST /api/admin/newsletter/[id]/send - Send campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    // Get campaign
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Check if campaign can be sent
    if (campaign.status === "sent") {
      return NextResponse.json(
        { success: false, error: "Campaign has already been sent" },
        { status: 400 }
      )
    }

    if (campaign.status === "sending") {
      return NextResponse.json(
        { success: false, error: "Campaign is already being sent" },
        { status: 400 }
      )
    }

    // Get recipients based on recipient type
    let recipients: { email: string; name?: string }[] = []

    switch (campaign.recipientType) {
      case "subscribers":
        // Get newsletter subscribers
        const subscribers = await prisma.newsletterSubscriber.findMany({
          where: { isActive: true },
          select: { email: true }
        })
        recipients = subscribers.map(s => ({ email: s.email }))
        break

      case "enrolled":
        // Get users with active subscriptions
        const enrolledUsers = await prisma.user.findMany({
          where: {
            status: "ACTIVE",
            subscriptions: {
              some: {
                status: "active"
              }
            }
          },
          select: { email: true }
        })
        recipients = enrolledUsers.map(u => ({ email: u.email }))
        break

      case "course_specific":
        // Get users enrolled in specific course
        if (campaign.recipientCourseId) {
          const courseEnrollments = await prisma.enrollment.findMany({
            where: { courseId: campaign.recipientCourseId },
            include: { user: { select: { email: true } } }
          })
          recipients = courseEnrollments.map(e => ({ email: e.user.email }))
        }
        break

      case "all":
      default:
        // Get all active users
        const allUsers = await prisma.user.findMany({
          where: { status: "ACTIVE" },
          select: { email: true }
        })
        recipients = allUsers.map(u => ({ email: u.email }))
        break
    }

    // Filter out unsubscribed users
    const unsubscribedEmails = new Set(
      (await prisma.newsletterSubscriber.findMany({
        where: { isActive: false },
        select: { email: true }
      })).map(s => s.email.toLowerCase())
    )

    recipients = recipients.filter(r => !unsubscribedEmails.has(r.email.toLowerCase()))

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "No recipients found" },
        { status: 400 }
      )
    }

    // Update campaign status to sending
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: "sending",
        totalRecipients: recipients.length,
      }
    })

    // Prepare email content
    const emailHtml = wrapInEmailTemplate(campaign.content)

    // Send emails in background (in production, this would be a job queue)
    // For now, we send synchronously but limit batch size
    const batchSize = 100
    let successfulSends = 0
    let failedSends = 0

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      
      try {
        const result = await sendBatchEmails(
          batch,
          campaign.subject,
          emailHtml
        )
        
        successfulSends += result.successful.length
        failedSends += result.failed.length

        // Update progress in database
        await prisma.newsletterCampaign.update({
          where: { id },
          data: {
            successfulSends,
            failedSends,
          }
        })
      } catch (error) {
        console.error("Batch send error:", error)
        failedSends += batch.length
      }
    }

    // Mark campaign as sent
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: failedSends === recipients.length ? "failed" : "sent",
        sentAt: new Date(),
        successfulSends,
        failedSends,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "SEND",
          module: "NEWSLETTER",
          userId: auth.userId,
          details: {
            campaignId: id,
            title: campaign.title,
            totalRecipients: recipients.length,
            successfulSends,
            failedSends,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRecipients: recipients.length,
        successfulSends,
        failedSends,
      },
      message: `Campaign sent to ${successfulSends} recipients`
    })

  } catch (error) {
    console.error("Send campaign error:", error)
    
    // Mark campaign as failed
    await prisma.newsletterCampaign.update({
      where: { id: (await params).id },
      data: { status: "failed" }
    }).catch(() => {})

    return NextResponse.json(
      { success: false, error: "Failed to send campaign" },
      { status: 500 }
    )
  }
}