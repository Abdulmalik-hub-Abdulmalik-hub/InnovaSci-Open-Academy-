"use client"

import { useState, useEffect, useCallback } from "react"

export interface CourseStats {
  enrollments: number
  completed: number
  wishlists: number
  modules: number
  lessons: number
}

export interface Course {
  id: string
  title: string
  slug: string
  category: string | null
  subcategory: string | null
  shortDescription: string | null
  price: number
  isFree: boolean
  status: string
  thumbnailUrl: string | null
  difficultyLevel: string | null
  durationHours: number | null
  language: string | null
  createdAt: string
  updatedAt: string
  stats: CourseStats
}

export interface Module {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonsCount: number
  lessons: {
    id: string
    title: string
    description: string | null
    orderIndex: number
    lessonType: string
    duration: number | null
    videoUrl: string | null
    isPreview: boolean
    materialsCount: number
    videosCount: number
  }[]
}

export interface CoursesResponse {
  courses: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    categories: string[]
  }
}

interface UseCoursesReturn {
  courses: Course[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  categories: string[]
  fetchCourses: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    category?: string
  }) => Promise<void>
  createCourse: (data: Partial<Course>) => Promise<{ success: boolean; error?: string; id?: string }>
  updateCourse: (id: string, data: Partial<Course>) => Promise<{ success: boolean; error?: string }>
  deleteCourse: (id: string) => Promise<{ success: boolean; error?: string }>
  refresh: () => void
}

export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [categories, setCategories] = useState<string[]>([])
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    status: "all",
    category: "",
  })

  const fetchCourses = useCallback(async (params?: Partial<typeof queryParams>) => {
    const query = { ...queryParams, ...params }
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      searchParams.set("page", String(query.page || 1))
      searchParams.set("limit", String(query.limit || 20))
      if (query.search) searchParams.set("search", query.search)
      if (query.status && query.status !== "all") searchParams.set("status", query.status)
      if (query.category) searchParams.set("category", query.category)

      const response = await fetch(`/api/admin/courses?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch courses")
      }

      setCourses(result.data.courses)
      setPagination(result.data.pagination)
      setCategories(result.data.filters?.categories || [])
    } catch (err) {
      console.error("Courses fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  const createCourse = useCallback(async (data: Partial<Course>): Promise<{ success: boolean; error?: string; id?: string }> => {
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      await fetchCourses()
      return { success: true, id: result.data.course.id }
    } catch (err) {
      console.error("Create course error:", err)
      return { success: false, error: "Failed to create course" }
    }
  }, [fetchCourses])

  const updateCourse = useCallback(async (id: string, data: Partial<Course>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setCourses(prev => prev.map(c => 
        c.id === id ? { ...c, ...result.data.course } : c
      ))
      return { success: true }
    } catch (err) {
      console.error("Update course error:", err)
      return { success: false, error: "Failed to update course" }
    }
  }, [])

  const deleteCourse = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setCourses(prev => prev.filter(c => c.id !== id))
      return { success: true }
    } catch (err) {
      console.error("Delete course error:", err)
      return { success: false, error: "Failed to delete course" }
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [queryParams])

  const refresh = useCallback(() => {
    fetchCourses()
  }, [fetchCourses])

  return {
    courses,
    loading,
    error,
    pagination,
    categories,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    refresh,
  }
}
