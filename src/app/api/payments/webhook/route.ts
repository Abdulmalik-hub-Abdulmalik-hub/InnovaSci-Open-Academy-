/**
 * Paystack Webhook Handler
 * 
 * POST /api/payments/webhook
 * 
 * Handles Paystack webhook events for:
 * - charge.success
 * - charge.failed
 * - subscription.create
 * - subscription.disable
 * - refund.created
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import crypto from 'crypto'

// Verify Paystack webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY || ''
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Verify webhook signature
    if (!verifySignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(payload)

    console.log('Paystack webhook event:', event.event)

    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data)
        break

      case 'charge.failed':
        await handleChargeFailed(event.data)
        break

      case 'subscription.create':
        await handleSubscriptionCreate(event.data)
        break

      case 'subscription.disable':
        await handleSubscriptionDisable(event.data)
        break

      case 'refund.created':
        await handleRefundCreated(event.data)
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleChargeSuccess(data: any) {
  try {
    const reference = data.reference
    
    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { paystackRef: reference }
    })

    if (!payment) {
      console.log('Payment not found for reference:', reference)
      return
    }

    if (payment.status === 'completed') {
      console.log('Payment already processed:', reference)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        paystackId: data.id?.toString(),
        paystackChannel: data.channel,
        gatewayResponse: data,
      }
    })

    console.log('Payment marked as completed:', reference)
  } catch (error) {
    console.error('Error handling charge.success:', error)
  }
}

async function handleChargeFailed(data: any) {
  try {
    const reference = data.reference
    
    const payment = await prisma.payment.findUnique({
      where: { paystackRef: reference }
    })

    if (!payment) {
      console.log('Payment not found for reference:', reference)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        failedAt: new Date(),
        gatewayResponse: data,
      }
    })

    console.log('Payment marked as failed:', reference)
  } catch (error) {
    console.error('Error handling charge.failed:', error)
  }
}

async function handleSubscriptionCreate(data: any) {
  try {
    const { customer, subscription, plan } = data
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      console.log('User not found for subscription:', customer.email)
      return
    }

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: { 
        paystackSubscriptionCode: subscription.subscription_code 
      },
      update: {
        status: 'active',
        planName: plan?.name || 'PRO',
        isPro: true,
      },
      create: {
        userId: user.id,
        planName: plan?.name || 'PRO',
        status: 'active',
        isPro: true,
        paystackSubscriptionCode: subscription.subscription_code,
        stripeSubscriptionId: null,
        autoRenew: true,
      }
    })

    console.log('Subscription created:', subscription.subscription_code)
  } catch (error) {
    console.error('Error handling subscription.create:', error)
  }
}

async function handleSubscriptionDisable(data: any) {
  try {
    const { subscription } = data
    
    await prisma.subscription.updateMany({
      where: { 
        paystackSubscriptionCode: subscription.subscription_code 
      },
      data: {
        status: 'cancelled',
        autoRenew: false,
      }
    })

    console.log('Subscription disabled:', subscription.subscription_code)
  } catch (error) {
    console.error('Error handling subscription.disable:', error)
  }
}

async function handleRefundCreated(data: any) {
  try {
    const reference = data.refund_ref || data.reference
    
    // Find the original payment
    const payment = await prisma.payment.findUnique({
      where: { paystackRef: reference }
    })

    if (!payment) {
      console.log('Payment not found for refund:', reference)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'refunded',
        refundedAt: new Date(),
      }
    })

    // Handle purchase refunds based on type
    if (payment.type === 'academy_purchase' && payment.academyPurchaseId) {
      await prisma.academyPurchase.update({
        where: { id: payment.academyPurchaseId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
        }
      })

      // Revoke access license
      await prisma.accessLicense.updateMany({
        where: { 
          userId: payment.userId,
          licenseType: 'academy',
          sourceType: 'purchase',
        },
        data: {
          status: 'revoked',
          revokedAt: new Date(),
          revokedReason: 'Refund processed',
        }
      })
    } else if (payment.type === 'domain_purchase' && payment.domainPurchaseId) {
      await prisma.domainPurchase.update({
        where: { id: payment.domainPurchaseId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
        }
      })
    } else if (payment.type === 'category_purchase' && payment.categoryPurchaseId) {
      await prisma.categoryPurchase.update({
        where: { id: payment.categoryPurchaseId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
        }
      })
    }

    console.log('Refund processed for:', reference)
  } catch (error) {
    console.error('Error handling refund.created:', error)
  }
}
