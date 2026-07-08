import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET /api/admin/capstones/professional - Get all professional capstones
export async function GET() {
  try {
    const capstones = await prisma.professionalCapstone.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: { select: { enrollments: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: capstones.map(c => ({
        ...c,
        includedCourses: c.includedCourses || [],
        enrollmentsCount: c._count.enrollments,
      }))
    })
  } catch (error) {
    console.error("Error fetching capstones:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch capstones"
    }, { status: 500 })
  }
}

// POST /api/admin/capstones/professional - Create capstone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, description, categoryId, includedCourses, requirements, thumbnailUrl } = body

    if (!title || !slug) {
      return NextResponse.json({
        success: false,
        error: "Title and slug are required"
      }, { status: 400 })
    }

    // Check slug uniqueness
    const existing = await prisma.professionalCapstone.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({
        success: false,
        error: "A capstone with this slug already exists"
      }, { status: 409 })
    }

    // Get max orderIndex
    const maxOrder = await prisma.professionalCapstone.findFirst({
      where: categoryId ? { categoryId } : {},
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true }
    })

    const capstone = await prisma.professionalCapstone.create({
      data: {
        title,
        slug,
        description: description || null,
        categoryId: categoryId || null,
        includedCourses: includedCourses || [],
        requirements: requirements || null,
        thumbnailUrl: thumbnailUrl || null,
        orderIndex: (maxOrder?.orderIndex ?? -1) + 1,
      }
    })

    return NextResponse.json({
      success: true,
      data: capstone,
      message: "Capstone created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating capstone:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create capstone"
    }, { status: 500 })
  }
}
