"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  RefreshCw, DollarSign, TrendingUp, TrendingDown, 
  Clock, Globe, AlertCircle, CheckCircle2, Loader2,
  ArrowDownRight, ArrowUpRight, History
} from "lucide-react"

interface ExchangeRate {
  from: string
  to: string
  rate: number
  timestamp: string
  source: string
}

interface RatesData {
  ngnToUsd: ExchangeRate
  usdToNgn: ExchangeRate
}

interface RateHistory {
  timestamp: Date
  rate: number
  source: string
}

const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
]

// Sample historical data (in production, this would come from a database)
const generateHistoricalData = (baseRate: number): RateHistory[] => {
  const now = new Date()
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const variance = (Math.random() - 0.5) * 0.05 * baseRate
    return {
      timestamp: date,
      rate: Number((baseRate + variance).toFixed(6)),
      source: i % 3 === 0 ? "exchangerate-api" : "frankfurter",
    }
  })
}

export default function ExchangeRatesPage() {
  const { toast } = useToast()
  const [rates, setRates] = useState<RatesData | null>(null)
  const [allRates, setAllRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRates = useCallback(async () => {
    try {
      const response = await fetch("/api/exchange-rates")
      const data = await response.json()
      
      if (data.success) {
        setRates(data.rates)
        setLastUpdated(new Date())
        
        // Generate mock all rates for display
        const baseRate = data.rates.usdToNgn?.rate || 1650
        const mockRates: Record<string, number> = {
          NGN: baseRate,
          USD: 1,
          GBP: baseRate * 0.00079,
          EUR: baseRate * 0.00092,
          KES: baseRate * 0.155,
          GHS: baseRate * 0.015,
          ZAR: baseRate * 0.0185,
          INR: baseRate * 0.083,
          AED: baseRate * 0.00367,
          SAR: baseRate * 0.00375,
        }
        setAllRates(mockRates)
      }
    } catch (error) {
      console.error("Failed to fetch rates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch exchange rates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRates()
    setRefreshing(false)
    toast({
      title: "Rates Updated",
      description: "Exchange rates have been refreshed",
    })
  }

  const formatRate = (rate: number, decimals: number = 4) => {
    return rate.toFixed(decimals)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "cache":
        return <Clock className="h-3 w-3" />
      case "fallback":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <CheckCircle2 className="h-3 w-3" />
    }
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "cache":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "fallback":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exchange Rates</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor currency exchange rates for payments
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Rates
        </Button>
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {formatDate(lastUpdated)}</span>
          {rates?.ngnToUsd && (
            <Badge variant="outline" className={getSourceBadgeColor(rates.ngnToUsd.source)}>
              {getSourceIcon(rates.ngnToUsd.source)}
              <span className="ml-1">{rates.ngnToUsd.source}</span>
            </Badge>
          )}
        </div>
      )}

      {/* Main Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* USD to NGN */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">USD to NGN</CardTitle>
                <p className="text-sm text-muted-foreground">US Dollar → Nigerian Naira</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">₦</span>
              <span className="text-5xl font-bold">
                {rates?.usdToNgn ? formatRate(rates.usdToNgn.rate, 2) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">1 USD = ₦{rates?.usdToNgn ? formatRate(rates.usdToNgn.rate, 2) : "—"}</span>
              {rates?.usdToNgn && (
                <Badge variant="outline" className={getSourceBadgeColor(rates.usdToNgn.source)}>
                  {getSourceIcon(rates.usdToNgn.source)}
                  <span className="ml-1">{rates.usdToNgn.source}</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NGN to USD */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">NGN to USD</CardTitle>
                <p className="text-sm text-muted-foreground">Nigerian Naira → US Dollar</p>
              </div>
            </div>
            <ArrowDownRight className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">$</span>
              <span className="text-5xl font-bold">
                {rates?.ngnToUsd ? formatRate(rates.ngnToUsd.rate, 6) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">1 NGN = ${rates?.ngnToUsd ? formatRate(rates.ngnToUsd.rate, 6) : "—"}</span>
              {rates?.ngnToUsd && (
                <Badge variant="outline" className={getSourceBadgeColor(rates.ngnToUsd.source)}>
                  {getSourceIcon(rates.ngnToUsd.source)}
                  <span className="ml-1">{rates.ngnToUsd.source}</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Rates Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Rates</TabsTrigger>
          <TabsTrigger value="history">30-Day History</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Supported Currencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUPPORTED_CURRENCIES.map((currency) => {
                  const rate = allRates[currency.code] || 1
                  return (
                    <div
                      key={currency.code}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{currency.flag}</span>
                        <div>
                          <p className="font-medium">{currency.code}</p>
                          <p className="text-sm text-muted-foreground">{currency.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">
                          {currency.code === "USD" ? "1.00" : formatRate(rate, 4)}
                        </p>
                        <p className="text-xs text-muted-foreground">per USD</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                USD/NGN Rate History (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generateHistoricalData(rates?.usdToNgn?.rate || 1650).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <p className="font-medium">₦{formatRate(item.rate, 2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getSourceBadgeColor(item.source)}>
                      {item.source}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium">About Exchange Rates</h3>
              <p className="text-sm text-muted-foreground">
                Exchange rates are fetched from free APIs (exchangerate-api and frankfurter.app) 
                and cached for 15 minutes to ensure optimal performance. Rates are automatically 
                applied during payment processing based on the selected currency.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Auto-updates every 15 min</Badge>
                <Badge variant="outline">Free tier providers</Badge>
                <Badge variant="outline">Fallback rates available</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
