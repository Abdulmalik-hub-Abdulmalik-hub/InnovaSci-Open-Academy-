import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// System Admin IDs that cannot be deleted or demoted
const SYSTEM_ADMIN_IDS = [
  "d2b7ac6d-0e84-4be7-89bd-4f93b15a2b51",
  // Add more system admin IDs as needed
]

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            payments: true,
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
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        profile: user.profile,
        isSystemAdmin: SYSTEM_ADMIN_IDS.includes(user.id),
        stats: {
          enrollments: user._count.enrollments,
          certificates: user._count.certificates,
          payments: user._count.payments,
        }
      }
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email, role, status, fullName, username, phone, country, bio } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent modification of system admin role
    if (SYSTEM_ADMIN_IDS.includes(id) && role && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Cannot change the role of a system administrator" },
        { status: 403 }
      )
    }

    // Prevent deactivating system admin
    if (SYSTEM_ADMIN_IDS.includes(id) && status && status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Cannot deactivate a system administrator" },
        { status: 403 }
      )
    }

    // Validate role
    if (role && !["ADMIN", "STUDENT"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be ADMIN or STUDENT" },
        { status: 400 }
      )
    }

    // Validate status
    if (status && !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    // Update user and profile in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          email: email || existingUser.email,
          role: role || existingUser.role,
          status: status?.toUpperCase() || existingUser.status,
        }
      })

      // Update profile if provided
      let updatedProfile = null
      if (fullName !== undefined || username !== undefined || phone !== undefined || country !== undefined || bio !== undefined) {
        updatedProfile = await tx.profile.update({
          where: { userId: id },
          data: {
            fullName: fullName !== undefined ? fullName : undefined,
            username: username !== undefined ? username : undefined,
            phone: phone !== undefined ? phone : undefined,
            country: country !== undefined ? country : undefined,
            bio: bio !== undefined ? bio : undefined,
          }
        })
      }

      return { updatedUser, updatedProfile }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: result.updatedUser.id,
          email: result.updatedUser.email,
          role: result.updatedUser.role,
          status: result.updatedUser.status,
          createdAt: result.updatedUser.createdAt.toISOString(),
          updatedAt: result.updatedUser.updatedAt.toISOString(),
        },
        profile: result.updatedProfile
      },
      message: "User updated successfully"
    })

  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent deletion of system admin
    if (SYSTEM_ADMIN_IDS.includes(id)) {
      return NextResponse.json(
        { success: false, error: "Cannot delete a system administrator" },
        { status: 403 }
      )
    }

    // Check if this is the last admin
    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" }
      })
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Cannot delete the last system administrator" },
          { status: 400 }
        )
      }
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
