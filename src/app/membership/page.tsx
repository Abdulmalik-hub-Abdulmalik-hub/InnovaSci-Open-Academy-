"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { 
  Check, X, CreditCard, Award, Download, 
  Infinity, Clock, Zap, Shield, BookOpen, MessageCircle, Headphones,
  Star, Sparkles, ChevronRight
} from "lucide-react"

interface Plan {
  id: string
  name: string
  description: string | null
  planType: string
  billingCycle: string
  price: number
  currency: string
  pricing: any
  features: string[]
  isActive: boolean
  isFeatured: boolean
  discountPercentage: number | null
  maxCourses: number | null
  maxCertificates: number | null
  allowedCourseIds: string[]
  trialDays: number | null
  sortOrder: number
}

type BillingCycle = "monthly" | "annual"

const features = [
  { icon: BookOpen, title: "Expert-Led Courses", description: "Learn from world-class instructors with hands-on projects" },
  { icon: Award, title: "Verified Certificates", description: "Earn certificates recognized by top employers" },
  { icon: Download, title: "Downloadable Resources", description: "Access project files, slides, and code samples" },
  { icon: MessageCircle, title: "Community Forum", description: "Connect with thousands of learners worldwide" },
  { icon: Clock, title: "Lifetime Access", description: "Learn at your own pace with unlimited course access" },
  { icon: Shield, title: "30-Day Guarantee", description: "Not satisfied? Get a full refund within 30 days" },
]

export default function MembershipPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual")
  
  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch("/api/public/plans")
      const result = await response.json()
      
      if (result.success && result.data?.plans) {
        setPlans(result.data.plans)
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
  
  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])
  
  // If no plans in database, show demo mode with default plans
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: "free",
      name: "Free",
      description: "Get started with basic learning",
      price: 0,
      features: [
        "Access to free courses",
        "Community forum access",
        "Basic progress tracking",
        "Email support"
      ],
      isFeatured: false,
      sortOrder: 0
    },
    {
      id: "pro",
      name: "Pro",
      description: "Everything you need to master scientific computing",
      price: 29,
      features: [
        "Access to all courses",
        "Community forum access",
        "Advanced progress tracking",
        "Priority email support",
        "Certificate of completion",
        "Downloadable resources",
        "Priority support"
      ],
      isFeatured: true,
      sortOrder: 1
    },
    {
      id: "team",
      name: "Team",
      description: "For teams and organizations",
      price: 79,
      features: [
        "Everything in Pro",
        "Team management dashboard",
        "Collaborative learning",
        "24/7 phone support",
        "Custom certificates",
        "Offline downloads",
        "Dedicated account manager",
        "Custom learning paths"
      ],
      isFeatured: false,
      sortOrder: 2
    }
  ]
  
  const sortedPlans = [...displayPlans].sort((a, b) => a.sortOrder - b.sortOrder)
  
  // Get price from plan
  const getPlanPrice = (plan: any) => {
    // Use pricing data if available
    if (plan.pricing && typeof plan.pricing === 'object') {
      const currency = "USD"
      if (plan.pricing[currency]) {
        const amount = plan.pricing[currency].amount
        return billingCycle === "annual" ? Math.round(amount * 0.8) : amount // 20% discount for annual
      }
    }
    // Fallback to simple price
    const basePrice = plan.price || 0
    return billingCycle === "annual" ? Math.round(basePrice * 0.8) : basePrice
  }
  
  // Determine which features to show based on plan
  const getFeatures = (plan: any) => {
    if (plan.features && Array.isArray(plan.features) && plan.features.length > 0) {
      return plan.features.map((f: string) => ({ name: f, included: true }))
    }
    
    // Default features based on plan type
    if (plan.name === "Free" || plan.id === "free") {
      return [
        { name: "Access to free courses", included: true },
        { name: "Community forum access", included: true },
        { name: "Basic progress tracking", included: true },
        { name: "Email support", included: true },
        { name: "Certificate of completion", included: false },
        { name: "Downloadable resources", included: false },
        { name: "Priority support", included: false },
        { name: "All-access to premium content", included: false },
      ]
    } else if (plan.name === "Pro" || plan.id === "pro") {
      return [
        { name: "Access to all courses", included: true },
        { name: "Community forum access", included: true },
        { name: "Advanced progress tracking", included: true },
        { name: "Priority email support", included: true },
        { name: "Certificate of completion", included: true },
        { name: "Downloadable resources", included: true },
        { name: "Priority support", included: true },
        { name: "All-access to premium content", included: false },
      ]
    } else {
      return [
        { name: "Everything in Pro", included: true },
        { name: "Team management dashboard", included: true },
        { name: "Collaborative learning", included: true },
        { name: "24/7 phone support", included: true },
        { name: "Custom certificates", included: true },
        { name: "Offline downloads", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "Custom learning paths", included: true },
      ]
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#2563EB]/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-[#7C3AED]/30 text-[#7C3AED]">
              <Zap className="h-3.5 w-3.5 mr-1" />
              Special Offer: Save up to 20% with annual billing
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Choose Your Learning Path
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Unlock your potential with world-class scientific education. 
              Get unlimited access to courses, certificates, and more.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 rounded-xl bg-muted">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                  billingCycle === "monthly"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  billingCycle === "annual"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annual
                <Badge className="bg-green-500/10 text-green-600 text-[10px] px-1.5 py-0.5">Best Value</Badge>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-full">
                  <CardHeader className="text-center pb-4">
                    <Skeleton className="h-8 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="text-center">
                    <Skeleton className="h-12 w-32 mx-auto mb-6" />
                    <div className="space-y-3 mb-8">
                      {[1, 2, 3, 4].map((j) => (
                        <Skeleton key={j} className="h-5 w-full" />
                      ))}
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {sortedPlans.map((plan, index) => {
                const features = getFeatures(plan)
                const price = plan.price === 0 ? 0 : getPlanPrice(plan)
                const isPopular = plan.isFeatured || plan.name === "Pro" || plan.id === "pro"
                const trialDays = (plan as any).trialDays
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "relative h-full transition-all duration-300",
                      isPopular && "border-[#7C3AED] shadow-lg shadow-[#7C3AED]/10 scale-[1.02]"
                    )}>
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white px-4 py-1">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="text-center">
                        <div className="mb-6">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold tracking-tight">
                              ${price}
                            </span>
                            <span className="text-muted-foreground">
                              /{billingCycle === "monthly" ? "mo" : "mo"}
                            </span>
                          </div>
                          {billingCycle === "annual" && plan.price > 0 && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              Save ${plan.price - price}/month
                            </p>
                          )}
                          {billingCycle === "annual" && plan.price > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Billed ${price * 12}/year
                            </p>
                          )}
                          {trialDays && trialDays > 0 && (
                            <p className="text-xs text-purple-600 mt-1">
                              {trialDays} day free trial
                            </p>
                          )}
                        </div>

                        <ul className="space-y-3 text-left mb-8">
                          {features.map((feature: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className={cn(
                                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                                feature.included ? "bg-green-500/10" : "bg-muted"
                              )}>
                                {feature.included ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <X className="h-3 w-3 text-muted-foreground/50" />
                                )}
                              </div>
                              <span className={cn(
                                "text-sm",
                                feature.included ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {feature.name}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <Link href={plan.price === 0 ? "/auth/signup" : `/membership/${plan.id}`}>
                          <Button 
                            className={cn(
                              "w-full",
                              isPopular 
                                ? "bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90" 
                                : ""
                            )}
                            variant={isPopular ? "default" : "outline"}
                          >
                            {plan.price === 0 ? "Start Learning" : "Get Started"}
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
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
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#2563EB]/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-[#7C3AED]" />
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
                q: "Can I cancel my subscription anytime?",
                a: "Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
              },
              {
                q: "Is there a free trial?",
                a: "Yes! All paid plans come with a 30-day money-back guarantee. If you&apos;re not satisfied, get a full refund."
              },
              {
                q: "Can I switch between plans?",
                a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle."
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
      <section className="py-20 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
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
                <Button size="lg" className="bg-white text-[#7C3AED] hover:bg-white/90 font-semibold">
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
