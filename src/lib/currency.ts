/**
 * Currency Utility Functions
 * Formatting, helpers, and constants for multi-currency support
 */

// Currency definitions
export interface CurrencyConfig {
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  thousandsSeparator: string
  decimalSeparator: string
  symbolPosition: 'before' | 'after'
  gatewayProvider: 'paystack' | 'stripe' | 'flutterwave' | 'paypal'
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    gatewayProvider: 'paystack',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    gatewayProvider: 'stripe',
  },
}

// Gateway mapping by currency
export const CURRENCY_GATEWAY: Record<string, string> = {
  NGN: 'paystack',
  USD: 'stripe',
}

// Get gateway for a currency
export function getGatewayForCurrency(currency: string): string {
  return CURRENCY_GATEWAY[currency] || 'paystack'
}

// Format amount with currency symbol
export function formatCurrency(
  amount: number | string,
  currencyCode: string = 'USD',
  options?: {
    showSymbol?: boolean
    showCode?: boolean
    locale?: string
  }
): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD

  const { showSymbol = true, showCode = false, locale = 'en-US' } = options || {}

  // Format the number
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(amountNum)

  let result = ''

  if (showSymbol) {
    result = currency.symbolPosition === 'before'
      ? `${currency.symbol}${formatted}`
      : `${formatted}${currency.symbol}`
  } else {
    result = formatted
  }

  if (showCode && currencyCode !== 'USD') {
    result += ` ${currencyCode}`
  }

  return result
}

// Format amount without symbol (just number)
export function formatAmount(amount: number | string, currencyCode: string = 'USD'): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(amountNum)
}

// Get currency symbol
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES[currencyCode]?.symbol || '$'
}

// Get currency config
export function getCurrencyConfig(currencyCode: string): CurrencyConfig | undefined {
  return CURRENCIES[currencyCode]
}

// Check if currency is supported
export function isSupportedCurrency(currencyCode: string): boolean {
  return currencyCode in CURRENCIES
}

// Get all supported currencies
export function getSupportedCurrencies(): string[] {
  return Object.keys(CURRENCIES)
}

// Pricing display helper
export interface PriceDisplay {
  ngn?: number
  usd?: number
  display: string
  primary: string
  hasMultiple: boolean
}

export function getPriceDisplay(
  plan: {
    supportedCurrencies?: string[]
    pricingMode?: string
    ngnPrice?: number | string | null
    usdPrice?: number | string | null
    generatedNgnPrice?: number | string | null
    generatedUsdPrice?: number | string | null
  },
  options?: {
    preferredCurrency?: string
    showBoth?: boolean
  }
): PriceDisplay {
  const supported = plan.supportedCurrencies || ['NGN']
  const hasNgn = supported.includes('NGN')
  const hasUsd = supported.includes('USD')

  const ngnAmount = plan.ngnPrice ? parseFloat(String(plan.ngnPrice)) : null
  const usdAmount = plan.usdPrice ? parseFloat(String(plan.usdPrice)) : null

  const preferred = options?.preferredCurrency || (hasNgn ? 'NGN' : 'USD')

  let display = ''
  let primary = ''
  const hasMultiple = hasNgn && hasUsd

  if (hasMultiple && options?.showBoth) {
    // Show both currencies
    const ngnFormatted = ngnAmount ? formatCurrency(ngnAmount, 'NGN') : ''
    const usdFormatted = usdAmount ? formatCurrency(usdAmount, 'USD') : ''

    if (preferred === 'NGN') {
      display = `${ngnFormatted} / ${usdFormatted}`
      primary = ngnFormatted
    } else {
      display = `${usdFormatted} / ${ngnFormatted}`
      primary = usdFormatted
    }
  } else {
    // Show primary currency
    if (preferred === 'NGN' && hasNgn && ngnAmount) {
      primary = formatCurrency(ngnAmount, 'NGN')
      display = primary
      if (hasUsd && usdAmount) {
        display += ` or ${formatCurrency(usdAmount, 'USD')}`
      }
    } else if (hasUsd && usdAmount) {
      primary = formatCurrency(usdAmount, 'USD')
      display = primary
      if (hasNgn && ngnAmount) {
        display += ` or ${formatCurrency(ngnAmount, 'NGN')}`
      }
    } else if (hasNgn && ngnAmount) {
      primary = formatCurrency(ngnAmount, 'NGN')
      display = primary
    } else if (hasUsd && usdAmount) {
      primary = formatCurrency(usdAmount, 'USD')
      display = primary
    }
  }

  return {
    ngn: ngnAmount || undefined,
    usd: usdAmount || undefined,
    display,
    primary,
    hasMultiple,
  }
}

// Get effective price for a currency
export function getEffectivePrice(
  plan: {
    supportedCurrencies?: string[]
    pricingMode?: string
    ngnPrice?: number | string | null
    usdPrice?: number | string | null
    generatedNgnPrice?: number | string | null
    generatedUsdPrice?: number | string | null
  },
  currency: string
): number | null {
  const supported = plan.supportedCurrencies || ['NGN']

  if (!supported.includes(currency)) {
    return null
  }

  if (currency === 'NGN') {
    const manualPrice = plan.ngnPrice ? parseFloat(String(plan.ngnPrice)) : null
    const generatedPrice = plan.generatedNgnPrice ? parseFloat(String(plan.generatedNgnPrice)) : null
    // In MANUAL/HYBRID mode, prefer manual price
    return manualPrice || generatedPrice
  }

  if (currency === 'USD') {
    const manualPrice = plan.usdPrice ? parseFloat(String(plan.usdPrice)) : null
    const generatedPrice = plan.generatedUsdPrice ? parseFloat(String(plan.generatedUsdPrice)) : null
    return manualPrice || generatedPrice
  }

  return null
}

// Convert kobo to naira (Paystack uses kobo)
export function fromKobo(kobo: number): number {
  return kobo / 100
}

// Convert to kobo for Paystack
export function toKobo(naira: number): number {
  return Math.round(naira * 100)
}

// Get currency for display based on user preference
export function getDisplayCurrency(
  supportedCurrencies: string[],
  userPreference?: string,
  defaultCurrency?: string
): string {
  // If user has a preference and it's supported
  if (userPreference && supportedCurrencies.includes(userPreference)) {
    return userPreference
  }

  // If default is supported
  if (defaultCurrency && supportedCurrencies.includes(defaultCurrency)) {
    return defaultCurrency
  }

  // Return first supported currency
  return supportedCurrencies[0] || 'USD'
}

// Price comparison helper
export function comparePrices(
  amount1: number,
  currency1: string,
  amount2: number,
  currency2: string
): 'cheaper' | 'expensive' | 'equal' {
  // Convert to USD for comparison
  const usdRate = currency1 === 'USD' ? 1 : (1 / 1650) // Rough estimate
  const usdAmount1 = amount1 * usdRate

  const usdRate2 = currency2 === 'USD' ? 1 : (1 / 1650)
  const usdAmount2 = amount2 * usdRate2

  const diff = usdAmount1 - usdAmount2

  if (Math.abs(diff) < 0.01) return 'equal'
  return diff < 0 ? 'cheaper' : 'expensive'
}

// Default exchange rate (used when API fails)
export const DEFAULT_EXCHANGE_RATE = 1650 // 1 USD = 1650 NGN

export function getExchangeRateDisplay(from: string, to: string, rate: number): string {
  if (from === to) return '1:1'

  if (from === 'USD' && to === 'NGN') {
    return `1 USD = ${formatAmount(rate, 'NGN')} NGN`
  }

  if (from === 'NGN' && to === 'USD') {
    return `1 NGN = $${formatAmount(rate, 'USD')}`
  }

  return `1 ${from} = ${formatAmount(rate, to)} ${to}`
}
