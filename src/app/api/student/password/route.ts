import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/supabase"
import { hash } from "bcryptjs"

// PUT /api/student/password - Update password
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All password fields are required" },
        { status: 400 }
      )
    }

    // Validate password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New passwords do not match" },
        { status: 400 }
      )
    }
    
    // Get user to check password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // If user has a password hash, verify current password
    if (user.passwordHash) {
      const { compare } = await import("bcryptjs")
      const isValid = await compare(currentPassword, user.passwordHash)
      
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 401 }
        )
      }
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    })
  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update password" },
      { status: 500 }
    )
  }
}