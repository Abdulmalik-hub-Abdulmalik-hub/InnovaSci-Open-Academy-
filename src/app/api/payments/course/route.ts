/**
 * Course Payment API
 * 
 * POST /api/payments/course
 * 
 * Initialize payment for course enrollment.
 * 
 * Body:
 * {
 *   courseId: string,
 *   courseTitle: string,
 *   amount: number (in naira),
 *   email: string,
 *   userId: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeTransaction, toKobo, generatePaymentReference } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, courseTitle, amount, email, userId } = body

    // Validate required fields
    if (!courseId || !amount || !email || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, amount, email, userId' },
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

    // Build metadata for course enrollment
    const metadata = {
      user_id: userId,
      course_id: courseId,
      course_title: courseTitle,
      type: 'course_enrollment',
    }

    // Get callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/payments/success?reference=${reference}&type=course`

    // Initialize Paystack transaction
    const response = await initializeTransaction(
      toKobo(amount), // Convert to kobo
      email,
      metadata,
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
    console.error('Course payment initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize course payment' },
      { status: 500 }
    )
  }
}
