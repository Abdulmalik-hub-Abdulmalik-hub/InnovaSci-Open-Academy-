import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/users - List all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }).catch(() => [])

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.profile?.fullName || "N/A",
      createdAt: user.createdAt,
      enrollments: user._count.enrollments,
      certificates: user._count.certificates
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      total: formattedUsers.length
    })
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json({
      success: false,
      error: "Database not ready",
      data: [],
      total: 0
    })
  }
}
