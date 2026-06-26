/**
 * Paystack Payment Initialization API (Multi-currency)
 * 
 * POST /api/payments/initialize
 * 
 * Body:
 * {
 *   type: 'course' | 'certificate' | 'subscription',
 *   amount: number,
 *   currency: 'NGN' | 'USD',
 *   email: string,
 *   metadata?: object
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeTransaction, toKobo, toCents, generatePaymentReference, PaystackMetadata } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, amount, currency = 'NGN', email, metadata = {} } = body

    // Validate required fields
    if (!type || !amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, email' },
        { status: 400 }
      )
    }

    // Validate currency
    const validCurrencies = ['NGN', 'USD']
    if (!validCurrencies.includes(currency.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid currency. Must be NGN or USD' },
        { status: 400 }
      )
    }

    const normalizedCurrency = currency.toUpperCase()

    // Validate amount
    if (amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Generate a unique reference with currency prefix
    const reference = generatePaymentReference(normalizedCurrency)

    // Build metadata with currency info
    const paystackMetadata: PaystackMetadata = {
      user_id: (metadata as Record<string, unknown>).user_id as string || '',
      type: type as 'course_enrollment' | 'certificate' | 'subscription' | 'one_time',
      ...metadata,
      payment_type: type,
      currency: normalizedCurrency,
      original_reference: reference,
    }

    // Get callback URL with currency
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/payments/success?reference=${reference}&currency=${normalizedCurrency}`

    // Initialize Paystack transaction
    // For USD, we use cents; for NGN, we use kobo
    const formattedAmount = normalizedCurrency === 'NGN' ? toKobo(amount) : toCents(amount)
    
    const response = await initializeTransaction(
      formattedAmount,
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
      currency: normalizedCurrency,
      amount: amount,
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
