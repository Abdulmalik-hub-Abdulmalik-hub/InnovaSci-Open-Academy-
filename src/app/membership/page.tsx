"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Check, X, CreditCard, Award, Download, 
  Infinity, Clock, Zap, Shield, BookOpen, MessageCircle, Headphones
} from "lucide-react"

type BillingCycle = "monthly" | "annual"

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic learning",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { name: "Access to free courses", included: true },
      { name: "Community forum access", included: true },
      { name: "Basic progress tracking", included: true },
      { name: "Email support", included: true },
      { name: "Certificate of completion", included: false },
      { name: "Downloadable resources", included: false },
      { name: "Priority support", included: false },
      { name: "All-access to premium content", included: false },
    ],
    cta: "Start Learning",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Everything you need to master scientific computing",
    monthlyPrice: 29,
    annualPrice: 24,
    savings: "Save $60/year",
    features: [
      { name: "Access to all courses", included: true },
      { name: "Community forum access", included: true },
      { name: "Advanced progress tracking", included: true },
      { name: "Priority email support", included: true },
      { name: "Certificate of completion", included: true },
      { name: "Downloadable resources", included: true },
      { name: "Priority support", included: false },
      { name: "All-access to premium content", included: false },
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    description: "For teams and organizations",
    monthlyPrice: 79,
    annualPrice: 65,
    savings: "Save $168/year",
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Team management dashboard", included: true },
      { name: "Collaborative learning", included: true },
      { name: "24/7 phone support", included: true },
      { name: "Custom certificates", included: true },
      { name: "Offline downloads", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom learning paths", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const features = [
  { icon: BookOpen, title: "Expert-Led Courses", description: "Learn from world-class instructors with hands-on projects" },
  { icon: Award, title: "Verified Certificates", description: "Earn certificates recognized by top employers" },
  { icon: Download, title: "Downloadable Resources", description: "Access project files, slides, and code samples" },
  { icon: MessageCircle, title: "Community Forum", description: "Connect with thousands of learners worldwide" },
  { icon: Clock, title: "Lifetime Access", description: "Learn at your own pace with unlimited course access" },
  { icon: Shield, title: "30-Day Guarantee", description: "Not satisfied? Get a full refund within 30 days" },
]

export default function MembershipPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual")

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice
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
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={cn(
                  "relative h-full transition-all duration-300",
                  plan.popular && "border-[#7C3AED] shadow-lg shadow-[#7C3AED]/10 scale-[1.02]"
                )}>
                  {plan.popular && (
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
                          ${getPrice(plan)}
                        </span>
                        <span className="text-muted-foreground">
                          /{billingCycle === "monthly" ? "mo" : "mo"}
                        </span>
                      </div>
                      {plan.savings && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          {plan.savings}
                        </p>
                      )}
                      {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Billed ${plan.annualPrice * 12}/year
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 text-left mb-8">
                      {plan.features.map((feature, idx) => (
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

                    <Button 
                      className={cn(
                        "w-full",
                        plan.popular 
                          ? "bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90" 
                          : ""
                      )}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
