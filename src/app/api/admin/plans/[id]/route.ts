import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
        subscriptions: {
          select: {
            id: true,
            status: true,
            userId: true,
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

    const activeSubscriptions = plan.subscriptions.filter(s => s.status === "active").length

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
        subscriptionCount: plan.subscriptions.length,
        activeSubscriptions,
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

    const existingPlan = await prisma.plan.findUnique({
      where: { id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      )
    }

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingPlan.name,
        description: description !== undefined ? description?.trim() || null : existingPlan.description,
        planType: planType !== undefined ? planType : existingPlan.planType,
        billingCycle: billingCycle !== undefined ? billingCycle : existingPlan.billingCycle,
        price: price !== undefined ? price : existingPlan.price,
        currency: currency !== undefined ? currency : existingPlan.currency,
        features: features !== undefined ? features : existingPlan.features,
        isActive: isActive !== undefined ? isActive : existingPlan.isActive,
        isFeatured: isFeatured !== undefined ? isFeatured : existingPlan.isFeatured,
        discountPercentage: discountPercentage !== undefined ? discountPercentage : existingPlan.discountPercentage,
        promoCode: promoCode !== undefined ? promoCode?.trim() || null : existingPlan.promoCode,
        maxCourses: maxCourses !== undefined ? maxCourses : existingPlan.maxCourses,
        maxCertificates: maxCertificates !== undefined ? maxCertificates : existingPlan.maxCertificates,
        allowedCourseIds: allowedCourseIds !== undefined ? allowedCourseIds : existingPlan.allowedCourseIds,
        trialDays: trialDays !== undefined ? trialDays : existingPlan.trialDays,
        sortOrder: sortOrder !== undefined ? sortOrder : existingPlan.sortOrder,
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
            planId: id,
            name: updatedPlan.name,
            changes: body,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPlan.id,
        name: updatedPlan.name,
        description: updatedPlan.description,
        planType: updatedPlan.planType,
        billingCycle: updatedPlan.billingCycle,
        price: Number(updatedPlan.price),
        currency: updatedPlan.currency,
        features: updatedPlan.features as string[],
        isActive: updatedPlan.isActive,
        isFeatured: updatedPlan.isFeatured,
        discountPercentage: updatedPlan.discountPercentage,
        maxCourses: updatedPlan.maxCourses,
        maxCertificates: updatedPlan.maxCertificates,
        trialDays: updatedPlan.trialDays,
        sortOrder: updatedPlan.sortOrder,
        updatedAt: updatedPlan.updatedAt.toISOString(),
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

// DELETE /api/admin/plans/[id] - Delete (deactivate) plan
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

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { status: "active" },
          select: { id: true }
        }
      }
    })

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      )
    }

    // Check for active subscriptions
    if (plan.subscriptions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete plan with ${plan.subscriptions.length} active subscriptions. Deactivate the plan instead.` 
        },
        { status: 400 }
      )
    }

    // Soft delete by deactivating
    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        isActive: false,
      }
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
            name: plan.name,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Plan deactivated successfully"
    })
  } catch (error) {
    console.error("Delete plan error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 }
    )
  }
}