import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/tickets - Get user's support tickets
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = { userId }
    if (status && status !== "all") {
      where.status = status
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      data: { tickets }
    })
  } catch (error) {
    console.error("Tickets API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch tickets" },
      { status: 500 }
    )
  }
}

// POST /api/student/tickets - Create a new support ticket
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user-id"
    const body = await request.json()
    const { category, subject, message, courseId, priority } = body

    if (!category || !message) {
      return NextResponse.json(
        { success: false, error: "Category and message are required" },
        { status: 400 }
      )
    }

    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        email: user.email,
        category,
        subject,
        message,
        priority: priority || "medium",
        status: "open"
      }
    })

    return NextResponse.json({
      success: true,
      data: { ticket }
    })
  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create ticket" },
      { status: 500 }
    )
  }
}
