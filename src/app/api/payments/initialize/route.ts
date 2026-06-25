/**
 * Paystack Payment Initialization API
 * 
 * POST /api/payments/initialize
 * 
 * Body:
 * {
 *   type: 'course' | 'certificate' | 'subscription',
 *   amount: number (in naira),
 *   email: string,
 *   metadata?: object
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeTransaction, toKobo, generatePaymentReference, PaystackMetadata } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, amount, email, metadata = {} } = body

    // Validate required fields
    if (!type || !amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, email' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Generate a unique reference
    const reference = generatePaymentReference()

    // Build metadata
    const paystackMetadata: PaystackMetadata = {
      user_id: (metadata as Record<string, unknown>).user_id as string || '',
      type: type as 'course_enrollment' | 'certificate' | 'subscription' | 'one_time',
      ...metadata,
      payment_type: type,
      original_reference: reference,
    }

    // Get callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/payments/success?reference=${reference}`

    // Initialize Paystack transaction
    const response = await initializeTransaction(
      toKobo(amount), // Convert to kobo
      email,
      paystackMetadata,
      callbackUrl
    )

    if (!response.status) {
      return NextResponse.json(
        { error: response.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: response.data.authorization_url,
      reference: response.data.reference,
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
