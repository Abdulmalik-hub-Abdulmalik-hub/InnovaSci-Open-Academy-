/**
 * Exchange Rates API
 * GET /api/exchange-rates
 */

import { NextResponse } from 'next/server'
import { getCurrentRates } from '@/lib/exchange-rate'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rates = await getCurrentRates()

    return NextResponse.json({
      success: true,
      rates: {
        ngnToUsd: {
          rate: rates.ngnToUsd.rate,
          source: rates.ngnToUsd.source,
          timestamp: rates.ngnToUsd.timestamp,
        },
        usdToNgn: {
          rate: rates.usdToNgn.rate,
          source: rates.usdToNgn.source,
          timestamp: rates.usdToNgn.timestamp,
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch exchange rates',
      },
      { status: 500 }
    )
  }
}
