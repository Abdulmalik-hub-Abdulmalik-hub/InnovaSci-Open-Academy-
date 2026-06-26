"use client"

import { useState, useEffect, useCallback } from "react"

export interface MaterialLesson {
  id: string
  title: string
  courseId: string
  courseTitle: string | null
}

export interface Material {
  id: string
  title: string
  type: string | null
  fileUrl: string
  visibility: string
  downloadAllowed: boolean
  createdAt: string
  lesson: MaterialLesson | null
}

export interface MaterialsFilters {
  lessons: { id: string; title: string }[]
  fileTypes: string[]
}

export interface MaterialsResponse {
  materials: Material[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: MaterialsFilters
}

interface UseMaterialsReturn {
  materials: Material[]
  loading: boolean
  uploading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  lessons: { id: string; title: string }[]
  fetchMaterials: (params?: {
    page?: number
    limit?: number
    search?: string
    lessonId?: string
    type?: string
  }) => Promise<void>
  uploadMaterial: (data: {
    file: File
    title: string
    lessonId: string
    type?: string
    visibility?: string
    downloadAllowed?: boolean
  }) => Promise<{ success: boolean; error?: string; material?: Material }>
  updateMaterial: (
    id: string,
    data: Partial<Pick<Material, "title" | "type" | "visibility" | "downloadAllowed">>
  ) => Promise<{ success: boolean; error?: string }>
  deleteMaterial: (id: string) => Promise<{ success: boolean; error?: string }>
  refresh: () => void
}

export function useMaterials(): UseMaterialsReturn {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([])
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    lessonId: "",
    type: "",
  })

  const fetchMaterials = useCallback(
    async (params?: Partial<typeof queryParams>) => {
      const query = { ...queryParams, ...params }
      setLoading(true)
      setError(null)

      try {
        const searchParams = new URLSearchParams()
        searchParams.set("page", String(query.page || 1))
        searchParams.set("limit", String(query.limit || 20))
        if (query.search) searchParams.set("search", query.search)
        if (query.lessonId) searchParams.set("lessonId", query.lessonId)
        if (query.type) searchParams.set("type", query.type)

        const response = await fetch(`/api/admin/materials?${searchParams.toString()}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch materials: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch materials")
        }

        setMaterials(result.data.materials)
        setPagination(result.data.pagination)
        setLessons(result.data.filters?.lessons || [])
      } catch (err) {
        console.error("Materials fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load materials")
      } finally {
        setLoading(false)
      }
    },
    [queryParams]
  )

  const uploadMaterial = useCallback(
    async (data: {
      file: File
      title: string
      lessonId: string
      type?: string
      visibility?: string
      downloadAllowed?: boolean
    }): Promise<{ success: boolean; error?: string; material?: Material }> => {
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append("file", data.file)
        formData.append("title", data.title)
        formData.append("lessonId", data.lessonId)
        if (data.type) formData.append("type", data.type)
        if (data.visibility) formData.append("visibility", data.visibility)
        if (data.downloadAllowed !== undefined) {
          formData.append("downloadAllowed", String(data.downloadAllowed))
        }

        const response = await fetch("/api/admin/materials", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (!result.success) {
          return { success: false, error: result.error }
        }

        // Refresh the materials list
        await fetchMaterials()
        return { success: true, material: result.data.material }
      } catch (err) {
        console.error("Upload material error:", err)
        return { success: false, error: "Failed to upload material" }
      } finally {
        setUploading(false)
      }
    },
    [fetchMaterials]
  )

  const updateMaterial = useCallback(
    async (
      id: string,
      data: Partial<Pick<Material, "title" | "type" | "visibility" | "downloadAllowed">>
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(`/api/admin/materials/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!result.success) {
          return { success: false, error: result.error }
        }

        setMaterials((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...result.data.material } : m))
        )
        return { success: true }
      } catch (err) {
        console.error("Update material error:", err)
        return { success: false, error: "Failed to update material" }
      }
    },
    []
  )

  const deleteMaterial = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch(`/api/admin/materials/${id}`, {
          method: "DELETE",
        })

        const result = await response.json()

        if (!result.success) {
          return { success: false, error: result.error }
        }

        setMaterials((prev) => prev.filter((m) => m.id !== id))
        return { success: true }
      } catch (err) {
        console.error("Delete material error:", err)
        return { success: false, error: "Failed to delete material" }
      }
    },
    []
  )

  useEffect(() => {
    fetchMaterials()
  }, [queryParams])

  const refresh = useCallback(() => {
    fetchMaterials()
  }, [fetchMaterials])

  return {
    materials,
    loading,
    uploading,
    error,
    pagination,
    lessons,
    fetchMaterials,
    uploadMaterial,
    updateMaterial,
    deleteMaterial,
    refresh,
  }
}