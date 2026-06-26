"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuditLogs, AuditLogFilters } from "@/hooks/useAuditLogs"
import {
  FileText, Search, Download, Filter, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, Eye, X, Check, XCircle,
  User, Clock, Monitor, Database, Shield, AlertTriangle,
  ArrowUpRight, ArrowDownLeft, Pencil, Trash2, Plus
} from "lucide-react"

const ACTION_ICONS: Record<string, React.ReactNode> = {
  SELECT: <Eye className="h-4 w-4" />,
  INSERT: <Plus className="h-4 w-4" />,
  CREATE: <Plus className="h-4 w-4" />,
  UPDATE: <Pencil className="h-4 w-4" />,
  DELETE: <Trash2 className="h-4 w-4" />,
  BULK_UPDATE: <Pencil className="h-4 w-4" />,
  EXPORT: <Download className="h-4 w-4" />,
  LOGIN: <ArrowUpRight className="h-4 w-4" />,
  LOGOUT: <ArrowDownLeft className="h-4 w-4" />,
}

const ACTION_COLORS: Record<string, string> = {
  SELECT: "bg-blue-500/20 text-blue-400",
  INSERT: "bg-green-500/20 text-green-400",
  CREATE: "bg-green-500/20 text-green-400",
  UPDATE: "bg-yellow-500/20 text-yellow-400",
  DELETE: "bg-red-500/20 text-red-400",
  BULK_UPDATE: "bg-orange-500/20 text-orange-400",
  EXPORT: "bg-purple-500/20 text-purple-400",
  LOGIN: "bg-cyan-500/20 text-cyan-400",
  LOGOUT: "bg-gray-500/20 text-gray-400",
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  DB_EXPLORER: <Database className="h-4 w-4" />,
  USERS: <User className="h-4 w-4" />,
  SETTINGS: <Shield className="h-4 w-4" />,
  STORAGE: <Monitor className="h-4 w-4" />,
  AUTH: <Shield className="h-4 w-4" />,
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function AdminAuditLogsPage() {
  const {
    logs, loading, exporting, error, pagination, filters,
    selectedLog, fetchLogs, fetchLogDetail, exportLogs,
    clearError, setSelectedLog
  } = useAuditLogs()

  const [search, setSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<AuditLogFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchLogs({ limit: 50 })
  }, [fetchLogs])

  const handleSearch = () => {
    fetchLogs({ ...activeFilters, search: search || undefined, page: 1 })
  }

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    const newFilters = { ...activeFilters }
    if (value) {
      (newFilters as Record<string, unknown>)[key] = value
    } else {
      delete (newFilters as Record<string, unknown>)[key]
    }
    setActiveFilters(newFilters)
    fetchLogs({ ...newFilters, page: 1 })
  }

  const handleRowClick = async (logId: string) => {
    await fetchLogDetail(logId)
    setShowDetail(true)
  }

  const handleExport = () => {
    exportLogs({ ...activeFilters, format: "csv" })
  }

  const activeFilterCount = Object.keys(activeFilters).filter(k => 
    k !== "page" && k !== "limit" && (activeFilters as Record<string, unknown>)[k]
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
            <p className="text-white/60">Track all administrative actions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
          <Button
            onClick={() => fetchLogs({ ...activeFilters, page: 1 })}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

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

      {/* Search and Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-white/20 text-white ${activeFilterCount > 0 ? "bg-white/10" : ""}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-purple-500 text-white">{activeFilterCount}</Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/40">Module</label>
                <select
                  value={activeFilters.module || ""}
                  onChange={(e) => handleFilterChange("module", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">All Modules</option>
                  {filters.modules.map((m) => (
                    <option key={m.value} value={m.value}>{m.value} ({m.count})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40">Action</label>
                <select
                  value={activeFilters.action || ""}
                  onChange={(e) => handleFilterChange("action", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">All Actions</option>
                  {filters.actions.map((a) => (
                    <option key={a.value} value={a.value}>{a.value} ({a.count})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40">User</label>
                <select
                  value={activeFilters.userId || ""}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">All Users</option>
                  {filters.users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40">Status</label>
                <select
                  value={activeFilters.success === undefined ? "" : String(activeFilters.success)}
                  onChange={(e) => handleFilterChange("success", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">All</option>
                  <option value="true">Success</option>
                  <option value="false">Failed</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-white/40">Date Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={activeFilters.startDate || ""}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-white"
                  />
                  <span className="text-white/40">to</span>
                  <Input
                    type="date"
                    value={activeFilters.endDate || ""}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="col-span-2 flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setActiveFilters({})
                      fetchLogs({ limit: 50 })
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-[#1a1a2e] border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/50">No audit logs found</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-white/5 cursor-pointer"
                      onClick={() => handleRowClick(log.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">{formatRelativeTime(log.createdAt)}</div>
                        <div className="text-xs text-white/40">{formatDate(log.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">{log.userName}</div>
                        <div className="text-xs text-white/40">{log.userEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={ACTION_COLORS[log.action] || "bg-gray-500/20 text-gray-400"}>
                          <span className="flex items-center gap-1">
                            {ACTION_ICONS[log.action] || <FileText className="h-3 w-3" />}
                            {log.action}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          {MODULE_ICONS[log.module] || <FileText className="h-4 w-4" />}
                          {log.module}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.targetTable ? (
                          <div className="text-sm">
                            <span className="text-white/60">{log.targetTable}</span>
                            {log.targetId && (
                              <span className="text-white/40 ml-2 text-xs">#{log.targetId.slice(0, 8)}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <Check className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs({ ...activeFilters, page: pagination.page - 1 })}
              className="border-white/20 text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-white/60 text-sm px-4">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchLogs({ ...activeFilters, page: pagination.page + 1 })}
              className="border-white/20 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <CardTitle className="text-white">Audit Log Details</CardTitle>
                <Badge className={ACTION_COLORS[selectedLog.action] || "bg-gray-500/20 text-gray-400"}>
                  {selectedLog.action}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowDetail(false); setSelectedLog(null) }}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-6">
                {/* Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/40 uppercase">User</label>
                    <p className="text-white">{selectedLog.userName}</p>
                    <p className="text-sm text-white/60">{selectedLog.userEmail}</p>
                    {selectedLog.userRole && (
                      <Badge className="mt-1 bg-purple-500/20 text-purple-400">{selectedLog.userRole}</Badge>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase">Timestamp</label>
                    <p className="text-white">{formatDate(selectedLog.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase">Module</label>
                    <p className="text-white">{selectedLog.module}</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase">Status</label>
                    <div className="flex items-center gap-2">
                      {selectedLog.success ? (
                        <><Check className="h-5 w-5 text-green-400" /><span className="text-green-400">Success</span></>
                      ) : (
                        <><XCircle className="h-5 w-5 text-red-400" /><span className="text-red-400">Failed</span></>
                      )}
                    </div>
                  </div>
                  {selectedLog.targetTable && (
                    <div>
                      <label className="text-xs text-white/40 uppercase">Target Table</label>
                      <p className="text-white">{selectedLog.targetTable}</p>
                    </div>
                  )}
                  {selectedLog.targetId && (
                    <div>
                      <label className="text-xs text-white/40 uppercase">Target ID</label>
                      <p className="text-white font-mono text-sm">{selectedLog.targetId}</p>
                    </div>
                  )}
                  {selectedLog.affectedRows !== null && (
                    <div>
                      <label className="text-xs text-white/40 uppercase">Affected Rows</label>
                      <p className="text-white">{selectedLog.affectedRows}</p>
                    </div>
                  )}
                  {selectedLog.ipAddress && (
                    <div>
                      <label className="text-xs text-white/40 uppercase">IP Address</label>
                      <p className="text-white font-mono text-sm">{selectedLog.ipAddress}</p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {selectedLog.errorMessage && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <label className="text-xs text-red-400 uppercase">Error</label>
                    <p className="text-red-400">{selectedLog.errorMessage}</p>
                  </div>
                )}

                {/* Previous Data */}
                {selectedLog.previousData && (
                  <div>
                    <label className="text-xs text-white/40 uppercase mb-2 block">Previous Data</label>
                    <pre className="p-4 rounded-lg bg-white/5 border border-white/10 overflow-x-auto text-sm text-white/80">
                      {JSON.stringify(selectedLog.previousData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* New Data */}
                {selectedLog.newData && (
                  <div>
                    <label className="text-xs text-white/40 uppercase mb-2 block">New Data</label>
                    <pre className="p-4 rounded-lg bg-white/5 border border-white/10 overflow-x-auto text-sm text-white/80">
                      {JSON.stringify(selectedLog.newData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Details */}
                {selectedLog.details && (
                  <div>
                    <label className="text-xs text-white/40 uppercase mb-2 block">Additional Details</label>
                    <pre className="p-4 rounded-lg bg-white/5 border border-white/10 overflow-x-auto text-sm text-white/80">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Query */}
                {selectedLog.query && (
                  <div>
                    <label className="text-xs text-white/40 uppercase mb-2 block">Query</label>
                    <pre className="p-4 rounded-lg bg-white/5 border border-white/10 overflow-x-auto text-sm text-white/80 font-mono">
                      {selectedLog.query}
                    </pre>
                  </div>
                )}

                {/* User Agent */}
                {selectedLog.userAgent && (
                  <div>
                    <label className="text-xs text-white/40 uppercase mb-2 block">User Agent</label>
                    <p className="text-sm text-white/60 break-all">{selectedLog.userAgent}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}