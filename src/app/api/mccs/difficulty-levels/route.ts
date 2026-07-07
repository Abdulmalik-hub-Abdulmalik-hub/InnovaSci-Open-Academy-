import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/mccs/difficulty-levels - List all difficulty levels
export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    const where: Record<string, unknown> = { isActive: true }
    if (categoryId) where.categoryId = categoryId

    const difficultyLevels = await prisma.difficultyLevel.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            courses: true
          }
        }
      },
      orderBy: [{ categoryId: 'asc' }, { orderIndex: 'asc' }]
    })

    return NextResponse.json({
      success: true,
      data: {
        difficultyLevels: difficultyLevels.map(dl => ({
          id: dl.id,
          name: dl.name,
          slug: dl.slug,
          description: dl.description,
          color: dl.color,
          categoryId: dl.categoryId,
          category: dl.category,
          courseCount: dl._count.courses,
        }))
      }
    })

  } catch (error) {
    console.error("Error fetching difficulty levels:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch difficulty levels"
    }, { status: 500 })
  }
}
