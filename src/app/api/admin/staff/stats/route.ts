import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

// GET /api/admin/staff/stats - Get staff statistics for dashboard
export async function GET(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    // Get all non-student users
    const allStaff = await prisma.user.findMany({
      where: {
        role: {
          not: "STUDENT"
        }
      },
      select: {
        id: true,
        role: true,
        status: true,
        staffProfile: {
          select: {
            id: true,
            department: true,
          }
        }
      }
    })

    // Calculate statistics
    const totalStaff = allStaff.length
    const activeStaff = allStaff.filter(u => u.status === "ACTIVE").length
    const inactiveStaff = allStaff.filter(u => u.status === "INACTIVE").length
    const suspendedStaff = allStaff.filter(u => u.status === "SUSPENDED").length

    // Count by role
    const roleCounts: Record<string, number> = {}
    allStaff.forEach(staff => {
      const role = staff.role || "UNKNOWN"
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })

    // Get portal counts
    const portalCounts = await prisma.staffAssignment.groupBy({
      by: ["portalId"],
      where: {
        status: "ACTIVE",
        staffProfile: {
          user: {
            status: "ACTIVE"
          }
        }
      },
      _count: { id: true }
    })

    const portals = await prisma.portal.findMany({
      where: {
        id: { in: portalCounts.map(p => p.portalId) }
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        icon: true,
        color: true,
      }
    })

    const portalStats = portalCounts.map(p => {
      const portal = portals.find(port => port.id === p.portalId)
      return {
        ...portal,
        count: p._count.id
      }
    })

    // Get department distribution
    const departmentCounts = await prisma.staffProfile.groupBy({
      by: ["department"],
      where: {
        isActive: true,
        department: { not: null }
      },
      _count: { id: true }
    })

    // Get recent activity
    const recentActivities = await prisma.staffActivity.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        staffProfile: {
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: { fullName: true }
                }
              }
            }
          }
        }
      }
    })

    // Get staff created over time (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyStats = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COUNT(*) as count
      FROM users
      WHERE "createdAt" >= ${twelveMonthsAgo}
        AND role != 'STUDENT'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `

    // Get top domains by staff count
    const domainStaffCounts = await prisma.staffAssignment.groupBy({
      by: ["domainId"],
      where: {
        status: "ACTIVE",
        domainId: { not: null }
      },
      _count: { id: true }
    })

    const domains = await prisma.domain.findMany({
      where: {
        id: { in: domainStaffCounts.map(d => d.domainId!) }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
      }
    })

    const domainStats = domainStaffCounts.map(d => {
      const domain = domains.find(dom => dom.id === d.domainId)
      return {
        ...domain,
        count: d._count.id
      }
    }).filter(d => d.name).sort((a, b) => b.count - a.count).slice(0, 10)

    // Get session statistics
    const sessionStats = await prisma.staffSession.groupBy({
      by: ["isActive"],
      _count: { id: true }
    })

    const activeSessions = sessionStats.find(s => s.isActive)?._count.id || 0
    const totalSessions = sessionStats.reduce((acc, s) => acc + Number(s._count.id), 0)

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStaff,
          activeStaff,
          inactiveStaff,
          suspendedStaff,
          activeStaffPercentage: totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 0,
        },
        byRole: roleCounts,
        byPortal: portalStats,
        byDepartment: departmentCounts.map(d => ({
          department: d.department || "Unassigned",
          count: d._count.id
        })),
        byDomain: domainStats,
        recentActivity: recentActivities.map(a => ({
          id: a.id,
          action: a.action,
          category: a.category,
          description: a.description,
          performedBy: a.performedByName,
          createdAt: a.createdAt,
          staffName: a.staffProfile?.user?.profile?.fullName || a.staffProfile?.user?.email,
        })),
        monthlyTrend: monthlyStats.map(m => ({
          month: m.month,
          count: Number(m.count)
        })),
        sessions: {
          active: activeSessions,
          total: totalSessions,
        }
      }
    })
  } catch (error) {
    console.error("Get staff stats error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff statistics" },
      { status: 500 }
    )
  }
}
