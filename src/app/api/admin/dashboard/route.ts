import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET() {
  try {
    let stats = {
      totalUsers: 0,
      activeUsers: 0,
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      totalEnrollments: 0,
      completedEnrollments: 0,
      totalRevenue: 0
    }

    try {
      const [userCount, activeCount, courseCount, pubCourses, draftCount, enrollCount, completedCount, revenueAgg] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.course.count(),
        prisma.course.count({ where: { status: "published" } }),
        prisma.course.count({ where: { status: "draft" } }),
        prisma.enrollment.count(),
        prisma.enrollment.count({ where: { completed: true } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
      ])

      stats = {
        totalUsers: userCount,
        activeUsers: activeCount,
        totalCourses: courseCount,
        publishedCourses: pubCourses,
        draftCourses: draftCount,
        totalEnrollments: enrollCount,
        completedEnrollments: completedCount,
        totalRevenue: Number(revenueAgg._sum?.amount) || 0
      }
    } catch (e) {
      console.log("Database queries failed, returning default stats")
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivity: [],
        topCourses: []
      }
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard" },
      { status: 500 }
    )
  }
}
