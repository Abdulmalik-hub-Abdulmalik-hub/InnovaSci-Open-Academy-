"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { 
  Check, X, CreditCard, Award, Download, 
  Infinity, Clock, Zap, Shield, BookOpen, MessageCircle, Headphones,
  Star, Sparkles, ChevronRight, Crown, Grid3X3, Layers,
  Lock, ShoppingCart, Percent, Tag, Gift
} from "lucide-react"

interface Domain {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
  shortDescription: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  domainId: string | null
  icon: string | null
}

interface Plan {
  id: string
  name: string
  description: string | null
  planType: string
  billingCycle: string
  purchaseScope: 'ACADEMY' | 'DOMAIN' | 'CATEGORY'
  allowedDomainIds: string[]
  allowedCategoryIds: string[]
  price: number
  currency: string
  pricing: any
  features: string[]
  isActive: boolean
  isFeatured: boolean
  isPopular: boolean
  isRecommended: boolean
  status: string
  visibility: string
  discountPercentage: number | null
  icon: string | null
  themeColor: string | null
  sortOrder: number
}

const features = [
  { icon: BookOpen, title: "Expert-Led Courses", description: "Learn from world-class instructors with hands-on projects" },
  { icon: Award, title: "Professional Certificates", description: "Earn recognized certificates for your career" },
  { icon: Download, title: "Downloadable Resources", description: "Access project files, slides, and code samples" },
  { icon: MessageCircle, title: "Community Forum", description: "Connect with thousands of learners worldwide" },
  { icon: Clock, title: "Lifetime Access", description: "Learn at your own pace with unlimited course access" },
  { icon: Shield, title: "30-Day Guarantee", description: "Not satisfied? Get a full refund within 30 days" },
]

const scopeInfo = {
  ACADEMY: {
    icon: Crown,
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-400",
  },
  DOMAIN: {
    icon: Grid3X3,
    color: "from-purple-500 to-blue-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    badge: "bg-purple-500/20 text-purple-400",
  },
  CATEGORY: {
    icon: Layers,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-400",
  },
}

// Format price helper
function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export default function MembershipPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly" | "lifetime">("lifetime")
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [showDomainPlans, setShowDomainPlans] = useState(false)
  const [showCategoryPlans, setShowCategoryPlans] = useState(false)
  const [purchaseModal, setPurchaseModal] = useState<{plan: Plan, type: string} | null>(null)
  
  const router = useRouter()

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch("/api/public/plans")
      const result = await response.json()
      
      if (result.success && result.data?.plans) {
        // Only show published and public plans
        const visiblePlans = result.data.plans.filter(
          (p: Plan) => p.status === 'PUBLISHED' && p.visibility === 'PUBLIC'
        )
        setPlans(visiblePlans)
      } else {
        setPlans([])
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err)
      setPlans([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFilters = useCallback(async () => {
    try {
      const [domainsRes, categoriesRes] = await Promise.all([
        fetch("/api/public/domains"),
        fetch("/api/admin/categories?includeInactive=true")
      ])
      
      const domainsData = await domainsRes.json()
      if (domainsData.success && domainsData.data?.domains) {
        setDomains(domainsData.data.domains)
      }
      
      const categoriesData = await categoriesRes.json()
      if (categoriesData.success && categoriesData.data?.categories) {
        setCategories(categoriesData.data.categories)
      }
    } catch (err) {
      console.error("Failed to fetch filters:", err)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
    fetchFilters()
  }, [fetchPlans, fetchFilters])

  // Group plans by scope
  const groupedPlans = {
    ACADEMY: plans.filter(p => p.purchaseScope === 'ACADEMY'),
    DOMAIN: plans.filter(p => p.purchaseScope === 'DOMAIN'),
    CATEGORY: plans.filter(p => p.purchaseScope === 'CATEGORY'),
  }

  // Get price based on billing cycle
  const getPlanPrice = (plan: Plan): number => {
    if (plan.pricing && typeof plan.pricing === 'object') {
      const currency = "USD"
      if (plan.pricing[currency]) {
        const amount = plan.pricing[currency][billingCycle] || plan.pricing[currency].lifetime || plan.price
        return amount
      }
    }
    // Fallback to simple price
    if (billingCycle === "lifetime") {
      return plan.price
    }
    // For other cycles, apply a discount
    const discount = billingCycle === "yearly" ? 0.8 : billingCycle === "quarterly" ? 0.85 : 1
    return plan.price * discount
  }

  // Handle purchase
  const handlePurchase = async (plan: Plan, scope: string, targetId?: string) => {
    const userId = localStorage.getItem('userId') // In real app, use auth
    const email = localStorage.getItem('userEmail') || 'demo@example.com' // In real app, use auth

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          planId: plan.id,
          targetId: targetId || null,
          amount: getPlanPrice(plan),
          currency: plan.currency || "USD",
          email,
          userId,
          couponCode: couponApplied ? couponCode : undefined,
        }),
      })

      const result = await response.json()

      if (result.success && result.authorizationUrl) {
        // Redirect to Paystack
        window.location.href = result.authorizationUrl
      } else {
        alert(result.error || "Failed to initialize payment")
      }
    } catch (err) {
      console.error("Purchase error:", err)
      alert("Failed to process purchase")
    }
  }

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    // In real app, validate coupon with backend
    setCouponApplied(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-purple-500/30 text-purple-400">
              <Zap className="h-3.5 w-3.5 mr-1" />
              One-Time Purchase • Lifetime Access
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Choose Your Learning Path
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Unlock your potential with world-class scientific education. 
              Get unlimited access to courses, certificates, and more with a single purchase.
            </p>

            {/* Coupon Input */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <Tag className="h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="bg-transparent text-white placeholder:text-white/40 outline-none w-40"
                />
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleApplyCoupon}
                  className="text-white/60 hover:text-white"
                >
                  Apply
                </Button>
              </div>
              {couponApplied && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  Coupon Applied!
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plan Selection Tabs */}
      <section className="py-8 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="outline"
              className={cn(
                "gap-2 border-white/20",
                !showDomainPlans && !showCategoryPlans 
                  ? "bg-white/10 text-white" 
                  : "text-white/60"
              )}
              onClick={() => {
                setShowDomainPlans(false)
                setShowCategoryPlans(false)
              }}
            >
              <Crown className="h-4 w-4 text-yellow-400" />
              Academy Access
            </Button>
            <Button
              variant="outline"
              className={cn(
                "gap-2 border-white/20",
                showDomainPlans 
                  ? "bg-purple-500/20 text-white border-purple-500/30" 
                  : "text-white/60"
              )}
              onClick={() => {
                setShowDomainPlans(true)
                setShowCategoryPlans(false)
              }}
            >
              <Grid3X3 className="h-4 w-4 text-purple-400" />
              Domain Access
            </Button>
            <Button
              variant="outline"
              className={cn(
                "gap-2 border-white/20",
                showCategoryPlans 
                  ? "bg-emerald-500/20 text-white border-emerald-500/30" 
                  : "text-white/60"
              )}
              onClick={() => {
                setShowDomainPlans(false)
                setShowCategoryPlans(true)
              }}
            >
              <Layers className="h-4 w-4 text-emerald-400" />
              Category Access
            </Button>
          </div>
        </div>
      </section>

      {/* Domain Selection (when viewing Domain plans) */}
      {showDomainPlans && domains.length > 0 && (
        <section className="py-8 bg-white/5">
          <div className="container mx-auto px-4">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Select a Domain
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {domains.map(domain => (
                <Button
                  key={domain.id}
                  variant="outline"
                  className={cn(
                    "gap-2 border-white/20",
                    selectedDomain === domain.id 
                      ? "bg-purple-500/20 text-white border-purple-500/30" 
                      : "text-white/60"
                  )}
                  onClick={() => setSelectedDomain(domain.id)}
                >
                  {domain.icon && <span className="text-lg">{domain.icon}</span>}
                  {domain.name}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Academy Plans */}
      {!showDomainPlans && !showCategoryPlans && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                <Crown className="inline h-8 w-8 text-yellow-400 mr-2" />
                Academy Access
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Full platform access - everything we offer, forever
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-96 rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : groupedPlans.ACADEMY.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {groupedPlans.ACADEMY.map((plan) => {
                  const Icon = Crown
                  const info = scopeInfo.ACADEMY
                  const price = getPlanPrice(plan)
                  
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className={cn(
                        "h-full overflow-hidden transition-all hover:scale-[1.02]",
                        plan.isFeatured ? `bg-gradient-to-br ${info.bgColor} border-2 ${info.borderColor}` : "bg-white/5 border-white/10",
                        plan.isPopular && "ring-2 ring-orange-500/50"
                      )}>
                        {plan.isPopular && (
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-1 text-sm font-medium">
                            <Zap className="inline h-4 w-4 mr-1" />
                            Most Popular
                          </div>
                        )}
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            {plan.icon ? (
                              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                                {plan.icon}
                              </div>
                            ) : (
                              <div className={cn("w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center")}>
                                <Icon className={cn("h-6 w-6 text-yellow-400")} />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-xl">{plan.name}</CardTitle>
                              <Badge className={info.badge + " mt-1"}>
                                <Crown className="h-3 w-3 mr-1" />
                                Full Academy Access
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">
                              {formatPrice(price, plan.currency)}
                            </span>
                            <span className="text-white/50 text-sm">
                              {billingCycle !== "lifetime" ? `/${billingCycle}` : "lifetime"}
                            </span>
                          </div>
                          
                          {plan.discountPercentage && plan.discountPercentage > 0 && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Percent className="h-3 w-3 mr-1" />
                              {plan.discountPercentage}% OFF
                            </Badge>
                          )}

                          {plan.description && (
                            <p className="text-white/60 text-sm">
                              {plan.description}
                            </p>
                          )}

                          <ul className="space-y-2 pt-4">
                            {[
                              "All domains included",
                              "All categories included",
                              "All courses & lessons",
                              "All certificates",
                              "Professional capstones",
                              "Lifetime access",
                              "Future courses included"
                            ].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <span className="text-white/70">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button 
                            className={cn(
                              "w-full mt-6",
                              plan.isFeatured 
                                ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600" 
                                : ""
                            )}
                            size="lg"
                            onClick={() => handlePurchase(plan, 'academy')}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Get Academy Access
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 max-w-2xl mx-auto">
                <CardContent className="py-12 text-center">
                  <Crown className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">
                    Academy access plans coming soon. Browse our domain and category options below.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Domain Plans */}
      {showDomainPlans && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                <Grid3X3 className="inline h-8 w-8 text-purple-400 mr-2" />
                Domain Access
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete access to all categories within a specific domain
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-96 rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : groupedPlans.DOMAIN.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {groupedPlans.DOMAIN
                  .filter(plan => !selectedDomain || plan.allowedDomainIds.includes(selectedDomain))
                  .map((plan) => {
                    const Icon = Grid3X3
                    const info = scopeInfo.DOMAIN
                    const price = getPlanPrice(plan)
                    const domainNames = plan.allowedDomainIds
                      .map(id => domains.find(d => d.id === id)?.name)
                      .filter(Boolean)
                      .join(", ") || "Selected Domains"
                    
                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Card className={cn(
                          "h-full overflow-hidden transition-all hover:scale-[1.02]",
                          plan.isFeatured ? `bg-gradient-to-br ${info.bgColor} border-2 ${info.borderColor}` : "bg-white/5 border-white/10",
                          plan.isPopular && "ring-2 ring-orange-500/50"
                        )}>
                          {plan.isPopular && (
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-1 text-sm font-medium">
                              <Zap className="inline h-4 w-4 mr-1" />
                              Most Popular
                            </div>
                          )}
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                              {plan.icon ? (
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                                  {plan.icon}
                                </div>
                              ) : (
                                <div className={cn("w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center")}>
                                  <Icon className={cn("h-6 w-6 text-purple-400")} />
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <Badge className={info.badge + " mt-1"}>
                                  <Grid3X3 className="h-3 w-3 mr-1" />
                                  {domainNames}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold">
                                {formatPrice(price, plan.currency)}
                              </span>
                              <span className="text-white/50 text-sm">
                                {billingCycle !== "lifetime" ? `/${billingCycle}` : "lifetime"}
                              </span>
                            </div>
                            
                            {plan.discountPercentage && plan.discountPercentage > 0 && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <Percent className="h-3 w-3 mr-1" />
                                {plan.discountPercentage}% OFF
                              </Badge>
                            )}

                            {plan.description && (
                              <p className="text-white/60 text-sm">
                                {plan.description}
                              </p>
                            )}

                            <ul className="space-y-2 pt-4">
                              {[
                                "All categories in domain",
                                "All courses & lessons",
                                "Professional certificates",
                                "Domain master certificate",
                                "Lifetime access",
                                "Future courses included"
                              ].map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                  <span className="text-white/70">{feature}</span>
                                </li>
                              ))}
                            </ul>

                            <Button 
                              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                              size="lg"
                              onClick={() => handlePurchase(plan, 'domain', plan.allowedDomainIds[0])}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Get Domain Access
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 max-w-2xl mx-auto">
                <CardContent className="py-12 text-center">
                  <Grid3X3 className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">
                    Domain access plans coming soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Category Plans */}
      {showCategoryPlans && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                <Layers className="inline h-8 w-8 text-emerald-400 mr-2" />
                Category Access
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete access to all courses within a specific category
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-80 rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : groupedPlans.CATEGORY.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {groupedPlans.CATEGORY.map((plan) => {
                  const Icon = Layers
                  const info = scopeInfo.CATEGORY
                  const price = getPlanPrice(plan)
                  const categoryNames = plan.allowedCategoryIds
                    .map(id => categories.find(c => c.id === id)?.name)
                    .filter(Boolean)
                    .join(", ") || "Selected Categories"
                  
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className={cn(
                        "h-full overflow-hidden transition-all hover:scale-[1.02]",
                        plan.isFeatured ? `bg-gradient-to-br ${info.bgColor} border-2 ${info.borderColor}` : "bg-white/5 border-white/10",
                        plan.isPopular && "ring-2 ring-orange-500/50"
                      )}>
                        {plan.isPopular && (
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-1 text-sm font-medium">
                            <Zap className="inline h-4 w-4 mr-1" />
                            Most Popular
                          </div>
                        )}
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            {plan.icon ? (
                              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                                {plan.icon}
                              </div>
                            ) : (
                              <div className={cn("w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center")}>
                                <Icon className={cn("h-6 w-6 text-emerald-400")} />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-xl">{plan.name}</CardTitle>
                              <Badge className={info.badge + " mt-1"}>
                                <Layers className="h-3 w-3 mr-1" />
                                {categoryNames}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">
                              {formatPrice(price, plan.currency)}
                            </span>
                            <span className="text-white/50 text-sm">
                              {billingCycle !== "lifetime" ? `/${billingCycle}` : "lifetime"}
                            </span>
                          </div>
                          
                          {plan.discountPercentage && plan.discountPercentage > 0 && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Percent className="h-3 w-3 mr-1" />
                              {plan.discountPercentage}% OFF
                            </Badge>
                          )}

                          {plan.description && (
                            <p className="text-white/60 text-sm">
                              {plan.description}
                            </p>
                          )}

                          <ul className="space-y-2 pt-4">
                            {[
                              "All courses in category",
                              "All difficulty levels",
                              "Mini projects",
                              "Professional capstone",
                              "Category certificate",
                              "Lifetime access"
                            ].map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <span className="text-white/70">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button 
                            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                            size="lg"
                            onClick={() => handlePurchase(plan, 'category', plan.allowedCategoryIds[0])}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Get Category Access
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 max-w-2xl mx-auto">
                <CardContent className="py-12 text-center">
                  <Layers className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">
                    Category access plans coming soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-20 bg-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to give you the best learning experience 
              with features that help you master scientific computing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Got questions? We&apos;ve got answers.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "What's included in a Category purchase?",
                a: "When you purchase a Category, you get lifetime access to ALL courses within that category - including all difficulty levels (Beginner, Intermediate, Advanced), practical exercises, mini projects, and the Professional Capstone. You'll also be eligible for the Category Professional Certificate."
              },
              {
                q: "What's included in a Domain purchase?",
                a: "A Domain purchase gives you access to ALL Categories within that domain, along with every course, lesson, project, and capstone. You'll be eligible for both Category Certificates and the Domain Master Certificate."
              },
              {
                q: "What happens to my access if I buy a Domain that contains a Category I already purchased?",
                a: "Great news! Your existing Category purchase is protected. When you purchase a Domain that includes categories you already own, we'll automatically apply a credit for the unused value of your Category purchase toward the Domain price."
              },
              {
                q: "Can I upgrade from Category to Domain access?",
                a: "Absolutely! You can upgrade at any time. The system will automatically calculate the value of your existing Category purchase and apply it as a discount to the Domain upgrade."
              },
              {
                q: "Do I get access to future courses?",
                a: "Yes! All purchases include lifetime access to future courses added to the purchased Category or Domain. You'll never pay again for new content in your scope."
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-blue-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are mastering scientific computing 
              and advancing their careers with InnovaSci Open Academy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 font-semibold">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Headphones className="h-4 w-4 mr-2" />
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
