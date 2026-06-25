"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  MessageSquare, Compass, Mail, Send, CheckCircle2,
  ChevronRight, Phone, MapPin, Clock, Users
} from "lucide-react"

// Contact form categories
const contactCategories = [
  { value: "billing", label: "Billing & Payments" },
  { value: "course-access", label: "Course Access Issue" },
  { value: "technical", label: "Technical Support" },
  { value: "business", label: "Business Inquiry" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "other", label: "Other" },
]

// Help cards directing users
const helpCards = [
  {
    icon: MessageSquare,
    title: "Have a technical question?",
    description: "Get help from our community of experts and fellow learners. Post your code, share your issue, and get answers fast.",
    cta: "Visit the Forum",
    href: "/forum",
    color: "purple",
  },
  {
    icon: Compass,
    title: "Need help with your learning path?",
    description: "Not sure which courses to take? Explore our curated learning paths and find the perfect roadmap for your goals.",
    cta: "Explore Learning Paths",
    href: "/learning-paths",
    color: "blue",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: "",
    category: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const isFormValid = formData.email && formData.category && formData.message

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#2563EB]/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-[#7C3AED]/30 text-[#7C3AED]">
              <Mail className="h-3.5 w-3.5 mr-1" />
              We&apos;re Here to Help
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions or need assistance? We&apos;re here to help you succeed 
              on your learning journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Help Cards Section */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {helpCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                        card.color === "purple" && "bg-purple-500/10",
                        card.color === "blue" && "bg-blue-500/10"
                      )}>
                        <Icon className={cn(
                          "h-7 w-7",
                          card.color === "purple" && "text-purple-600",
                          card.color === "blue" && "text-blue-600"
                        )} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                      <p className="text-muted-foreground mb-6">{card.description}</p>
                      <Link href={card.href}>
                        <Button variant="outline" className="w-full gap-2">
                          {card.cta}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Submit a Support Ticket</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Ticket Submitted!</h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for contacting us. We&apos;ve received your message and will 
                        get back to you within 24 hours.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSubmitted(false)
                          setFormData({ email: "", category: "", subject: "", message: "" })
                        }}
                      >
                        Submit Another Ticket
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">
                          Category <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                            "placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            !formData.category && "text-muted-foreground"
                          )}
                          required
                        >
                          <option value="">Select a category</option>
                          {contactCategories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject <span className="text-muted-foreground text-xs">(Optional)</span>
                        </label>
                        <Input
                          id="subject"
                          type="text"
                          placeholder="Brief summary of your inquiry"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          id="message"
                          placeholder="Describe your question or issue in detail..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className={cn(
                            "flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                            "placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "resize-none"
                          )}
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="w-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Submitting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Submit Ticket
                          </span>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our{" "}
                        <Link href="/privacy" className="text-[#7C3AED] hover:underline">
                          Privacy Policy
                        </Link>
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground">support@innovasci.com</p>
                <p className="text-sm text-muted-foreground">Response within 24 hours</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Support Hours</h3>
                <p className="text-sm text-muted-foreground">Monday - Friday</p>
                <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM (UTC)</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">Join 10,000+ learners</p>
                <p className="text-sm text-muted-foreground">in our forums</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Mini Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl font-bold mb-2">Common Questions</h2>
              <p className="text-muted-foreground">Quick answers to frequently asked questions</p>
            </motion.div>

            <div className="space-y-4">
              {[
                { q: "How do I reset my password?", a: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email." },
                { q: "Can I download course videos?", a: "Pro and Team members can download videos for offline viewing. Free users can stream content." },
                { q: "How do I get a certificate?", a: "Complete all lessons in a course to unlock your certificate. It will be available in your profile." },
                { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and bank transfers for annual plans." },
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-1">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
