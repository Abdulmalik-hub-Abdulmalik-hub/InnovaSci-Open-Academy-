import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

        if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "ACTIVE") {
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

// GET /api/admin/scholarships/analytics - Get scholarship analytics
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/scholarships/analytics"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing"
    }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const scholarshipId = searchParams.get("scholarshipId")
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (period) {
      case "7d": startDate.setDate(now.getDate() - 7); break;
      case "30d": startDate.setDate(now.getDate() - 30); break;
      case "90d": startDate.setDate(now.getDate() - 90); break;
      case "1y": startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate.setDate(now.getDate() - 30);
    }

    const whereClause: any = {
      createdAt: { gte: startDate }
    }
    if (scholarshipId) whereClause.scholarshipId = scholarshipId

    // Get scholarship stats
    const [
      totalScholarships,
      activeScholarships,
      draftScholarships,
      closedScholarships,
    ] = await Promise.all([
      prisma.scholarship.count(),
      prisma.scholarship.count({ where: { status: "PUBLISHED", applicationStatus: "OPEN" } }),
      prisma.scholarship.count({ where: { status: "DRAFT" } }),
      prisma.scholarship.count({ where: { status: "CLOSED" } }),
    ])

    // Get application stats
    const applicationStats = await prisma.scholarshipApplication.groupBy({
      by: ['status'],
      _count: true,
      where: scholarshipId ? { scholarshipId } : undefined,
    })

    // Calculate totals
    const statusCounts = applicationStats.reduce((acc, curr) => {
      acc[curr.status] = curr._count
      return acc
    }, {} as Record<string, number>)

    const totalApplications = Object.values(statusCounts).reduce((a, b) => a + b, 0)

    // Get scholarship-wise stats
    const scholarshipStats = await prisma.scholarship.findMany({
      where: scholarshipId ? { id: scholarshipId } : { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        applicationCount: true,
        viewCount: true,
        totalBudget: true,
        usedBudget: true,
        availableSlots: true,
      },
      orderBy: { applicationCount: 'desc' },
      take: 10,
    })

    // Get daily application trend - use raw SQL for date truncation
    const dailyTrendRaw = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as count
      FROM "ScholarshipApplication"
      WHERE "createdAt" >= ${startDate}
      ${scholarshipId ? Prisma.sql`AND "scholarshipId" = ${scholarshipId}` : Prisma.empty}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `

    const dailyTrend = dailyTrendRaw.map(d => ({
      createdAt: d.date,
      _count: Number(d.count)
    }))

    // Get applications by country
    const countryStats = await prisma.scholarshipApplication.groupBy({
      by: ['country'],
      _count: true,
      where: scholarshipId ? { scholarshipId } : undefined,
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    })

    // Get applications by gender
    const genderStats = await prisma.scholarshipApplication.groupBy({
      by: ['gender'],
      _count: true,
      where: scholarshipId ? { scholarshipId } : undefined,
    })

    // Get sponsor stats
    const sponsorStats = await prisma.scholarshipSponsor.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        totalBudget: true,
        usedBudget: true,
        sponsoredStudents: true,
        activeScholarships: true,
      },
      orderBy: { sponsoredStudents: 'desc' },
      take: 5,
    })

    // Get recent applications
    const recentApplications = await prisma.scholarshipApplication.findMany({
      where: scholarshipId ? { scholarshipId } : undefined,
      select: {
        id: true,
        applicationNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        status: true,
        createdAt: true,
        scholarship: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Calculate budget stats
    const totalBudgetResult = await prisma.scholarship.aggregate({
      where: { status: "PUBLISHED" },
      _sum: { totalBudget: true, usedBudget: true }
    })

    const totalBudget = totalBudgetResult._sum.totalBudget ? Number(totalBudgetResult._sum.totalBudget) : 0
    const usedBudget = totalBudgetResult._sum.usedBudget ? Number(totalBudgetResult._sum.usedBudget) : 0

    // Format daily trend for charting
    const formattedDailyTrend = dailyTrend.map(d => ({
      date: d.createdAt.toISOString().split('T')[0],
      count: d._count,
    }))

    // Calculate conversion rates
    const approvalRate = totalApplications > 0 
      ? Math.round((statusCounts['APPROVED'] || 0) / totalApplications * 100) 
      : 0
    const completionRate = totalApplications > 0 
      ? Math.round(((statusCounts['APPROVED'] || 0) + (statusCounts['REJECTED'] || 0)) / totalApplications * 100) 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalScholarships,
          activeScholarships,
          draftScholarships,
          closedScholarships,
          totalApplications,
          pendingApplications: statusCounts['SUBMITTED'] || 0,
          underReviewApplications: statusCounts['UNDER_REVIEW'] || 0,
          interviewApplications: statusCounts['INTERVIEW'] || 0,
          approvedApplications: statusCounts['APPROVED'] || 0,
          rejectedApplications: statusCounts['REJECTED'] || 0,
          awardedApplications: statusCounts['AWARDED'] || 0,
          enrolledApplications: statusCounts['ENROLLED'] || 0,
        },
        budget: {
          totalBudget,
          usedBudget,
          remainingBudget: totalBudget - usedBudget,
          utilizationRate: totalBudget > 0 ? Math.round(usedBudget / totalBudget * 100) : 0,
        },
        conversion: {
          approvalRate,
          completionRate,
          interviewRate: totalApplications > 0 
            ? Math.round((statusCounts['INTERVIEW'] || 0) / totalApplications * 100) 
            : 0,
        },
        topScholarships: scholarshipStats.map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          applications: s.applicationCount,
          views: s.viewCount,
          conversionRate: s.viewCount > 0 ? Math.round(s.applicationCount / s.viewCount * 100) : 0,
          budget: s.totalBudget ? Number(s.totalBudget) : null,
          usedBudget: s.usedBudget ? Number(s.usedBudget) : null,
          slots: s.availableSlots,
        })),
        topSponsors: sponsorStats.map(s => ({
          id: s.id,
          name: s.name,
          logoUrl: s.logoUrl,
          totalBudget: s.totalBudget ? Number(s.totalBudget) : null,
          usedBudget: s.usedBudget ? Number(s.usedBudget) : null,
          sponsoredStudents: s.sponsoredStudents,
          activeScholarships: s.activeScholarships,
        })),
        demographics: {
          countries: countryStats.map(c => ({
            country: c.country || 'Unknown',
            count: c._count,
          })),
          gender: genderStats.map(g => ({
            gender: g.gender || 'Not Specified',
            count: g._count,
          })),
        },
        trend: formattedDailyTrend,
        recentApplications: recentApplications.map(a => ({
          id: a.id,
          applicationNumber: a.applicationNumber,
          applicantName: `${a.firstName} ${a.lastName}`,
          email: a.email,
          country: a.country,
          status: a.status,
          scholarship: a.scholarship.name,
          submittedAt: a.createdAt.toISOString(),
        })),
      }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch analytics",
      details: error?.message
    }, { status: 500 })
  }
}
