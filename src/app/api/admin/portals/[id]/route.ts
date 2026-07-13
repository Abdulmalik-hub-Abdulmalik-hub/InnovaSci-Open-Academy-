import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/portals/[id] - Get portal details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params

    const portal = await prisma.portal.findUnique({
      where: { id },
      include: {
        defaultRole: true,
        staffAssignments: {
          where: { status: "ACTIVE" },
          include: {
            staffProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    status: true,
                    profile: {
                      select: { fullName: true, avatarUrl: true }
                    }
                  }
                }
              }
            },
            domain: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            course: { select: { id: true, title: true } },
          }
        },
        _count: {
          select: {
            staffAssignments: { where: { status: "ACTIVE" } }
          }
        }
      }
    })

    if (!portal) {
      return NextResponse.json(
        { success: false, error: "Portal not found" },
        { status: 404 }
      )
    }

    // Get portal statistics
    const stats = {
      totalAssignments: portal.staffAssignments.length,
      activeStaff: portal.staffAssignments.filter(a => 
        a.staffProfile?.user?.status === "ACTIVE"
      ).length,
      byStatus: {
        active: portal.staffAssignments.filter(a => a.status === "ACTIVE").length,
        inactive: portal.staffAssignments.filter(a => a.status === "INACTIVE").length,
        expired: portal.staffAssignments.filter(a => a.status === "EXPIRED").length,
      },
      byDomain: [...new Map(
        portal.staffAssignments
          .filter(a => a.domain)
          .map(a => [a.domain!.id, { id: a.domain!.id, name: a.domain!.name, count: 1 }])
      ).values()].map(d => {
        const count = portal.staffAssignments.filter(a => a.domain?.id === d.id).length
        return { ...d, count }
      }),
    }

    return NextResponse.json({
      success: true,
      data: {
        ...portal,
        stats,
      }
    })
  } catch (error) {
    console.error("Get portal error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch portal" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/portals/[id] - Update portal
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.ROLES_MANAGE)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const { displayName, description, icon, color, dashboardRoute, allowedPermissions, isActive, defaultRoleId } = body

    // Check if portal exists
    const existingPortal = await prisma.portal.findUnique({
      where: { id }
    })

    if (!existingPortal) {
      return NextResponse.json(
        { success: false, error: "Portal not found" },
        { status: 404 }
      )
    }

    // Prevent modifying system portals
    if (existingPortal.isSystem && body.name && body.name !== existingPortal.name) {
      return NextResponse.json(
        { success: false, error: "Cannot rename system portals" },
        { status: 400 }
      )
    }

    const portal = await prisma.portal.update({
      where: { id },
      data: {
        ...(displayName && { displayName }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(dashboardRoute !== undefined && { dashboardRoute }),
        ...(allowedPermissions !== undefined && { allowedPermissions }),
        ...(isActive !== undefined && { isActive }),
        ...(defaultRoleId !== undefined && { defaultRoleId }),
      }
    })

    await createAuditLog({
      userId: auth.user.id,
      action: "UPDATE",
      module: "PORTAL",
      targetId: id,
      newData: body,
    })

    return NextResponse.json({
      success: true,
      data: portal,
      message: "Portal updated successfully"
    })
  } catch (error) {
    console.error("Update portal error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update portal" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/portals/[id] - Delete portal
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.ROLES_MANAGE)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params

    const portal = await prisma.portal.findUnique({
      where: { id }
    })

    if (!portal) {
      return NextResponse.json(
        { success: false, error: "Portal not found" },
        { status: 404 }
      )
    }

    // Prevent deleting system portals
    if (portal.isSystem) {
      return NextResponse.json(
        { success: false, error: "System portals cannot be deleted" },
        { status: 400 }
      )
    }

    // Check if portal has active assignments
    const activeAssignments = await prisma.staffAssignment.count({
      where: {
        portalId: id,
        status: "ACTIVE"
      }
    })

    if (activeAssignments > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete portal with ${activeAssignments} active assignments` },
        { status: 400 }
      )
    }

    await prisma.portal.delete({
      where: { id }
    })

    await createAuditLog({
      userId: auth.user.id,
      action: "DELETE",
      module: "PORTAL",
      targetId: id,
    })

    return NextResponse.json({
      success: true,
      message: "Portal deleted successfully"
    })
  } catch (error) {
    console.error("Delete portal error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete portal" },
      { status: 500 }
    )
  }
}
