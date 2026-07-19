"use client"

import { useState, useEffect, useCallback } from "react"
import { getCountryByCode, getAvailableGateways, convertPrice } from "@/lib/countries"

export interface LocalizationData {
  countryCode: string
  country: string
  currency: string
  currencySymbol: string
  timezone: string
  language: string
  preferredGateway: string
  availableGateways: string[]
}

export function useLocalization() {
  const [localization, setLocalization] = useState<LocalizationData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLocalization = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/student/profile")
      const data = await response.json()
      
      if (data.success && data.data?.profile) {
        const profile = data.data.profile
        const country = profile.countryCode ? getCountryByCode(profile.countryCode) : null
        
        setLocalization({
          countryCode: profile.countryCode || "",
          country: profile.country || "",
          currency: profile.currency || "USD",
          currencySymbol: profile.currencySymbol || "$",
          timezone: profile.timezone || "UTC",
          language: profile.language || "English",
          preferredGateway: profile.preferredGateway || "stripe",
          availableGateways: country?.paymentGateways || ["stripe"]
        })
      } else {
        // Default to USD if no profile found
        setLocalization({
          countryCode: "US",
          country: "United States",
          currency: "USD",
          currencySymbol: "$",
          timezone: "America/New_York",
          language: "English",
          preferredGateway: "stripe",
          availableGateways: ["stripe", "paypal"]
        })
      }
    } catch (error) {
      console.error("Failed to fetch localization:", error)
      // Fallback to defaults
      setLocalization({
        countryCode: "US",
        country: "United States",
        currency: "USD",
        currencySymbol: "$",
        timezone: "America/New_York",
        language: "English",
        preferredGateway: "stripe",
        availableGateways: ["stripe", "paypal"]
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLocalization()
  }, [fetchLocalization])

  const convertPriceToLocal = useCallback((amount: number, fromCurrency: string, exchangeRates?: Record<string, number>) => {
    if (!localization) return amount
    
    if (fromCurrency === localization.currency) {
      return amount
    }
    
    if (exchangeRates) {
      return convertPrice(amount, fromCurrency, localization.currency, exchangeRates)
    }
    
    // Fallback: return original amount if no exchange rates
    return amount
  }, [localization])

  return {
    localization,
    loading,
    refresh: fetchLocalization,
    convertPrice: convertPriceToLocal
  }
}

// Format price with user's currency
export function formatLocalPrice(amount: number, currency: string, options?: {
  showSymbol?: boolean
  decimals?: number
}): string {
  const symbol = getCurrencySymbol(currency)
  const decimals = options?.decimals ?? (currency === 'JPY' || currency === 'KRW' ? 0 : 2)
  
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  return options?.showSymbol !== false ? `${symbol}${formatted}` : formatted
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
    JPY: "¥",
    INR: "₹",
    CNY: "¥",
    KRW: "₩",
    SGD: "S$",
    MYR: "RM",
    THB: "฿",
    IDR: "Rp",
    PHP: "₱",
    VND: "₫",
    PKR: "₨",
    BDT: "৳",
    AED: "د.إ",
    SAR: "﷼",
    ZAR: "R",
    BRL: "R$",
    MXN: "MX$",
    KES: "KSh",
    GHS: "₵",
  }
  
  return symbols[currency] || currency
}
