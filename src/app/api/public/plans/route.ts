import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/plans - List active pricing plans for membership page
export async function GET() {
  const endpoint = "/api/public/plans"
  const method = "GET"
  
  try {
    // Check database connection first
    if (!process.env.DATABASE_URL) {
      console.error(`[${endpoint}] DATABASE_URL not configured`)
      return NextResponse.json(
        { 
          success: false, 
          error: "Database configuration missing",
          code: "DATABASE_NOT_READY"
        },
        { status: 503 }
      )
    }

    let plans: any[] = []
    
    try {
      plans = await prisma.plan.findMany({
        where: { 
          isActive: true
        },
        orderBy: { sortOrder: "asc" }
      })
    } catch (dbError) {
      console.error(`[${endpoint}] Database query failed:`, dbError)
      return NextResponse.json({
        success: true,
        data: { plans: [] },
        warning: "Could not fetch plans from database"
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        plans: plans.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          planType: p.planType,
          billingCycle: p.billingCycle,
          price: Number(p.price),
          currency: p.currency,
          pricing: p.pricing,
          features: p.features as string[],
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          discountPercentage: p.discountPercentage,
          maxCourses: p.maxCourses,
          maxCertificates: p.maxCertificates,
          allowedCourseIds: p.allowedCourseIds,
          trialDays: p.trialDays,
          sortOrder: p.sortOrder,
          createdAt: p.createdAt.toISOString(),
        }))
      }
    })
  } catch (error) {
    console.error(`[${endpoint}] [${method}] Unexpected error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch plans",
      code: "INTERNAL_ERROR",
      data: []
    }, { status: 500 })
  }
}
