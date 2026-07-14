/**
 * Sync Queue - Handles offline mutations and synchronization
 */

import { v4 as uuidv4 } from "uuid"
import { offlineDb, SyncQueueItem, PendingUpload } from "./database"

export type SyncOperationType = SyncQueueItem["type"]

// Retry configuration
const RETRY_DELAYS = [
  1000,    // 1 second
  2000,    // 2 seconds
  5000,    // 5 seconds
  10000,   // 10 seconds
  30000,   // 30 seconds
  60000,   // 1 minute
  120000,  // 2 minutes
]

// Operations that require online connection
const SERVER_DEPENDENT_OPERATIONS: SyncOperationType[] = [
  "CREATE",
  "UPDATE", 
  "DELETE",
  "UPLOAD",
  "PAYMENT",
  "ENROLLMENT",
  "CERTIFICATE",
  "AUTH_REFRESH",
]

export function isServerDependent(type: SyncOperationType): boolean {
  return SERVER_DEPENDENT_OPERATIONS.includes(type)
}

// Add operation to sync queue
export async function queueOperation(
  type: SyncOperationType,
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  payload?: any,
  headers?: Record<string, string>,
  maxRetries: number = 5
): Promise<string> {
  const uuid = uuidv4()
  
  const item: SyncQueueItem = {
    uuid,
    type,
    endpoint,
    method,
    payload,
    headers,
    status: "PENDING",
    retryCount: 0,
    maxRetries,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  await offlineDb.syncQueue.add(item)
  
  // Dispatch event for UI updates
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sync-queue-updated"))
  }
  
  return uuid
}

// Get all pending operations
export async function getPendingOperations(): Promise<SyncQueueItem[]> {
  return await offlineDb.syncQueue
    .where("status")
    .anyOf(["PENDING", "FAILED"])
    .and((item) => item.retryCount < item.maxRetries)
    .toArray()
}

// Get sync queue statistics
export async function getSyncStats(): Promise<{
  pending: number
  failed: number
  completed: number
}> {
  const [pending, failed, completed] = await Promise.all([
    offlineDb.syncQueue.where("status").equals("PENDING").count(),
    offlineDb.syncQueue.where("status").equals("FAILED").count(),
    offlineDb.syncQueue.where("status").equals("COMPLETED").count(),
  ])
  
  return { pending, failed, completed }
}

// Update operation status
export async function updateOperationStatus(
  uuid: string,
  status: SyncQueueItem["status"],
  error?: string
): Promise<void> {
  const item = await offlineDb.syncQueue.where("uuid").equals(uuid).first()
  if (item) {
    await offlineDb.syncQueue.update(item.id!, {
      status,
      error,
      updatedAt: new Date(),
      retryCount: status === "FAILED" ? item.retryCount + 1 : item.retryCount,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
    })
  }
  
  // Dispatch event for UI updates
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sync-queue-updated"))
  }
}

// Execute a single operation
async function executeOperation(item: SyncQueueItem): Promise<boolean> {
  try {
    await updateOperationStatus(item.uuid, "IN_PROGRESS")
    
    const response = await fetch(item.endpoint, {
      method: item.method,
      headers: {
        "Content-Type": "application/json",
        ...item.headers,
      },
      body: item.payload ? JSON.stringify(item.payload) : undefined,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    await updateOperationStatus(item.uuid, "COMPLETED")
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await updateOperationStatus(item.uuid, "FAILED", errorMessage)
    return false
  }
}

// Get delay for retry based on retry count
function getRetryDelay(retryCount: number): number {
  const index = Math.min(retryCount, RETRY_DELAYS.length - 1)
  // Add jitter (0-25% of delay)
  const jitter = Math.random() * RETRY_DELAYS[index] * 0.25
  return RETRY_DELAYS[index] + jitter
}

// Sync manager class
class SyncManager {
  private isRunning = false
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true
  private syncInterval: NodeJS.Timeout | null = null
  
  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline())
      window.addEventListener("offline", () => this.handleOffline())
    }
  }
  
  private handleOnline(): void {
    console.log("[SyncManager] Connection restored - starting sync")
    this.isOnline = true
    this.startSync()
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent("network-status-changed", { detail: { isOnline: true } }))
  }
  
  private handleOffline(): void {
    console.log("[SyncManager] Connection lost - pausing sync")
    this.isOnline = false
    this.stopSync()
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent("network-status-changed", { detail: { isOnline: false } }))
  }
  
  async startSync(): Promise<void> {
    if (this.isRunning || !this.isOnline) return
    
    this.isRunning = true
    console.log("[SyncManager] Sync started")
    
    // Initial sync
    await this.sync()
    
    // Set up periodic sync
    this.syncInterval = setInterval(() => this.sync(), 30000) // Every 30 seconds
  }
  
  stopSync(): void {
    this.isRunning = false
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    console.log("[SyncManager] Sync stopped")
  }
  
  async sync(): Promise<void> {
    if (!this.isOnline) {
      console.log("[SyncManager] Skipping sync - offline")
      return
    }
    
    const pendingOps = await getPendingOperations()
    
    if (pendingOps.length === 0) {
      return
    }
    
    console.log(`[SyncManager] Processing ${pendingOps.length} pending operations`)
    
    for (const op of pendingOps) {
      // Wait for retry delay if it's a retry
      if (op.retryCount > 0 && op.status === "FAILED") {
        const delay = getRetryDelay(op.retryCount - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      
      if (!this.isOnline) break // Stop if we went offline
      
      await executeOperation(op)
    }
    
    // Clean up completed operations older than 24 hours
    await this.cleanupOldOperations()
  }
  
  private async cleanupOldOperations(): Promise<void> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    await offlineDb.syncQueue
      .where("completedAt")
      .below(cutoff)
      .and((item) => item.status === "COMPLETED")
      .delete()
  }
  
  async forceSyncNow(): Promise<void> {
    await this.sync()
  }
  
  getIsOnline(): boolean {
    return this.isOnline
  }
}

// Singleton instance
export const syncManager = new SyncManager()

// Pending upload management
export async function queueUpload(
  file: File | Blob,
  endpoint: string,
  fieldName: string,
  metadata?: any
): Promise<string> {
  const uuid = uuidv4()
  
  const upload: PendingUpload = {
    uuid,
    file,
    endpoint,
    fieldName,
    metadata,
    status: "PENDING",
    progress: 0,
    createdAt: new Date(),
  }
  
  await offlineDb.pendingUploads.add(upload)
  
  // Trigger sync if online
  if (navigator.onLine) {
    syncManager.forceSyncNow()
  }
  
  return uuid
}

export async function getPendingUploads(): Promise<PendingUpload[]> {
  return await offlineDb.pendingUploads
    .where("status")
    .anyOf(["PENDING", "FAILED"])
    .toArray()
}

export async function updateUploadProgress(uuid: string, progress: number): Promise<void> {
  const upload = await offlineDb.pendingUploads.where("uuid").equals(uuid).first()
  if (upload) {
    await offlineDb.pendingUploads.update(upload.id!, { progress })
  }
}

export async function updateUploadStatus(
  uuid: string,
  status: PendingUpload["status"],
  error?: string
): Promise<void> {
  const upload = await offlineDb.pendingUploads.where("uuid").equals(uuid).first()
  if (upload) {
    await offlineDb.pendingUploads.update(upload.id!, {
      status,
      error,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
    })
  }
}

// Helper to check if we can perform a server operation
export function canPerformServerOperation(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine
}
