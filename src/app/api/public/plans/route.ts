/**
 * Public Plans API
 * 
 * GET /api/public/plans
 * 
 * Returns all published plans with their purchase scope information
 * Used by the Membership page and Course pages
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') // ACADEMY, DOMAIN, CATEGORY
    const categoryId = searchParams.get('categoryId')
    const domainId = searchParams.get('domainId')

    const where: any = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      isActive: true,
    }

    // Filter by scope
    if (scope) {
      where.purchaseScope = scope
    }

    // Filter plans by category/domain if specified
    if (categoryId) {
      where.allowedCategoryIds = { has: categoryId }
    }
    if (domainId) {
      where.allowedDomainIds = { has: domainId }
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        planType: true,
        billingCycle: true,
        purchaseScope: true,
        allowedDomainIds: true,
        allowedCategoryIds: true,
        price: true,
        currency: true,
        pricing: true,
        features: true,
        isActive: true,
        isFeatured: true,
        isPopular: true,
        isRecommended: true,
        status: true,
        visibility: true,
        discountPercentage: true,
        icon: true,
        bannerUrl: true,
        themeColor: true,
        seoTitle: true,
        seoDescription: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Get domain and category details
    const domainIds = [...new Set(plans.flatMap(p => p.allowedDomainIds))]
    const categoryIds = [...new Set(plans.flatMap(p => p.allowedCategoryIds))]

    const [domains, categories] = await Promise.all([
      prisma.domain.findMany({
        where: { id: { in: domainIds } },
        select: { id: true, name: true, slug: true, icon: true, color: true }
      }),
      prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true, slug: true, icon: true, domainId: true }
      }),
    ])

    const formattedPlans = plans.map(plan => ({
      ...plan,
      purchaseScope: plan.purchaseScope || 'CATEGORY',
      domains: plan.allowedDomainIds.map(id => domains.find(d => d.id === id)).filter(Boolean),
      categories: plan.allowedCategoryIds.map(id => categories.find(c => c.id === id)).filter(Boolean),
    }))

    return NextResponse.json({
      success: true,
      data: {
        plans: formattedPlans,
        domains,
        categories,
      }
    })
  } catch (error) {
    console.error('Get public plans error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
