/**
 * Offline-First API Client
 * Provides automatic retry logic, cache-first strategy, and offline support
 */

import { getCachedData, setCachedData, CacheEntry, CACHE_CONFIG } from "./database"
import { queueOperation, canPerformServerOperation, syncManager, isServerDependent, SyncOperationType } from "./sync-queue"

export interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  headers?: Record<string, string>
  body?: any
  cacheKey?: string
  cacheCategory?: CacheEntry["category"]
  cacheTtl?: number
  skipCache?: boolean
  skipQueue?: boolean
  operationType?: SyncOperationType
  retries?: number
  retryDelay?: number
  backoffFactor?: number
  maxDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onOffline?: () => void
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fromCache?: boolean
  queued?: boolean
}

// Retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
}

// Check if error is retryable
function isRetryableError(error: any): boolean {
  if (error.name === "AbortError") return false
  if (error.message?.includes("timeout")) return true
  if (error.message?.includes("network")) return true
  if (error.status >= 500) return true
  if (error.status === 429) return true // Rate limited
  return false
}

// Calculate retry delay with exponential backoff
function calculateDelay(attempt: number, baseDelay: number, factor: number, maxDelay: number): number {
  const delay = Math.min(baseDelay * Math.pow(factor, attempt), maxDelay)
  // Add jitter (0-25% randomization)
  return delay * (0.75 + Math.random() * 0.5)
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Fetch with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit & { signal?: AbortSignal },
  retries: number,
  baseDelay: number,
  backoffFactor: number,
  maxDelay: number
): Promise<Response> {
  let lastError: any
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal,
      })
      
      // Don't retry on client errors (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response
      }
      
      return response
    } catch (error: any) {
      lastError = error
      
      // Don't retry if not retryable
      if (!isRetryableError(error)) {
        throw error
      }
      
      // Don't wait after last attempt
      if (attempt < retries) {
        const delay = calculateDelay(attempt, baseDelay, backoffFactor, maxDelay)
        console.log(`[ApiClient] Retry ${attempt + 1}/${retries} after ${delay}ms`)
        await sleep(delay)
      }
    }
  }
  
  throw lastError
}

/**
 * Main API client function
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    cacheKey,
    cacheCategory = "GENERAL",
    cacheTtl,
    skipCache = false,
    skipQueue = false,
    operationType,
    retries = DEFAULT_RETRY_CONFIG.maxRetries,
    retryDelay = DEFAULT_RETRY_CONFIG.baseDelay,
    backoffFactor = DEFAULT_RETRY_CONFIG.backoffFactor,
    maxDelay = DEFAULT_RETRY_CONFIG.maxDelay,
    onSuccess,
    onError,
    onOffline,
  } = options

  const isReadOperation = method === "GET"
  const fullCacheKey = cacheKey || `${method}:${endpoint}:${body ? JSON.stringify(body) : ""}`

  // Check if online
  if (!canPerformServerOperation()) {
    // For read operations, try to return cached data
    if (isReadOperation && !skipCache) {
      const cachedData = await getCachedData<T>(fullCacheKey)
      if (cachedData !== undefined) {
        console.log(`[ApiClient] Returning cached data for ${endpoint}`)
        return {
          success: true,
          data: cachedData,
          fromCache: true,
        }
      }
    }
    
    // For write operations, queue them
    if (!isReadOperation && !skipQueue) {
      const opType = operationType || (method === "POST" ? "CREATE" : method === "PUT" || method === "PATCH" ? "UPDATE" : "DELETE")
      
      if (isServerDependent(opType)) {
        console.log(`[ApiClient] Queuing ${opType} operation for ${endpoint}`)
        await queueOperation(opType, endpoint, method as any, body, headers)
        
        onOffline?.()
        
        return {
          success: true,
          queued: true,
        }
      }
    }
    
    // No cached data and can't queue - return offline error
    onOffline?.()
    
    return {
      success: false,
      error: "You are offline. This request has been queued and will be retried when you reconnect.",
    }
  }

  try {
    // For GET requests, try cache first
    if (isReadOperation && !skipCache) {
      const cachedData = await getCachedData<T>(fullCacheKey)
      if (cachedData !== undefined) {
        // Refresh cache in background
        fetchWithRetry(endpoint, { method, headers }, 1, 1000, 2, 5000)
          .then(async (response) => {
            if (response.ok) {
              const data = await response.json()
              await setCachedData(fullCacheKey, data, cacheCategory, cacheTtl)
            }
          })
          .catch(() => {}) // Ignore background refresh errors
        
        return {
          success: true,
          data: cachedData,
          fromCache: true,
        }
      }
    }

    // Make the actual request with retry
    const response = await fetchWithRetry(
      endpoint,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      },
      retries,
      retryDelay,
      backoffFactor,
      maxDelay
    )

    const data = await response.json()

    if (!response.ok) {
      const error = new Error(data.message || data.error || `HTTP ${response.status}`)
      ;(error as any).status = response.status
      ;(error as any).data = data
      
      onError?.(error)
      
      return {
        success: false,
        error: error.message,
      }
    }

    // Cache successful GET responses
    if (isReadOperation && !skipCache) {
      await setCachedData(fullCacheKey, data, cacheCategory, cacheTtl)
    }

    onSuccess?.(data)

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    console.error(`[ApiClient] Error for ${method} ${endpoint}:`, error)
    
    // If offline or network error, try to return cached data for GET
    if (isReadOperation && !skipCache) {
      const cachedData = await getCachedData<T>(fullCacheKey)
      if (cachedData !== undefined) {
        console.log(`[ApiClient] Falling back to cache for ${endpoint}`)
        return {
          success: true,
          data: cachedData,
          fromCache: true,
        }
      }
    }
    
    // If write operation and network error, queue it
    if (!isReadOperation && !skipQueue && (error.name === "TypeError" || error.message?.includes("network"))) {
      const opType = operationType || (method === "POST" ? "CREATE" : method === "PUT" || method === "PATCH" ? "UPDATE" : "DELETE")
      
      if (isServerDependent(opType)) {
        console.log(`[ApiClient] Queuing ${opType} operation for ${endpoint} due to network error`)
        await queueOperation(opType, endpoint, method as any, body, headers)
        
        return {
          success: true,
          queued: true,
        }
      }
    }

    onError?.(error)

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiClientOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiClientOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T = any>(endpoint: string, options?: Omit<ApiClientOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
}

// Start sync when module loads
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "complete") {
    syncManager.startSync()
  } else {
    window.addEventListener("load", () => syncManager.startSync())
  }
}
