import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize, getAuthenticatedUser } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"
import { sendTicketReplyNotification, sendTicketStatusNotification } from "@/lib/email"

// Admin authentication helper with demo mode
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; user?: any; error?: string }> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return { authorized: true, userId: "demo-user" } // Demo mode
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, role: true, status: true }
        })
        
        if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "SUPPORT_STAFF") && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id, user }
        }
      }
    }
    
    return { authorized: false, error: "Invalid or expired authentication token" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// GET /api/admin/tickets/[id] - Get single ticket with comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error || "Authentication required" },
      { status: 401 }
    )
  }

  try {
    const { id } = await params

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                profile: { select: { fullName: true, avatarUrl: true } }
              }
            }
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      )
    }

    // Separate internal and external comments
    const externalComments = ticket.comments.filter(c => !c.isInternal)
    const internalComments = ticket.comments.filter(c => c.isInternal)

    return NextResponse.json({
      success: true,
      data: {
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
        user: ticket.user ? {
          id: ticket.user.id,
          email: ticket.user.email,
          name: ticket.user.profile?.fullName || "Guest",
          avatar: ticket.user.profile?.avatarUrl,
        } : null,
        comments: {
          external: externalComments.map(c => ({
            id: c.id,
            message: c.message,
            isInternal: c.isInternal,
            createdAt: c.createdAt,
            user: c.user ? {
              id: c.user.id,
              email: c.user.email,
              name: c.user.profile?.fullName || "Support",
              avatar: c.user.profile?.avatarUrl,
              isAdmin: c.user.role !== "STUDENT",
            } : {
              id: null,
              email: ticket.email,
              name: "Customer",
              avatar: null,
              isAdmin: false,
            }
          })),
          internal: internalComments.map(c => ({
            id: c.id,
            message: c.message,
            isInternal: c.isInternal,
            createdAt: c.createdAt,
            user: c.user ? {
              id: c.user.id,
              email: c.user.email,
              name: c.user.profile?.fullName || "Support",
              avatar: c.user.profile?.avatarUrl,
              isAdmin: c.user.role !== "STUDENT",
            } : null
          })),
        },
        totalComments: ticket.comments.length,
      }
    })
  } catch (error) {
    console.error("Get ticket error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch ticket" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/tickets/[id] - Update ticket status, assign, add comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error || "Authentication required" },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { 
      status, 
      priority, 
      assignedTo, 
      labels,
      message,
      isInternal 
    } = body

    const ticket = await prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = {}
    const previousData: Record<string, unknown> = {}

    // Update status
    if (status) {
      previousData.status = ticket.status
      updates.status = status
      if (status === "resolved" || status === "closed") {
        updates.resolvedAt = new Date()
      } else {
        updates.resolvedAt = null
      }
    }

    // Update priority
    if (priority) {
      previousData.priority = ticket.priority
      updates.priority = priority
    }

    // Update assignment
    if (assignedTo !== undefined) {
      previousData.assignedTo = ticket.assignedTo
      updates.assignedTo = assignedTo
    }

    // Update labels
    if (labels !== undefined) {
      previousData.labels = ticket.labels
      updates.labels = labels
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await prisma.supportTicket.update({
        where: { id },
        data: updates
      })
    }

    // Add comment if provided
    let newComment = null
    if (message) {
      newComment = await prisma.ticketComment.create({
        data: {
          ticketId: id,
          userId: auth.userId,
          message,
          isInternal: isInternal || false,
        },
        include: {
          user: {
            select: {
              email: true,
              role: true,
              profile: { select: { fullName: true, avatarUrl: true } }
            }
          }
        }
      })
    }

    // Send notifications
    if (status && status !== ticket.status) {
      await sendTicketStatusNotification({
        ticketId: ticket.id,
        subject: ticket.subject || "Support Request",
        customerEmail: ticket.email,
        message: `Your ticket status has been updated to: ${status.replace("_", " ")}`,
        status,
      })
    }

    // Send reply notification if external comment added
    if (newComment && !newComment.isInternal) {
      await sendTicketReplyNotification({
        ticketId: ticket.id,
        subject: ticket.subject || "Support Request",
        customerEmail: ticket.email,
        message: newComment.message,
      })
    }

    // Audit log
    await createAuditLog({
      userId: auth.userId,
      action: status ? "UPDATE" : "INSERT",
      module: "SUPPORT",
      targetTable: "SupportTicket",
      targetId: id,
      previousData: Object.keys(previousData).length > 0 ? previousData : undefined,
      newData: { status, priority, assignedTo, labels, message, isInternal },
      details: { ticketSubject: ticket.subject },
    })

    // Fetch updated ticket
    const updatedTicket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { fullName: true } }
          }
        },
        _count: { select: { comments: true } }
      }
    })

    return NextResponse.json({
      success: true,
      message: newComment ? "Reply sent and ticket updated" : "Ticket updated",
      data: {
        ticket: updatedTicket,
        comment: newComment,
      }
    })
  } catch (error) {
    console.error("Update ticket error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update ticket" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tickets/[id] - Delete a ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error || "Authentication required" },
      { status: 401 }
    )
  }

  try {
    const { id } = await params

    const ticket = await prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      )
    }

    await prisma.supportTicket.delete({ where: { id } })

    await createAuditLog({
      userId: auth.userId,
      action: "DELETE",
      module: "SUPPORT",
      targetTable: "SupportTicket",
      targetId: id,
      previousData: {
        subject: ticket.subject,
        email: ticket.email,
        status: ticket.status,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully"
    })
  } catch (error) {
    console.error("Delete ticket error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete ticket" },
      { status: 500 }
    )
  }
}