import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/scholarships - List public scholarships
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const type = searchParams.get("type")
    const domain = searchParams.get("domain")
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")
    
    const skip = (page - 1) * limit
    
    const now = new Date()
    
    const where: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      // Only show scholarships that are open or haven't closed yet
      OR: [
        { closingDate: null },
        { closingDate: { gte: now } }
      ]
    }
    
    if (type) where.type = type
    if (featured === "true") where.isFeatured = true
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortName: { contains: search, mode: "insensitive" } },
      ]
    }
    
    // Handle domain filter
    if (domain) {
      where.domains = {
        some: {
          domain: {
            slug: domain
          }
        }
      }
    }
    
    // Handle category filter
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }
    
    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFeatured: "desc" },
          { closingDate: "asc" }
        ],
        select: {
          id: true,
          name: true,
          shortName: true,
          slug: true,
          type: true,
          description: true,
          awardAmount: true,
          currency: true,
          availableSlots: true,
          openingDate: true,
          closingDate: true,
          applicationDeadline: true,
          thumbnailUrl: true,
          bannerUrl: true,
          color: true,
          icon: true,
          isFeatured: true,
          domains: {
            include: {
              domain: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                  color: true,
                }
              }
            }
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                }
              }
            }
          },
          sponsor: {
            select: {
              id: true,
              name: true,
              logo: true,
            }
          },
          _count: {
            select: { applications: true }
          }
        }
      }),
      prisma.scholarship.count({ where })
    ])
    
    return NextResponse.json({
      scholarships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching public scholarships:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
