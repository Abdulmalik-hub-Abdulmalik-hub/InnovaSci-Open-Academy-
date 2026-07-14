import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes } from "@/lib/api-response"

// GET - Get available payment gateways for a country/currency
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")?.toUpperCase()
    const currency = searchParams.get("currency")?.toUpperCase()

    // Get all enabled gateways
    const gateways = await prisma.paymentGateway.findMany({
      where: { isEnabled: true },
      orderBy: { priority: "asc" },
    })

    if (gateways.length === 0) {
      return errorResponse("No payment gateways are currently enabled", ErrorCodes.SERVICE_UNAVAILABLE, 503)
    }

    // If country or currency provided, filter gateways
    let availableGateways = gateways

    if (country || currency) {
      availableGateways = gateways.filter((gateway) => {
        if (country && gateway.supportedCountries.length > 0) {
          if (!gateway.supportedCountries.includes(country)) {
            return false
          }
        }
        if (currency && gateway.supportedCurrencies.length > 0) {
          if (!gateway.supportedCurrencies.includes(currency)) {
            return false
          }
        }
        return true
      })
    }

    if (availableGateways.length === 0) {
      return successResponse({
        available: false,
        message: `No payment gateways available for ${country || ""} ${currency || ""}. Please contact support.`,
        gateways: [],
        defaultGateway: null,
      })
    }

    // Get default gateway
    const defaultGateway = availableGateways.find((g) => g.isDefault) || availableGateways[0]

    // Return public-safe gateway info (no secrets)
    const publicGateways = availableGateways.map((gateway) => ({
      id: gateway.id,
      name: gateway.name,
      provider: gateway.provider,
      slug: gateway.slug,
      iconName: gateway.iconName,
      color: gateway.color,
      supportedCurrencies: gateway.supportedCurrencies,
      supportedCountries: gateway.supportedCountries,
      supportedMethods: gateway.supportedMethods,
      environment: gateway.environment,
    }))

    return successResponse({
      available: true,
      gateways: publicGateways,
      defaultGateway: {
        id: defaultGateway.id,
        name: defaultGateway.name,
        provider: defaultGateway.provider,
        slug: defaultGateway.slug,
        iconName: defaultGateway.iconName,
        color: defaultGateway.color,
      },
    })
  } catch (error) {
    console.error("Error fetching available gateways:", error)
    return errorResponse("Failed to fetch payment gateways", ErrorCodes.INTERNAL_ERROR, 500)
  }
}
