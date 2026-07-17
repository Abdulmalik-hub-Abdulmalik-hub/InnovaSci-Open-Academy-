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
  Clock,
  ArrowRight
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "What is InnovaSci Open Academy?",
    answer: "InnovaSci Open Academy is a world-class scientific and technological learning platform powered by InnovaSci AI Labs. We democratize high-quality education by offering courses in data science, machine learning, drug discovery, and other scientific disciplines.",
    category: "General"
  },
  {
    id: "2",
    question: "How do I enroll in a course?",
    answer: "Browse our course catalog, select a course that interests you, and click the 'Enroll' button. Some courses are free while others may require payment. Once enrolled, you'll have lifetime access to all course materials.",
    category: "Courses"
  },
  {
    id: "3",
    question: "What payment methods are accepted?",
    answer: "We accept credit/debit cards (Visa, Mastercard, American Express), Paystack payments, and bank transfers. All payments are processed securely through our encrypted payment system.",
    category: "Billing"
  },
  {
    id: "4",
    question: "Can I get a refund?",
    answer: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied with a course, contact our support team within 30 days of purchase for a full refund.",
    category: "Billing"
  },
  {
    id: "5",
    question: "How do I earn certificates?",
    answer: "Complete all lessons and assessments in a course to earn your certificate. Certificates are automatically generated and can be downloaded from your dashboard. Each certificate includes a unique verification code.",
    category: "Certificates"
  },
  {
    id: "6",
    question: "Are certificates recognized by employers?",
    answer: "Yes! Our certificates are verified and recognized by industry partners. They include a unique verification code that employers can use to confirm your achievement on our verification portal.",
    category: "Certificates"
  },
  {
    id: "7",
    question: "How do I track my learning progress?",
    answer: "Your progress is automatically tracked as you complete lessons. Visit 'My Courses' in your dashboard to see your overall progress, completed lessons, and time spent learning.",
    category: "Courses"
  },
  {
    id: "9",
    question: "How do I reset my password?",
    answer: "Click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    category: "Account"
  },
  {
    id: "10",
    question: "How do I contact an instructor?",
    answer: "You can ask questions in the Q&A section of each course. Instructors typically respond within 24-48 hours. For urgent matters, use our live chat support or email us at support@innosci.org.",
    category: "Courses"
  },
  {
    id: "11",
    question: "What are Learning Paths?",
    answer: "Learning Paths are curated sequences of courses designed to help you master a specific skill or career track. Each path guides you through the right courses in the optimal order, ensuring you build a solid foundation before moving to advanced topics.",
    category: "Learning Paths"
  },
  {
    id: "12",
    question: "How long do I have access to courses?",
    answer: "Once you enroll in a course, you have lifetime access. You can revisit lessons, download resources, and watch videos anytime. Your progress is saved and you can continue where you left off.",
    category: "Courses"
  }
]

const categories = [
  { 
    name: "Getting Started", 
    icon: BookOpen, 
    count: 3,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
  },
  { 
    name: "Courses", 
    icon: Video, 
    count: 4,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
  },
  { 
    name: "Certificates", 
    icon: FileText, 
    count: 2,
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
  },
  { 
    name: "Billing", 
    icon: MessageCircle, 
    count: 2,
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-background dark:from-purple-950/20 dark:to-background py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Knowledge Base
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions, learn about our platform features, and get the most out of your learning journey.
          </p>
          
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Browse by Category</h2>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
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
                            faq.category === "General" ? "bg-blue-100 dark:bg-blue-900/30" :
                            faq.category === "Courses" ? "bg-purple-100 dark:bg-purple-900/30" :
                            faq.category === "Certificates" ? "bg-green-100 dark:bg-green-900/30" :
                            faq.category === "Billing" ? "bg-amber-100 dark:bg-amber-900/30" :
                            faq.category === "Account" ? "bg-blue-100 dark:bg-blue-900/30" :
                            "bg-gray-100 dark:bg-gray-800"
                          }`}>
                            <BookOpen className={`w-4 h-4 ${
                              faq.category === "General" ? "text-blue-600" :
                              faq.category === "Courses" ? "text-purple-600" :
                              faq.category === "Certificates" ? "text-green-600" :
                              faq.category === "Billing" ? "text-amber-600" :
                              faq.category === "Account" ? "text-blue-600" :
                              "text-gray-600 dark:text-gray-400"
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
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Still need help?</h3>
                    <p className="text-sm text-muted-foreground">
                      Can't find what you're looking for? Our support team is here to help.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href="/contact">
                    <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                      <Mail className="w-4 h-4" />
                      Contact Us
                    </Button>
                  </Link>
                  <Link href="/forum">
                    <Button variant="outline" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Visit Forum
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Quick Links</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/courses">
                <Card className="hover:shadow-md transition-all hover:scale-[1.02]">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Browse Courses</p>
                      <p className="text-xs text-muted-foreground">Explore our catalog</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/learning-paths">
                <Card className="hover:shadow-md transition-all hover:scale-[1.02]">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Learning Paths</p>
                      <p className="text-xs text-muted-foreground">Structured learning</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
