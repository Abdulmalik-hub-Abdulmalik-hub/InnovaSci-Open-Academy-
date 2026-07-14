import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, createdResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"

const createGatewaySchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
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
  notes: z.string().optional(),
})

// GET - List all payment gateways
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const { searchParams } = new URL(request.url)
    const includeDisabled = searchParams.get("includeDisabled") === "true"

    const where = includeDisabled ? {} : { isEnabled: true }

    const gateways = await prisma.paymentGateway.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { priority: "asc" }],
      include: {
        _count: {
          select: { transactions: true, configurations: true },
        },
      },
    })

    // Get gateway stats
    const stats = {
      total: gateways.length,
      enabled: gateways.filter((g) => g.isEnabled).length,
      disabled: gateways.filter((g) => !g.isEnabled).length,
      totalTransactions: gateways.reduce((acc, g) => acc + g._count.transactions, 0),
    }

    return successResponse({
      gateways,
      stats,
    })
  } catch (error) {
    console.error("Error fetching payment gateways:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// POST - Create a new payment gateway
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can create payment gateways", ErrorCodes.FORBIDDEN, 403)
    }

    const body = await request.json()
    const validatedData = createGatewaySchema.parse(body)

    // Check if slug already exists
    const existingSlug = await prisma.paymentGateway.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return errorResponse("A gateway with this slug already exists", ErrorCodes.CONFLICT, 409)
    }

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.paymentGateway.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const gateway = await prisma.paymentGateway.create({
      data: validatedData,
    })

    return createdResponse(gateway, "Payment gateway created successfully")
  } catch (error) {
    console.error("Error creating payment gateway:", error)
    
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
