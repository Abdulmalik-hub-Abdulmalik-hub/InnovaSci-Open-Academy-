import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';

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

// GET /api/admin/newsletter - List all campaigns
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [campaigns, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterCampaign.count({ where })
    ])

    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      subject: campaign.subject,
      status: campaign.status,
      recipientType: campaign.recipientType,
      scheduledAt: campaign.scheduledAt?.toISOString() || null,
      sentAt: campaign.sentAt?.toISOString() || null,
      totalRecipients: campaign.totalRecipients,
      successfulSends: campaign.successfulSends,
      failedSends: campaign.failedSends,
      createdBy: campaign.createdBy,
      createdAt: campaign.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        campaigns: formattedCampaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error("Get campaigns error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : "UNKNOWN"
    return NextResponse.json(
      { success: false, error: `Failed to fetch campaigns: ${errorMessage}`, code: errorCode },
      { status: 500 }
    )
  }
}

// POST /api/admin/newsletter - Create a new campaign
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title,
      subject,
      content,
      status = "draft",
      recipientType = "all",
      recipientCourseId,
      scheduledAt,
    } = body

    // Validation
    const errors: string[] = []
    
    if (!title || title.trim().length < 2) {
      errors.push("Title is required (min 2 characters)")
    }
    
    if (!subject || subject.trim().length < 2) {
      errors.push("Subject is required (min 2 characters)")
    }
    
    if (!content || content.trim().length < 10) {
      errors.push("Content is required (min 10 characters)")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      )
    }

    // Validate scheduled date if provided
    let scheduledAtDate: Date | null = null
    if (scheduledAt) {
      scheduledAtDate = new Date(scheduledAt)
      if (scheduledAtDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: "Scheduled date must be in the future" },
          { status: 400 }
        )
      }
    }

    // Create campaign
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        title: title.trim(),
        subject: subject.trim(),
        content: content.trim(),
        status,
        recipientType,
        recipientCourseId: recipientCourseId || null,
        scheduledAt: scheduledAtDate,
        createdBy: auth.userId,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "NEWSLETTER",
          userId: auth.userId,
          details: {
            campaignId: campaign.id,
            title: campaign.title,
            subject: campaign.subject,
            status: campaign.status,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        title: campaign.title,
        subject: campaign.subject,
        status: campaign.status,
        recipientType: campaign.recipientType,
        scheduledAt: campaign.scheduledAt?.toISOString() || null,
        createdAt: campaign.createdAt.toISOString(),
      },
      message: "Campaign created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create campaign error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
      { status: 500 }
    )
  }
}