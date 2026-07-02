import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic';

async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")

  if (!authHeader) {
    return { authorized: true }
  }

  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)

      if (token.startsWith("admin_")) {
        const userId = token.substring(6)

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })

        if (user && user.role === "ADMIN" && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id }
        }
      }
    }

    return { authorized: false, error: "Invalid or expired authentication token" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/categories/[id]"
  const { id } = params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        category: {
          ...category,
          courseCount: category._count.courses,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString()
        }
      }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to fetch category" }, { status: 500 })
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/categories/[id]"
  const { id } = params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, icon, color, orderIndex, isActive } = body

    // Check if category exists
    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    // If name is being updated, check for conflicts
    if (name && name !== existing.name) {
      const slugConflict = await prisma.category.findFirst({
        where: { slug: generateSlug(name), NOT: { id } }
      })
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: "A category with this name already exists" },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (icon !== undefined) updateData.icon = icon?.trim() || null
    if (color !== undefined) updateData.color = color?.trim() || null
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex
    if (isActive !== undefined) updateData.isActive = isActive

    // Update slug if name changed
    if (name && name !== existing.name) {
      updateData.slug = generateSlug(name)
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { courses: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        category: {
          ...category,
          courseCount: category._count.courses,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString()
        }
      }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = "/api/admin/categories/[id]"
  const { id } = params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    // Check if category exists and has courses
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } }
    })

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    if (category._count.courses > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category with ${category._count.courses} courses. Move or delete courses first.`
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
  }
}
