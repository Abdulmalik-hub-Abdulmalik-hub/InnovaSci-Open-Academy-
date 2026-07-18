import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

// GET /api/admin/scholarship-analytics - Get scholarship analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "scholarships:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const scholarshipId = searchParams.get("scholarshipId")
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, 1y
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(startDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }
    
    // Build where clause
    const scholarshipWhere: any = {}
    const applicationWhere: any = {
      createdAt: { gte: startDate }
    }
    
    if (scholarshipId) {
      scholarshipWhere.id = scholarshipId
      applicationWhere.scholarshipId = scholarshipId
    }
    
    // Get scholarship stats
    const [
      totalScholarships,
      activeScholarships,
      featuredScholarships,
      scholarshipStats
    ] = await Promise.all([
      prisma.scholarship.count({ where: scholarshipWhere }),
      prisma.scholarship.count({ where: { ...scholarshipWhere, status: "PUBLISHED" } }),
      prisma.scholarship.count({ where: { ...scholarshipWhere, isFeatured: true } }),
      prisma.scholarship.findMany({
        where: scholarshipWhere,
        select: {
          id: true,
          name: true,
          type: true,
          applicationCount: true,
          viewCount: true,
        }
      })
    ])
    
    // Get application stats
    const [
      totalApplications,
      applicationStats,
      statusDistribution,
      countryDistribution,
      genderDistribution
    ] = await Promise.all([
      prisma.scholarshipApplication.count({ where: applicationWhere }),
      prisma.scholarshipApplication.groupBy({
        by: ["status"],
        _count: true,
        where: applicationWhere
      }),
      prisma.scholarshipApplication.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.scholarshipApplication.groupBy({
        by: ["country"],
        _count: true,
        where: { country: { not: null } },
        orderBy: { _count: { country: "desc" } },
        take: 10
      }),
      prisma.scholarshipApplication.groupBy({
        by: ["gender"],
        _count: true,
        where: { gender: { not: null } }
      })
    ])
    
    // Get award stats
    const awardStats = await prisma.scholarshipAward.groupBy({
      by: ["status"],
      _count: true,
    })
    
    // Get sponsor stats
    const sponsorStats = await prisma.sponsor.aggregate({
      _count: true,
      _sum: { budget: true, spent: true }
    })
    
    // Get application trend (last 30 days)
    const trendData = await getApplicationTrend(startDate, now, applicationWhere)
    
    // Calculate completion rate
    const approved = statusDistribution.find(s => s.status === "APPROVED")?._count || 0
    const rejected = statusDistribution.find(s => s.status === "REJECTED")?._count || 0
    const completed = approved + rejected
    const completionRate = totalApplications > 0 
      ? Math.round((completed / totalApplications) * 100) 
      : 0
    
    return NextResponse.json({
      overview: {
        totalScholarships,
        activeScholarships,
        featuredScholarships,
        totalApplications,
        completionRate,
        totalAwards: awardStats.reduce((acc, s) => acc + s._count, 0),
        totalSponsors: sponsorStats._count,
        totalBudget: sponsorStats._sum.budget || 0,
        totalSpent: sponsorStats._sum.spent || 0,
      },
      applicationStats: applicationStats.reduce((acc, s) => {
        acc[s.status] = s._count
        return acc
      }, {} as Record<string, number>),
      awardStats: awardStats.reduce((acc, s) => {
        acc[s.status] = s._count
        return acc
      }, {} as Record<string, number>),
      countryDistribution: countryDistribution.map(c => ({
        country: c.country,
        count: c._count
      })),
      genderDistribution: genderDistribution.map(g => ({
        gender: g.gender,
        count: g._count
      })),
      topScholarships: scholarshipStats
        .sort((a, b) => b.applicationCount - a.applicationCount)
        .slice(0, 5),
      trend: trendData,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    })
  } catch (error) {
    console.error("Error fetching scholarship analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getApplicationTrend(startDate: Date, endDate: Date, where: any) {
  const applications = await prisma.scholarshipApplication.findMany({
    where: {
      ...where,
      createdAt: { gte: startDate, lte: endDate }
    },
    select: {
      createdAt: true,
      status: true
    }
  })
  
  // Group by day
  const trendMap = new Map<string, { date: string; submitted: number; approved: number; rejected: number }>()
  
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]
    trendMap.set(dateStr, { date: dateStr, submitted: 0, approved: 0, rejected: 0 })
  }
  
  applications.forEach(app => {
    const dateStr = app.createdAt.toISOString().split("T")[0]
    const entry = trendMap.get(dateStr)
    if (entry) {
      if (app.status === "SUBMITTED") entry.submitted++
      if (app.status === "APPROVED") entry.approved++
      if (app.status === "REJECTED") entry.rejected++
    }
  })
  
  return Array.from(trendMap.values())
}
