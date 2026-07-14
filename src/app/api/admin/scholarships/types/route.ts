import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, createdResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"

const createTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  orderIndex: z.number().int().optional(),
})

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
      ...type,
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

// POST - Create a new scholarship type
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can create scholarship types", ErrorCodes.FORBIDDEN, 403)
    }

    const body = await request.json()
    const validatedData = createTypeSchema.parse(body)

    // Check if slug already exists
    const existingSlug = await prisma.scholarshipType.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return errorResponse("A scholarship type with this slug already exists", ErrorCodes.CONFLICT, 409)
    }

    // Check if name already exists
    const existingName = await prisma.scholarshipType.findFirst({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return errorResponse("A scholarship type with this name already exists", ErrorCodes.CONFLICT, 409)
    }

    // Get max orderIndex if not provided
    let finalOrderIndex = validatedData.orderIndex
    if (finalOrderIndex === undefined) {
      const maxOrder = await prisma.scholarshipType.aggregate({
        _max: { orderIndex: true },
      })
      finalOrderIndex = (maxOrder._max.orderIndex || 0) + 1
    }

    const scholarshipType = await prisma.scholarshipType.create({
      data: {
        ...validatedData,
        orderIndex: finalOrderIndex,
      },
    })

    return createdResponse(scholarshipType, "Scholarship type created successfully")
  } catch (error) {
    console.error("Error creating scholarship type:", error)
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        error.errors.map((e) => e.message).join(", "),
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }
    
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
