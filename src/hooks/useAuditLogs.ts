"use client"

import { useState, useCallback } from "react"

export interface AuditLogEntry {
  id: string
  userId: string | null
  userEmail: string
  userName: string
  action: string
  module: string
  targetTable: string | null
  targetId: string | null
  affectedRows: number | null
  previousData: Record<string, unknown> | null
  newData: Record<string, unknown> | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  success: boolean
  errorMessage: string | null
  createdAt: string
}

export interface AuditLogDetail extends AuditLogEntry {
  query: string | null
  userAgent: string | null
  userRole: string | null
  userAvatar: string | null
}

export interface FilterOption {
  value: string
  count?: number
}

export interface UserOption {
  id: string
  email: string
  name: string | null
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UseAuditLogsReturn {
  logs: AuditLogEntry[]
  loading: boolean
  exporting: boolean
  error: string | null
  pagination: PaginationInfo | null
  filters: {
    modules: FilterOption[]
    actions: FilterOption[]
    users: UserOption[]
  }
  selectedLog: AuditLogDetail | null
  fetchLogs: (options?: AuditLogFilters) => Promise<void>
  fetchLogDetail: (id: string) => Promise<AuditLogDetail | null>
  exportLogs: (options?: AuditLogFilters & { format?: "csv" | "json" }) => Promise<void>
  clearError: () => void
  setSelectedLog: (log: AuditLogDetail | null) => void
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  module?: string
  action?: string
  userId?: string
  targetTable?: string
  startDate?: string
  endDate?: string
  success?: boolean
  search?: string
}

export function useAuditLogs(): UseAuditLogsReturn {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [filters, setFilters] = useState<{
    modules: FilterOption[]
    actions: FilterOption[]
    users: UserOption[]
  }>({ modules: [], actions: [], users: [] })
  const [selectedLog, setSelectedLog] = useState<AuditLogDetail | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchLogs = useCallback(async (options?: AuditLogFilters) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (options?.page) params.set("page", String(options.page))
      if (options?.limit) params.set("limit", String(options.limit))
      if (options?.module) params.set("module", options.module)
      if (options?.action) params.set("action", options.action)
      if (options?.userId) params.set("userId", options.userId)
      if (options?.targetTable) params.set("targetTable", options.targetTable)
      if (options?.startDate) params.set("startDate", options.startDate)
      if (options?.endDate) params.set("endDate", options.endDate)
      if (options?.success !== undefined) params.set("success", String(options.success))
      if (options?.search) params.set("search", options.search)

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch audit logs")
      }

      setLogs(result.data.logs)
      setPagination(result.data.pagination)
      setFilters(result.data.filters)
    } catch (err) {
      console.error("Fetch audit logs error:", err)
      setError(err instanceof Error ? err.message : "Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLogDetail = useCallback(async (id: string): Promise<AuditLogDetail | null> => {
    try {
      const response = await fetch(`/api/admin/audit-logs/${id}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch audit log")
      }

      const detail = result.data as AuditLogDetail
      setSelectedLog(detail)
      return detail
    } catch (err) {
      console.error("Fetch audit log detail error:", err)
      setError(err instanceof Error ? err.message : "Failed to load audit log detail")
      return null
    }
  }, [])

  const exportLogs = useCallback(async (options?: AuditLogFilters & { format?: "csv" | "json" }) => {
    setExporting(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {}
      
      if (options?.module) body.module = options.module
      if (options?.action) body.action = options.action
      if (options?.userId) body.userId = options.userId
      if (options?.startDate) body.startDate = options.startDate
      if (options?.endDate) body.endDate = options.endDate
      if (options?.format) body.format = options.format

      const response = await fetch("/api/admin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (options?.format === "csv" || !options?.format) {
        // For CSV, the response is a file download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || "Failed to export")
        }
        // Download JSON
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error("Export audit logs error:", err)
      setError(err instanceof Error ? err.message : "Failed to export audit logs")
    } finally {
      setExporting(false)
    }
  }, [])

  return {
    logs,
    loading,
    exporting,
    error,
    pagination,
    filters,
    selectedLog,
    fetchLogs,
    fetchLogDetail,
    exportLogs,
    clearError,
    setSelectedLog,
  }
}