"use client"

import { useState, useEffect, useCallback } from "react"

export interface CurrentEnrollment {
  id: string
  courseId: string
  course: {
    id: string
    title: string
    thumbnailUrl: string | null
    category: string | null
    durationHours: number | null
    totalLessons: number
  }
  progressPercent: number
  enrolledAt: string
}

export interface EnrollmentSummary {
  id: string
  courseId: string
  course: {
    id: string
    title: string
    thumbnailUrl: string | null
    category: string | null
    durationHours: number | null
    totalLessons: number
  }
  progressPercent: number
  completed: boolean
  enrolledAt: string
}

export interface Certificate {
  id: string
  verificationCode: string
  certificateUrl: string | null
  issuedAt: string
  course: {
    id: string
    title: string
    thumbnailUrl: string | null
  }
}

export interface RecommendedCourse {
  id: string
  title: string
  thumbnailUrl: string | null
  shortDescription: string | null
  category: string | null
  durationHours: number | null
  studentCount: number
}

export interface RecentActivity {
  type: string
  course: string
  lesson: string
  timestamp: string
}

export interface DashboardStats {
  totalEnrolled: number
  completedCourses: number
  totalHoursLearned: number
  certificatesEarned: number
}

export interface StudentDashboardData {
  currentEnrollment: CurrentEnrollment | null
  enrollments: EnrollmentSummary[]
  certificates: Certificate[]
  recommendedCourses: RecommendedCourse[]
  recentActivity: RecentActivity[]
  stats: DashboardStats
}

interface UseStudentDashboardReturn {
  data: StudentDashboardData | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useStudentDashboard(): UseStudentDashboardReturn {
  const [data, setData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/student/dashboard")
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
