import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// POST /api/admin/users/activate
// Activate a user account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: "Email is required"
      }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { email: email.trim() }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    // Update status to ACTIVE
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE" }
    })

    return NextResponse.json({
      success: true,
      message: `User ${email} activated successfully`,
      userId: user.id
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
