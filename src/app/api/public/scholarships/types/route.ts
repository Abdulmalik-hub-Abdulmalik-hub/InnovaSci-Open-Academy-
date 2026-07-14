import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, handlePrismaError } from "@/lib/api-response"

// GET - List public scholarship types (active only)
export async function GET() {
  try {
    const types = await prisma.scholarshipType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: { scholarships: true },
        },
      },
      orderBy: { name: "asc" },
    })

    const formattedTypes = types.map((type) => ({
      ...type,
      scholarshipCount: type._count.scholarships,
    }))

    return successResponse(formattedTypes)
  } catch (error) {
    console.error("Error fetching public scholarship types:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
