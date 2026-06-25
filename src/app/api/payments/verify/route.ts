/**
 * Paystack Payment Verification API
 * 
 * GET /api/payments/verify?reference=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyTransaction, fromKobo } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    // Verify with Paystack
    const response = await verifyTransaction(reference)

    if (!response.status) {
      return NextResponse.json(
        { error: response.message },
        { status: 400 }
      )
    }

    const transaction = response.data

    // Return standardized response
    return NextResponse.json({
      success: transaction.status === 'success',
      reference: transaction.reference,
      amount: fromKobo(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      paidAt: transaction.paid_at,
      customer: {
        email: transaction.customer.email,
      },
      metadata: transaction.metadata,
      channel: transaction.channel,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
