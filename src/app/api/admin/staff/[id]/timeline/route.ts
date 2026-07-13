import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/staff/[id]/timeline - Get staff activity timeline
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit
    
    // Filters
    const category = searchParams.get("category")
    const action = searchParams.get("action")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Build where clause
    const where: any = { staffProfileId: id }
    
    if (category) {
      where.category = category
    }
    
    if (action) {
      where.action = action
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      }
    }

    const [activities, total] = await Promise.all([
      prisma.staffActivity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.staffActivity.count({ where })
    ])

    // Get activity statistics
    const stats = await prisma.staffActivity.groupBy({
      by: ["action"],
      where: { staffProfileId: id },
      _count: { action: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        activities,
        stats: stats.map(s => ({
          action: s.action,
          count: s._count.action
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      }
    })
  } catch (error) {
    console.error("Get timeline error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch timeline" },
      { status: 500 }
    )
  }
}
