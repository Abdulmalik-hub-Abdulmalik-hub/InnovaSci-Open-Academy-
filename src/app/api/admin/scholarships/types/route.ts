import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"

// GET - List all scholarship types with statistics
// Note: Templates are system-managed. This endpoint is read-only.
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
