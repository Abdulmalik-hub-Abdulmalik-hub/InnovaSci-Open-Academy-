"use client"

import { useState, useCallback } from "react"

export interface Setting {
  key: string
  value: string
  type: string
  description?: string
  isEncrypted?: boolean
  isPublic?: boolean
}

interface UseSettingsReturn {
  settings: Record<string, Setting[]>
  loading: boolean
  saving: boolean
  error: string | null
  categories: string[]
  fetchSettings: (category?: string) => Promise<void>
  updateSetting: (key: string, value: string) => Promise<{ success: boolean; error?: string }>
  bulkUpdate: (settings: { key: string; value: string }[]) => Promise<{ success: boolean; error?: string }>
  initializeSettings: () => Promise<void>
  clearError: () => void
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Record<string, Setting[]>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchSettings = useCallback(async (category?: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = category ? `?category=${category}` : ""
      const response = await fetch(`/api/admin/settings${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch settings")
      }

      setSettings(result.data.settings)
      setCategories(result.data.categories || Object.keys(result.data.settings))
    } catch (err) {
      console.error("Fetch settings error:", err)
      setError(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSetting = useCallback(async (key: string, value: string): Promise<{ success: boolean; error?: string }> => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update setting")
      }

      // Refresh settings
      await fetchSettings()
      return { success: true }
    } catch (err) {
      console.error("Update setting error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update setting"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setSaving(false)
    }
  }, [fetchSettings])

  const bulkUpdate = useCallback(async (settingsToUpdate: { key: string; value: string }[]): Promise<{ success: boolean; error?: string }> => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToUpdate }),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update settings")
      }

      // Refresh settings
      await fetchSettings()
      return { success: true }
    } catch (err) {
      console.error("Bulk update error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update settings"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setSaving(false)
    }
  }, [fetchSettings])

  const initializeSettings = useCallback(async () => {
    setLoading(true)
    try {
      await fetch("/api/admin/settings?init=true")
      await fetchSettings()
    } finally {
      setLoading(false)
    }
  }, [fetchSettings])

  return {
    settings,
    loading,
    saving,
    error,
    categories,
    fetchSettings,
    updateSetting,
    bulkUpdate,
    initializeSettings,
    clearError,
  }
}