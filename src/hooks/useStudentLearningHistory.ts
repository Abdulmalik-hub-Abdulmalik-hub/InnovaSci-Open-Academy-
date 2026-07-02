"use client"

import { useState, useEffect, useCallback } from "react"

export interface LearningHistoryItem {
  courseId: string
  course: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string | null
    category: string | null
    shortDescription: string | null
    durationHours: number | null
    difficultyLevel: string | null
    totalLessons: number
  }
  completedLessons: number
  progressPercent: number
  isCompleted: boolean
  nextLessonId: string | null
  lastActivity: boolean
}

export function useStudentLearningHistory() {
  const [history, setHistory] = useState<LearningHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchHistory = useCallback(async (options?: { page?: number }) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (options?.page) params.set("page", options.page.toString())
      
      const url = `/api/student/learning-history?${params}`
      console.log("[useStudentLearningHistory] Fetching:", url)
      
      const response = await fetch(url)
      console.log("[useStudentLearningHistory] Response status:", response.status)
      
      const data = await response.json()
      console.log("[useStudentLearningHistory] Response data:", JSON.stringify(data, null, 2))
      
      if (data.success) {
        setHistory(data.data.history)
        setPagination(data.data.pagination)
      } else {
        console.error("[useStudentLearningHistory] API Error:", data.error, data.technicalError, data.errorDetails)
        setError(data.error || "Failed to fetch learning history")
      }
    } catch (err: any) {
      console.error("[useStudentLearningHistory] Network error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    fetchHistory({ page: 1 })
  }, [fetchHistory])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    loading,
    error,
    pagination,
    fetchHistory,
    refresh
  }
}