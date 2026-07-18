import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

// GET /api/admin/applications - List all applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "applications:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const scholarshipId = searchParams.get("scholarshipId")
    const search = searchParams.get("search")
    const country = searchParams.get("country")
    const gender = searchParams.get("gender")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (status) where.status = status
    if (scholarshipId) where.scholarshipId = scholarshipId
    if (country) where.country = country
    if (gender) where.gender = gender
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { applicationNumber: { contains: search, mode: "insensitive" } },
        { trackingNumber: { contains: search, mode: "insensitive" } },
      ]
    }
    
    const [applications, total] = await Promise.all([
      prisma.scholarshipApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          scholarship: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              thumbnailUrl: true,
            }
          },
          reviews: {
            select: {
              id: true,
              status: true,
              totalScore: true,
            }
          }
        }
      }),
      prisma.scholarshipApplication.count({ where })
    ])
    
    // Get status counts
    const statusCounts = await prisma.scholarshipApplication.groupBy({
      by: ["status"],
      _count: true,
      where: scholarshipId ? { scholarshipId } : undefined
    })
    
    const statusMap: Record<string, number> = {}
    statusCounts.forEach(s => {
      statusMap[s.status] = s._count
    })
    
    return NextResponse.json({
      applications,
      statusCounts: statusMap,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
