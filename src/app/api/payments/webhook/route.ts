/**
 * Paystack Webhook Handler
 * 
 * POST /api/payments/webhook
 * 
 * This endpoint receives webhook events from Paystack.
 * Configure this URL in your Paystack dashboard under Settings > Webhooks.
 * 
 * Events handled:
 * - charge.success - Payment successful, fulfill the order
 * - charge.failed - Payment failed, handle accordingly
 */

import { NextRequest, NextResponse } from 'next/server'
import { fromKobo } from '@/lib/paystack'

// Type definitions for webhook data
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
interface WebhookMetadata {
  user_id: string
  type: string
  course_id?: string
  reference_id?: string
  plan_id?: string
  [key: string]: unknown
}

interface WebhookData {
  id: number
  domain: string
  amount: number
  currency: string
  reference: string
  status: string
  paid_at: string | null
  created_at: string
  channel: string
  customer: {
    email: string
    customer_code: string
  }
  metadata: WebhookMetadata
  authorization: {
    authorization_code: string
    bank: string
    channel: string
    card_type: string
    reusable: boolean
  }
}

interface WebhookEvent {
  event: string
  data: WebhookData
}

// Store processed events to prevent duplicate processing
const processedEvents = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    // Verify webhook signature
    if (!signature) {
      console.error('Missing Paystack signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // In production, verify the HMAC signature:
    // const crypto = require('crypto')
    // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    //   .update(rawBody)
    //   .digest('hex')
    // if (hash !== signature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    let event: WebhookEvent
    try {
      event = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Check for duplicate event
    const eventId = `${event.event}-${event.data.id}`
    if (processedEvents.has(eventId)) {
      console.log(`Duplicate event ignored: ${eventId}`)
      return NextResponse.json({ received: true, duplicate: true })
    }

    console.log(`Processing Paystack webhook event: ${event.event}`)

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulCharge(event.data)
        break

      case 'charge.failed':
        await handleFailedCharge(event.data)
        break

      case 'transfer.success':
        await handleSuccessfulTransfer(event.data)
        break

      default:
        console.log(`Unhandled event type: ${event.event}`)
    }

    // Mark event as processed
    processedEvents.add(eventId)

    // Clean up old events (keep last 10000)
    if (processedEvents.size > 10000) {
      const toDelete = Array.from(processedEvents).slice(0, 1000)
      toDelete.forEach(id => processedEvents.delete(id))
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Type for valid payment types
type PaymentType = 'course_enrollment' | 'certificate' | 'subscription' | 'one_time'

/**
 * Handle successful payment
 */
async function handleSuccessfulCharge(data: WebhookData) {
  const { amount, reference, customer, metadata, authorization } = data
  
  console.log(`Payment successful: ${reference} - ${fromKobo(amount)} ${data.currency}`)
  console.log(`Customer: ${customer.email}`)
  console.log(`Payment type: ${metadata.type}`)
  console.log(`Authorization: ${authorization.authorization_code}`)

  // Process based on payment type
  const paymentType = metadata.type as PaymentType
  
  switch (paymentType) {
    case 'course_enrollment':
      await fulfillCourseEnrollment({
        reference,
        userId: metadata.user_id,
        courseId: metadata.course_id || '',
        amount: fromKobo(amount),
        customerEmail: customer.email,
        authorizationCode: authorization.authorization_code,
      })
      break

    case 'certificate':
      await fulfillCertificatePurchase({
        reference,
        userId: metadata.user_id,
        certificateId: metadata.reference_id || '',
        amount: fromKobo(amount),
        customerEmail: customer.email,
      })
      break

    case 'subscription':
      await fulfillSubscription({
        reference,
        userId: metadata.user_id,
        planId: metadata.plan_id || '',
        amount: fromKobo(amount),
        customerEmail: customer.email,
        authorizationCode: authorization.authorization_code,
      })
      break

    case 'one_time':
      await fulfillOneTimePayment({
        reference,
        userId: metadata.user_id,
        amount: fromKobo(amount),
        customerEmail: customer.email,
      })
      break

    default:
      console.log(`Unknown payment type: ${metadata.type}`)
  }
}

/**
 * Handle failed payment
 */
async function handleFailedCharge(data: WebhookData) {
  const { reference, metadata, customer } = data
  
  console.log(`Payment failed: ${reference}`)
  console.log(`Customer: ${customer.email}`)
  console.log(`Payment type: ${metadata.type}`)

  // Log the failed payment for support/review
}

/**
 * Handle successful transfer (for refunds)
 */
async function handleSuccessfulTransfer(data: WebhookData) {
  console.log(`Transfer successful: ${data.reference}`)
}

/**
 * Fulfill course enrollment
 */
async function fulfillCourseEnrollment(params: {
  reference: string
  userId: string
  courseId: string
  amount: number
  customerEmail: string
  authorizationCode: string
}) {
  console.log(`Fulfilling course enrollment:`, params)
  // TODO: Implement database operations
}

/**
 * Fulfill certificate purchase
 */
async function fulfillCertificatePurchase(params: {
  reference: string
  userId: string
  certificateId: string
  amount: number
  customerEmail: string
}) {
  console.log(`Fulfilling certificate purchase:`, params)
  // TODO: Implement database operations
}

/**
 * Fulfill subscription
 */
async function fulfillSubscription(params: {
  reference: string
  userId: string
  planId: string
  amount: number
  customerEmail: string
  authorizationCode: string
}) {
  console.log(`Fulfilling subscription:`, params)
  // TODO: Implement database operations
}

/**
 * Fulfill one-time payment
 */
async function fulfillOneTimePayment(params: {
  reference: string
  userId: string
  amount: number
  customerEmail: string
}) {
  console.log(`Fulfilling one-time payment:`, params)
  // TODO: Implement database operations
}
