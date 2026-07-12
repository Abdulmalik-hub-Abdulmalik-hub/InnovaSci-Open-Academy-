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

// GET /api/admin/plans/[id] - Get single plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            categoryPurchases: true,
            domainPurchases: true,
            academyPurchases: true,
            subscriptions: true,
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...plan,
        purchaseScope: plan.purchaseScope || 'CATEGORY',
        subscriptionCount: plan._count.categoryPurchases + plan._count.domainPurchases + plan._count.academyPurchases + plan._count.subscriptions,
      }
    })
  } catch (error) {
    console.error("Get plan error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch plan" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/plans/[id] - Update plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params
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

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      )
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name: name?.trim() || existingPlan.name,
        description: description?.trim() || existingPlan.description,
        planType: planType || existingPlan.planType,
        billingCycle: billingCycle || existingPlan.billingCycle,
        purchaseScope: purchaseScope || existingPlan.purchaseScope,
        allowedDomainIds: allowedDomainIds ?? existingPlan.allowedDomainIds,
        allowedCategoryIds: allowedCategoryIds ?? existingPlan.allowedCategoryIds,
        price: price !== undefined ? price : existingPlan.price,
        currency: currency || existingPlan.currency,
        pricing: pricing !== undefined ? pricing : existingPlan.pricing,
        features: features ?? existingPlan.features,
        isActive: isActive ?? existingPlan.isActive,
        isFeatured: isFeatured ?? existingPlan.isFeatured,
        isPopular: isPopular ?? existingPlan.isPopular,
        isRecommended: isRecommended ?? existingPlan.isRecommended,
        discountPercentage: discountPercentage ?? existingPlan.discountPercentage,
        promoCode: promoCode?.trim() || existingPlan.promoCode,
        maxCourses: maxCourses ?? existingPlan.maxCourses,
        maxCertificates: maxCertificates ?? existingPlan.maxCertificates,
        trialDays: trialDays ?? existingPlan.trialDays,
        sortOrder: sortOrder ?? existingPlan.sortOrder,
        icon: icon !== undefined ? icon : existingPlan.icon,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : existingPlan.bannerUrl,
        themeColor: themeColor !== undefined ? themeColor : existingPlan.themeColor,
        status: status || existingPlan.status,
        visibility: visibility || existingPlan.visibility,
        seoTitle: seoTitle?.trim() || existingPlan.seoTitle,
        seoDescription: seoDescription?.trim() || existingPlan.seoDescription,
      }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "PLANS",
          userId: auth.userId,
          details: {
            planId: plan.id,
            name: plan.name,
            purchaseScope: plan.purchaseScope,
            price: plan.price,
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
        updatedAt: plan.updatedAt.toISOString(),
      },
      message: "Plan updated successfully"
    })
  } catch (error) {
    console.error("Update plan error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update plan" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/plans/[id] - Delete plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            categoryPurchases: true,
            domainPurchases: true,
            academyPurchases: true,
          }
        }
      }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      )
    }

    // Check if plan has purchases
    const totalPurchases = existingPlan._count.categoryPurchases + 
                           existingPlan._count.domainPurchases + 
                           existingPlan._count.academyPurchases

    if (totalPurchases > 0) {
      // Instead of deleting, archive the plan
      await prisma.plan.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          isActive: false,
        }
      })

      return NextResponse.json({
        success: true,
        message: `Plan has ${totalPurchases} existing purchases. Plan has been archived instead of deleted.`,
        archived: true,
      })
    }

    // Delete the plan
    await prisma.plan.delete({
      where: { id }
    })

    // Log to audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "PLANS",
          userId: auth.userId,
          details: {
            planId: id,
            name: existingPlan.name,
            purchaseScope: existingPlan.purchaseScope,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully"
    })
  } catch (error) {
    console.error("Delete plan error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 }
    )
  }
}
