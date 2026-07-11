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

// GET /api/admin/domains - List all domains
export async function GET(request: NextRequest) {
  const endpoint = "/api/admin/domains"

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
    const includeArchived = searchParams.get("includeArchived") === "true"

    let where: any = {}
    
    if (!includeInactive && !includeArchived) {
      where.status = { in: ["DRAFT", "PUBLISHED"] }
    } else if (!includeArchived) {
      where.status = { in: ["DRAFT", "PUBLISHED"] }
    }

    const domains = await prisma.domain.findMany({
      where,
      include: {
        _count: {
          select: { 
            categories: {
              include: {
                _count: {
                  select: { courses: true }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { orderIndex: 'asc' },
        { name: 'asc' }
      ]
    })

    const formattedDomains = domains.map(domain => {
      const categoryCount = domain._count.categories.length
      const courseCount = domain._count.categories.reduce((acc, cat) => acc + cat._count.courses, 0)
      
      return {
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
        categoryCount,
        courseCount,
        createdAt: domain.createdAt.toISOString(),
        updatedAt: domain.updatedAt.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      data: { domains: formattedDomains }
    })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch domains",
      details: error?.message
    }, { status: 500 })
  }
}

// POST /api/admin/domains - Create new domain
export async function POST(request: NextRequest) {
  const endpoint = "/api/admin/domains"

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

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      )
    }

    const slug = generateSlug(name)

    // Check if slug already exists
    const existing = await prisma.domain.findFirst({
      where: { OR: [{ slug }, { name }] }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A domain with this name already exists" },
        { status: 409 }
      )
    }

    // Get max orderIndex if not provided
    let finalOrderIndex = orderIndex
    if (finalOrderIndex === undefined) {
      const maxOrder = await prisma.domain.aggregate({
        _max: { orderIndex: true }
      })
      finalOrderIndex = (maxOrder._max.orderIndex || 0) + 1
    }

    const domain = await prisma.domain.create({
      data: {
        name: name.trim(),
        shortName: shortName?.trim() || null,
        slug,
        shortDescription: shortDescription?.trim() || null,
        fullDescription: fullDescription?.trim() || null,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        icon: icon?.trim() || null,
        color: color?.trim() || null,
        orderIndex: finalOrderIndex,
        status: status || "DRAFT",
        visibility: visibility || "PUBLIC",
        isFeatured: isFeatured || false,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        seoKeywords: seoKeywords || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        domain: {
          ...domain,
          categoryCount: 0,
          courseCount: 0,
          createdAt: domain.createdAt.toISOString(),
          updatedAt: domain.updatedAt.toISOString()
        }
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to create domain",
      details: error?.message
    }, { status: 500 })
  }
}
