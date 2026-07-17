import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"

// GET - Get single scholarship type (read-only)
// Note: Templates are system-managed and cannot be edited via API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const type = await prisma.scholarshipType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { scholarships: true },
        },
      },
    })

    if (!type) {
      return errorResponse("Scholarship type not found", ErrorCodes.NOT_FOUND, 404)
    }

    return successResponse({
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
      createdAt: type.createdAt,
      updatedAt: type.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching scholarship type:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
