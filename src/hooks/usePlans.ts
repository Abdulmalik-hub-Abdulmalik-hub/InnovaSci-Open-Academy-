"use client"

import { useState, useCallback } from "react"

export interface Plan {
  id: string
  name: string
  description: string | null
  planType: string
  billingCycle: string
  price: number
  currency: string
  stripePriceId: string | null
  paystackPlanId: string | null
  features: string[]
  isActive: boolean
  isFeatured: boolean
  discountPercentage: number | null
  promoCode: string | null
  maxCourses: number | null
  maxCertificates: number | null
  allowedCourseIds: string[]
  trialDays: number | null
  sortOrder: number
  createdAt: string
  updatedAt?: string
  subscriptionCount?: number
}

interface UsePlansReturn {
  plans: Plan[]
  loading: boolean
  error: string | null
  fetchPlans: (activeOnly?: boolean) => Promise<void>
  createPlan: (data: Partial<Plan>) => Promise<{ success: boolean; error?: string; plan?: Plan }>
  updatePlan: (id: string, data: Partial<Plan>) => Promise<{ success: boolean; error?: string }>
  deletePlan: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function usePlans(): UsePlansReturn {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async (activeOnly: boolean = false) => {
    setLoading(true)
    setError(null)

    try {
      const url = activeOnly 
        ? "/api/admin/plans?activeOnly=true"
        : "/api/admin/plans"

      const response = await fetch(url)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch plans")
      }

      setPlans(result.data.plans)
    } catch (err) {
      console.error("Fetch plans error:", err)
      setError(err instanceof Error ? err.message : "Failed to load plans")
    } finally {
      setLoading(false)
    }
  }, [])

  const createPlan = useCallback(async (data: Partial<Plan>): Promise<{ success: boolean; error?: string; plan?: Plan }> => {
    try {
      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      await fetchPlans()
      return { success: true, plan: result.data }
    } catch (err) {
      console.error("Create plan error:", err)
      return { success: false, error: "Failed to create plan" }
    }
  }, [fetchPlans])

  const updatePlan = useCallback(async (id: string, data: Partial<Plan>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setPlans(prev => prev.map(p => p.id === id ? { ...p, ...result.data } : p))
      return { success: true }
    } catch (err) {
      console.error("Update plan error:", err)
      return { success: false, error: "Failed to update plan" }
    }
  }, [])

  const deletePlan = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setPlans(prev => prev.filter(p => p.id !== id))
      return { success: true }
    } catch (err) {
      console.error("Delete plan error:", err)
      return { success: false, error: "Failed to delete plan" }
    }
  }, [])

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  }
}