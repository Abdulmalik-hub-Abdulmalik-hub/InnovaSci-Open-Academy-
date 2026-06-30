import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';

// Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return { authorized: true } // Demo mode
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        
        if (user && user.role === "ADMIN" && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id }
        }
      }
    }
    
    return { authorized: false, error: "Invalid or expired authentication token" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// GET /api/admin/plans - List all plans
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("activeOnly") === "true"
    const includeSubscriptions = searchParams.get("includeSubscriptions") === "true"

    const where = activeOnly ? { isActive: true } : {}

    // Fetch plans with subscription count if needed
    let plans;
    if (includeSubscriptions) {
      plans = await prisma.plan.findMany({
        where,
        include: {
          subscriptions: {
            select: {
              id: true,
              status: true,
            }
          }
        },
        orderBy: { sortOrder: "asc" },
      })
    } else {
      plans = await prisma.plan.findMany({
        where,
        orderBy: { sortOrder: "asc" },
      })
    }

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      planType: plan.planType,
      billingCycle: plan.billingCycle,
      price: Number(plan.price),
      currency: plan.currency,
      stripePriceId: plan.stripePriceId,
      paystackPlanId: plan.paystackPlanId,
      features: plan.features as string[],
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      discountPercentage: plan.discountPercentage,
      promoCode: plan.promoCode,
      maxCourses: plan.maxCourses,
      maxCertificates: plan.maxCertificates,
      allowedCourseIds: plan.allowedCourseIds,
      trialDays: plan.trialDays,
      sortOrder: plan.sortOrder,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      subscriptionCount: includeSubscriptions && "subscriptions" in plan ? (plan.subscriptions as unknown[])?.length : undefined,
    }))

    return NextResponse.json({
      success: true,
      data: {
        plans: formattedPlans,
      }
    })
  } catch (error) {
    console.error("Get plans error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : "UNKNOWN"
    return NextResponse.json(
      { success: false, error: `Failed to fetch plans: ${errorMessage}`, code: errorCode },
      { status: 500 }
    )
  }
}

// POST /api/admin/plans - Create a new plan
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      name,
      description,
      planType,
      billingCycle,
      price,
      currency,
      features,
      isActive,
      isFeatured,
      discountPercentage,
      promoCode,
      maxCourses,
      maxCertificates,
      allowedCourseIds,
      trialDays,
      sortOrder,
    } = body

    // Validation
    const errors: string[] = []
    
    if (!name || name.trim().length < 2) {
      errors.push("Plan name must be at least 2 characters")
    }
    
    if (!price || price < 0) {
      errors.push("Price must be a positive number")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      )
    }

    const plan = await prisma.plan.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        planType: planType || "subscription",
        billingCycle: billingCycle || "monthly",
        price,
        currency: currency || "USD",
        features: features || [],
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        discountPercentage: discountPercentage || 0,
        promoCode: promoCode?.trim() || null,
        maxCourses: maxCourses ?? -1,
        maxCertificates: maxCertificates ?? -1,
        allowedCourseIds: allowedCourseIds || [],
        trialDays: trialDays || 0,
        sortOrder: sortOrder || 0,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "PLANS",
          userId: auth.userId,
          details: {
            planId: plan.id,
            name: plan.name,
            price: plan.price,
            billingCycle: plan.billingCycle,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        planType: plan.planType,
        billingCycle: plan.billingCycle,
        price: Number(plan.price),
        currency: plan.currency,
        features: plan.features as string[],
        isActive: plan.isActive,
        isFeatured: plan.isFeatured,
        discountPercentage: plan.discountPercentage,
        maxCourses: plan.maxCourses,
        maxCertificates: plan.maxCertificates,
        trialDays: plan.trialDays,
        sortOrder: plan.sortOrder,
        createdAt: plan.createdAt.toISOString(),
      },
      message: "Plan created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create plan error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create plan" },
      { status: 500 }
    )
  }
}