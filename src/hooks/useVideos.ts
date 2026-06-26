"use client"

import { useState, useCallback } from "react"

export interface VideoLesson {
  id: string
  title: string
  module: {
    id: string
    title: string
    course: {
      id: string
      title: string
    } | null
  } | null
}

export interface Video {
  id: string
  title: string
  videoUrl: string
  duration: number | null
  provider: string | null
  storageType: string | null
  orderIndex: number
  createdAt: string
  lesson?: VideoLesson | null
}

export interface VideoUploadData {
  lessonId: string
  title: string
  videoUrl?: string
  provider?: string
  storageType?: string
  file?: File
}

interface UseVideosReturn {
  videos: Video[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  fetchVideos: (params?: {
    lessonId?: string
    page?: number
    limit?: number
  }) => Promise<void>
  createVideo: (data: VideoUploadData) => Promise<{ success: boolean; error?: string; video?: Video }>
  updateVideo: (id: string, data: Partial<Video>) => Promise<{ success: boolean; error?: string }>
  deleteVideo: (id: string) => Promise<{ success: boolean; error?: string }>
  getSignedUrl: (videoId: string) => Promise<{ success: boolean; error?: string; url?: string }>
}

export function useVideos(): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchVideos = useCallback(async (params?: {
    lessonId?: string
    page?: number
    limit?: number
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params?.lessonId) searchParams.set("lessonId", params.lessonId)
      searchParams.set("page", String(params?.page || 1))
      searchParams.set("limit", String(params?.limit || 20))

      const response = await fetch(`/api/admin/videos?${searchParams.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch videos")
      }

      setVideos(result.data.videos)
      setPagination(result.data.pagination)
    } catch (err) {
      console.error("Fetch videos error:", err)
      setError(err instanceof Error ? err.message : "Failed to load videos")
    } finally {
      setLoading(false)
    }
  }, [])

  const createVideo = useCallback(async (data: VideoUploadData): Promise<{ success: boolean; error?: string; video?: Video }> => {
    try {
      const formData = new FormData()
      formData.append("lessonId", data.lessonId)
      formData.append("title", data.title)
      if (data.videoUrl) formData.append("videoUrl", data.videoUrl)
      if (data.provider) formData.append("provider", data.provider)
      if (data.storageType) formData.append("storageType", data.storageType)
      if (data.file) formData.append("file", data.file)

      const response = await fetch("/api/admin/videos", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      await fetchVideos()
      return { success: true, video: result.data }
    } catch (err) {
      console.error("Create video error:", err)
      return { success: false, error: "Failed to create video" }
    }
  }, [fetchVideos])

  const updateVideo = useCallback(async (id: string, data: Partial<Video>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setVideos(prev => prev.map(v => v.id === id ? { ...v, ...result.data } : v))
      return { success: true }
    } catch (err) {
      console.error("Update video error:", err)
      return { success: false, error: "Failed to update video" }
    }
  }, [])

  const deleteVideo = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setVideos(prev => prev.filter(v => v.id !== id))
      return { success: true }
    } catch (err) {
      console.error("Delete video error:", err)
      return { success: false, error: "Failed to delete video" }
    }
  }, [])

  const getSignedUrl = useCallback(async (videoId: string): Promise<{ success: boolean; error?: string; url?: string }> => {
    try {
      // Get auth token from localStorage or cookie
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      
      const response = await fetch(`/api/public/videos/${videoId}/stream`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      return { success: true, url: result.data.videoUrl }
    } catch (err) {
      console.error("Get signed URL error:", err)
      return { success: false, error: "Failed to get video URL" }
    }
  }, [])

  return {
    videos,
    loading,
    error,
    pagination,
    fetchVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    getSignedUrl,
  }
}