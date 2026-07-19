import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET() {
  const endpoint = "/api/admin/dashboard"
  const method = "GET"
  
  try {
    // Check database connection first
    if (!process.env.DATABASE_URL) {
      console.error(`[${endpoint}] DATABASE_URL not configured`)
      return NextResponse.json(
        { 
          success: false, 
          error: "Database configuration missing",
          code: "DATABASE_NOT_READY"
        },
        { status: 503 }
      )
    }

    let stats = {
      totalUsers: 0,
      activeUsers: 0,
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      totalEnrollments: 0,
      completedEnrollments: 0,
      totalRevenue: 0,
      // Scholarship stats
      totalScholarships: 0,
      activeScholarships: 0,
      totalApplications: 0,
      pendingApplications: 0,
      totalAwards: 0,
      activeAwards: 0,
    }

    try {
      const [
        userCount, 
        activeCount, 
        courseCount, 
        pubCourses, 
        draftCount, 
        enrollCount, 
        completedCount, 
        revenueAgg,
        scholarshipCount,
        activeScholarshipCount,
        applicationCount,
        pendingAppCount,
        awardCount,
        activeAwardCount,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.course.count(),
        prisma.course.count({ where: { status: "published" } }),
        prisma.course.count({ where: { status: "draft" } }),
        prisma.enrollment.count(),
        prisma.enrollment.count({ where: { completed: true } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
        // Scholarship stats
        prisma.scholarship.count(),
        prisma.scholarship.count({ where: { status: "PUBLISHED" } }),
        prisma.scholarshipApplication.count(),
        prisma.scholarshipApplication.count({ 
          where: { 
            status: { in: ["SUBMITTED", "UNDER_REVIEW", "INTERVIEW"] } 
          } 
        }),
        prisma.scholarshipAward.count(),
        prisma.scholarshipAward.count({ where: { status: "ACCEPTED" } }),
      ])

      stats = {
        totalUsers: userCount,
        activeUsers: activeCount,
        totalCourses: courseCount,
        publishedCourses: pubCourses,
        draftCourses: draftCount,
        totalEnrollments: enrollCount,
        completedEnrollments: completedCount,
        totalRevenue: Number(revenueAgg._sum?.amount) || 0,
        // Scholarship stats
        totalScholarships: scholarshipCount,
        activeScholarships: activeScholarshipCount,
        totalApplications: applicationCount,
        pendingApplications: pendingAppCount,
        totalAwards: awardCount,
        activeAwards: activeAwardCount,
      }
    } catch (dbError) {
      // Database query failed, but we can still return default stats
      console.error(`[${endpoint}] Database query failed:`, dbError)
      // Return with default stats, but indicate partial failure
      return NextResponse.json({
        success: true,
        data: {
          stats,
          recentActivity: [],
          topCourses: []
        },
        warning: "Some statistics may not be up to date due to database issues"
      })
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
    console.error(`[${endpoint}] [${method}] Unexpected error:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch dashboard data",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}
