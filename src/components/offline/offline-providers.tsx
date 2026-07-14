"use client"

import { ReactNode, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "./error-boundary"
import { OfflineBanner } from "./offline-banner"
import { initOfflineDatabase } from "@/lib/offline/database"
import { syncManager } from "@/lib/offline/sync-queue"
import { Toaster } from "@/components/ui/toaster"

// Create a client with offline-friendly configuration
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't retry on mount to avoid unnecessary requests when offline
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500) {
              return false
            }
          }
          // Retry up to 3 times on other errors
          return failureCount < 3
        },
        // Cache data for longer when offline
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        // Don't refetch on window focus when offline
        refetchOnWindowFocus: typeof navigator !== "undefined" ? navigator.onLine : true,
        // Retry on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations up to 3 times
        retry: 3,
        retryDelay: (attemptIndex) => {
          return Math.min(1000 * 2 ** attemptIndex, 10000)
        },
      },
    },
  })
}

interface OfflineProvidersProps {
  children: ReactNode
}

export function OfflineProviders({ children }: OfflineProvidersProps) {
  useEffect(() => {
    // Initialize offline database
    initOfflineDatabase().catch(console.error)
    
    // Start sync manager
    syncManager.startSync()
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service worker registered:', registration.scope)
        })
        .catch((error) => {
          console.error('[SW] Service worker registration failed:', error)
        })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_REQUESTED') {
          syncManager.forceSyncNow()
        }
      })
    }

    // Handle online/offline events
    const handleOnline = () => {
      console.log('[App] Back online')
      syncManager.forceSyncNow()
    }

    const handleOffline = () => {
      console.log('[App] Gone offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      syncManager.stopSync()
    }
  }, [])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={createQueryClient()}>
        <OfflineBanner />
        {children}
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

// Hook to use offline-aware query options
export function useOfflineQueryOptions() {
  return {
    retry: (failureCount: number, error: any) => {
      if (error?.offline || error?.message?.includes('offline')) {
        return false
      }
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      return failureCount < 3
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  }
}

// Component to handle network status changes at the app level
export function NetworkChangeHandler({ onOnline, onOffline }: {
  onOnline?: () => void
  onOffline?: () => void
}) {
  useEffect(() => {
    const handleOnline = () => onOnline?.()
    const handleOffline = () => onOffline?.()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [onOnline, onOffline])

  return null
}
