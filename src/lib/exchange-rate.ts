/**
 * Exchange Rate Service
 * Provider-agnostic exchange rate fetching with caching
 */

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  timestamp: Date
  source: string
}

export interface ExchangeRateProvider {
  name: string
  fetchRates: (baseCurrency: string) => Promise<Record<string, number>>
}

// Default exchange rates (fallback when providers fail)
const DEFAULT_RATES: Record<string, Record<string, number>> = {
  NGN: { USD: 0.00061 }, // 1 NGN = 0.00061 USD
  USD: { NGN: 1650 },    // 1 USD = 1650 NGN
}

// In-memory cache
let rateCache: Map<string, { rate: number; timestamp: Date }> = new Map()
const CACHE_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// Free exchange rate providers (no API key required)
const FREE_PROVIDERS: ExchangeRateProvider[] = [
  {
    name: 'exchangerate-api',
    fetchRates: async (baseCurrency: string) => {
      const response = await fetch(
        `https://open.er-api.com/v6/latest/${baseCurrency}`,
        { next: { revalidate: 900 } } // Cache for 15 minutes
      )
      if (!response.ok) throw new Error('Failed to fetch rates')
      const data = await response.json()
      if (data.result !== 'success') throw new Error('API returned error')
      return data.rates
    },
  },
  {
    name: 'frankfurter',
    fetchRates: async (baseCurrency: string) => {
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${baseCurrency}`,
        { next: { revalidate: 900 } }
      )
      if (!response.ok) throw new Error('Failed to fetch rates')
      const data = await response.json()
      return data.rates
    },
  },
]

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  from: string,
  to: string,
  providerName?: string
): Promise<ExchangeRate> {
  const cacheKey = `${from}_${to}`
  const now = new Date()

  // Check cache first
  const cached = rateCache.get(cacheKey)
  if (cached && now.getTime() - cached.timestamp.getTime() < CACHE_DURATION_MS) {
    return {
      from,
      to,
      rate: cached.rate,
      timestamp: cached.timestamp,
      source: 'cache',
    }
  }

  // Try providers
  const providers = providerName
    ? FREE_PROVIDERS.filter((p) => p.name === providerName)
    : FREE_PROVIDERS

  for (const provider of providers) {
    try {
      const rates = await provider.fetchRates(from)
      let rate: number

      if (rates[to] !== undefined) {
        rate = rates[to]
      } else if (from === to) {
        rate = 1
      } else {
        // Try reverse conversion
        const reverseRates = await provider.fetchRates(to)
        if (reverseRates[from] !== undefined) {
          rate = 1 / reverseRates[from]
        } else {
          continue // Try next provider
        }
      }

      // Update cache
      rateCache.set(cacheKey, { rate, timestamp: now })

      return {
        from,
        to,
        rate,
        timestamp: now,
        source: provider.name,
      }
    } catch (error) {
      console.warn(`Exchange rate provider ${provider.name} failed:`, error)
      continue
    }
  }

  // Fallback to default rates
  let fallbackRate = DEFAULT_RATES[from]?.[to]
  if (fallbackRate === undefined) {
    fallbackRate = 1 / (DEFAULT_RATES[to]?.[from] || 1)
  }

  return {
    from,
    to,
    rate: fallbackRate || 1,
    timestamp: now,
    source: 'fallback',
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<{ converted: number; rate: ExchangeRate }> {
  const rate = await getExchangeRate(from, to)
  return {
    converted: Number((amount * rate.rate).toFixed(2)),
    rate,
  }
}

/**
 * Get all supported exchange rates for a base currency
 */
export async function getAllRates(
  baseCurrency: string = 'USD'
): Promise<Record<string, number>> {
  const cacheKey = `all_${baseCurrency}`
  const cached = rateCache.get(cacheKey)

  if (cached && new Date().getTime() - cached.timestamp.getTime() < CACHE_DURATION_MS) {
    const cachedRates = rateCache.get(cacheKey + '_rates')
    return cachedRates ? (cachedRates as unknown as Record<string, number>) : { NGN: 1650, USD: 1 }
  }

  try {
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${baseCurrency}`,
      { next: { revalidate: 900 } }
    )
    const data = await response.json()
    const rates = data.rates as Record<string, number>

    rateCache.set(cacheKey, { rate: 1, timestamp: new Date() })
    rateCache.set(cacheKey + '_rates', rates as unknown as { rate: number; timestamp: Date })

    return rates
  } catch (error) {
    console.warn('Failed to fetch all rates, using defaults:', error)
    return {
      NGN: 1650,
      USD: 1,
    }
  }
}

/**
 * Get current exchange rate with provider info
 */
export async function getCurrentRates(): Promise<{
  ngnToUsd: ExchangeRate
  usdToNgn: ExchangeRate
}> {
  const [ngnToUsd, usdToNgn] = await Promise.all([
    getExchangeRate('NGN', 'USD'),
    getExchangeRate('USD', 'NGN'),
  ])

  return { ngnToUsd, usdToNgn }
}

/**
 * Calculate converted price based on pricing mode
 */
export function calculateConvertedPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount
  return Number((amount * exchangeRate).toFixed(2))
}

/**
 * Clear the exchange rate cache
 */
export function clearRateCache(): void {
  rateCache.clear()
}
