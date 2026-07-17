"use client"

import { useState, useEffect, useCallback } from "react"
import { syncManager, getSyncStats } from "@/lib/offline/sync-queue"
import { getCachedData, setCachedData } from "@/lib/offline/database"

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
  justReconnected: boolean
  syncStats: {
    pending: number
    failed: number
    completed: number
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const [justReconnected, setJustReconnected] = useState(false)
  const [syncStats, setSyncStats] = useState({ pending: 0, failed: 0, completed: 0 })

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)
    setWasOffline(!navigator.onLine)

    const handleOnline = () => {
      const wasOfflineBefore = !isOnline
      setIsOnline(true)
      setWasOffline(false)
      
      if (wasOfflineBefore) {
        setJustReconnected(true)
        // Reset justReconnected after 5 seconds
        setTimeout(() => setJustReconnected(false), 5000)
      }
      
      // Trigger sync when coming back online
      syncManager.forceSyncNow()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      setJustReconnected(false)
    }

    const handleSyncQueueUpdated = () => {
      getSyncStats().then(setSyncStats)
    }

    const handleNetworkStatusChanged = (e: CustomEvent) => {
      if (e.detail?.isOnline) {
        handleOnline()
      } else {
        handleOffline()
      }
    }

    // Listen for events
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("sync-queue-updated", handleSyncQueueUpdated)
    window.addEventListener("network-status-changed", handleNetworkStatusChanged as EventListener)

    // Initial sync stats
    getSyncStats().then(setSyncStats)

    // Periodic sync stats refresh
    const interval = setInterval(() => {
      getSyncStats().then(setSyncStats)
    }, 10000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("sync-queue-updated", handleSyncQueueUpdated)
      window.removeEventListener("network-status-changed", handleNetworkStatusChanged as EventListener)
      clearInterval(interval)
    }
  }, [isOnline])

  return {
    isOnline,
    wasOffline,
    justReconnected,
    syncStats,
  }
}

// Hook for detecting slow connections
export function useSlowConnection() {
  const [isSlow, setIsSlow] = useState(false)
  const [effectiveType, setEffectiveType] = useState<string | null>(null)

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    if (connection) {
      const updateConnectionStatus = () => {
        const type = connection.effectiveType
        setEffectiveType(type)
        setIsSlow(type === "2g" || type === "slow-2g")
      }

      updateConnectionStatus()
      connection.addEventListener("change", updateConnectionStatus)

      return () => {
        connection.removeEventListener("change", updateConnectionStatus)
      }
    }
  }, [])

  return { isSlow, effectiveType }
}

// Hook for caching data locally
export function useLocalCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    category?: "COURSES" | "CATEGORIES" | "ENROLLMENTS" | "USERS" | "DASHBOARD" | "GENERAL"
    staleWhileRevalidate?: boolean
  } = {}
) {
  const { ttl, category = "GENERAL", staleWhileRevalidate = true } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try cache first
      const cached = await getCachedData<T>(key)
      
      if (cached !== undefined) {
        setData(cached)
        setIsFromCache(true)
        
        if (staleWhileRevalidate) {
          // Fetch fresh data in background
          try {
            const fresh = await fetcher()
            await setCachedData(key, fresh, category, ttl)
            setData(fresh)
            setIsFromCache(false)
          } catch (e) {
            // Ignore background refresh errors
            console.log("[useLocalCache] Background refresh failed, keeping cached data")
          }
        }
      } else {
        // No cache, fetch from server
        const fresh = await fetcher()
        await setCachedData(key, fresh, category, ttl)
        setData(fresh)
        setIsFromCache(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"))
      
      // Try to return stale cache on error
      const cached = await getCachedData<T>(key)
      if (cached !== undefined) {
        setData(cached)
        setIsFromCache(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, category, ttl, staleWhileRevalidate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refresh = useCallback(() => {
    return loadData()
  }, [loadData])

  return {
    data,
    setData,
    isLoading,
    error,
    isFromCache,
    refresh,
  }
}
