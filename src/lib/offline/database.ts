/**
 * Offline-First Database using Dexie (IndexedDB)
 * Stores data locally for offline access and sync queue
 */

import Dexie, { Table } from "dexie"

// Types for sync queue items
export interface SyncQueueItem {
  id?: number
  uuid: string
  type: "CREATE" | "UPDATE" | "DELETE" | "UPLOAD" | "PAYMENT" | "ENROLLMENT" | "CERTIFICATE" | "AUTH_REFRESH"
  endpoint: string
  method: "POST" | "PUT" | "PATCH" | "DELETE"
  payload?: any
  headers?: Record<string, string>
  status: "PENDING" | "IN_PROGRESS" | "FAILED" | "COMPLETED"
  retryCount: number
  maxRetries: number
  error?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// Types for cached API responses
export interface CacheEntry {
  id?: number
  key: string // API endpoint + params hash
  data: any
  timestamp: Date
  expiresAt: Date
  category: "COURSES" | "CATEGORIES" | "ENROLLMENTS" | "USERS" | "DASHBOARD" | "GENERAL"
}

// Types for user session data
export interface SessionCache {
  id?: number
  userId: string
  role: string
  data: any
  expiresAt: Date
}

// Types for form drafts
export interface FormDraft {
  id?: number
  formKey: string // Unique key for the form
  data: any
  updatedAt: Date
}

// Types for pending uploads
export interface PendingUpload {
  id?: number
  uuid: string
  file: File | Blob
  endpoint: string
  fieldName: string
  metadata?: any
  status: "PENDING" | "IN_PROGRESS" | "FAILED" | "COMPLETED"
  progress: number
  error?: string
  createdAt: Date
  completedAt?: Date
}

// Database class
class OfflineDatabase extends Dexie {
  syncQueue!: Table<SyncQueueItem, number>
  cache!: Table<CacheEntry, number>
  sessions!: Table<SessionCache, number>
  formDrafts!: Table<FormDraft, number>
  pendingUploads!: Table<PendingUpload, number>

  constructor() {
    super("InnovaSciAcademyOffline")

    this.version(1).stores({
      syncQueue: "++id, uuid, type, status, createdAt, endpoint",
      cache: "++id, key, category, timestamp, expiresAt",
      sessions: "++id, userId, expiresAt",
      formDrafts: "++id, formKey, updatedAt",
      pendingUploads: "++id, uuid, status, createdAt",
    })
  }
}

// Singleton instance
export const offlineDb = new OfflineDatabase()

// Cache configuration
export const CACHE_CONFIG = {
  COURSES: { maxAge: 10 * 60 * 1000, ttl: 10 * 60 * 1000 }, // 10 minutes
  CATEGORIES: { maxAge: 30 * 60 * 1000, ttl: 30 * 60 * 1000 }, // 30 minutes
  ENROLLMENTS: { maxAge: 2 * 60 * 1000, ttl: 2 * 60 * 1000 }, // 2 minutes
  USERS: { maxAge: 5 * 60 * 1000, ttl: 5 * 60 * 1000 }, // 5 minutes
  DASHBOARD: { maxAge: 1 * 60 * 1000, ttl: 1 * 60 * 1000 }, // 1 minute
  GENERAL: { maxAge: 5 * 60 * 1000, ttl: 5 * 60 * 1000 }, // 5 minutes
} as const

// Helper functions
export async function getCachedData<T>(key: string): Promise<T | undefined> {
  const entry = await offlineDb.cache.where("key").equals(key).first()
  if (entry && entry.expiresAt > new Date()) {
    return entry.data as T
  }
  // Remove expired entry
  if (entry) {
    await offlineDb.cache.delete(entry.id!)
  }
  return undefined
}

export async function setCachedData(
  key: string,
  data: any,
  category: CacheEntry["category"],
  ttl?: number
): Promise<void> {
  const config = CACHE_CONFIG[category] || CACHE_CONFIG.GENERAL
  const expiresAt = new Date(Date.now() + (ttl || config.ttl))
  
  // Remove existing entry with same key
  await offlineDb.cache.where("key").equals(key).delete()
  
  await offlineDb.cache.add({
    key,
    data,
    timestamp: new Date(),
    expiresAt,
    category,
  })
}

export async function clearExpiredCache(): Promise<void> {
  const now = new Date()
  await offlineDb.cache.where("expiresAt").below(now).delete()
}

export async function clearAllCache(): Promise<void> {
  await offlineDb.cache.clear()
}

// Session management
export async function getCachedSession(): Promise<SessionCache | undefined> {
  const now = new Date()
  const sessions = await offlineDb.sessions.where("expiresAt").above(now).toArray()
  return sessions[0]
}

export async function cacheSession(userId: string, role: string, data: any, expiresIn: number = 24 * 60 * 60 * 1000): Promise<void> {
  // Clear existing sessions
  await offlineDb.sessions.clear()
  
  await offlineDb.sessions.add({
    userId,
    role,
    data,
    expiresAt: new Date(Date.now() + expiresIn),
  })
}

// Form draft management
export async function getFormDraft<T>(formKey: string): Promise<T | undefined> {
  const draft = await offlineDb.formDrafts.where("formKey").equals(formKey).first()
  return draft?.data as T | undefined
}

export async function saveFormDraft(formKey: string, data: any): Promise<void> {
  // Remove existing draft
  await offlineDb.formDrafts.where("formKey").equals(formKey).delete()
  
  await offlineDb.formDrafts.add({
    formKey,
    data,
    updatedAt: new Date(),
  })
}

export async function deleteFormDraft(formKey: string): Promise<void> {
  await offlineDb.formDrafts.where("formKey").equals(formKey).delete()
}

// Initialize database
export async function initOfflineDatabase(): Promise<void> {
  try {
    await offlineDb.open()
    // Clear expired entries on startup
    await clearExpiredCache()
    console.log("[OfflineDB] Database initialized successfully")
  } catch (error) {
    console.error("[OfflineDB] Failed to initialize database:", error)
  }
}
