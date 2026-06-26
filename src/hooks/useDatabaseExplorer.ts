"use client"

import { useState, useCallback } from "react"

export interface TableInfo {
  name: string
  isProtected: boolean
}

export interface ColumnInfo {
  name: string
  type: string
  isId: boolean
  isOptional: boolean
}

export interface RowData {
  [key: string]: unknown
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UseDatabaseExplorerReturn {
  tables: TableInfo[]
  selectedTable: string | null
  columns: ColumnInfo[]
  rows: RowData[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  safeMode: boolean
  selectedRow: RowData | null
  setSelectedTable: (table: string | null) => void
  setSafeMode: (enabled: boolean) => void
  setRows: React.Dispatch<React.SetStateAction<RowData[]>>
  fetchTables: () => Promise<void>
  fetchRows: (table: string, options?: { page?: number; limit?: number; filterField?: string; filterValue?: string }) => Promise<void>
  fetchRow: (table: string, id: string) => Promise<RowData | null>
  updateRow: (table: string, id: string, data: Partial<RowData>) => Promise<{ success: boolean; error?: string }>
  deleteRow: (table: string, id: string) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

export function useDatabaseExplorer(): UseDatabaseExplorerReturn {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [rows, setRows] = useState<RowData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [safeMode, setSafeMode] = useState(true)
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchTables = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/database?action=list")
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch tables")
      }

      setTables(result.data.tables)
    } catch (err) {
      console.error("Fetch tables error:", err)
      setError(err instanceof Error ? err.message : "Failed to load tables")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchColumns = useCallback(async (table: string) => {
    try {
      const response = await fetch(`/api/admin/database?action=columns&table=${encodeURIComponent(table)}`)
      const result = await response.json()

      if (result.success) {
        setColumns(result.data.columns)
        return result.data
      }
      return null
    } catch (err) {
      console.error("Fetch columns error:", err)
      return null
    }
  }, [])

  const fetchRows = useCallback(async (
    table: string, 
    options?: { page?: number; limit?: number; filterField?: string; filterValue?: string }
  ) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        action: "rows",
        table,
        page: String(options?.page || 1),
        limit: String(options?.limit || 50),
      })

      if (options?.filterField && options?.filterValue) {
        params.set("filterField", options.filterField)
        params.set("filterValue", options.filterValue)
      }

      const response = await fetch(`/api/admin/database?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch rows")
      }

      setRows(result.data.rows)
      setPagination(result.data.pagination)
      setSelectedTable(table)

      // Also fetch columns
      await fetchColumns(table)
    } catch (err) {
      console.error("Fetch rows error:", err)
      setError(err instanceof Error ? err.message : "Failed to load rows")
    } finally {
      setLoading(false)
    }
  }, [fetchColumns])

  const fetchRow = useCallback(async (table: string, id: string): Promise<RowData | null> => {
    try {
      const response = await fetch(`/api/admin/database/${encodeURIComponent(table)}/${id}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch row")
      }

      setSelectedRow(result.data.row)
      return result.data.row
    } catch (err) {
      console.error("Fetch row error:", err)
      setError(err instanceof Error ? err.message : "Failed to load row")
      return null
    }
  }, [])

  const updateRow = useCallback(async (
    table: string, 
    id: string, 
    data: Partial<RowData>
  ): Promise<{ success: boolean; error?: string }> => {
    if (safeMode) {
      return { success: false, error: "Safe Mode is enabled. Disable Safe Mode to make changes." }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/database/${encodeURIComponent(table)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, safeMode }),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update row")
      }

      // Refresh rows
      await fetchRows(table)
      return { success: true }
    } catch (err) {
      console.error("Update row error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update row"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [safeMode, fetchRows])

  const deleteRow = useCallback(async (
    table: string, 
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (safeMode) {
      return { success: false, error: "Safe Mode is enabled. Disable Safe Mode to delete rows." }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/database/${encodeURIComponent(table)}/${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to delete row")
      }

      // Refresh rows
      await fetchRows(table)
      return { success: true }
    } catch (err) {
      console.error("Delete row error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete row"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [safeMode, fetchRows])

  return {
    tables,
    selectedTable,
    columns,
    rows,
    loading,
    error,
    pagination,
    safeMode,
    selectedRow,
    setSelectedTable,
    setSafeMode,
    setRows,
    fetchTables,
    fetchRows,
    fetchRow,
    updateRow,
    deleteRow,
    clearError,
  }
}