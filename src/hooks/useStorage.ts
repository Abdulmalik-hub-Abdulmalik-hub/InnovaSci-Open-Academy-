"use client"

import { useState, useCallback } from "react"

export interface StoredFile {
  id: string
  originalName: string
  storedName: string
  fileUrl: string
  originalUrl?: string
  fileSize: number
  fileSizeFormatted?: string
  mimeType: string
  fileType: string
  storageType: string
  folder: string | null
  tags: string[]
  courseId: string | null
  isOrphaned: boolean
  createdAt: string
}

export interface StorageInfo {
  localFiles: number
  localSize: number
  localSizeFormatted: string
  totalDbRecords: number
}

interface UseStorageReturn {
  files: StoredFile[]
  storageInfo: StorageInfo | null
  loading: boolean
  uploading: boolean
  error: string | null
  pagination: { page: number; limit: number; total: number; totalPages: number } | null
  fetchFiles: (options?: { type?: string; folder?: string; page?: number }) => Promise<void>
  uploadFiles: (files: File[], options?: { folder?: string; tags?: string[]; courseId?: string }) => Promise<{ success: boolean; error?: string }>
  deleteFile: (id: string) => Promise<{ success: boolean; error?: string }>
  updateFile: (id: string, data: { folder?: string; tags?: string[]; courseId?: string }) => Promise<{ success: boolean; error?: string }>
  findOrphans: () => Promise<{ orphans: StoredFile[]; totalSize: number } | null>
  deleteOrphans: (ids: string[]) => Promise<{ success: boolean; freedSpace?: string }>
}

export function useStorage(): UseStorageReturn {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)

  const fetchFiles = useCallback(async (options?: { type?: string; folder?: string; page?: number }) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options?.type) params.set("type", options.type)
      if (options?.folder) params.set("folder", options.folder)
      if (options?.page) params.set("page", String(options.page))

      const url = `/api/admin/storage/files${params.toString() ? `?${params}` : ""}`
      const response = await fetch(url)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch files")
      }

      setFiles(result.data.files)
      setStorageInfo(result.data.storage)
      setPagination(result.data.pagination)
    } catch (err) {
      console.error("Fetch files error:", err)
      setError(err instanceof Error ? err.message : "Failed to load files")
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadFiles = useCallback(async (
    files: File[], 
    options?: { folder?: string; tags?: string[]; courseId?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach(file => formData.append("files", file))
      if (options?.folder) formData.set("folder", options.folder)
      if (options?.tags) formData.set("tags", options.tags.join(","))
      if (options?.courseId) formData.set("courseId", options.courseId)

      const response = await fetch("/api/admin/storage/files", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      await fetchFiles()
      return { success: true }
    } catch (err) {
      console.error("Upload files error:", err)
      return { success: false, error: "Failed to upload files" }
    } finally {
      setUploading(false)
    }
  }, [fetchFiles])

  const deleteFile = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/storage/files/${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setFiles(prev => prev.filter(f => f.id !== id))
      return { success: true }
    } catch (err) {
      console.error("Delete file error:", err)
      return { success: false, error: "Failed to delete file" }
    }
  }, [])

  const updateFile = useCallback(async (
    id: string, 
    data: { folder?: string; tags?: string[]; courseId?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/storage/files/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setFiles(prev => prev.map(f => f.id === id ? { ...f, ...result.data } : f))
      return { success: true }
    } catch (err) {
      console.error("Update file error:", err)
      return { success: false, error: "Failed to update file" }
    }
  }, [])

  const findOrphans = useCallback(async (): Promise<{ orphans: StoredFile[]; totalSize: number } | null> => {
    try {
      const response = await fetch("/api/admin/storage/orphans")
      const result = await response.json()

      if (!result.success) {
        return null
      }

      return {
        orphans: result.data.orphans,
        totalSize: result.data.orphanedSize,
      }
    } catch (err) {
      console.error("Find orphans error:", err)
      return null
    }
  }, [])

  const deleteOrphans = useCallback(async (ids: string[]): Promise<{ success: boolean; freedSpace?: string }> => {
    try {
      const params = new URLSearchParams()
      params.set("ids", ids.join(","))
      
      const response = await fetch(`/api/admin/storage/orphans?${params}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (!result.success) {
        return { success: false }
      }

      await fetchFiles()
      return { success: true, freedSpace: result.data.freedSpaceFormatted }
    } catch (err) {
      console.error("Delete orphans error:", err)
      return { success: false }
    }
  }, [fetchFiles])

  return {
    files,
    storageInfo,
    loading,
    uploading,
    error,
    pagination,
    fetchFiles,
    uploadFiles,
    deleteFile,
    updateFile,
    findOrphans,
    deleteOrphans,
  }
}