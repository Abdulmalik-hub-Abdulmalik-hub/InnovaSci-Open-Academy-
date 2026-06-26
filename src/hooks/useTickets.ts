"use client"

import { useState, useCallback } from "react"

export interface TicketComment {
  id: string
  message: string
  isInternal: boolean
  createdAt: string
  user: {
    id: string | null
    email: string
    name: string
    avatar: string | null
    isAdmin?: boolean
  } | null
}

export interface Ticket {
  id: string
  userId: string | null
  email: string
  category: string
  subject: string | null
  message: string
  status: string
  priority: string
  assignedTo: string | null
  labels: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  userName: string
  userEmail: string
  userAvatar: string | null
  commentCount: number
}

export interface TicketDetail extends Ticket {
  user: {
    id: string
    email: string
    name: string
    avatar: string | null
  } | null
  comments: {
    external: TicketComment[]
    internal: TicketComment[]
  }
  totalComments: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Assignee {
  id: string
  email: string
  name: string
}

interface UseTicketsReturn {
  tickets: Ticket[]
  selectedTicket: TicketDetail | null
  loading: boolean
  sending: boolean
  error: string | null
  pagination: PaginationInfo | null
  stats: {
    byStatus: Record<string, number>
    byPriority: Record<string, number>
  }
  assignees: Assignee[]
  fetchTickets: (options?: TicketFilters) => Promise<void>
  fetchTicketDetail: (id: string) => Promise<TicketDetail | null>
  updateTicket: (id: string, data: TicketUpdate) => Promise<boolean>
  createTicket: (data: Partial<Ticket>) => Promise<Ticket | null>
  deleteTicket: (id: string) => Promise<boolean>
  clearError: () => void
  setSelectedTicket: (ticket: TicketDetail | null) => void
}

export interface TicketFilters {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
  search?: string
  sortBy?: "createdAt" | "priority" | "updatedAt"
  sortOrder?: "asc" | "desc"
}

export interface TicketUpdate {
  status?: string
  priority?: string
  assignedTo?: string | null
  labels?: string | null
  message?: string
  isInternal?: boolean
}

export function useTickets(): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [stats, setStats] = useState<{
    byStatus: Record<string, number>
    byPriority: Record<string, number>
  }>({ byStatus: {}, byPriority: {} })
  const [assignees, setAssignees] = useState<Assignee[]>([])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchTickets = useCallback(async (options?: TicketFilters) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (options?.page) params.set("page", String(options.page))
      if (options?.limit) params.set("limit", String(options.limit))
      if (options?.status) params.set("status", options.status)
      if (options?.priority) params.set("priority", options.priority)
      if (options?.category) params.set("category", options.category)
      if (options?.assignedTo) params.set("assignedTo", options.assignedTo)
      if (options?.search) params.set("search", options.search)
      if (options?.sortBy) params.set("sortBy", options.sortBy)
      if (options?.sortOrder) params.set("sortOrder", options.sortOrder)

      const response = await fetch(`/api/admin/tickets?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch tickets")
      }

      setTickets(result.data.tickets)
      setPagination(result.data.pagination)
      setStats(result.data.stats)
      setAssignees(result.data.assignees)
    } catch (err) {
      console.error("Fetch tickets error:", err)
      setError(err instanceof Error ? err.message : "Failed to load tickets")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTicketDetail = useCallback(async (id: string): Promise<TicketDetail | null> => {
    try {
      const response = await fetch(`/api/admin/tickets/${id}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch ticket")
      }

      const detail = result.data as TicketDetail
      setSelectedTicket(detail)
      return detail
    } catch (err) {
      console.error("Fetch ticket detail error:", err)
      setError(err instanceof Error ? err.message : "Failed to load ticket")
      return null
    }
  }, [])

  const updateTicket = useCallback(async (id: string, data: TicketUpdate): Promise<boolean> => {
    setSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update ticket")
      }

      // Update selected ticket if it's the one being modified
      if (selectedTicket?.id === id) {
        await fetchTicketDetail(id)
      }

      return true
    } catch (err) {
      console.error("Update ticket error:", err)
      setError(err instanceof Error ? err.message : "Failed to update ticket")
      return false
    } finally {
      setSending(false)
    }
  }, [selectedTicket, fetchTicketDetail])

  const createTicket = useCallback(async (data: Partial<Ticket>): Promise<Ticket | null> => {
    setSending(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create ticket")
      }

      return result.data as Ticket
    } catch (err) {
      console.error("Create ticket error:", err)
      setError(err instanceof Error ? err.message : "Failed to create ticket")
      return null
    } finally {
      setSending(false)
    }
  }, [])

  const deleteTicket = useCallback(async (id: string): Promise<boolean> => {
    setSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to delete ticket")
      }

      // Remove from list
      setTickets(prev => prev.filter(t => t.id !== id))

      // Clear selected if deleted
      if (selectedTicket?.id === id) {
        setSelectedTicket(null)
      }

      return true
    } catch (err) {
      console.error("Delete ticket error:", err)
      setError(err instanceof Error ? err.message : "Failed to delete ticket")
      return false
    } finally {
      setSending(false)
    }
  }, [selectedTicket])

  return {
    tickets,
    selectedTicket,
    loading,
    sending,
    error,
    pagination,
    stats,
    assignees,
    fetchTickets,
    fetchTicketDetail,
    updateTicket,
    createTicket,
    deleteTicket,
    clearError,
    setSelectedTicket,
  }
}