/**
 * Paystack Payment Initialization API (Enhanced for Category/Domain/Academy Purchases)
 * 
 * POST /api/payments/initialize
 * 
 * Body:
 * {
 *   scope: 'category' | 'domain' | 'academy',
 *   planId: string (optional),
 *   targetId: string (categoryId, domainId, or null for academy),
 *   amount: number,
 *   currency: 'NGN' | 'USD',
 *   email: string,
 *   couponCode?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { initializeTransaction, toKobo, toCents, generatePaymentReference, PaystackMetadata } from '@/lib/paystack'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      scope, 
      planId, 
      targetId, 
      amount, 
      currency = 'NGN', 
      email, 
      userId,
      couponCode 
    } = body

    // Validate required fields
    if (!scope || !amount || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: scope, amount, email' },
        { status: 400 }
      )
    }

    // Validate scope
    if (!['category', 'domain', 'academy'].includes(scope)) {
      return NextResponse.json(
        { success: false, error: 'Invalid scope. Must be category, domain, or academy' },
        { status: 400 }
      )
    }

    // Validate currency
    const validCurrencies = ['NGN', 'USD']
    if (!validCurrencies.includes(currency.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid currency. Must be NGN or USD' },
        { status: 400 }
      )
    }

    const normalizedCurrency = currency.toUpperCase()

    // Validate amount
    if (amount < 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Validate targetId based on scope
    if (scope === 'category' && !targetId) {
      return NextResponse.json(
        { success: false, error: 'Category purchase requires targetId (categoryId)' },
        { status: 400 }
      )
    }

    if (scope === 'domain' && !targetId) {
      return NextResponse.json(
        { success: false, error: 'Domain purchase requires targetId (domainId)' },
        { status: 400 }
      )
    }

    // Check for existing purchases (prevent duplicates)
    if (userId) {
      if (scope === 'academy') {
        const existingAcademyPurchase = await prisma.academyPurchase.findUnique({
          where: { userId },
        })
        if (existingAcademyPurchase && existingAcademyPurchase.status === 'active') {
          return NextResponse.json(
            { success: false, error: 'You already own the entire Academy' },
            { status: 400 }
          )
        }
      } else if (scope === 'domain') {
        const existingDomainPurchase = await prisma.domainPurchase.findUnique({
          where: {
            userId_domainId: { userId, domainId: targetId }
          }
        })
        if (existingDomainPurchase && existingDomainPurchase.status === 'active') {
          return NextResponse.json(
            { success: false, error: 'You already own this Domain' },
            { status: 400 }
          )
        }
      } else if (scope === 'category') {
        const existingCategoryPurchase = await prisma.categoryPurchase.findUnique({
          where: {
            userId_categoryId: { userId, categoryId: targetId }
          }
        })
        if (existingCategoryPurchase && existingCategoryPurchase.status === 'active') {
          return NextResponse.json(
            { success: false, error: 'You already own this Category' },
            { status: 400 }
          )
        }
      }
    }

    // Fetch plan details if provided
    let planDetails = null
    if (planId) {
      planDetails = await prisma.plan.findUnique({
        where: { id: planId },
        select: {
          id: true,
          name: true,
          purchaseScope: true,
          allowedDomainIds: true,
          allowedCategoryIds: true,
          pricing: true,
        }
      })
    }

    // Validate plan scope matches
    if (planDetails) {
      const planScopeMap: Record<string, string> = { ACADEMY: 'academy', DOMAIN: 'domain', CATEGORY: 'category' }
      const planScope = planScopeMap[planDetails.purchaseScope as keyof typeof planScopeMap]
      
      if (planScope !== scope) {
        return NextResponse.json(
          { success: false, error: `Plan is for ${planScope} scope, but requested ${scope}` },
          { status: 400 }
        )
      }

      // Validate targetId is in allowed list
      if (scope === 'domain' && planDetails.allowedDomainIds.length > 0) {
        if (!planDetails.allowedDomainIds.includes(targetId)) {
          return NextResponse.json(
            { success: false, error: 'This domain is not included in the selected plan' },
            { status: 400 }
          )
        }
      }

      if (scope === 'category' && planDetails.allowedCategoryIds.length > 0) {
        if (!planDetails.allowedCategoryIds.includes(targetId)) {
          return NextResponse.json(
            { success: false, error: 'This category is not included in the selected plan' },
            { status: 400 }
          )
        }
      }
    }

    // Validate target exists and get details
    let targetDetails: any = null
    if (scope === 'category') {
      targetDetails = await prisma.category.findUnique({
        where: { id: targetId },
        include: { domain: true },
      })
      if (!targetDetails) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        )
      }
    } else if (scope === 'domain') {
      targetDetails = await prisma.domain.findUnique({
        where: { id: targetId },
      })
      if (!targetDetails) {
        return NextResponse.json(
          { success: false, error: 'Domain not found' },
          { status: 404 }
        )
      }
    }

    // Validate coupon if provided
    let couponDetails = null
    let finalAmount = amount
    if (couponCode) {
      couponDetails = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      })
      
      if (!couponDetails) {
        return NextResponse.json(
          { success: false, error: 'Invalid coupon code' },
          { status: 400 }
        )
      }

      if (!couponDetails.isActive) {
        return NextResponse.json(
          { success: false, error: 'Coupon is no longer active' },
          { status: 400 }
        )
      }

      if (couponDetails.expiresAt && new Date() > couponDetails.expiresAt) {
        return NextResponse.json(
          { success: false, error: 'Coupon has expired' },
          { status: 400 }
        )
      }

      if (couponDetails.maxUses && couponDetails.currentUses >= couponDetails.maxUses) {
        return NextResponse.json(
          { success: false, error: 'Coupon usage limit reached' },
          { status: 400 }
        )
      }

      // Calculate discount
      if (couponDetails.discountType === 'percentage') {
        finalAmount = amount * (1 - Number(couponDetails.discountValue) / 100)
      } else {
        finalAmount = Math.max(0, amount - Number(couponDetails.discountValue))
      }
    }

    // Generate a unique reference with scope prefix
    const scopePrefix = scope === 'academy' ? 'ACAD' : scope === 'domain' ? 'DOM' : 'CAT'
    const reference = `${scopePrefix}-${generatePaymentReference(normalizedCurrency)}`

    // Build metadata with all purchase info
    const paystackMetadata: PaystackMetadata = {
      user_id: userId || '',
      type: `${scope}_purchase`,
      scope,
      plan_id: planId || '',
      target_id: targetId || '',
      coupon_code: couponCode || '',
      discount_applied: amount - finalAmount,
      original_amount: amount,
      final_amount: finalAmount,
      currency: normalizedCurrency,
      original_reference: reference,
      ...(targetDetails && {
        target_name: targetDetails.name || '',
        domain_id: targetDetails.domainId || targetDetails.id || '',
        domain_name: targetDetails.domain?.name || '',
      }),
    }

    // Get callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/payments/success?reference=${reference}&currency=${normalizedCurrency}`

    // Initialize Paystack transaction
    const formattedAmount = normalizedCurrency === 'NGN' ? toKobo(finalAmount) : toCents(finalAmount)
    
    const response = await initializeTransaction(
      formattedAmount,
      email,
      paystackMetadata,
      callbackUrl
    )

    if (!response.status) {
      return NextResponse.json(
        { success: false, error: response.message },
        { status: 400 }
      )
    }

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId: userId || 'pending',
        type: `${scope}_purchase`,
        status: 'pending',
        amount: finalAmount,
        currency: normalizedCurrency,
        amountInKobo: normalizedCurrency === 'NGN' ? toKobo(finalAmount) : null,
        amountInCents: normalizedCurrency === 'USD' ? toCents(finalAmount) : null,
        paystackRef: response.data.reference,
        metadata: {
          scope,
          planId,
          targetId,
          couponCode,
          originalAmount: amount,
          discountAmount: amount - finalAmount,
          targetDetails: targetDetails ? {
            name: targetDetails.name,
            id: targetDetails.id,
            domainId: targetDetails.domainId || targetDetails.id,
          } : null,
        },
        initiatedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      authorizationUrl: response.data.authorization_url,
      reference: response.data.reference,
      currency: normalizedCurrency,
      amount: finalAmount,
      originalAmount: amount,
      discountApplied: amount - finalAmount,
      scope,
      targetName: targetDetails?.name || 'Entire Academy',
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
