"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Video, 
  FileText, 
  MessageCircle,
  Mail,
  ArrowLeft,
  ExternalLink,
  Clock
} from "lucide-react"

interface Article {
  id: string
  title: string
  category: string
  content: string
  readTime: string
  lastUpdated: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I reset my password?",
    answer: "Click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    category: "Account"
  },
  {
    id: "2",
    question: "How do I download my certificate?",
    answer: "Once you complete a course, go to 'My Certificates' in your dashboard. Find the certificate you want to download and click the download button. Certificates are available in PDF format.",
    category: "Certificates"
  },
  {
    id: "3",
    question: "Can I access courses offline?",
    answer: "Currently, offline access is not available. All courses require an active internet connection to stream video content and track your progress.",
    category: "Courses"
  },
  {
    id: "4",
    question: "How do I track my learning progress?",
    answer: "Your progress is automatically tracked as you complete lessons. Visit the 'My Courses' section in your dashboard to see your overall progress, completed lessons, and time spent learning.",
    category: "Courses"
  },
  {
    id: "5",
    question: "What payment methods are accepted?",
    answer: "We accept credit/debit cards (Visa, Mastercard, American Express), Paystack payments, and bank transfers. All payments are processed securely.",
    category: "Billing"
  },
  {
    id: "6",
    question: "How do I verify my certificate?",
    answer: "Employers can verify your certificate using the verification link on your certificate page. They can visit our verification portal and enter the certificate code found on your document.",
    category: "Certificates"
  },
  {
    id: "7",
    question: "Can I get a refund?",
    answer: "We offer a 30-day money-back guarantee. If you're not satisfied with a course, contact our support team within 30 days of purchase for a full refund.",
    category: "Billing"
  },
  {
    id: "8",
    question: "How do I contact an instructor?",
    answer: "You can ask questions in the Q&A section of each course. Instructors typically respond within 24-48 hours. For urgent matters, use our live chat support.",
    category: "Courses"
  },
  {
    id: "9",
    question: "Are certificates recognized by employers?",
    answer: "Yes! Our certificates are verified and recognized. They include a unique verification code that employers can use to confirm your achievement.",
    category: "Certificates"
  },
  {
    id: "10",
    question: "How long do I have access to courses?",
    answer: "Once you enroll in a course, you have lifetime access. You can revisit lessons, download resources, and watch videos anytime.",
    category: "Courses"
  }
]

const categories = [
  { 
    name: "Getting Started", 
    icon: BookOpen, 
    count: 5,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
  },
  { 
    name: "Courses", 
    icon: Video, 
    count: 8,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
  },
  { 
    name: "Certificates", 
    icon: FileText, 
    count: 4,
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
  },
  { 
    name: "Billing", 
    icon: MessageCircle, 
    count: 3,
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
  }
]

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/support">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Find answers to common questions and learn more about our platform
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
        />
      </div>

      {/* Coming Soon Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">Tutorials Coming Soon</h3>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  In Development
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">
                Video tutorials and detailed guides are currently being created. 
                In the meantime, browse our FAQ section below for quick answers to common questions.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  Video tutorials coming soon
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Detailed guides in progress
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card 
                key={category.name}
                className={`cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${
                  selectedCategory === category.name ? "ring-2 ring-purple-500" : ""
                }`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.name ? "all" : category.name
                )}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.count} articles</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
          {selectedCategory !== "all" && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              Clear filter
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <Card 
                key={faq.id}
                className={`overflow-hidden transition-all ${
                  expandedFaq === faq.id ? "ring-2 ring-purple-500/50" : ""
                }`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full text-left"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        faq.category === "Account" ? "bg-blue-100 dark:bg-blue-900/30" :
                        faq.category === "Courses" ? "bg-purple-100 dark:bg-purple-900/30" :
                        faq.category === "Certificates" ? "bg-green-100 dark:bg-green-900/30" :
                        "bg-amber-100 dark:bg-amber-900/30"
                      }`}>
                        <BookOpen className={`w-4 h-4 ${
                          faq.category === "Account" ? "text-blue-600" :
                          faq.category === "Courses" ? "text-purple-600" :
                          faq.category === "Certificates" ? "text-green-600" :
                          "text-amber-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{faq.question}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {faq.category}
                        </Badge>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${
                      expandedFaq === faq.id ? "rotate-180" : ""
                    }`} />
                  </CardContent>
                </button>
                
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="ml-11 pl-3 border-l-2 border-purple-200 dark:border-purple-800">
                      <p className="text-muted-foreground">{faq.answer}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          2 min read
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
                <Button 
                  variant="link" 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all") }}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Still Need Help */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Still need help?</h3>
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/support">
                <Button variant="outline" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Open Support Ticket
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => window.location.href = "mailto:support@innosci.org"}
              >
                <Mail className="w-4 h-4" />
                Email Us
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}