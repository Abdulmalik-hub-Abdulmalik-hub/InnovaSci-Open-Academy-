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

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/categories"

  if (!process.env.DATABASE_URL) {
    console.error(`[${endpoint}] DATABASE_URL not configured`)
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
    const domainId = searchParams.get("domainId")

    let where: any = {}
    
    if (!includeInactive) {
      where.isActive = true
    }
    
    if (domainId) {
      where.domainId = domainId
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        domain: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
          }
        },
        _count: {
          select: { courses: true }
        }
      },
      orderBy: [
        { orderIndex: 'asc' },
        { name: 'asc' }
      ]
    })

    const formattedCategories = categories.map(cat => ({
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
      domainId: cat.domainId,
      domain: cat.domain,
      courseCount: cat._count.courses,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: { categories: formattedCategories }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const prismaErrorCode = error?.code || error?.meta?.code || ''
    const prismaErrorMsg = error?.meta?.message || error?.message || ''
    
    return NextResponse.json({
      success: false,
      error: `Failed to fetch categories: ${errorMessage}`,
      details: {
        message: prismaErrorMsg || errorMessage,
        code: prismaErrorCode,
        stack: error?.stack?.substring(0, 500)
      }
    }, { status: 500 })
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  const endpoint = "/api/admin/categories"

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
      description, 
      icon, 
      color, 
      orderIndex,
      domainId,
      thumbnailUrl,
      bannerUrl,
      status,
      visibility,
      seoTitle,
      seoDescription,
      seoKeywords
    } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      )
    }

    // Validate domain exists if provided
    if (domainId) {
      const domain = await prisma.domain.findUnique({
        where: { id: domainId }
      })
      
      if (!domain) {
        return NextResponse.json(
          { success: false, error: "Domain not found" },
          { status: 404 }
        )
      }
    }

    const slug = generateSlug(name)

    // Check if slug already exists within the same domain
    const existingSlug = await prisma.category.findFirst({
      where: { 
        slug,
        domainId: domainId || null
      }
    })

    // Check if name already exists within the same domain
    const existingName = await prisma.category.findFirst({
      where: { 
        name,
        domainId: domainId || null
      }
    })

    if (existingSlug || existingName) {
      return NextResponse.json(
        { success: false, error: "A category with this name already exists in this domain" },
        { status: 409 }
      )
    }

    // Get max orderIndex if not provided
    let finalOrderIndex = orderIndex
    if (finalOrderIndex === undefined) {
      const maxOrder = await prisma.category.aggregate({
        where: { domainId: domainId || null },
        _max: { orderIndex: true }
      })
      finalOrderIndex = (maxOrder._max.orderIndex || 0) + 1
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        color: color?.trim() || null,
        orderIndex: finalOrderIndex,
        domainId: domainId || null,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        status: status || "ACTIVE",
        visibility: visibility || "PUBLIC",
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        seoKeywords: seoKeywords || null
      },
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
    })

    return NextResponse.json({
      success: true,
      data: {
        category: {
          ...category,
          courseCount: 0,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString()
        }
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to create category",
      details: error?.message
    }, { status: 500 })
  }
}
