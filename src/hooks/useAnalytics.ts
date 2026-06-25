"use client"

import { useState, useEffect, useCallback } from "react"

export interface AnalyticsOverview {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  totalRevenue: number
  revenueThisMonth: number
  revenueGrowthRate: number
  newUsersThisMonth: number
  userGrowthRate: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  charts: {
    usersOverTime: { date: string; count: number }[]
    enrollmentsOverTime: { date: string; count: number }[]
    revenueOverTime: { date: string; amount: number }[]
    revenueByDayOfWeek: { day: string; amount: number }[]
  }
  categories: { category: string; count: number }[]
  topCourses: { id: string; title: string; enrollments: number }[]
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null
  loading: boolean
  error: string | null
  period: string
  setPeriod: (period: string) => void
  refresh: () => void
}

export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("30days")

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch analytics")
      }

      setData(result.data)
    } catch (err) {
      console.error("Analytics fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    data,
    loading,
    error,
    period,
    setPeriod,
    refresh: fetchAnalytics,
  }
}
