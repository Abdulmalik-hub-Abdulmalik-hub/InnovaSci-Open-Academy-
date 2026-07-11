import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Simple in-memory cache
interface CacheEntry {
  data: unknown
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T
  }
  return null
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export const dynamic = "force-dynamic"

// Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return { authorized: true } // Demo mode
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        
        if (user && user.role === "ADMIN" && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id }
        }
      }
    }
    
    return { authorized: false, error: "Invalid or expired authentication token" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// GET /api/admin/analytics - Get analytics data
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30days"
    const forceRefresh = searchParams.get("refresh") === "true"

    // Check cache
    const cacheKey = `analytics_${period}`
    if (!forceRefresh) {
      const cached = getCached<unknown>(cacheKey)
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
        })
      }
    }

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
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      totalRevenue,
      usersOverTime,
      enrollmentsOverTime,
      revenueOverTime,
      coursesByCategory,
      coursesByDomain,
      topCourses,
      revenueByDay,
      newUsersThisMonth,
      newUsersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      completions,
      lessonViews,
      certificatesIssued,
      recentEnrollments,
      recentPayments,
      subscriptionStats,
      totalDomains,
      publishedDomains,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.course.count({ where: { status: "published" } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { completed: false } }),
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
        by: ["categoryId"],
        _count: true,
        where: { status: "published", categoryId: { not: null } },
        orderBy: { _count: { categoryId: "desc" } },
      }),
      // Courses grouped by domain (through category)
      prisma.domain.findMany({
        include: {
          _count: {
            select: {
              categories: {
                include: {
                  _count: {
                    select: { courses: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.course.findMany({
        take: 10,
        orderBy: { enrollments: { _count: "desc" } },
        include: { 
          _count: { select: { enrollments: true } },
          category: true
        },
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
      prisma.learningProgress.count({ where: { completedAt: { not: null } } }),
      prisma.userLectureProgress.count(),
      prisma.certificate.count(),
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: "desc" },
        include: {
          user: { 
            include: {
              profile: { select: { fullName: true } }
            }
          },
          course: { select: { id: true, title: true, thumbnailUrl: true } },
        }
      }),
      prisma.payment.findMany({
        where: { status: "COMPLETED" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { 
            include: {
              profile: { select: { fullName: true } }
            }
          },
        }
      }),
      prisma.subscription.groupBy({
        by: ["status"],
        _count: true,
      }),
      // Domain counts
      prisma.domain.count(),
      prisma.domain.count({ where: { status: "PUBLISHED" } }),
    ])

    // Process time series data
    const usersByDate = usersOverTime.reduce<Record<string, number>>((acc, item) => {
      const date = item.createdAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + (item._count as unknown as number)
      return acc
    }, {})

    const enrollmentsByDate = enrollmentsOverTime.reduce<Record<string, number>>((acc, item) => {
      const date = item.enrolledAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + (item._count as unknown as number)
      return acc
    }, {})

    const revenueByDate = revenueOverTime.reduce((acc: Record<string, number>, item: { createdAt: Date; amount: unknown }) => {
      const date = item.createdAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + Number(item.amount)
      return acc
    }, {})

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const revenueByDayOfWeek = Array(7).fill(0)
    
    revenueByDay.forEach((payment: { createdAt: Date; amount: unknown }) => {
      const dayIndex = payment.createdAt.getDay()
      revenueByDayOfWeek[dayIndex] += Number(payment.amount)
    })

    const userGrowthRate = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : "0"
    
    const revenueGrowthRate = Number(revenueLastMonth._sum.amount) > 0
      ? ((Number(revenueThisMonth._sum.amount) - Number(revenueLastMonth._sum.amount)) / Number(revenueLastMonth._sum.amount) * 100).toFixed(1)
      : "0"

    const completionRate = totalEnrollments > 0 
      ? Math.round((completions / totalEnrollments) * 100) 
      : 0

    const result = {
      overview: {
        totalUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        activeEnrollments,
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
        revenueThisMonth: Number(revenueThisMonth._sum.amount) || 0,
        revenueGrowthRate: parseFloat(revenueGrowthRate),
        newUsersThisMonth,
        userGrowthRate: parseFloat(userGrowthRate),
        completionRate,
        totalCompletions: completions,
        lessonViews,
        certificatesIssued,
        period,
        // Domain stats
        totalDomains,
        publishedDomains,
      },
      charts: {
        usersOverTime: Object.entries(usersByDate).map(([date, count]) => ({ date, count })),
        enrollmentsOverTime: Object.entries(enrollmentsByDate).map(([date, count]) => ({ date, count })),
        revenueOverTime: Object.entries(revenueByDate).map(([date, amount]) => ({ date, amount })),
        revenueByDayOfWeek: dayNames.map((day, index) => ({ day, amount: revenueByDayOfWeek[index] })),
      },
      categories: coursesByCategory.map((c) => ({ 
        categoryId: c.categoryId || "uncategorized", 
        count: c._count as unknown as number 
      })),
      domains: coursesByDomain.map((d: any) => {
        const courseCount = d._count.categories.reduce((acc: number, cat: any) => acc + cat._count.courses, 0)
        return {
          id: d.id,
          name: d.name,
          slug: d.slug,
          icon: d.icon,
          color: d.color,
          categoryCount: d._count.categories.length,
          courseCount,
        }
      }),
      topCourses: topCourses.map((c) => ({ 
        id: c.id, 
        title: c.title, 
        enrollments: c._count.enrollments 
      })),
      recentEnrollments: recentEnrollments.map((e) => ({
        id: e.id,
        user: { id: e.user.id, name: e.user.profile?.fullName, email: e.user.email },
        course: { id: e.course.id, title: e.course.title, thumbnailUrl: e.course.thumbnailUrl },
        enrolledAt: e.enrolledAt.toISOString(),
      })),
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        user: { id: p.user.id, name: p.user.profile?.fullName, email: p.user.email },
        createdAt: p.createdAt.toISOString(),
      })),
      subscriptions: {
        active: subscriptionStats.find((s) => s.status === "active")?._count as unknown as number || 0,
        cancelled: subscriptionStats.find((s) => s.status === "cancelled")?._count as unknown as number || 0,
        expired: subscriptionStats.find((s) => s.status === "expired")?._count as unknown as number || 0,
      },
    }

    // Cache the result
    setCache(cacheKey, result)

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
