"use client"

import { useState, useEffect, useCallback } from "react"

export interface StudentCourseDomain {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
}

export interface StudentCourseCategory {
  id?: string
  name: string
}

export interface StudentCourse {
  id: string
  title: string
  slug: string
  thumbnailUrl: string | null
  category: StudentCourseCategory | string | null
  categoryId: string | null
  domain: StudentCourseDomain | null
  domainId: string | null
  shortDescription: string | null
  durationHours: number | null
  difficultyLevel: string | null
  totalLessons: number
  completedLessons: number
}

// Helper to extract category name
function getCourseCategoryName(cat: StudentCourseCategory | string | null | undefined): string {
  if (!cat) return ""
  if (typeof cat === 'object' && 'name' in cat && cat.name) return cat.name
  return cat as string
}

export { getCourseCategoryName }

export interface StudentEnrollment {
  id: string
  courseId: string
  course: StudentCourse
  progressPercent: number
  completed: boolean
  enrolledAt: string
  completedAt: string | null
}

interface UseStudentEnrollmentsReturn {
  enrollments: StudentEnrollment[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  categories: string[]
  fetchEnrollments: (params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
  }) => Promise<void>
  refresh: () => void
}

export function useStudentEnrollments(): UseStudentEnrollmentsReturn {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [categories, setCategories] = useState<string[]>([])

  const fetchEnrollments = useCallback(async (params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      searchParams.set("page", String(params?.page || 1))
      searchParams.set("limit", String(params?.limit || 20))
      if (params?.status) searchParams.set("status", params.status)
      if (params?.category) searchParams.set("category", params.category)

      const response = await fetch(`/api/student/enrollments?${searchParams.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch enrollments")
      }

      setEnrollments(result.data?.enrollments || [])
      setPagination(result.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
      setCategories(result.data?.filters?.categories || [])
    } catch (err) {
      console.error("Fetch enrollments error:", err)
      setError(err instanceof Error ? err.message : "Failed to load enrollments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  const refresh = useCallback(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  return {
    enrollments,
    loading,
    error,
    pagination,
    categories,
    fetchEnrollments,
    refresh,
  }
}
