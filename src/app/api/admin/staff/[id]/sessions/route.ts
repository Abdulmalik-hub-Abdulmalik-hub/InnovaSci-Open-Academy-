import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"
import { v4 as uuidv4 } from "uuid"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/staff/[id]/sessions - Get staff sessions
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    const sessions = await prisma.staffSession.findMany({
      where: {
        staffProfileId: id,
        ...(activeOnly && { isActive: true })
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      data: sessions
    })
  } catch (error) {
    console.error("Get sessions error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}

// POST /api/admin/staff/[id]/sessions - Create new session (for testing) or terminate sessions
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_EDIT)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const { action, sessionId } = body

    // Verify staff exists
    const staff = await prisma.staffProfile.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      )
    }

    if (action === "terminate") {
      // Terminate specific session or all sessions
      if (sessionId) {
        // Terminate specific session
        const session = await prisma.staffSession.findUnique({
          where: { id: sessionId }
        })

        if (!session || session.staffProfileId !== id) {
          return NextResponse.json(
            { success: false, error: "Session not found" },
            { status: 404 }
          )
        }

        await prisma.staffSession.update({
          where: { id: sessionId },
          data: {
            isActive: false,
            terminatedAt: new Date(),
            terminatedBy: auth.user.id,
            terminationReason: "ADMIN_TERMINATED"
          }
        })

        // Create activity log
        await prisma.staffActivity.create({
          data: {
            staffProfileId: id,
            action: "SESSION_TERMINATED",
            category: "SECURITY",
            description: "Active session terminated by administrator",
            metadata: { sessionId, ipAddress: session.ipAddress },
            performedBy: auth.user.id,
            performedByName: auth.user.profile?.fullName || "System",
          }
        })

        return NextResponse.json({
          success: true,
          message: "Session terminated successfully"
        })
      } else {
        // Terminate all active sessions
        const result = await prisma.staffSession.updateMany({
          where: {
            staffProfileId: id,
            isActive: true
          },
          data: {
            isActive: false,
            terminatedAt: new Date(),
            terminatedBy: auth.user.id,
            terminationReason: "ADMIN_TERMINATED_ALL"
          }
        })

        // Create activity log
        await prisma.staffActivity.create({
          data: {
            staffProfileId: id,
            action: "ALL_SESSIONS_TERMINATED",
            category: "SECURITY",
            description: `All ${result.count} active sessions terminated by administrator`,
            performedBy: auth.user.id,
            performedByName: auth.user.profile?.fullName || "System",
          }
        })

        // Create notification
        await prisma.staffNotification.create({
          data: {
            staffProfileId: id,
            title: "Sessions Terminated",
            message: "All your active sessions have been terminated by an administrator. Please log in again if needed.",
            type: "SECURITY",
            priority: "HIGH",
          }
        })

        return NextResponse.json({
          success: true,
          message: `${result.count} sessions terminated successfully`
        })
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Session action error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to perform session action" },
      { status: 500 }
    )
  }
}
