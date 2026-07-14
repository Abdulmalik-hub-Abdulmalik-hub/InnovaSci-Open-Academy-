import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"

const updateTypeSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens").optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
})

// GET - Get single scholarship type
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
      ...type,
      scholarshipCount: type._count.scholarships,
    })
  } catch (error) {
    console.error("Error fetching scholarship type:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// PATCH - Update scholarship type
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can update scholarship types", ErrorCodes.FORBIDDEN, 403)
    }

    const body = await request.json()
    const validatedData = updateTypeSchema.parse(body)

    // Check if slug already exists (if updating slug)
    if (validatedData.slug) {
      const existing = await prisma.scholarshipType.findFirst({
        where: {
          slug: validatedData.slug,
          NOT: { id },
        },
      })

      if (existing) {
        return errorResponse("A scholarship type with this slug already exists", ErrorCodes.CONFLICT, 409)
      }
    }

    // Check if name already exists (if updating name)
    if (validatedData.name) {
      const existing = await prisma.scholarshipType.findFirst({
        where: {
          name: validatedData.name,
          NOT: { id },
        },
      })

      if (existing) {
        return errorResponse("A scholarship type with this name already exists", ErrorCodes.CONFLICT, 409)
      }
    }

    const type = await prisma.scholarshipType.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: { scholarships: true },
        },
      },
    })

    return successResponse({
      ...type,
      scholarshipCount: type._count.scholarships,
    }, "Scholarship type updated successfully")
  } catch (error) {
    console.error("Error updating scholarship type:", error)
    
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

// DELETE - Delete scholarship type (only if no scholarships attached)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can delete scholarship types", ErrorCodes.FORBIDDEN, 403)
    }

    // Check if there are scholarships attached to this type
    const scholarshipCount = await prisma.scholarship.count({
      where: { typeId: id },
    })

    if (scholarshipCount > 0) {
      return errorResponse(
        `Cannot delete this scholarship type because it has ${scholarshipCount} scholarship(s) attached. Please reassign or delete them first.`,
        ErrorCodes.CONFLICT,
        409
      )
    }

    await prisma.scholarshipType.delete({
      where: { id },
    })

    return successResponse(null, "Scholarship type deleted successfully")
  } catch (error) {
    console.error("Error deleting scholarship type:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
