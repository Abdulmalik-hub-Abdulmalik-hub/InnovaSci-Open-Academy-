import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

// GET /api/admin/awards - List all awards
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "awards:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const scholarshipId = searchParams.get("scholarshipId")
    const search = searchParams.get("search")
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (status) where.status = status
    if (scholarshipId) where.scholarshipId = scholarshipId
    if (search) {
      where.OR = [
        { recipientName: { contains: search, mode: "insensitive" } },
        { recipientEmail: { contains: search, mode: "insensitive" } },
        { awardNumber: { contains: search, mode: "insensitive" } },
      ]
    }
    
    const [awards, total] = await Promise.all([
      prisma.scholarshipAward.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          application: {
            select: {
              id: true,
              scholarshipId: true,
              firstName: true,
              lastName: true,
              scholarship: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  type: true,
                }
              }
            }
          },
          enrollmentRecords: true
        }
      }),
      prisma.scholarshipAward.count({ where })
    ])
    
    // Get status counts
    const statusCounts = await prisma.scholarshipAward.groupBy({
      by: ["status"],
      _count: true,
    })
    
    const statusMap: Record<string, number> = {}
    statusCounts.forEach(s => {
      statusMap[s.status] = s._count
    })
    
    return NextResponse.json({
      awards,
      statusCounts: statusMap,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching awards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
