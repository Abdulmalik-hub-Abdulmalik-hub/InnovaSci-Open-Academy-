"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, Loader2 } from "lucide-react"

interface Plan {
  id: string
  name: string
  description: string | null
  planType: string
  billingCycle: string
  price: number
  currency: string
  features: string[]
  isActive: boolean
  isFeatured: boolean
  discountPercentage: number | null
  trialDays: number | null
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price)
  }

  const calculateYearlyPrice = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12
    const discount = yearlyPrice * 0.2 // 20% discount
    return yearlyPrice - discount
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
              const isYearly = plan.billingCycle === "yearly"
              const displayPrice = isYearly && plan.billingCycle !== "yearly"
                ? calculateYearlyPrice(plan.price) / 12
                : plan.price

              return (
                <Card
                  key={plan.id}
                  className={`relative bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden ${
                    plan.isFeatured ? "ring-2 ring-yellow-500" : ""
                  }`}
                >
                  {plan.isFeatured && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}

                  <CardContent className={`p-8 ${plan.isFeatured ? "pt-12" : ""}`}>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    
                    {plan.description && (
                      <p className="text-white/60 mb-6">{plan.description}</p>
                    )}

                    <div className="mb-6">
                      <span className="text-5xl font-bold text-white">
                        {formatPrice(displayPrice, plan.currency)}
                      </span>
                      <span className="text-white/50 ml-2">
                        /{isYearly ? "year" : "month"}
                      </span>
                    </div>

                    {isYearly && (
                      <p className="text-green-400 text-sm mb-6">
                        Billed annually at {formatPrice(plan.price, plan.currency)}/year
                      </p>
                    )}

                    {plan.trialDays && plan.trialDays > 0 && (
                      <p className="text-purple-400 text-sm mb-6">
                        {plan.trialDays}-day free trial
                      </p>
                    )}

                    <Button
                      className={`w-full mb-8 ${
                        plan.isFeatured
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
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

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                What payment methods do you accept?
              </h3>
              <p className="text-white/60">
                We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment provider.
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
          </div>
        </div>
      </div>
    </div>
  )
}