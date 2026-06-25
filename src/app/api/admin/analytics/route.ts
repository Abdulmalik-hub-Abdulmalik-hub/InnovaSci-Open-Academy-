import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30days"

    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case "7days":
        startDate.setDate(now.getDate() - 7)
        break
      case "30days":
        startDate.setDate(now.getDate() - 30)
        break
      case "90days":
        startDate.setDate(now.getDate() - 90)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      usersOverTime,
      enrollmentsOverTime,
      revenueOverTime,
      coursesByCategory,
      topCourses,
      revenueByDay,
      newUsersThisMonth,
      newUsersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: "published" } }),
      prisma.enrollment.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      prisma.user.groupBy({
        by: ["createdAt"],
        _count: true,
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.enrollment.groupBy({
        by: ["enrolledAt"],
        _count: true,
        where: { enrolledAt: { gte: startDate } },
        orderBy: { enrolledAt: "asc" },
      }),
      prisma.payment.findMany({
        select: { amount: true, createdAt: true },
        where: { status: "COMPLETED", createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.course.groupBy({
        by: ["category"],
        _count: true,
        where: { status: "published", category: { not: null } },
        orderBy: { _count: { category: "desc" } },
      }),
      prisma.course.findMany({
        take: 10,
        orderBy: { enrollments: { _count: "desc" } },
        include: { _count: { select: { enrollments: true } } },
        where: { status: "published" }
      }),
      prisma.payment.findMany({
        select: { amount: true, createdAt: true },
        where: { status: "COMPLETED", createdAt: { gte: startDate } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED", createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        }
      }),
    ])

    const usersByDate = usersOverTime.reduce((acc: Record<string, number>, item) => {
      const date = item.createdAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + item._count
      return acc
    }, {})

    const enrollmentsByDate = enrollmentsOverTime.reduce((acc: Record<string, number>, item) => {
      const date = item.enrolledAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + item._count
      return acc
    }, {})

    const revenueByDate = revenueOverTime.reduce((acc: Record<string, number>, item) => {
      const date = item.createdAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + Number(item.amount)
      return acc
    }, {})

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const revenueByDayOfWeek = Array(7).fill(0)
    
    revenueByDay.forEach(payment => {
      const dayIndex = payment.createdAt.getDay()
      revenueByDayOfWeek[dayIndex] += Number(payment.amount)
    })

    const userGrowthRate = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : "0"
    
    const revenueGrowthRate = Number(revenueLastMonth._sum.amount) > 0
      ? ((Number(revenueThisMonth._sum.amount) - Number(revenueLastMonth._sum.amount)) / Number(revenueLastMonth._sum.amount) * 100).toFixed(1)
      : "0"

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          totalRevenue: Number(totalRevenue._sum.amount) || 0,
          revenueThisMonth: Number(revenueThisMonth._sum.amount) || 0,
          revenueGrowthRate: parseFloat(revenueGrowthRate),
          newUsersThisMonth,
          userGrowthRate: parseFloat(userGrowthRate),
        },
        charts: {
          usersOverTime: Object.entries(usersByDate).map(([date, count]) => ({ date, count })),
          enrollmentsOverTime: Object.entries(enrollmentsByDate).map(([date, count]) => ({ date, count })),
          revenueOverTime: Object.entries(revenueByDate).map(([date, amount]) => ({ date, amount })),
          revenueByDayOfWeek: dayNames.map((day, index) => ({ day, amount: revenueByDayOfWeek[index] })),
        },
        categories: coursesByCategory.map(c => ({ category: c.category, count: c._count })),
        topCourses: topCourses.map(c => ({ id: c.id, title: c.title, enrollments: c._count.enrollments })),
      }
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
