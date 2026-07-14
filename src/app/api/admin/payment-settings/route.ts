import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"
import { z } from "zod"

const updateSettingsSchema = z.object({
  defaultGatewayId: z.string().optional(),
  defaultCurrency: z.string().optional(),
  supportedCurrencies: z.array(z.string()).optional(),
  exchangeRateMode: z.enum(["automatic", "manual"]).optional(),
  autoUpdateRates: z.boolean().optional(),
  updateIntervalHours: z.number().optional(),
  paymentTimeout: z.number().optional(),
  retryAttempts: z.number().optional(),
  refundEnabled: z.boolean().optional(),
  refundWindowDays: z.number().optional(),
  webhookEnabled: z.boolean().optional(),
  webhookRetries: z.number().optional(),
  invoicePrefix: z.string().optional(),
  invoiceAutoNumber: z.boolean().optional(),
  receiptEnabled: z.boolean().optional(),
  receiptEmailEnabled: z.boolean().optional(),
  taxEnabled: z.boolean().optional(),
  taxRate: z.number().optional(),
  taxName: z.string().optional(),
  platformFeePercent: z.number().optional(),
  platformFeeFixed: z.number().optional(),
})

// GET - Get payment settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    let settings = await prisma.paymentSettings.findFirst()

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          defaultCurrency: "USD",
          supportedCurrencies: ["NGN", "USD", "EUR", "GBP"],
          exchangeRateMode: "automatic",
          autoUpdateRates: true,
          updateIntervalHours: 24,
          paymentTimeout: 30,
          retryAttempts: 3,
          refundEnabled: true,
          refundWindowDays: 7,
          webhookEnabled: true,
          webhookRetries: 3,
          invoicePrefix: "INV",
          invoiceAutoNumber: true,
          receiptEnabled: true,
          receiptEmailEnabled: true,
        },
      })
    }

    // Get default gateway
    const defaultGateway = settings.defaultGatewayId
      ? await prisma.paymentGateway.findUnique({
          where: { id: settings.defaultGatewayId },
        })
      : await prisma.paymentGateway.findFirst({
          where: { isDefault: true, isEnabled: true },
        })

    // Get all enabled gateways
    const enabledGateways = await prisma.paymentGateway.findMany({
      where: { isEnabled: true },
      orderBy: { priority: "asc" },
    })

    return successResponse({
      ...settings,
      defaultGateway,
      enabledGateways,
    })
  } catch (error) {
    console.error("Error fetching payment settings:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// PATCH - Update payment settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can update payment settings", ErrorCodes.FORBIDDEN, 403)
    }

    const body = await request.json()
    const validatedData = updateSettingsSchema.parse(body)

    let settings = await prisma.paymentSettings.findFirst()

    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: validatedData,
      })
    } else {
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: validatedData,
      })
    }

    return successResponse(settings, "Payment settings updated successfully")
  } catch (error) {
    console.error("Error updating payment settings:", error)
    
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
