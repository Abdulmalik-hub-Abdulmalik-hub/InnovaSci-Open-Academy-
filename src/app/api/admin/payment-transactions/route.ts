import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"

// GET - List payment transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return errorResponse("Unauthorized", ErrorCodes.UNAUTHORIZED, 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const gatewayId = searchParams.get("gatewayId")
    const purchaseType = searchParams.get("purchaseType")
    const search = searchParams.get("search")
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")

    // Build where clause
    const where: any = {}
    
    if (status) where.status = status
    if (gatewayId) where.gatewayId = gatewayId
    if (purchaseType) where.purchaseType = purchaseType
    
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { gatewayRef: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
      ]
    }
    
    if (fromDate || toDate) {
      where.createdAt = {}
      if (fromDate) where.createdAt.gte = new Date(fromDate)
      if (toDate) where.createdAt.lte = new Date(toDate)
    }

    // Get total count
    const total = await prisma.paymentTransaction.count({ where })

    // Get transactions
    const transactions = await prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        gateway: {
          select: {
            id: true,
            name: true,
            provider: true,
            color: true,
          },
        },
      },
    })

    // Get statistics
    const [totalRevenue, successCount, failedCount, pendingCount] = await Promise.all([
      prisma.paymentTransaction.aggregate({
        where: { status: "success" },
        _sum: { amount: true },
      }),
      prisma.paymentTransaction.count({ where: { ...where, status: "success" } }),
      prisma.paymentTransaction.count({ where: { ...where, status: "failed" } }),
      prisma.paymentTransaction.count({ where: { ...where, status: "pending" } }),
    ])

    // Revenue by gateway
    const revenueByGateway = await prisma.paymentTransaction.groupBy({
      by: ["gatewayId"],
      where: { status: "success" },
      _sum: { amount: true },
      _count: true,
    })

    const gatewayIds = revenueByGateway.map((r) => r.gatewayId)
    const gateways = await prisma.paymentGateway.findMany({
      where: { id: { in: gatewayIds } },
      select: { id: true, name: true, color: true },
    })

    const revenueData = revenueByGateway.map((r) => {
      const gateway = gateways.find((g) => g.id === r.gatewayId)
      return {
        gatewayId: r.gatewayId,
        gatewayName: gateway?.name || "Unknown",
        gatewayColor: gateway?.color || "#6B7280",
        totalAmount: r._sum.amount || 0,
        transactionCount: r._count,
      }
    })

    // Revenue by currency
    const revenueByCurrency = await prisma.paymentTransaction.groupBy({
      by: ["currency"],
      where: { status: "success" },
      _sum: { amount: true },
      _count: true,
    })

    // Revenue by status
    const revenueByStatus = await prisma.paymentTransaction.groupBy({
      by: ["status"],
      _count: true,
    })

    return successResponse({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalRevenue: totalRevenue._sum.amount || 0,
        successCount,
        failedCount,
        pendingCount,
        totalCount: total,
      },
      revenueByGateway: revenueData,
      revenueByCurrency: revenueByCurrency.map((r) => ({
        currency: r.currency,
        totalAmount: r._sum.amount || 0,
        transactionCount: r._count,
      })),
      revenueByStatus: revenueByStatus.map((r) => ({
        status: r.status,
        count: r._count,
      })),
    })
  } catch (error) {
    console.error("Error fetching payment transactions:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
