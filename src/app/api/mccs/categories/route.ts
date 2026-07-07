import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/mccs/categories - List all categories
export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        difficultyLevels: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            courses: true
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          color: c.color,
          courseCount: c._count.courses,
          difficultyLevels: c.difficultyLevels.map(dl => ({
            id: dl.id,
            name: dl.name,
            slug: dl.slug,
            description: dl.description,
            color: dl.color,
          }))
        }))
      }
    })

  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch categories"
    }, { status: 500 })
  }
}
