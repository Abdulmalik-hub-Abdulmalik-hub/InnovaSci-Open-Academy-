import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"
import { sendTicketReplyNotification, sendTicketStatusNotification, sendTicketCreatedNotification } from "@/lib/email"

// GET /api/admin/tickets - Get all tickets
export async function GET(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.SUPPORT_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
    const skip = (page - 1) * limit

    // Filters
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const category = searchParams.get("category")
    const assignedTo = searchParams.get("assignedTo")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc"

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category
    if (assignedTo) where.assignedTo = assignedTo

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { labels: { contains: search, mode: "insensitive" } },
      ]
    }

    // Build orderBy
    const orderBy: Record<string, string> = {}
    if (sortBy === "priority") {
      // Custom priority ordering
      orderBy.priority = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Fetch tickets with counts
    const [tickets, total, statusCounts, priorityCounts] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true } }
            }
          },
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.supportTicket.groupBy({
        by: ["priority"],
        _count: true,
      }),
    ])

    // Get available assignees
    const assignees = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN", "SUPPORT_STAFF"] },
        status: "ACTIVE"
      },
      select: { id: true, email: true, profile: { select: { fullName: true } } },
    })

    return NextResponse.json({
      success: true,
      data: {
        tickets: tickets.map(ticket => ({
          id: ticket.id,
          userId: ticket.userId,
          email: ticket.email,
          category: ticket.category,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          priority: ticket.priority,
          assignedTo: ticket.assignedTo,
          labels: ticket.labels,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          resolvedAt: ticket.resolvedAt,
          userName: ticket.user?.profile?.fullName || "Guest",
          userEmail: ticket.user?.email || ticket.email,
          userAvatar: ticket.user?.profile?.avatarUrl,
          commentCount: ticket._count.comments,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          byStatus: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
          byPriority: priorityCounts.reduce((acc, p) => ({ ...acc, [p.priority]: p._count }), {}),
        },
        assignees: assignees.map(a => ({
          id: a.id,
          email: a.email,
          name: a.profile?.fullName || a.email,
        })),
      }
    })
  } catch (error) {
    console.error("Get tickets error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch tickets" },
      { status: 500 }
    )
  }
}

// POST /api/admin/tickets - Create a new ticket (from admin or public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, subject, message, category, priority, userId, labels } = body

    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: "Email and message are required" },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        email,
        subject: subject || "No Subject",
        message,
        category: category || "other",
        priority: priority || "medium",
        userId: userId || null,
        labels: labels || null,
        status: "open",
      },
      include: {
        user: {
          select: { profile: { select: { fullName: true } } }
        }
      }
    })

    // Send confirmation email
    await sendTicketCreatedNotification({
      ticketId: ticket.id,
      subject: ticket.subject || "Support Request",
      customerEmail: ticket.email,
      customerName: ticket.user?.profile?.fullName || undefined,
      message: ticket.message,
    })

    return NextResponse.json({
      success: true,
      data: ticket
    })
  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create ticket" },
      { status: 500 }
    )
  }
}