"use client"

import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, RefreshCw, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { getSyncStats } from "@/lib/offline/sync-queue"

interface SyncStatus {
  pending: number
  failed: number
}

export function OfflineBanner() {
  const { isOnline, justReconnected, syncStats } = useNetworkStatus()
  const [showReconnected, setShowReconnected] = useState(false)
  const [pendingOps, setPendingOps] = useState<SyncStatus>({ pending: 0, failed: 0 })

  useEffect(() => {
    if (justReconnected) {
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [justReconnected])

  useEffect(() => {
    const updatePendingOps = async () => {
      const stats = await getSyncStats()
      setPendingOps({ pending: stats.pending, failed: stats.failed })
    }

    updatePendingOps()
    const interval = setInterval(updatePendingOps, 5000)

    const handleQueueUpdate = () => updatePendingOps()
    window.addEventListener("sync-queue-updated", handleQueueUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener("sync-queue-updated", handleQueueUpdate)
    }
  }, [])

  // Don't show if online and no pending ops
  if (isOnline && pendingOps.pending === 0 && pendingOps.failed === 0 && !showReconnected) {
    return null
  }

  // Reconnected banner
  if (showReconnected && isOnline) {
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[100]"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 shadow-lg">
          <div className="container mx-auto flex items-center justify-center gap-3 text-sm font-medium">
            <Wifi className="h-4 w-4" />
            <span>Back online! Syncing your changes...</span>
            {pendingOps.pending > 0 && (
              <span className="flex items-center gap-1 ml-2 bg-white/20 px-2 py-0.5 rounded-full">
                <RefreshCw className="h-3 w-3 animate-spin" />
                {pendingOps.pending} pending
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Offline banner
  if (!isOnline) {
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[100]"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg">
          <div className="container mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <WifiOff className="h-4 w-4" />
              <span className="font-medium">You are offline</span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">
                Changes will sync when you reconnect
              </span>
            </div>
            {pendingOps.pending > 0 && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                <span>{pendingOps.pending} queued</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Syncing banner (online but pending ops)
  if (isOnline && pendingOps.pending > 0) {
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[100]"
      >
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 shadow-lg">
          <div className="container mx-auto flex items-center justify-center gap-3 text-sm font-medium">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Syncing {pendingOps.pending} change{pendingOps.pending !== 1 ? "s" : ""}...</span>
            {pendingOps.failed > 0 && (
              <span className="text-amber-200">
                ({pendingOps.failed} failed, retrying)
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

// Compact indicator for use in header/status bar
export function OfflineIndicator() {
  const { isOnline, syncStats } = useNetworkStatus()
  const hasPending = syncStats.pending > 0 || syncStats.failed > 0

  if (isOnline && !hasPending) {
    return null
  }

  return (
    <div
      className={`
        flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium
        ${!isOnline ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}
      `}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Syncing</span>
        </>
      )}
    </div>
  )
}
