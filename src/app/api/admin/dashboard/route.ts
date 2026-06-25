import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET() {
  try {
    // Parallel queries for better performance
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      completedEnrollments,
      totalRevenue,
      recentEnrollments,
      recentPayments,
      topCourses,
    ] = await Promise.all([
      // User counts
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      
      // Course counts
      prisma.course.count(),
      prisma.course.count({ where: { status: "published" } }),
      prisma.course.count({ where: { status: "draft" } }),
      
      // Enrollment counts
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { completed: true } }),
      
      // Revenue (sum of completed payments)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      
      // Recent enrollments (last 10)
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true }
              }
            }
          },
          course: {
            select: { id: true, title: true }
          }
        }
      }),
      
      // Recent payments (last 10)
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: { status: "COMPLETED" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true }
              }
            }
          }
        }
      }),
      
      // Top courses by enrollment
      prisma.course.findMany({
        take: 5,
        include: {
          _count: {
            select: { enrollments: true }
          },
          enrollments: {
            where: { completed: true },
            select: { id: true }
          }
        }
      }),
    ])

    // Calculate completion rate
    const completionRate = totalEnrollments > 0 
      ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
      : "0.0"

    // Process top courses
    const processedTopCourses = topCourses
      .map(course => ({
        id: course.id,
        title: course.title,
        students: course._count.enrollments,
        completed: course.enrollments.length,
        status: course.status,
        thumbnailUrl: course.thumbnailUrl,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 5)

    // Process recent activity
    const recentActivity = [
      ...recentEnrollments.map(e => ({
        id: e.id,
        type: "enrollment" as const,
        userName: e.user.profile?.fullName || e.user.email,
        userEmail: e.user.email,
        action: "enrolled in",
        target: e.course.title,
        timestamp: e.enrolledAt.toISOString(),
      })),
      ...recentPayments.map(p => ({
        id: p.id,
        type: "payment" as const,
        userName: p.user.profile?.fullName || p.user.email,
        userEmail: p.user.email,
        action: "paid",
        amount: Number(p.amount),
        timestamp: p.createdAt.toISOString(),
      })),
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

    // Calculate revenue
    const revenue = Number(totalRevenue._sum.amount) || 0

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalCourses,
          publishedCourses,
          draftCourses,
          totalEnrollments,
          completedEnrollments,
          completionRate: parseFloat(completionRate),
          totalRevenue: revenue,
          formattedRevenue: `$${revenue.toLocaleString()}`,
        },
        recentActivity,
        topCourses: processedTopCourses,
      }
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
