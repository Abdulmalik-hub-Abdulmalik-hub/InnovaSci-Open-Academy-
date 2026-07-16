"use client"

import { useState, useEffect, useCallback } from "react"

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalEnrollments: number
  completedEnrollments: number
  completionRate: number
  totalRevenue: number
  formattedRevenue: string
  // Scholarship statistics
  totalScholarshipTypes: number
  activeScholarshipTypes: number
  totalScholarships: number
  publishedScholarships: number
  totalApplications: number
  pendingApplications: number
  awardedScholarships: number
}

export interface RecentActivity {
  id: string
  type: "enrollment" | "payment" | "certificate" | "user"
  userName: string
  userEmail: string
  action: string
  target?: string
  amount?: number
  timestamp: string
}

export interface TopCourse {
  id: string
  title: string
  students: number
  completed: number
  status: string
  thumbnailUrl: string | null
}

export interface DashboardData {
  stats: DashboardStats
  recentActivity: RecentActivity[]
  topCourses: TopCourse[]
}

interface UseDashboardReturn {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/admin/dashboard")
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch dashboard data")
      }
      
      setData(result.data)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard,
  }
}

// Format relative time (e.g., "2 minutes ago")
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`
  }

  return date.toLocaleDateString()
}
