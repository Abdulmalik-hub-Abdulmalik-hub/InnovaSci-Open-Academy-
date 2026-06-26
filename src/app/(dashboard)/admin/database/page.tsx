"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDatabaseExplorer } from "@/hooks/useDatabaseExplorer"
import {
  Database, Table, Shield, ShieldAlert, Lock, Unlock,
  ChevronRight, ChevronDown, RefreshCw, Loader2, Trash2,
  Edit, Eye, Search, AlertTriangle, Check, X, ArrowLeft,
  ShieldCheck
} from "lucide-react"

export default function AdminDatabasePage() {
  const {
    tables, selectedTable, columns, rows, loading, error, pagination,
    safeMode, selectedRow, setSafeMode, setSelectedTable, fetchTables, fetchRows,
    fetchRow, updateRow, deleteRow, clearError, setRows
  } = useDatabaseExplorer()

  const [viewMode, setViewMode] = useState<"tables" | "rows" | "detail">("tables")
  const [filterField, setFilterField] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, unknown>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [unlockConfirm, setUnlockConfirm] = useState(false)

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const handleTableSelect = (tableName: string) => {
    fetchRows(tableName, { page: 1, limit: 50 })
    setViewMode("rows")
  }

  const handleRowClick = async (row: Record<string, unknown>) => {
    if (!selectedTable) return
    await fetchRow(selectedTable, row.id as string)
    setViewMode("detail")
  }

  const handleEdit = (row: Record<string, unknown>) => {
    setEditingRow(row.id as string)
    setEditData({ ...row })
  }

  const handleSaveEdit = async () => {
    if (!editingRow || !selectedTable) return
    
    const result = await updateRow(selectedTable, editingRow, editData)
    if (result.success) {
      setEditingRow(null)
      setEditData({})
    }
  }

  const handleCancelEdit = () => {
    setEditingRow(null)
    setEditData({})
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      if (!selectedTable) return
      const result = await deleteRow(selectedTable, id)
      if (result.success) {
        setDeleteConfirm(null)
      }
    } else {
      setDeleteConfirm(id)
    }
  }

  const handleFilter = () => {
    if (!selectedTable) return
    fetchRows(selectedTable, { 
      page: 1, 
      limit: 50,
      filterField: filterField || undefined,
      filterValue: filterValue || undefined
    })
  }

  const handleUnlock = () => {
    if (unlockConfirm) {
      setSafeMode(false)
      setShowUnlockModal(false)
      setUnlockConfirm(false)
    }
  }

  const handleLock = () => {
    setSafeMode(true)
  }

  const isProtectedTable = (tableName: string) => {
    return tables.find(t => t.name === tableName)?.isProtected || false
  }

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "NULL"
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Database Explorer</h1>
            <p className="text-white/60">Direct database access (Super Admin only)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Safe Mode Toggle */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            {safeMode ? (
              <Shield className="h-5 w-5 text-green-400" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-red-400" />
            )}
            <span className="text-white/60 text-sm">
              Safe Mode: {safeMode ? "ON" : "OFF"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (safeMode) {
                  setShowUnlockModal(true)
                } else {
                  handleLock()
                }
              }}
              className={safeMode ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"}
            >
              {safeMode ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </Button>
          </div>
          <Button 
            onClick={() => fetchTables()} 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-red-500/20 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                Disable Safe Mode?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">
                  ⚠️ <strong>Warning:</strong> Disabling Safe Mode will allow direct database modifications.
                  This is irreversible and can cause data loss.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unlock-confirm"
                  checked={unlockConfirm}
                  onChange={(e) => setUnlockConfirm(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="unlock-confirm" className="text-white/60 text-sm">
                  I understand the risks and want to proceed
                </label>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => { setShowUnlockModal(false); setUnlockConfirm(false) }}
                  className="flex-1 border-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleUnlock}
                  disabled={!unlockConfirm}
                  className="flex-1"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Disable Safe Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError} className="text-red-400">
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tables View */}
      {viewMode === "tables" && (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Table className="h-5 w-5" />
              Available Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => handleTableSelect(table.name)}
                    className={`p-4 rounded-lg border text-left transition-all hover:scale-[1.02] ${
                      table.isProtected 
                        ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40" 
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{table.name}</span>
                      {table.isProtected && (
                        <Shield className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-1">
                      {table.isProtected ? "Protected" : "Click to explore"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rows View */}
      {viewMode === "rows" && selectedTable && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => { setViewMode("tables"); setSelectedTable(null); setRows([]) }}
              className="text-white/60 hover:text-white"
            >
              Tables
            </button>
            <ChevronRight className="h-4 w-4 text-white/40" />
            <span className="text-white flex items-center gap-2">
              {selectedTable}
              {isProtectedTable(selectedTable) && (
                <Badge className="bg-red-500/20 text-red-400 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Protected
                </Badge>
              )}
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="">All columns</option>
                {columns.map((col) => (
                  <option key={col.name} value={col.name}>{col.name}</option>
                ))}
              </select>
              <Input
                placeholder="Filter value..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="max-w-xs bg-white/5 border-white/10 text-white"
              />
              <Button onClick={handleFilter} variant="outline" className="border-white/20 text-white">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-white/40 text-sm">
              {pagination?.total || 0} rows
            </span>
          </div>

          {/* Table */}
          <Card className="bg-[#1a1a2e] border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.name} className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">
                          {col.name}
                          {col.isId && <span className="ml-1 text-purple-400">PK</span>}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((row) => (
                      <tr key={row.id as string} className="hover:bg-white/5">
                        {columns.map((col) => (
                          <td 
                            key={col.name} 
                            className="px-4 py-3 text-sm text-white/80 max-w-xs truncate"
                            title={formatValue(row[col.name])}
                          >
                            {row[col.name] === "***MASKED***" ? (
                              <span className="text-yellow-400">••••••••</span>
                            ) : col.type === "DateTime" && row[col.name] ? (
                              new Date(row[col.name] as string).toLocaleString()
                            ) : col.type === "Decimal" || col.type === "Int" ? (
                              <span className="text-blue-400">{formatValue(row[col.name])}</span>
                            ) : (
                              formatValue(row[col.name])
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRowClick(row)}
                              className="text-white/60 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!isProtectedTable(selectedTable) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(row)}
                                  disabled={safeMode}
                                  className={`${safeMode ? "text-white/20" : "text-white/60 hover:text-white"}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(row.id as string)}
                                  disabled={safeMode}
                                  className={`${safeMode ? "text-white/20" : "text-red-400 hover:text-red-300"}`}
                                >
                                  {deleteConfirm === row.id ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchRows(selectedTable, { page: pagination.page - 1, limit: pagination.limit })}
                className="border-white/20 text-white"
              >
                Previous
              </Button>
              <span className="text-white/60 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchRows(selectedTable, { page: pagination.page + 1, limit: pagination.limit })}
                className="border-white/20 text-white"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Detail View */}
      {viewMode === "detail" && selectedRow && selectedTable && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => { setViewMode("tables"); setSelectedTable(null) }}
              className="text-white/60 hover:text-white"
            >
              Tables
            </button>
            <ChevronRight className="h-4 w-4 text-white/40" />
            <button 
              onClick={() => setViewMode("rows")}
              className="text-white/60 hover:text-white"
            >
              {selectedTable}
            </button>
            <ChevronRight className="h-4 w-4 text-white/40" />
            <span className="text-white">Row Details</span>
          </div>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Row Details
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() => setViewMode("rows")}
                className="text-white/60 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </CardHeader>
            <CardContent>
              {editingRow === selectedRow.id ? (
                // Edit Mode
                <div className="space-y-4">
                  {columns.map((col) => (
                    <div key={col.name} className="grid grid-cols-3 gap-4">
                      <label className="text-white/60 text-sm flex items-center gap-1">
                        {col.name}
                        {col.isId && <span className="text-purple-400 text-xs">PK</span>}
                      </label>
                      <div className="col-span-2">
                        {col.isId ? (
                          <Input
                            value={formatValue(editData[col.name])}
                            disabled
                            className="bg-white/5 border-white/10 text-white/40"
                          />
                        ) : (
                          <Input
                            value={formatValue(editData[col.name])}
                            onChange={(e) => setEditData({ ...editData, [col.name]: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            type={col.type === "Int" || col.type === "Decimal" ? "number" : "text"}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1 border-white/20 text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={safeMode}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-3">
                  {columns.map((col) => (
                    <div key={col.name} className="grid grid-cols-3 gap-4 py-2 border-b border-white/5">
                      <label className="text-white/60 text-sm flex items-center gap-1">
                        {col.name}
                        {col.isId && <span className="text-purple-400 text-xs">PK</span>}
                      </label>
                      <div className="col-span-2">
                        {selectedRow[col.name] === "***MASKED***" ? (
                          <span className="text-yellow-400">•••••••• (masked)</span>
                        ) : col.type === "DateTime" && selectedRow[col.name] ? (
                          <span className="text-white">{new Date(selectedRow[col.name] as string).toLocaleString()}</span>
                        ) : col.type === "Boolean" ? (
                          <Badge className={selectedRow[col.name] ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                            {String(selectedRow[col.name])}
                          </Badge>
                        ) : col.type === "Decimal" || col.type === "Int" ? (
                          <span className="text-blue-400">{formatValue(selectedRow[col.name])}</span>
                        ) : (
                          <span className="text-white break-all">{formatValue(selectedRow[col.name])}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {!isProtectedTable(selectedTable) && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(selectedRow)}
                        disabled={safeMode}
                        className={`flex-1 ${safeMode ? "border-white/10 text-white/20" : "border-white/20 text-white hover:bg-white/10"}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Row
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(selectedRow.id as string)}
                        disabled={safeMode}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleteConfirm === selectedRow.id ? "Confirm Delete?" : "Delete Row"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}