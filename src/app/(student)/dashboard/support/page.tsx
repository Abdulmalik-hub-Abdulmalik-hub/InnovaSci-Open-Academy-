"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { 
  Headphones, Search, Loader2, Plus, MessageSquare, Clock,
  ChevronRight, AlertCircle, CheckCircle2, X, Send
} from "lucide-react"

interface SupportTicket {
  id: string
  subject: string
  message: string
  category: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

export default function SupportPage() {
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    category: "technical",
    priority: "medium"
  })

  useEffect(() => {
    // In production, fetch from API
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return
    
    setSubmitting(true)
    // In production, submit to API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitting(false)
    setShowNewTicket(false)
    setNewTicket({ subject: "", message: "", category: "technical", priority: "medium" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">Open</Badge>
      case "in_progress":
        return <Badge className="bg-amber-500">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-blue-500">Resolved</Badge>
      case "closed":
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="border-blue-500/30 text-blue-400">Low</Badge>
      case "medium":
        return <Badge variant="outline" className="border-amber-500/30 text-amber-400">Medium</Badge>
      case "high":
        return <Badge variant="outline" className="border-red-500/30 text-red-400">High</Badge>
      case "urgent":
        return <Badge className="bg-red-500">Urgent</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Help & Support</h1>
            <p className="text-white/60 mt-1">
              Get help from our support team
            </p>
          </div>
          <Button 
            onClick={() => setShowNewTicket(true)}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Headphones className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{tickets.length}</p>
              <p className="text-xs text-white/60">Total Tickets</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {tickets.filter(t => t.status === "open").length}
              </p>
              <p className="text-xs text-white/60">Open</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {tickets.filter(t => t.status === "in_progress").length}
              </p>
              <p className="text-xs text-white/60">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {tickets.filter(t => t.status === "resolved").length}
              </p>
              <p className="text-xs text-white/60">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      ticket.status === "open" ? "bg-green-500/20" :
                      ticket.status === "in_progress" ? "bg-amber-500/20" :
                      ticket.status === "resolved" ? "bg-blue-500/20" : "bg-white/10"
                    )}>
                      <MessageSquare className={cn(
                        "h-5 w-5",
                        ticket.status === "open" ? "text-green-400" :
                        ticket.status === "in_progress" ? "text-amber-400" :
                        ticket.status === "resolved" ? "text-blue-400" : "text-white/60"
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{ticket.subject}</h3>
                          <p className="text-sm text-white/60 mt-1 line-clamp-2">{ticket.message}</p>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-xs">{ticket.category}</span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-white/40 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Headphones className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery ? "No tickets found" : "No support tickets yet"}
            </h3>
            <p className="text-white/60 mb-4">
              {searchQuery 
                ? "Try adjusting your search" 
                : "Create a new ticket to get help from our support team"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowNewTicket(true)} className="bg-purple-500 hover:bg-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            )}
          </div>
        )}

        {/* FAQ Card */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Headphones className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-white mb-2">Need Immediate Help?</h4>
                <p className="text-white/60 mb-4">
                  Check our FAQ section or browse documentation for quick answers to common questions.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/20 text-white">
                    View FAQ
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white">
                    Documentation
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Create Support Ticket</h2>
              <button onClick={() => setShowNewTicket(false)} className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Subject *</label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Category</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    >
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="course-access">Course Access</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-1 block">Message *</label>
                  <Textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                    className="bg-white/5 border-white/10 text-white min-h-32"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTicket(false)}
                    className="border-white/20 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !newTicket.subject.trim() || !newTicket.message.trim()}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
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