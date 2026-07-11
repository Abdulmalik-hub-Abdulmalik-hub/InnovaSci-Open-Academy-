import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/domains - List published domains for public view
export async function GET() {
  const endpoint = "/api/public/domains"
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

    let domains: any[] = []
    
    try {
      domains = await prisma.domain.findMany({
        where: { 
          status: "PUBLISHED",
          visibility: { in: ["PUBLIC", "FEATURED"] }
        },
        include: {
          categories: {
            where: { isActive: true },
            include: {
              _count: {
                select: { courses: true }
              }
            }
          },
          _count: {
            select: { 
              categories: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: [
          { orderIndex: 'asc' },
          { name: 'asc' }
        ]
      })
    } catch (dbError) {
      console.error(`[${endpoint}] Database query failed:`, dbError)
      return NextResponse.json({
        success: true,
        data: { domains: [] },
        warning: "Could not fetch domains from database"
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        domains: domains.map((d: any) => ({
          id: d.id,
          name: d.name,
          shortName: d.shortName,
          slug: d.slug,
          shortDescription: d.shortDescription,
          fullDescription: d.fullDescription,
          thumbnailUrl: d.thumbnailUrl,
          bannerUrl: d.bannerUrl,
          icon: d.icon,
          color: d.color,
          isFeatured: d.isFeatured,
          categoryCount: d._count.categories,
          categories: d.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon,
            color: c.color,
            courseCount: c._count.courses
          }))
        }))
      }
    })
  } catch (error) {
    console.error(`[${endpoint}] [${method}] Unexpected error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch domains",
      code: "INTERNAL_ERROR",
      data: []
    }, { status: 500 })
  }
}
