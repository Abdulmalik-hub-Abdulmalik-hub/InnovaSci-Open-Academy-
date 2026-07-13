import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"

// GET - Get scholarship analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, 1y, all

    // Calculate date range
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
        startDate = new Date(0) // All time
    }

    // Get scholarship counts by status
    const scholarshipCounts = await prisma.scholarship.groupBy({
      by: ["status"],
      _count: { id: true },
    })

    // Get application counts by status
    const applicationCounts = await prisma.scholarshipApplication.groupBy({
      by: ["status"],
      _count: { id: true },
    })

    // Get total applications and awards
    const [totalApplications, totalAwards, totalSponsors] = await Promise.all([
      prisma.scholarshipApplication.count(),
      prisma.scholarshipAward.count({ where: { status: { in: ["ACTIVE", "PENDING_ACCEPTANCE"] } } }),
      prisma.sponsor.count({ where: { status: "ACTIVE" } }),
    ])

    // Get total budget
    const budgetData = await prisma.scholarship.aggregate({
      _sum: {
        totalBudget: true,
        budgetUsed: true,
      },
    })

    // Get applications trend (last 30 days)
    const applicationsTrend = await prisma.scholarshipApplication.findMany({
      where: {
        submittedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: {
        submittedAt: true,
        status: true,
        country: true,
        gender: true,
        scholarship: {
          select: {
            typeId: true,
            type: { select: { name: true } },
          },
        },
      },
      orderBy: { submittedAt: "asc" },
    })

    // Process applications trend by day
    const dailyApplications: Record<string, number> = {}
    applicationsTrend.forEach((app) => {
      if (app.submittedAt) {
        const date = app.submittedAt.toISOString().split("T")[0]
        dailyApplications[date] = (dailyApplications[date] || 0) + 1
      }
    })

    // Get country distribution
    const countryDistribution = await prisma.scholarshipApplication.groupBy({
      by: ["country"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    // Get gender distribution
    const genderDistribution = await prisma.scholarshipApplication.groupBy({
      by: ["gender"],
      _count: { id: true },
    })

    // Get scholarship type distribution
    const typeDistribution = await prisma.scholarshipApplication.groupBy({
      by: ["scholarshipId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    })

    // Get scholarship names for type distribution
    const scholarshipIds = typeDistribution.map((t) => t.scholarshipId)
    const scholarships = await prisma.scholarship.findMany({
      where: { id: { in: scholarshipIds } },
      select: { id: true, name: true, type: { select: { name: true } } },
    })

    const scholarshipMap = new Map(scholarships.map((s) => [s.id, s]))
    const topScholarships = typeDistribution.map((t) => ({
      scholarship: scholarshipMap.get(t.scholarshipId),
      applicationCount: t._count.id,
    })).filter((t) => t.scholarship)

    // Calculate approval rate
    const approvedCount = applicationCounts.find((c) => c.status === "APPROVED")?._count.id || 0
    const rejectedCount = applicationCounts.find((c) => c.status === "REJECTED")?._count.id || 0
    const totalDecisions = approvedCount + rejectedCount
    const approvalRate = totalDecisions > 0 ? (approvedCount / totalDecisions) * 100 : 0

    // Build scholarship status counts
    const scholarshipStats = {
      total: scholarshipCounts.reduce((acc, curr) => acc + curr._count.id, 0),
      draft: scholarshipCounts.find((c) => c.status === "DRAFT")?._count.id || 0,
      published: scholarshipCounts.find((c) => c.status === "PUBLISHED")?._count.id || 0,
      closed: scholarshipCounts.find((c) => c.status === "CLOSED")?._count.id || 0,
      archived: scholarshipCounts.find((c) => c.status === "ARCHIVED")?._count.id || 0,
    }

    // Build application status counts
    const applicationStats = {
      total: totalApplications,
      submitted: applicationCounts.find((c) => c.status === "SUBMITTED")?._count.id || 0,
      underReview: applicationCounts.find((c) => c.status === "UNDER_REVIEW")?._count.id || 0,
      interview: applicationCounts.find((c) => c.status === "INTERVIEW")?._count.id || 0,
      additionalInfo: applicationCounts.find((c) => c.status === "ADDITIONAL_INFO")?._count.id || 0,
      approved: approvedCount,
      rejected: rejectedCount,
      withdrawn: applicationCounts.find((c) => c.status === "WITHDRAWN")?._count.id || 0,
      approvalRate: Math.round(approvalRate * 100) / 100,
    }

    return successResponse({
      summary: {
        totalScholarships: scholarshipStats.total,
        activeScholarships: scholarshipStats.published,
        totalApplications,
        totalAwards,
        totalSponsors,
        totalBudget: budgetData._sum.totalBudget ? Number(budgetData._sum.totalBudget) : 0,
        budgetUsed: budgetData._sum.budgetUsed ? Number(budgetData._sum.budgetUsed) : 0,
        budgetRemaining: budgetData._sum.totalBudget && budgetData._sum.budgetUsed
          ? Number(budgetData._sum.totalBudget) - Number(budgetData._sum.budgetUsed)
          : 0,
      },
      scholarshipStats,
      applicationStats,
      applicationsTrend: Object.entries(dailyApplications).map(([date, count]) => ({ date, count })),
      countryDistribution: countryDistribution.map((c) => ({
        country: c.country || "Unknown",
        count: c._count.id,
      })),
      genderDistribution: genderDistribution.map((g) => ({
        gender: g.gender || "Not Specified",
        count: g._count.id,
      })),
      topScholarships,
      period,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
