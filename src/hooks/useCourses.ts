"use client"

import { useState, useEffect, useCallback } from "react"

export interface CourseStats {
  enrollments: number
  completed: number
  wishlists: number
  modules: number
  lessons: number
}

export interface ModuleStats {
  lessons: number
  duration: number
  completed: number
}

export interface CourseCategory {
  id?: string
  name: string
}

export interface Course {
  id: string
  title: string
  slug: string
  category: CourseCategory | string | null
  categoryId?: string | null
  subcategory: string | null
  shortDescription: string | null
  price: number
  isFree: boolean
  status: string
  thumbnailUrl: string | null
  introVideoUrl: string | null
  difficultyLevel: string | null
  durationHours: number | null
  language: string | null
  createdAt: string
  updatedAt: string
  stats: CourseStats
}

export interface ModuleLesson {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonType: string
  duration: number | null
  videoUrl: string | null
  isPreview: boolean
  isFree: boolean
  isExercise: boolean
  exerciseDescription: string | null
  exerciseFilesUrl: string | null
  solutionVideoUrl: string | null
  materialsCount: number
  videosCount: number
}

export interface Module {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonsCount: number
  lessons: ModuleLesson[]
  stats?: ModuleStats
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

export interface CurriculumLesson {
  id: string
  title: string
  description?: string
  orderIndex: number
  lessonType: string
  duration?: number
  videoUrl?: string
  isPreview?: boolean
  isFree: boolean
  isAccessible?: boolean
}

export interface CurriculumModule {
  id: string
  title: string
  description?: string
  orderIndex: number
  lessons: CurriculumLesson[]
}

export interface CourseCurriculum {
  course: {
    id: string
    title: string
    slug: string
    isFree: boolean
    price?: number
  }
  isEnrolled: boolean
  enrollment?: {
    progressPercent: number
    completed: boolean
    enrolledAt: string
  } | null
  curriculum: {
    modules: CurriculumModule[]
    totalLessons: number
    totalDuration: number
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
  fetchModules: (courseId: string) => Promise<Module[]>
  createModule: (courseId: string, data: { title: string; description?: string }) => Promise<{ success: boolean; error?: string; module?: Module }>
  updateModule: (courseId: string, moduleId: string, data: { title?: string; description?: string }) => Promise<{ success: boolean; error?: string }>
  deleteModule: (courseId: string, moduleId: string) => Promise<{ success: boolean; error?: string }>
  reorderModules: (courseId: string, moduleIds: string[]) => Promise<{ success: boolean; error?: string }>
  createLesson: (courseId: string, moduleId: string, data: { title: string; description?: string; lessonType?: string; duration?: number; videoUrl?: string; isPreview?: boolean; isExercise?: boolean; exerciseDescription?: string; exerciseFilesUrl?: string; solutionVideoUrl?: string }) => Promise<{ success: boolean; error?: string; lesson?: ModuleLesson }>
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

  const fetchModules = useCallback(async (courseId: string): Promise<Module[]> => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch modules")
      }

      return result.data.modules
    } catch (err) {
      console.error("Fetch modules error:", err)
      throw err
    }
  }, [])

  const createModule = useCallback(async (
    courseId: string,
    data: { title: string; description?: string }
  ): Promise<{ success: boolean; error?: string; module?: Module }> => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      return { success: true, module: result.data }
    } catch (err) {
      console.error("Create module error:", err)
      return { success: false, error: "Failed to create module" }
    }
  }, [])

  const updateModule = useCallback(async (
    courseId: string,
    moduleId: string,
    data: { title?: string; description?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (err) {
      console.error("Update module error:", err)
      return { success: false, error: "Failed to update module" }
    }
  }, [])

  const deleteModule = useCallback(async (
    courseId: string,
    moduleId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (err) {
      console.error("Delete module error:", err)
      return { success: false, error: "Failed to delete module" }
    }
  }, [])

  const reorderModules = useCallback(async (
    courseId: string,
    moduleIds: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleIds }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (err) {
      console.error("Reorder modules error:", err)
      return { success: false, error: "Failed to reorder modules" }
    }
  }, [])

  const createLesson = useCallback(async (
    courseId: string,
    moduleId: string,
    data: {
      title: string
      description?: string
      lessonType?: string
      duration?: number
      videoUrl?: string
      isPreview?: boolean
      isExercise?: boolean
      exerciseDescription?: string
      exerciseFilesUrl?: string
      solutionVideoUrl?: string
    }
  ): Promise<{ success: boolean; error?: string; lesson?: ModuleLesson }> => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      return { success: true, lesson: result.data }
    } catch (err) {
      console.error("Create lesson error:", err)
      return { success: false, error: "Failed to create lesson" }
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
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    createLesson,
    refresh,
  }
}
