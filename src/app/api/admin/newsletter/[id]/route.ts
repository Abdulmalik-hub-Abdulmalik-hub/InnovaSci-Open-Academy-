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

// GET /api/admin/newsletter/[id] - Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        title: campaign.title,
        subject: campaign.subject,
        content: campaign.content,
        status: campaign.status,
        recipientType: campaign.recipientType,
        recipientCourseId: campaign.recipientCourseId,
        scheduledAt: campaign.scheduledAt?.toISOString() || null,
        sentAt: campaign.sentAt?.toISOString() || null,
        totalRecipients: campaign.totalRecipients,
        successfulSends: campaign.successfulSends,
        failedSends: campaign.failedSends,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error("Get campaign error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaign" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/newsletter/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const {
      title,
      subject,
      content,
      status,
      recipientType,
      recipientCourseId,
      scheduledAt,
    } = body

    const existingCampaign = await prisma.newsletterCampaign.findUnique({
      where: { id }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Cannot edit a campaign that is already sent
    if (existingCampaign.status === "sent") {
      return NextResponse.json(
        { success: false, error: "Cannot edit a campaign that has already been sent" },
        { status: 400 }
      )
    }

    // Validate scheduled date if updating to scheduled
    let scheduledAtDate = existingCampaign.scheduledAt
    if (scheduledAt !== undefined) {
      if (scheduledAt) {
        scheduledAtDate = new Date(scheduledAt)
        if (scheduledAtDate <= new Date()) {
          return NextResponse.json(
            { success: false, error: "Scheduled date must be in the future" },
            { status: 400 }
          )
        }
      } else {
        scheduledAtDate = null
      }
    }

    const updatedCampaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existingCampaign.title,
        subject: subject !== undefined ? subject.trim() : existingCampaign.subject,
        content: content !== undefined ? content.trim() : existingCampaign.content,
        status: status !== undefined ? status : existingCampaign.status,
        recipientType: recipientType !== undefined ? recipientType : existingCampaign.recipientType,
        recipientCourseId: recipientCourseId !== undefined ? recipientCourseId : existingCampaign.recipientCourseId,
        scheduledAt: scheduledAtDate,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "NEWSLETTER",
          userId: auth.userId,
          details: {
            campaignId: id,
            title: updatedCampaign.title,
            changes: body,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCampaign.id,
        title: updatedCampaign.title,
        subject: updatedCampaign.subject,
        status: updatedCampaign.status,
        recipientType: updatedCampaign.recipientType,
        scheduledAt: updatedCampaign.scheduledAt?.toISOString() || null,
        updatedAt: updatedCampaign.updatedAt.toISOString(),
      },
      message: "Campaign updated successfully"
    })
  } catch (error) {
    console.error("Update campaign error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update campaign" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/newsletter/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Cannot delete a campaign that is currently sending
    if (campaign.status === "sending") {
      return NextResponse.json(
        { success: false, error: "Cannot delete a campaign that is currently sending" },
        { status: 400 }
      )
    }

    await prisma.newsletterCampaign.delete({
      where: { id }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "NEWSLETTER",
          userId: auth.userId,
          details: {
            campaignId: id,
            title: campaign.title,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully"
    })
  } catch (error) {
    console.error("Delete campaign error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete campaign" },
      { status: 500 }
    )
  }
}