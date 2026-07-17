import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")

  if (!authHeader) {
    return { authorized: true } // Demo mode
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

        if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "ACTIVE") {
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

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/admin/scholarship-types - List all scholarship types
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/scholarship-types"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing"
    }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    let where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    const types = await prisma.scholarshipType.findMany({
      where,
      include: {
        _count: {
          select: { scholarships: true }
        }
      },
      orderBy: { orderIndex: 'asc' }
    })

    const formattedTypes = types.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      icon: t.icon,
      color: t.color,
      orderIndex: t.orderIndex,
      isActive: t.isActive,
      scholarshipCount: t._count.scholarships,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: { types: formattedTypes }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch scholarship types",
      details: error?.message
    }, { status: 500 })
  }
}

// POST /api/admin/scholarship-types - Create new scholarship type
export async function POST(request: NextRequest) {
  const endpoint = "/api/admin/scholarship-types"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing"
    }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, icon, color, orderIndex, isActive } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      )
    }

    const slug = generateSlug(name)

    // Check if slug already exists
    const existing = await prisma.scholarshipType.findFirst({
      where: { OR: [{ slug }, { name }] }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A scholarship type with this name already exists" },
        { status: 409 }
      )
    }

    // Get max orderIndex if not provided
    let finalOrderIndex = orderIndex
    if (finalOrderIndex === undefined) {
      const maxOrder = await prisma.scholarshipType.aggregate({
        _max: { orderIndex: true }
      })
      finalOrderIndex = (maxOrder._max.orderIndex || 0) + 1
    }

    const type = await prisma.scholarshipType.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        color: color?.trim() || null,
        orderIndex: finalOrderIndex,
        isActive: isActive ?? true,
      }
    })

    return NextResponse.json({
      success: true,
      data: { type },
      message: "Scholarship type created successfully"
    }, { status: 201 })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to create scholarship type",
      details: error?.message
    }, { status: 500 })
  }
}
