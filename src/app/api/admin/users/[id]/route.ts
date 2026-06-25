import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

    // Update user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
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
