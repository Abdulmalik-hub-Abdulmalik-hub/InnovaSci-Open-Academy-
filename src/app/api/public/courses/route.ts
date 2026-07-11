import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - this route uses request.url for search params
export const dynamic = 'force-dynamic'

// GET /api/public/courses - List published courses for public view
export async function GET(request: NextRequest) {
  const endpoint = "/api/public/courses"
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

    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get("domainId")
    const categoryId = searchParams.get("categoryId")
    const difficultyLevel = searchParams.get("difficultyLevel")
    const searchQuery = searchParams.get("q")

    let where: any = { 
      status: "published",
      isActive: true
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel
    }
    
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { shortDescription: { contains: searchQuery, mode: 'insensitive' } },
        { fullDescription: { contains: searchQuery, mode: 'insensitive' } }
      ]
    }

    // If domainId is provided, filter by domain through category
    if (domainId) {
      where.category = {
        domainId: domainId,
        isActive: true
      }
    }

    let courses: any[] = []
    
    try {
      courses = await prisma.course.findMany({
        where,
        include: {
          category: {
            include: {
              domain: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                  icon: true
                }
              }
            }
          },
          _count: {
            select: { enrollments: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    } catch (dbError) {
      console.error(`[${endpoint}] Database query failed:`, dbError)
      // Return empty array on failure
      return NextResponse.json({
        success: true,
        data: [],
        warning: "Could not fetch courses from database"
      })
    }

    return NextResponse.json({
      success: true,
      data: courses.map(c => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        shortDescription: c.shortDescription,
        thumbnailUrl: c.thumbnailUrl,
        price: Number(c.price),
        isFree: c.isFree,
        category: c.category?.name || null,
        categoryId: c.categoryId,
        domain: c.category?.domain ? {
          id: c.category.domain.id,
          name: c.category.domain.name,
          slug: c.category.domain.slug,
          color: c.category.domain.color,
          icon: c.category.domain.icon
        } : null,
        domainId: c.category?.domainId,
        difficultyLevel: c.difficultyLevel,
        durationHours: c.durationHours,
        enrollments: c._count.enrollments,
        createdAt: c.createdAt
      }))
    })
  } catch (error) {
    console.error(`[${endpoint}] [${method}] Unexpected error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch courses",
      code: "INTERNAL_ERROR",
      data: []
    }, { status: 500 })
  }
}
