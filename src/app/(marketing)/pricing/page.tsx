"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, Loader2 } from "lucide-react"
import { formatCurrency, getCurrencySymbol } from "@/lib/currency"

interface Plan {
  id: string
  name: string
  description: string | null
  planType: string
  billingCycle: string
  price: number
  currency: string
  pricing: any
  // Multi-currency fields
  pricingMode?: 'MANUAL' | 'AUTO_CONVERSION' | 'HYBRID'
  baseCurrency?: string
  supportedCurrencies?: string[]
  ngnPrice?: number | null
  usdPrice?: number | null
  features: string[]
  isActive: boolean
  isFeatured: boolean
  isPopular: boolean
  discountPercentage: number | null
  trialDays: number | null
  themeColor?: string | null
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("NGN")

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/plans?activeOnly=true")
      const result = await response.json()
      
      if (result.success) {
        setPlans(result.data.plans)
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlans = plans.filter(plan => {
    if (billingCycle === "yearly" && plan.billingCycle !== "yearly") return false
    if (billingCycle === "monthly" && plan.billingCycle === "yearly") return false
    return true
  })

  // Get price for the selected currency
  const getPriceForCurrency = (plan: Plan, cycle: string = billingCycle) => {
    const supported = plan.supportedCurrencies || ['NGN']
    
    if (!supported.includes(selectedCurrency)) {
      // Fallback to first supported currency
      const fallback = supported[0] || 'NGN'
      return getPriceFromPlan(plan, fallback, cycle)
    }
    
    return getPriceFromPlan(plan, selectedCurrency, cycle)
  }

  const getPriceFromPlan = (plan: Plan, currency: string, cycle: string) => {
    const pricing = plan.pricing || {}
    const currencyData = pricing[currency] || {}
    
    // Get price for the billing cycle
    let price = currencyData[cycle] || currencyData.lifetime || currencyData.yearly || currencyData.monthly || 0
    
    // Fallback to legacy price fields
    if (price === 0) {
      if (currency === 'NGN' && plan.ngnPrice) {
        price = plan.ngnPrice
      } else if (currency === 'USD' && plan.usdPrice) {
        price = plan.usdPrice
      } else if (plan.price) {
        price = plan.price
      }
    }
    
    return price
  }

  // Get display price text with both currencies if available
  const getPriceDisplay = (plan: Plan) => {
    const supported = plan.supportedCurrencies || ['NGN']
    const hasMultiple = supported.length > 1
    const ngnPrice = getPriceFromPlan(plan, 'NGN', billingCycle)
    const usdPrice = getPriceFromPlan(plan, 'USD', billingCycle)
    
    if (hasMultiple) {
      return {
        primary: selectedCurrency === 'NGN' 
          ? formatCurrency(ngnPrice, 'NGN')
          : formatCurrency(usdPrice, 'USD'),
        secondary: selectedCurrency === 'NGN' 
          ? formatCurrency(usdPrice, 'USD')
          : formatCurrency(ngnPrice, 'NGN'),
        hasMultiple,
        ngnPrice,
        usdPrice,
      }
    }
    
    const price = getPriceFromPlan(plan, selectedCurrency, billingCycle)
    return {
      primary: formatCurrency(price, selectedCurrency),
      secondary: null,
      hasMultiple: false,
      ngnPrice: selectedCurrency === 'NGN' ? price : null,
      usdPrice: selectedCurrency === 'USD' ? price : null,
    }
  }

  // Check if plan supports a currency
  const supportsCurrency = (plan: Plan, currency: string) => {
    const supported = plan.supportedCurrencies || ['NGN']
    return supported.includes(currency)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Choose the plan that fits your learning goals. All plans include access to our community and free courses.
          </p>

          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${selectedCurrency === "NGN" ? "text-white" : "text-white/50"}`}>
              Currency:
            </span>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setSelectedCurrency("NGN")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCurrency === "NGN"
                    ? "bg-purple-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                ₦ NGN
              </button>
              <button
                onClick={() => setSelectedCurrency("USD")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCurrency === "USD"
                    ? "bg-purple-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                $ USD
              </button>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-lg ${billingCycle === "monthly" ? "text-white" : "text-white/50"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 rounded-full bg-purple-600 transition-colors"
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === "yearly" ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-lg ${billingCycle === "yearly" ? "text-white" : "text-white/50"}`}>
              Yearly
            </span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              Save 20%
            </Badge>
          </div>
        </div>

        {/* Plans Grid */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg">No plans available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPlans.map((plan) => {
              const priceDisplay = getPriceDisplay(plan)
              const isYearly = plan.billingCycle === "yearly"
              const themeColor = plan.themeColor || '#7C3AED'

              return (
                <Card
                  key={plan.id}
                  className={`relative bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden ${
                    plan.isFeatured || plan.isPopular ? "ring-2 ring-yellow-500" : ""
                  }`}
                  style={{ borderColor: plan.isFeatured ? themeColor : undefined }}
                >
                  {(plan.isFeatured || plan.isPopular) && (
                    <div 
                      className="absolute top-0 left-0 right-0 text-white text-center py-1 text-sm font-medium"
                      style={{ background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)` }}
                    >
                      Most Popular
                    </div>
                  )}

                  <CardContent className={`p-8 ${plan.isFeatured || plan.isPopular ? "pt-12" : ""}`}>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    
                    {plan.description && (
                      <p className="text-white/60 mb-6">{plan.description}</p>
                    )}

                    {/* Multi-Currency Price Display */}
                    <div className="mb-6">
                      {priceDisplay.hasMultiple && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-5xl font-bold text-white">
                            {priceDisplay.primary}
                          </span>
                        </div>
                      )}
                      {priceDisplay.hasMultiple && (
                        <p className="text-white/50 text-lg mb-2">
                          or {priceDisplay.secondary}
                        </p>
                      )}
                      {!priceDisplay.hasMultiple && (
                        <span className="text-5xl font-bold text-white">
                          {priceDisplay.primary}
                        </span>
                      )}
                      <span className="text-white/50 ml-2">
                        /{isYearly ? "year" : "month"}
                      </span>
                    </div>

                    {/* Show alternative price */}
                    {priceDisplay.hasMultiple && (
                      <p className="text-white/50 text-sm mb-4">
                        {selectedCurrency === 'NGN' ? (
                          <>Also available for {formatCurrency(priceDisplay.usdPrice || 0, 'USD')}</>
                        ) : (
                          <>Also available for {formatCurrency(priceDisplay.ngnPrice || 0, 'NGN')}</>
                        )}
                      </p>
                    )}

                    {/* Show pricing mode badge */}
                    {plan.pricingMode && plan.pricingMode !== 'MANUAL' && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
                        {plan.pricingMode === 'AUTO_CONVERSION' ? 'Auto-Priced' : 'Hybrid Pricing'}
                      </Badge>
                    )}

                    {isYearly && (
                      <p className="text-green-400 text-sm mb-6">
                        Billed annually
                      </p>
                    )}

                    {plan.trialDays && plan.trialDays > 0 && (
                      <p className="text-purple-400 text-sm mb-6">
                        {plan.trialDays}-day free trial
                      </p>
                    )}

                    <Button
                      className={`w-full mb-8 ${
                        plan.isFeatured || plan.isPopular
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                      style={{ 
                        background: plan.isFeatured || plan.isPopular 
                          ? `linear-gradient(to right, ${themeColor}, ${themeColor}aa)` 
                          : undefined 
                      }}
                    >
                      Get Started
                    </Button>

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-white/80">
                            <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Currency Info */}
        <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-white/70 text-sm">Pay with</p>
              <p className="text-white font-medium">₦ NGN (Paystack)</p>
            </div>
            <div className="hidden md:block w-px bg-white/20" />
            <div>
              <p className="text-white/70 text-sm">or</p>
              <p className="text-white font-medium">$ USD (Stripe)</p>
            </div>
            <div className="hidden md:block w-px bg-white/20" />
            <div>
              <p className="text-white/70 text-sm">Prices updated daily</p>
              <p className="text-white font-medium">Real-time rates</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I pay in my local currency?
              </h3>
              <p className="text-white/60">
                Yes! We support payments in Nigerian Naira (NGN) and US Dollars (USD). Choose your preferred currency at checkout.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-white/60">
                We accept all major credit cards, debit cards, bank transfers, and mobile money. NGN payments are processed via Paystack, USD payments via Stripe.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-white/60">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-white/60">
                Yes! All paid plans come with a free trial period so you can explore the features before committing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I switch plans later?
              </h3>
              <p className="text-white/60">
                Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                How are exchange rates determined?
              </h3>
              <p className="text-white/60">
                We use real-time exchange rates from reliable financial data providers. Rates are updated daily to ensure fair pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}