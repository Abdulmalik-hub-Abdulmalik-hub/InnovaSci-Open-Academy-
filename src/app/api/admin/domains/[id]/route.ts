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

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/admin/domains/[id] - Get single domain
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const endpoint = "/api/admin/domains/[id]"
  const { id } = await params

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
    const domain = await prisma.domain.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            _count: {
              select: { courses: true }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { categories: true }
        }
      }
    })

    if (!domain) {
      return NextResponse.json(
        { success: false, error: "Domain not found" },
        { status: 404 }
      )
    }

    const courseCount = domain.categories.reduce((acc, cat) => acc + cat._count.courses, 0)

    return NextResponse.json({
      success: true,
      data: {
        domain: {
          id: domain.id,
          name: domain.name,
          shortName: domain.shortName,
          slug: domain.slug,
          shortDescription: domain.shortDescription,
          fullDescription: domain.fullDescription,
          thumbnailUrl: domain.thumbnailUrl,
          bannerUrl: domain.bannerUrl,
          icon: domain.icon,
          color: domain.color,
          orderIndex: domain.orderIndex,
          status: domain.status,
          visibility: domain.visibility,
          isFeatured: domain.isFeatured,
          seoTitle: domain.seoTitle,
          seoDescription: domain.seoDescription,
          seoKeywords: domain.seoKeywords,
          categoryCount: domain._count.categories,
          courseCount,
          categories: domain.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            icon: cat.icon,
            thumbnailUrl: cat.thumbnailUrl,
            bannerUrl: cat.bannerUrl,
            color: cat.color,
            orderIndex: cat.orderIndex,
            isActive: cat.isActive,
            status: cat.status,
            visibility: cat.visibility,
            courseCount: cat._count.courses,
            createdAt: cat.createdAt.toISOString(),
            updatedAt: cat.updatedAt.toISOString()
          })),
          createdAt: domain.createdAt.toISOString(),
          updatedAt: domain.updatedAt.toISOString()
        }
      }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch domain",
      details: error?.message
    }, { status: 500 })
  }
}

// PUT /api/admin/domains/[id] - Update domain
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const endpoint = "/api/admin/domains/[id]"
  const { id } = await params

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
    const { 
      name, 
      shortName, 
      shortDescription, 
      fullDescription, 
      thumbnailUrl,
      bannerUrl,
      icon, 
      color, 
      orderIndex,
      status,
      visibility,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords
    } = body

    // Check if domain exists
    const existing = await prisma.domain.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Domain not found" },
        { status: 404 }
      )
    }

    // If name is being changed, check for conflicts
    if (name && name !== existing.name) {
      const slugConflict = await prisma.domain.findFirst({
        where: { 
          slug: generateSlug(name),
          id: { not: id }
        }
      })

      const nameConflict = await prisma.domain.findFirst({
        where: { 
          name,
          id: { not: id }
        }
      })

      if (slugConflict || nameConflict) {
        return NextResponse.json(
          { success: false, error: "A domain with this name already exists" },
          { status: 409 }
        )
      }
    }

    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name.trim()
    if (shortName !== undefined) updateData.shortName = shortName?.trim() || null
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription?.trim() || null
    if (fullDescription !== undefined) updateData.fullDescription = fullDescription?.trim() || null
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl?.trim() || null
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl?.trim() || null
    if (icon !== undefined) updateData.icon = icon?.trim() || null
    if (color !== undefined) updateData.color = color?.trim() || null
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex
    if (status !== undefined) updateData.status = status
    if (visibility !== undefined) updateData.visibility = visibility
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle?.trim() || null
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription?.trim() || null
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords || null

    // Update slug if name changed
    if (name && name !== existing.name) {
      updateData.slug = generateSlug(name)
    }

    const domain = await prisma.domain.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { categories: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        domain: {
          ...domain,
          categoryCount: domain._count.categories,
          createdAt: domain.createdAt.toISOString(),
          updatedAt: domain.updatedAt.toISOString()
        }
      }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to update domain",
      details: error?.message
    }, { status: 500 })
  }
}

// DELETE /api/admin/domains/[id] - Delete domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const endpoint = "/api/admin/domains/[id]"
  const { id } = await params

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
    // Check if domain exists
    const existing = await prisma.domain.findUnique({
      where: { id },
      include: {
        _count: {
          select: { categories: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Domain not found" },
        { status: 404 }
      )
    }

    // Check if domain has categories
    if (existing._count.categories > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete domain: it contains ${existing._count.categories} categories. Please remove or reassign categories first.` 
        },
        { status: 400 }
      )
    }

    await prisma.domain.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      data: { deleted: true }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete domain",
      details: error?.message
    }, { status: 500 })
  }
}
