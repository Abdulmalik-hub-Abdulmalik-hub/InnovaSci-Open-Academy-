import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { z } from "zod"

// GET /api/admin/applications/[id] - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "applications:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const application = await prisma.scholarshipApplication.findUnique({
      where: { id: params.id },
      include: {
        scholarship: {
          include: {
            sponsor: true,
            domains: { include: { domain: true } },
            categories: { include: { category: true } },
          }
        },
        reviews: {
          include: {
            // reviewer info if internal
          }
        },
        statusHistory: {
          orderBy: { createdAt: "desc" }
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 20
        },
        award: true,
      }
    })
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/applications/[id] - Update application
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "applications:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const { status, interviewDate, interviewNotes, decisionNotes, ...updateData } = body
    
    const currentApplication = await prisma.scholarshipApplication.findUnique({
      where: { id: params.id }
    })
    
    if (!currentApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    // Handle status change
    if (status && status !== currentApplication.status) {
      // Create status history entry
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: params.id,
          previousStatus: currentApplication.status,
          newStatus: status,
          changedBy: session.user.id,
          changedByName: session.user.name || session.user.email,
          notes: decisionNotes
        }
      })
      
      // Create notification
      await prisma.applicationNotification.create({
        data: {
          applicationId: params.id,
          type: status,
          title: `Application ${status.replace("_", " ").toLowerCase()}`,
          message: `Your application status has been updated to ${status.replace("_", " ").toLowerCase()}.`,
          channel: "EMAIL"
        }
      })
    }
    
    const application = await prisma.scholarshipApplication.update({
      where: { id: params.id },
      data: {
        ...updateData,
        status: status || undefined,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
        interviewNotes: interviewNotes,
        decisionDate: status === "APPROVED" || status === "REJECTED" ? new Date() : undefined,
        decisionBy: (status === "APPROVED" || status === "REJECTED") ? session.user.id : undefined,
        decisionNotes: decisionNotes,
      },
      include: {
        scholarship: true,
        reviews: true,
        statusHistory: { orderBy: { createdAt: "desc" } }
      }
    })
    
    return NextResponse.json(application)
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
