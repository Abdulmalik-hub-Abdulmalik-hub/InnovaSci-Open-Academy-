import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/courses - List published courses for public view
export async function GET() {
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

    let courses: any[] = []
    
    try {
      courses = await prisma.course.findMany({
        where: { status: "published" },
        include: {
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
        category: c.category,
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
