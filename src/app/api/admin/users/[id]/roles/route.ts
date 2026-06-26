import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize, getAuthenticatedUser } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

// GET /api/admin/users/[id]/roles - Get user's roles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        currentRole: user.role,
        roles: user.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          displayName: ur.role.displayName,
          permissions: ur.role.permissions.map(p => p.name)
        }))
      }
    })
  } catch (error) {
    console.error("Get user roles error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch user roles" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id]/roles - Update user's role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(PERMISSIONS.USERS_MANAGE)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const { role, userRoles } = body

    // Prevent self-demotion
    if (id === auth.user.id && role && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "You cannot change your own role" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Update main role
    if (role) {
      await prisma.user.update({
        where: { id },
        data: { role }
      })
    }

    // Update role assignments if provided
    if (userRoles && Array.isArray(userRoles)) {
      // Remove existing roles
      await prisma.userRole.deleteMany({
        where: { userId: id }
      })

      // Add new roles
      for (const roleId of userRoles) {
        await prisma.userRole.create({
          data: {
            userId: id,
            roleId,
            assignedBy: auth.user.id
          }
        })
      }
    }

    // Audit log
    await createAuditLog({
      userId: auth.user.id,
      action: "UPDATE",
      module: "USERS",
      targetTable: "User",
      targetId: id,
      previousData: { role: user.role },
      newData: { role },
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "User roles updated successfully",
      data: {
        userId: updatedUser?.id,
        role: updatedUser?.role,
        roles: updatedUser?.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          displayName: ur.role.displayName
        }))
      }
    })
  } catch (error) {
    console.error("Update user roles error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update user roles" },
      { status: 500 }
    )
  }
}