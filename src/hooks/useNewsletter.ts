"use client"

import { useState, useCallback } from "react"

export interface NewsletterCampaign {
  id: string
  title: string
  subject: string
  content?: string
  status: string
  recipientType: string
  recipientCourseId?: string
  scheduledAt: string | null
  sentAt: string | null
  totalRecipients: number
  successfulSends: number
  failedSends: number
  createdAt: string
  updatedAt?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UseNewsletterReturn {
  campaigns: NewsletterCampaign[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  fetchCampaigns: (options?: { status?: string; page?: number }) => Promise<void>
  getCampaign: (id: string) => Promise<{ success: boolean; campaign?: NewsletterCampaign; error?: string }>
  createCampaign: (data: Partial<NewsletterCampaign>) => Promise<{ success: boolean; error?: string; campaign?: NewsletterCampaign }>
  updateCampaign: (id: string, data: Partial<NewsletterCampaign>) => Promise<{ success: boolean; error?: string }>
  deleteCampaign: (id: string) => Promise<{ success: boolean; error?: string }>
  sendCampaign: (id: string) => Promise<{ success: boolean; error?: string; result?: any }>
}

export function useNewsletter(): UseNewsletterReturn {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  const fetchCampaigns = useCallback(async (options?: { status?: string; page?: number }) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options?.status) params.set("status", options.status)
      if (options?.page) params.set("page", String(options.page))

      const url = `/api/admin/newsletter${params.toString() ? `?${params}` : ""}`
      const response = await fetch(url)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch campaigns")
      }

      setCampaigns(result.data.campaigns)
      setPagination(result.data.pagination)
    } catch (err) {
      console.error("Fetch campaigns error:", err)
      setError(err instanceof Error ? err.message : "Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }, [])

  const getCampaign = useCallback(async (id: string): Promise<{ success: boolean; campaign?: NewsletterCampaign; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`)
      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      return { success: true, campaign: result.data }
    } catch (err) {
      console.error("Get campaign error:", err)
      return { success: false, error: "Failed to get campaign" }
    }
  }, [])

  const createCampaign = useCallback(async (data: Partial<NewsletterCampaign>): Promise<{ success: boolean; error?: string; campaign?: NewsletterCampaign }> => {
    try {
      const response = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      await fetchCampaigns()
      return { success: true, campaign: result.data }
    } catch (err) {
      console.error("Create campaign error:", err)
      return { success: false, error: "Failed to create campaign" }
    }
  }, [fetchCampaigns])

  const updateCampaign = useCallback(async (id: string, data: Partial<NewsletterCampaign>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...result.data } : c))
      return { success: true }
    } catch (err) {
      console.error("Update campaign error:", err)
      return { success: false, error: "Failed to update campaign" }
    }
  }, [])

  const deleteCampaign = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setCampaigns(prev => prev.filter(c => c.id !== id))
      return { success: true }
    } catch (err) {
      console.error("Delete campaign error:", err)
      return { success: false, error: "Failed to delete campaign" }
    }
  }, [])

  const sendCampaign = useCallback(async (id: string): Promise<{ success: boolean; error?: string; result?: any }> => {
    try {
      const response = await fetch(`/api/admin/newsletter/${id}/send`, {
        method: "POST",
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      await fetchCampaigns()
      return { success: true, result: result.data }
    } catch (err) {
      console.error("Send campaign error:", err)
      return { success: false, error: "Failed to send campaign" }
    }
  }, [fetchCampaigns])

  return {
    campaigns,
    loading,
    error,
    pagination,
    fetchCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
  }
}