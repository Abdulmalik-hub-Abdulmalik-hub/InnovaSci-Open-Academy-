// Country and Location Data Library
// Export all country-related utilities and data

export * from './countries'
export * from './states'

import { countries, getCountryByCode, searchCountries, currencySymbols, formatPrice } from './countries'
import { getStatesByCountry, getCitiesByState, hasStates, hasCities } from './states'

// Localization Service
export interface LocalizationSettings {
  country: string
  countryCode: string
  state: string
  city: string
  postalCode: string
  streetAddress: string
  phone: string
  currency: string
  currencySymbol: string
  language: string
  timezone: string
  preferredGateway: string
}

export interface GatewayInfo {
  id: string
  name: string
  icon: string
  available: boolean
}

// Get localization settings for a country
export function getLocalizationForCountry(countryCode: string): LocalizationSettings | null {
  const country = getCountryByCode(countryCode)
  if (!country) return null

  return {
    country: country.name,
    countryCode: country.code,
    state: "",
    city: "",
    postalCode: "",
    streetAddress: "",
    phone: "",
    currency: country.currency,
    currencySymbol: country.currencySymbol,
    language: country.language,
    timezone: country.timezone,
    preferredGateway: country.paymentGateways[0] || "stripe",
  }
}

// Get available payment gateways for a country
export function getAvailableGateways(countryCode: string): GatewayInfo[] {
  const country = getCountryByCode(countryCode)
  if (!country) return []

  const allGateways = [
    { id: "stripe", name: "Stripe", icon: "CreditCard" },
    { id: "paystack", name: "Paystack", icon: "Wallet" },
    { id: "flutterwave", name: "Flutterwave", icon: "Globe" },
    { id: "paypal", name: "PayPal", icon: "DollarSign" },
    { id: "razorpay", name: "Razorpay", icon: "Rupee" },
    { id: "mpesa", name: "M-Pesa", icon: "Smartphone" },
    { id: "alipay", name: "Alipay", icon: "Globe" },
    { id: "wechat", name: "WeChat Pay", icon: "MessageCircle" },
    { id: "gcash", name: "GCash", icon: "Smartphone" },
    { id: "bank_transfer", name: "Bank Transfer", icon: "Building" },
  ]

  return allGateways.map(gateway => ({
    ...gateway,
    available: country.paymentGateways.includes(gateway.id)
  }))
}

// Convert price between currencies
export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount
  
  const fromRate = exchangeRates[fromCurrency] || 1
  const toRate = exchangeRates[toCurrency] || 1
  
  // Convert to base currency (USD), then to target currency
  const inUSD = amount / fromRate
  return inUSD * toRate
}

// Get display price with proper formatting
export function getDisplayPrice(
  amount: number,
  currency: string,
  options?: {
    exchangeRates?: Record<string, number>
    showCurrency?: boolean
    decimals?: number
  }
): string {
  const symbol = currencySymbols[currency] || currency
  
  if (options?.exchangeRates) {
    // If exchange rates provided, format with proper decimal places
    const decimals = options?.decimals ?? (currency === 'JPY' || currency === 'KRW' ? 0 : 2)
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`
  }
  
  return formatPrice(amount, currency)
}

// Validate phone number format
export function validatePhoneNumber(phone: string, countryCode: string): boolean {
  const country = getCountryByCode(countryCode)
  if (!country) return true // Skip validation if country not found
  
  // Remove any non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Basic validation: should start with + and have reasonable length
  if (!cleaned.startsWith('+')) return false
  if (cleaned.length < 8 || cleaned.length > 15) return false
  
  return true
}

// Format phone number with country code
export function formatPhoneNumber(phone: string, countryCode: string): string {
  const country = getCountryByCode(countryCode)
  if (!country) return phone
  
  // If phone doesn't start with +, prepend country calling code
  if (!phone.startsWith('+')) {
    return `${country.callingCode}${phone.replace(/^\+/, '')}`
  }
  
  return phone
}

// Get timezone options
export function getTimezoneOptions(): { value: string; label: string }[] {
  return [
    { value: "Africa/Lagos", label: "Africa - Lagos (WAT)" },
    { value: "Africa/Johannesburg", label: "Africa - Johannesburg (SAST)" },
    { value: "Africa/Nairobi", label: "Africa - Nairobi (EAT)" },
    { value: "Africa/Cairo", label: "Africa - Cairo (EET)" },
    { value: "America/New_York", label: "Americas - New York (EST)" },
    { value: "America/Los_Angeles", label: "Americas - Los Angeles (PST)" },
    { value: "America/Chicago", label: "Americas - Chicago (CST)" },
    { value: "America/Denver", label: "Americas - Denver (MST)" },
    { value: "America/Toronto", label: "Americas - Toronto (EST)" },
    { value: "America/Vancouver", label: "Americas - Vancouver (PST)" },
    { value: "America/Sao_Paulo", label: "Americas - São Paulo (BRT)" },
    { value: "America/Mexico_City", label: "Americas - Mexico City (CST)" },
    { value: "America/Buenos_Aires", label: "Americas - Buenos Aires (ART)" },
    { value: "Europe/London", label: "Europe - London (GMT)" },
    { value: "Europe/Paris", label: "Europe - Paris (CET)" },
    { value: "Europe/Berlin", label: "Europe - Berlin (CET)" },
    { value: "Europe/Madrid", label: "Europe - Madrid (CET)" },
    { value: "Europe/Rome", label: "Europe - Rome (CET)" },
    { value: "Europe/Amsterdam", label: "Europe - Amsterdam (CET)" },
    { value: "Europe/Brussels", label: "Europe - Brussels (CET)" },
    { value: "Europe/Zurich", label: "Europe - Zurich (CET)" },
    { value: "Europe/Stockholm", label: "Europe - Stockholm (CET)" },
    { value: "Europe/Oslo", label: "Europe - Oslo (CET)" },
    { value: "Europe/Copenhagen", label: "Europe - Copenhagen (CET)" },
    { value: "Europe/Helsinki", label: "Europe - Helsinki (EET)" },
    { value: "Europe/Athens", label: "Europe - Athens (EET)" },
    { value: "Europe/Moscow", label: "Europe - Moscow (MSK)" },
    { value: "Europe/Istanbul", label: "Europe - Istanbul (TRT)" },
    { value: "Asia/Dubai", label: "Asia - Dubai (GST)" },
    { value: "Asia/Riyadh", label: "Asia - Riyadh (AST)" },
    { value: "Asia/Kolkata", label: "Asia - Mumbai/Delhi (IST)" },
    { value: "Asia/Singapore", label: "Asia - Singapore (SGT)" },
    { value: "Asia/Hong_Kong", label: "Asia - Hong Kong (HKT)" },
    { value: "Asia/Shanghai", label: "Asia - Shanghai (CST)" },
    { value: "Asia/Tokyo", label: "Asia - Tokyo (JST)" },
    { value: "Asia/Seoul", label: "Asia - Seoul (KST)" },
    { value: "Asia/Bangkok", label: "Asia - Bangkok (ICT)" },
    { value: "Asia/Jakarta", label: "Asia - Jakarta (WIB)" },
    { value: "Asia/Manila", label: "Asia - Manila (PHT)" },
    { value: "Asia/Kuala_Lumpur", label: "Asia - Kuala Lumpur (MYT)" },
    { value: "Australia/Sydney", label: "Australia - Sydney (AEST)" },
    { value: "Australia/Melbourne", label: "Australia - Melbourne (AEST)" },
    { value: "Australia/Perth", label: "Australia - Perth (AWST)" },
    { value: "Pacific/Auckland", label: "Pacific - Auckland (NZST)" },
    { value: "Pacific/Honolulu", label: "Pacific - Honolulu (HST)" },
  ]
}
