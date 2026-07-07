import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/mccs/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        orderIndex: true,
        _count: {
          select: {
            courses: true
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    })

    const formattedCategories = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      color: c.color,
      orderIndex: c.orderIndex,
      courseCount: c._count.courses
    }))

    return NextResponse.json({
      success: true,
      data: {
        categories: formattedCategories
      }
    })
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch categories"
    }, { status: 500 })
  }
}
