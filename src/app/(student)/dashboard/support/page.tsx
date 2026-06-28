"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { 
  HelpCircle, MessageCircle, Mail, Phone, BookOpen,
  ChevronRight, Search, Clock, CheckCircle2, AlertCircle,
  Plus, Send, X, FileText, ExternalLink
} from "lucide-react"

interface SupportTicket {
  id: string
  subject: string
  category: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  lastUpdate: string
  responses: number
}

const mockTickets: SupportTicket[] = [
  {
    id: "t1",
    subject: "Cannot access course video",
    category: "technical",
    message: "The video for Module 3 is not loading properly...",
    status: "open",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    lastUpdate: "2024-01-15T14:20:00Z",
    responses: 1
  },
  {
    id: "t2",
    subject: "Question about certificate verification",
    category: "other",
    message: "I need help verifying my certificate for my employer...",
    status: "resolved",
    priority: "medium",
    createdAt: "2024-01-10T09:00:00Z",
    lastUpdate: "2024-01-12T11:30:00Z",
    responses: 3
  }
]

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email."
  },
  {
    question: "How do I download my certificate?",
    answer: "Go to 'My Certificates' in your dashboard and click the download button next to the certificate."
  },
  {
    question: "Can I access courses offline?",
    answer: "Currently, offline access is not available. All courses require an internet connection."
  },
  {
    question: "How do I track my learning progress?",
    answer: "Your progress is automatically tracked as you complete lessons. View your progress in the 'My Courses' section."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept credit/debit cards, Paystack, and bank transfers for payments."
  }
]

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("all")
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState<{
    category: string
    subject: string
    message: string
    priority: "low" | "medium" | "high" | "urgent"
  }>({
    category: "technical",
    subject: "",
    message: "",
    priority: "medium"
  })
  const [submitting, setSubmitting] = useState(false)

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500">Open</Badge>
      case "in_progress":
        return <Badge className="bg-amber-500">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>
      case "closed":
        return <Badge variant="outline">Closed</Badge>
    }
  }

  const getPriorityBadge = (priority: SupportTicket["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    }
    return <Badge className={cn("capitalize", colors[priority])}>{priority}</Badge>
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const ticket: SupportTicket = {
      id: `t${Date.now()}`,
      subject: newTicket.subject,
      category: newTicket.category,
      message: newTicket.message,
      status: "open",
      priority: newTicket.priority as SupportTicket["priority"],
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      responses: 0
    }
    
    setTickets([ticket, ...tickets])
    setShowNewTicket(false)
    setNewTicket({ category: "technical", subject: "", message: "", priority: "medium" })
    setSubmitting(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground mt-1">
            Get help with your courses and account
          </p>
        </div>
        
        <Button 
          onClick={() => setShowNewTicket(true)}
          className="bg-brand-purple hover:bg-brand-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Quick Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Chat Card */}
        <Card 
          className="hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).$crisp) {
              (window as any).$crisp.push(["do", "chat:open"])
            } else {
              // Fallback: show alert that chat will open when configured
              console.log("Crisp chat widget not configured. Add Crisp script to enable live chat.")
            }
          }}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our team</p>
            </div>
          </CardContent>
        </Card>

        {/* Email Us Card */}
        <Card 
          className="hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group"
          onClick={() => {
            window.location.href = "mailto:support@innosci.org"
          }}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Email Us</h3>
              <p className="text-sm text-muted-foreground">support@innosci.org</p>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base Card */}
        <Link href="/dashboard/knowledge-base">
          <Card className="hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Knowledge Base</h3>
                <p className="text-sm text-muted-foreground">Browse tutorials</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* My Tickets Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Support Tickets
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "open", "resolved"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg transition-colors",
                  statusFilter === status
                    ? "bg-brand-purple text-white"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        ticket.status === "resolved"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : ticket.status === "open"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-gray-100 dark:bg-gray-800"
                      )}>
                        {ticket.status === "resolved" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <MessageCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {ticket.message}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(ticket.lastUpdate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {ticket.responses} response{ticket.responses !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No tickets match your search"
                  : "You haven't submitted any support tickets yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-medium">{faq.question}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                    {faq.answer}
                  </p>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline">
            View All FAQs
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Create Support Ticket</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowNewTicket(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="course-access">Course Access</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Input
                    placeholder="Brief summary of your issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                    rows={5}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowNewTicket(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
