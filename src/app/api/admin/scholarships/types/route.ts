import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, createdResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"

// GET - List all scholarship types with statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const where = includeInactive ? {} : { isActive: true }

    // Get all types with counts
    const types = await prisma.scholarshipType.findMany({
      where,
      orderBy: [
        { orderIndex: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: {
          select: { scholarships: true },
        },
      },
    })

    // Get statistics
    const stats = {
      total: types.length,
      active: types.filter(t => t.isActive).length,
      inactive: types.filter(t => !t.isActive).length,
      totalScholarships: types.reduce((acc, t) => acc + t._count.scholarships, 0),
    }

    const formattedTypes = types.map((type) => ({
      id: type.id,
      name: type.name,
      slug: type.slug,
      shortName: type.shortName,
      description: type.description,
      objectives: type.objectives,
      eligibility: type.eligibility,
      benefits: type.benefits,
      icon: type.icon,
      color: type.color,
      badge: type.badge,
      seoTitle: type.seoTitle,
      seoDescription: type.seoDescription,
      seoKeywords: type.seoKeywords,
      tags: type.tags,
      isCustom: type.isCustom,
      isActive: type.isActive,
      orderIndex: type.orderIndex,
      scholarshipCount: type._count.scholarships,
    }))

    return successResponse({
      types: formattedTypes,
      stats,
    })
  } catch (error) {
    console.error("Error fetching scholarship types:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// POST - Create a custom scholarship type
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const {
      name,
      shortName,
      slug,
      description,
      objectives,
      eligibility,
      benefits,
      icon,
      color,
      badge,
      banner,
      seoTitle,
      seoDescription,
      seoKeywords,
      tags,
      isActive,
    } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return errorResponse("Name is required", ErrorCodes.VALIDATION_ERROR, 400)
    }

    if (!slug || !slug.trim()) {
      return errorResponse("Slug is required", ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Check if slug already exists
    const existingBySlug = await prisma.scholarshipType.findFirst({
      where: { slug: slug.trim().toLowerCase() }
    })
    
    if (existingBySlug) {
      return errorResponse("A scholarship type with this slug already exists", ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Check if name already exists
    const existingByName = await prisma.scholarshipType.findFirst({
      where: { name: name.trim() }
    })
    
    if (existingByName) {
      return errorResponse("A scholarship type with this name already exists", ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Get the highest orderIndex to place new type before "Custom"
    const highestOrderType = await prisma.scholarshipType.findFirst({
      where: { isCustom: false },
      orderBy: { orderIndex: "desc" }
    })
    
    const newOrderIndex = highestOrderType ? highestOrderType.orderIndex + 1 : 1

    // Create the custom scholarship type
    const newType = await prisma.scholarshipType.create({
      data: {
        name: name.trim(),
        shortName: shortName?.trim() || null,
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        description: description?.trim() || null,
        objectives: objectives?.trim() || null,
        eligibility: eligibility?.trim() || null,
        benefits: benefits?.trim() || null,
        icon: icon?.trim() || "Award",
        color: color || "#6366F1",
        badge: badge?.trim() || null,
        banner: banner?.trim() || null,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        seoKeywords: seoKeywords?.trim() || null,
        tags: tags?.trim() || null,
        isActive: isActive !== false,
        isCustom: true,
        orderIndex: newOrderIndex,
      },
    })

    return createdResponse({
      type: {
        id: newType.id,
        name: newType.name,
        slug: newType.slug,
        shortName: newType.shortName,
        description: newType.description,
        objectives: newType.objectives,
        eligibility: newType.eligibility,
        benefits: newType.benefits,
        icon: newType.icon,
        color: newType.color,
        badge: newType.badge,
        seoTitle: newType.seoTitle,
        seoDescription: newType.seoDescription,
        seoKeywords: newType.seoKeywords,
        tags: newType.tags,
        isCustom: newType.isCustom,
        isActive: newType.isActive,
        orderIndex: newType.orderIndex,
      }
    }, "Custom scholarship type created successfully")
  } catch (error) {
    console.error("Error creating scholarship type:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
