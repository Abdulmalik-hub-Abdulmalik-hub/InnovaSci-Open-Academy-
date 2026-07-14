import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"

const updateGatewaySchema = z.object({
  name: z.string().min(1).optional(),
  provider: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  isEnabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  environment: z.enum(["sandbox", "production"]).optional(),
  logoUrl: z.string().optional(),
  iconName: z.string().optional(),
  color: z.string().optional(),
  publicKey: z.string().optional(),
  secretKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  supportedCurrencies: z.array(z.string()).optional(),
  supportedCountries: z.array(z.string()).optional(),
  supportedMethods: z.array(z.string()).optional(),
  transactionFeePercent: z.number().optional(),
  transactionFeeFixed: z.number().optional(),
  currency: z.string().optional(),
  priority: z.number().optional(),
  healthStatus: z.string().optional(),
  healthMessage: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
})

// GET - Get single payment gateway
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

    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactions: true, configurations: true, logs: true },
        },
        configurations: {
          orderBy: { priority: "asc" },
        },
      },
    })

    if (!gateway) {
      return errorResponse("Payment gateway not found", ErrorCodes.NOT_FOUND, 404)
    }

    return successResponse(gateway)
  } catch (error) {
    console.error("Error fetching payment gateway:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// PATCH - Update payment gateway
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can update payment gateways", ErrorCodes.FORBIDDEN, 403)
    }

    const body = await request.json()
    const validatedData = updateGatewaySchema.parse(body)

    // Check if gateway exists
    const existing = await prisma.paymentGateway.findUnique({
      where: { id },
    })

    if (!existing) {
      return errorResponse("Payment gateway not found", ErrorCodes.NOT_FOUND, 404)
    }

    // Check slug uniqueness if changing
    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const slugExists = await prisma.paymentGateway.findFirst({
        where: { slug: validatedData.slug, NOT: { id } },
      })
      if (slugExists) {
        return errorResponse("A gateway with this slug already exists", ErrorCodes.CONFLICT, 409)
      }
    }

    // If setting as default, unset other defaults
    if (validatedData.isDefault === true) {
      await prisma.paymentGateway.updateMany({
        where: { isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
    }

    const gateway = await prisma.paymentGateway.update({
      where: { id },
      data: validatedData,
    })

    return successResponse(gateway, "Payment gateway updated successfully")
  } catch (error) {
    console.error("Error updating payment gateway:", error)
    
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

// DELETE - Delete payment gateway
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can delete payment gateways", ErrorCodes.FORBIDDEN, 403)
    }

    // Check if gateway exists
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    if (!gateway) {
      return errorResponse("Payment gateway not found", ErrorCodes.NOT_FOUND, 404)
    }

    // Check if gateway has transactions
    if (gateway._count.transactions > 0) {
      return errorResponse(
        `Cannot delete gateway with ${gateway._count.transactions} transactions. Consider disabling it instead.`,
        ErrorCodes.CONFLICT,
        409
      )
    }

    await prisma.paymentGateway.delete({
      where: { id },
    })

    return successResponse(null, "Payment gateway deleted successfully")
  } catch (error) {
    console.error("Error deleting payment gateway:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
