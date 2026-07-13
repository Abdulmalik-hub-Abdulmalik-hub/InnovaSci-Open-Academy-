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
})

// GET - List all scholarship types
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const types = await prisma.scholarshipType.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { scholarships: true },
        },
      },
    })

    const formattedTypes = types.map((type) => ({
      ...type,
      scholarshipCount: type._count.scholarships,
    }))

    return successResponse(formattedTypes)
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
    const existing = await prisma.scholarshipType.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existing) {
      return errorResponse("A scholarship type with this slug already exists", ErrorCodes.CONFLICT, 409)
    }

    const scholarshipType = await prisma.scholarshipType.create({
      data: validatedData,
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
