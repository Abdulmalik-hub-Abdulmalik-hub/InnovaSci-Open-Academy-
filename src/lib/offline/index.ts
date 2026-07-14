/**
 * Offline-First Module Exports
 */

export { OfflineProviders } from "@/components/offline/offline-providers"
export { OfflineBanner, OfflineIndicator } from "@/components/offline/offline-banner"
export { ErrorBoundary, InlineError, LoadingFallback, useErrorHandler } from "@/components/offline/error-boundary"
export { useNetworkStatus, useSlowConnection, useLocalCache } from "@/hooks/useNetworkStatus"

export { api, apiClient } from "./api-client"
export { syncManager, queueOperation, getSyncStats, getPendingOperations, canPerformServerOperation } from "./sync-queue"
export {
  offlineDb,
  getCachedData,
  setCachedData,
  clearExpiredCache,
  clearAllCache,
  getCachedSession,
  cacheSession,
  getFormDraft,
  saveFormDraft,
  deleteFormDraft,
  initOfflineDatabase,
  type SyncQueueItem,
  type CacheEntry,
  type SessionCache,
  type FormDraft,
  type PendingUpload,
} from "./database"
