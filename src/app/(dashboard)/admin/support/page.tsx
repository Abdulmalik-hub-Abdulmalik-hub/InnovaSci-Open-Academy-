"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTickets, TicketFilters, TicketDetail } from "@/hooks/useTickets"
import {
  Headphones, Search, RefreshCw, Loader2, AlertTriangle,
  X, Send, Lock, ChevronLeft, ChevronRight,
  Clock, User, Tag, MessageSquare, CheckCircle2,
  AlertCircle, Circle, CheckCheck, Filter, Plus, Trash2
} from "lucide-react"

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  open: <Circle className="h-4 w-4" />,
  in_progress: <AlertCircle className="h-4 w-4" />,
  resolved: <CheckCircle2 className="h-4 w-4" />,
  closed: <CheckCheck className="h-4 w-4" />,
}

const CATEGORY_LABELS: Record<string, string> = {
  billing: "Billing",
  "course-access": "Course Access",
  technical: "Technical",
  business: "Business",
  partnership: "Partnership",
  other: "Other",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function AdminSupportPage() {
  const {
    tickets, selectedTicket, loading, sending, error, pagination, stats,
    assignees, fetchTickets, fetchTicketDetail, updateTicket,
    deleteTicket, clearError, setSelectedTicket
  } = useTickets()

  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<TicketFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showTicketDetail, setShowTicketDetail] = useState(false)

  useEffect(() => {
    fetchTickets({ limit: 20 })
  }, [fetchTickets])

  const handleSearch = () => {
    fetchTickets({ ...filters, search: search || undefined, page: 1 })
  }

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    const newFilters = { ...filters }
    if (value) {
      (newFilters as Record<string, unknown>)[key] = value
    } else {
      delete (newFilters as Record<string, unknown>)[key]
    }
    setFilters(newFilters)
    fetchTickets({ ...newFilters, page: 1 })
  }

  const handleTicketClick = async (ticketId: string) => {
    await fetchTicketDetail(ticketId)
    setShowTicketDetail(true)
  }

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return

    const success = await updateTicket(selectedTicket.id, {
      message: replyMessage,
      isInternal: isInternalNote,
    })

    if (success) {
      setReplyMessage("")
      setIsInternalNote(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return
    await updateTicket(selectedTicket.id, { status })
  }

  const handleAssignChange = async (assignedTo: string | null) => {
    if (!selectedTicket) return
    await updateTicket(selectedTicket.id, { assignedTo })
  }

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return
    await deleteTicket(id)
    setShowTicketDetail(false)
  }

  const activeFilterCount = Object.keys(filters).filter(k => 
    k !== "page" && k !== "limit" && (filters as Record<string, unknown>)[k]
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Headphones className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Support Center</h1>
            <p className="text-white/60">Manage customer support tickets</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchTickets({ ...filters, page: 1 })}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError} className="text-red-400">
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <button
            key={status}
            onClick={() => handleFilterChange("status", filters.status === status ? "" : status)}
            className={`p-4 rounded-lg border transition-colors ${
              filters.status === status
                ? "bg-white/10 border-white/20"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {STATUS_ICONS[status]}
              <span className="text-white/60 capitalize">{status.replace("_", " ")}</span>
            </div>
            <p className="text-2xl font-bold text-white">{count}</p>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-white/20 text-white ${activeFilterCount > 0 ? "bg-white/10" : ""}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-purple-500 text-white">{activeFilterCount}</Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/40">Priority</label>
                <select
                  value={filters.priority || ""}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40">Category</label>
                <select
                  value={filters.category || ""}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40">Assigned To</label>
                <select
                  value={filters.assignedTo || ""}
                  onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">Anyone</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40">Sort By</label>
                <select
                  value={filters.sortBy || "createdAt"}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="updatedAt">Updated Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              {activeFilterCount > 0 && (
                <div className="col-span-4 flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilters({})
                      fetchTickets({ limit: 20 })
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className={`${showTicketDetail ? "col-span-5" : "col-span-12"}`}>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {loading && tickets.length === 0 ? (
                  <div className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-12 text-center">
                    <Headphones className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/50">No tickets found</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket.id)}
                      className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                        selectedTicket?.id === ticket.id ? "bg-white/10" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${PRIORITY_COLORS[ticket.priority]} border text-xs`}>
                              {ticket.priority}
                            </Badge>
                            <Badge className={`${STATUS_COLORS[ticket.status]} border text-xs`}>
                              {ticket.status.replace("_", " ")}
                            </Badge>
                            <span className="text-white/40 text-xs">{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                          </div>
                          <h3 className="text-white font-medium truncate">{ticket.subject || "No Subject"}</h3>
                          <p className="text-white/50 text-sm truncate">{ticket.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {ticket.userName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(ticket.createdAt)}
                            </span>
                            {ticket.commentCount > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {ticket.commentCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchTickets({ ...filters, page: pagination.page - 1 })}
                className="border-white/20 text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-white/60 text-sm px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchTickets({ ...filters, page: pagination.page + 1 })}
                className="border-white/20 text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        {showTicketDetail && selectedTicket && (
          <div className="col-span-7">
            <Card className="bg-[#1a1a2e] border-white/10 h-[calc(100vh-300px)] flex flex-col">
              <CardHeader className="border-b border-white/10 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setShowTicketDetail(false); setSelectedTicket(null) }}
                      className="text-white/60 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle className="text-white">{selectedTicket.subject || "No Subject"}</CardTitle>
                      <CardDescription className="text-white/40">
                        From {selectedTicket.user?.name || selectedTicket.email} • {formatDate(selectedTicket.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTicket(selectedTicket.id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Ticket Meta */}
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <Badge className={`${PRIORITY_COLORS[selectedTicket.priority]} border`}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge className={`${STATUS_COLORS[selectedTicket.status]} border`}>
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                  <span className="text-white/40">{CATEGORY_LABELS[selectedTicket.category] || selectedTicket.category}</span>
                  {selectedTicket.labels && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-white/40" />
                      <span className="text-white/60">{selectedTicket.labels}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Original Message */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>

                  {/* Comments */}
                  {selectedTicket.comments.external.map((comment) => (
                    <div
                      key={comment.id}
                      className={`rounded-lg p-4 ${
                        comment.user?.isAdmin
                          ? "bg-purple-500/10 border-l-4 border-purple-500"
                          : "bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{comment.user?.name || "Customer"}</span>
                          {comment.user?.isAdmin && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">Support</Badge>
                          )}
                        </div>
                        <span className="text-white/40 text-xs">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-white/80 whitespace-pre-wrap">{comment.message}</p>
                    </div>
                  ))}

                  {/* Internal Notes */}
                  {selectedTicket.comments.internal.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-medium">Internal Notes</span>
                      </div>
                      {selectedTicket.comments.internal.map((comment) => (
                        <div key={comment.id} className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{comment.user?.name || "Support"}</span>
                            <span className="text-white/40 text-xs">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-white/80 whitespace-pre-wrap">{comment.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Reply Box */}
              <div className="border-t border-white/10 p-4 flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 resize-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-purple-500"
                    />
                    <Lock className="h-4 w-4" />
                    Internal note (hidden from customer)
                  </label>
                  <Button
                    onClick={handleSendReply}
                    disabled={sending || !replyMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isInternalNote ? "Add Note" : "Send Reply"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}