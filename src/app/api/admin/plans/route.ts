import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
    const scope = searchParams.get("scope") // ACADEMY, DOMAIN, CATEGORY

    const where: any = {}
    
    if (activeOnly) {
      where.isActive = true
      where.status = 'PUBLISHED'
    }
    
    if (scope) {
      where.purchaseScope = scope
    }

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
          },
          _count: {
            select: {
              categoryPurchases: true,
              domainPurchases: true,
              academyPurchases: true,
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
      purchaseScope: plan.purchaseScope || 'CATEGORY',
      allowedDomainIds: plan.allowedDomainIds || [],
      allowedCategoryIds: plan.allowedCategoryIds || [],
      price: Number(plan.price),
      currency: plan.currency,
      pricing: plan.pricing,
      features: plan.features as string[] || [],
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      isPopular: plan.isPopular,
      isRecommended: plan.isRecommended,
      status: plan.status,
      visibility: plan.visibility,
      discountPercentage: plan.discountPercentage,
      icon: plan.icon,
      bannerUrl: plan.bannerUrl,
      themeColor: plan.themeColor,
      seoTitle: plan.seoTitle,
      seoDescription: plan.seoDescription,
      sortOrder: plan.sortOrder,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      subscriptionCount: includeSubscriptions && "subscriptions" in plan ? (plan.subscriptions as unknown[])?.length || 0 : 
                         includeSubscriptions ? (plan as any)._count?.categoryPurchases + (plan as any)._count?.domainPurchases + (plan as any)._count?.academyPurchases : undefined,
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
    return NextResponse.json(
      { success: false, error: `Failed to fetch plans: ${errorMessage}` },
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
      purchaseScope,
      allowedDomainIds,
      allowedCategoryIds,
      price,
      currency,
      pricing,
      features,
      isActive,
      isFeatured,
      isPopular,
      isRecommended,
      discountPercentage,
      promoCode,
      maxCourses,
      maxCertificates,
      trialDays,
      sortOrder,
      icon,
      bannerUrl,
      themeColor,
      status,
      visibility,
      seoTitle,
      seoDescription,
    } = body

    // Validation
    const errors: string[] = []
    
    if (!name || name.trim().length < 2) {
      errors.push("Plan name must be at least 2 characters")
    }
    
    if (price !== undefined && price < 0) {
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
        planType: planType || "one_time",
        billingCycle: billingCycle || "lifetime",
        purchaseScope: purchaseScope || "CATEGORY",
        allowedDomainIds: allowedDomainIds || [],
        allowedCategoryIds: allowedCategoryIds || [],
        price: price || 0,
        currency: currency || "USD",
        pricing: pricing || null,
        features: features || [],
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isPopular: isPopular ?? false,
        isRecommended: isRecommended ?? false,
        discountPercentage: discountPercentage || 0,
        promoCode: promoCode?.trim() || null,
        maxCourses: maxCourses ?? -1,
        maxCertificates: maxCertificates ?? -1,
        trialDays: trialDays || 0,
        sortOrder: sortOrder || 0,
        icon: icon || null,
        bannerUrl: bannerUrl || null,
        themeColor: themeColor || null,
        status: status || "PUBLISHED",
        visibility: visibility || "PUBLIC",
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
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
            purchaseScope: plan.purchaseScope,
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
        purchaseScope: plan.purchaseScope,
        allowedDomainIds: plan.allowedDomainIds,
        allowedCategoryIds: plan.allowedCategoryIds,
        price: Number(plan.price),
        currency: plan.currency,
        pricing: plan.pricing,
        features: plan.features as string[],
        isActive: plan.isActive,
        isFeatured: plan.isFeatured,
        isPopular: plan.isPopular,
        isRecommended: plan.isRecommended,
        status: plan.status,
        visibility: plan.visibility,
        discountPercentage: plan.discountPercentage,
        sortOrder: plan.sortOrder,
        icon: plan.icon,
        themeColor: plan.themeColor,
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
