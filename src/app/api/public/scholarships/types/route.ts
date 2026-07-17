import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, handlePrismaError } from "@/lib/api-response"

// GET - List public scholarship types (active only) with full template data
export async function GET() {
  try {
    const types = await prisma.scholarshipType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        shortName: true,
        description: true,
        objectives: true,
        eligibility: true,
        benefits: true,
        icon: true,
        color: true,
        badge: true,
        banner: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        tags: true,
        isCustom: true,
        orderIndex: true,
        _count: {
          select: { scholarships: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    })

    const formattedTypes = types.map((type) => ({
      ...type,
      scholarshipCount: type._count.scholarships,
      // Include template data for auto-fill (excluding internal fields)
      templateData: type.isCustom ? null : {
        description: type.description,
        objectives: type.objectives,
        eligibility: type.eligibility,
        benefits: type.benefits,
        icon: type.icon,
        color: type.color,
        seoTitle: type.seoTitle,
        seoDescription: type.seoDescription,
        seoKeywords: type.seoKeywords,
        tags: type.tags,
      },
    }))

    return successResponse(formattedTypes)
  } catch (error) {
    console.error("Error fetching public scholarship types:", error)
    
    // Re-throw with more context for debugging
    if (process.env.NODE_ENV === "development") {
      throw error
    }
    
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
