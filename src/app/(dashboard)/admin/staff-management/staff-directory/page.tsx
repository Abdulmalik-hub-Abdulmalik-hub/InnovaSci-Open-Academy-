"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users, Search, Filter, Plus, Download, RefreshCw,
  MoreHorizontal, Eye, Edit, Trash2, UserX, UserCheck,
  Shield, Mail, Phone, MapPin, Calendar, Activity,
  ChevronLeft, ChevronRight, X, Loader2, AlertCircle,
  CheckCircle2, XCircle, Clock, Monitor, Tablet, Smartphone,
  FileText, Printer, Send, UserCog, Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"

// Type definitions
type PaginationState = { page: number; limit: number; total: number; totalPages: number }
type FilterState = Record<string, string | undefined>

// Status badge colors
const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  ACTIVE: { bg: "bg-green-500/20", text: "text-green-400", icon: CheckCircle2 },
  INACTIVE: { bg: "bg-gray-500/20", text: "text-gray-400", icon: Clock },
  SUSPENDED: { bg: "bg-red-500/20", text: "text-red-400", icon: XCircle },
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Super Admin",
  ACADEMIC_DIRECTOR: "Academic Director",
  INSTRUCTOR: "Instructor",
  REVIEWER: "Reviewer",
  PROJECT_SUPERVISOR: "Project Supervisor",
  FINANCE_OFFICER: "Finance Officer",
  ADMISSION_OFFICER: "Admission Officer",
  STUDENT_AFFAIRS: "Student Affairs",
  QUALITY_ASSURANCE: "Quality Assurance",
  RESEARCH_COORDINATOR: "Research Coordinator",
  SUPPORT_STAFF: "Support Staff",
}

// Stats card component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  description 
}: { 
  title: string
  value: string | number
  icon: any
  color: string
  description?: string
}) {
  return (
    <Card className="bg-[#1a1a2e] border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {description && (
              <p className="text-xs text-white/40 mt-1">{description}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Staff row component
function StaffRow({ 
  staff, 
  onSelect, 
  isSelected, 
  onAction 
}: { 
  staff: any
  onSelect: (id: string) => void
  isSelected: boolean
  onAction: (action: string, staff: any) => void
}) {
  const StatusIcon = statusColors[staff.status]?.icon || Clock
  const hasActiveSession = staff.hasActiveSession

  const rowClassName = isSelected 
    ? "border-b border-white/5 hover:bg-white/5 transition-colors bg-purple-500/10"
    : "border-b border-white/5 hover:bg-white/5 transition-colors"

  return (
    <tr className={rowClassName}>
      <td className="px-4 py-3">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onSelect(staff.id)}
          className="border-white/20"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={staff.avatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
              {staff.fullName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-white">{staff.fullName}</p>
            <p className="text-xs text-white/50">{staff.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-white/80">{staff.staffId || "N/A"}</p>
      </td>
      <td className="px-4 py-3">
        <Badge className={statusColors[staff.status]?.bg + " " + statusColors[staff.status]?.text}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {staff.status}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="border-white/20 text-white/80">
          {roleLabels[staff.role] || staff.role}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {staff.portals?.slice(0, 2).map((portal: any) => (
            <Badge 
              key={portal.id} 
              variant="outline" 
              className="border-white/10 text-xs"
              style={{ borderColor: portal.color || '#fff' }}
            >
              {portal.displayName}
            </Badge>
          ))}
          {staff.portals?.length > 2 && (
            <Badge variant="outline" className="border-white/10 text-xs">
              +{staff.portals.length - 2}
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-white/60">{staff.department || "N/A"}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-white/60">{staff.assignmentCount || 0}</p>
      </td>
      <td className="px-4 py-3">
        {hasActiveSession ? (
          <Badge className="bg-green-500/20 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse" />
            Online
          </Badge>
        ) : (
          <Badge className="bg-gray-500/20 text-gray-400">
            Offline
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-white/60">
          {staff.lastLogin ? formatDate(staff.lastLogin) : "Never"}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-white/60">
          {formatDate(staff.createdAt)}
        </p>
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
            <DropdownMenuItem className="cursor-pointer">
              <Link href={`/admin/staff-management/staff-directory/${staff.id}`} className="flex items-center w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("edit", staff)} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Edit Staff
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("assign", staff)} className="cursor-pointer">
              <UserCog className="h-4 w-4 mr-2" />
              Manage Assignments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("security", staff)} className="cursor-pointer">
              <Shield className="h-4 w-4 mr-2" />
              Security Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            {staff.status === "ACTIVE" ? (
              <DropdownMenuItem onClick={() => onAction("suspend", staff)} className="cursor-pointer text-yellow-400">
                <UserX className="h-4 w-4 mr-2" />
                Suspend Account
              </DropdownMenuItem>
            ) : staff.status === "SUSPENDED" ? (
              <DropdownMenuItem onClick={() => onAction("activate", staff)} className="cursor-pointer text-green-400">
                <UserCheck className="h-4 w-4 mr-2" />
                Activate Account
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => onAction("reset", staff)} className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => onAction("delete", staff)} className="cursor-pointer text-red-400">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Staff
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

// Helper function to format dates
function formatDate(date: string | Date): string {
  if (!date) return "N/A"
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// Filter component
function FilterPanel({ 
  filters, 
  onFilterChange, 
  onClear,
  domains,
  categories
}: { 
  filters: any
  onFilterChange: (key: string, value: any) => void
  onClear: () => void
  domains: any[]
  categories: any[]
}) {
  const roles = Object.entries(roleLabels).map(([value, label]) => ({ value, label }))
  const statuses = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ]

  return (
    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-white/60 hover:text-white">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-white/60 mb-1 block">Status</label>
          <select
            value={filters.status || ""}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-xs text-white/60 mb-1 block">Role</label>
          <select
            value={filters.role || ""}
            onChange={(e) => onFilterChange("role", e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-xs text-white/60 mb-1 block">Department</label>
          <Input
            placeholder="Filter by department"
            value={filters.department || ""}
            onChange={(e) => onFilterChange("department", e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        
        <div>
          <label className="text-xs text-white/60 mb-1 block">Domain</label>
          <select
            value={filters.domainId || ""}
            onChange={(e) => onFilterChange("domainId", e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          >
            <option value="">All Domains</option>
            {domains.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse mb-2" />
              <div className="h-8 w-12 bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-0">
          <div className="h-64 bg-white/5 animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffDirectoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({})
  const [domains, setDomains] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<any>(null)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState("")

  // Fetch staff data
  const fetchStaff = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())
      if (searchQuery) params.set("search", searchQuery)
      if (filters.status) params.set("status", filters.status)
      if (filters.role) params.set("role", filters.role)
      if (filters.department) params.set("department", filters.department)
      if (filters.domainId) params.set("domainId", filters.domainId)
      if (filters.portal) params.set("portal", filters.portal)

      const res = await fetch(`/api/admin/staff?${params.toString()}`)
      const data = await res.json()
      
      if (data.success) {
        setStaff(data.data.staff)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error("Error fetching staff:", error)
      toast.error("Failed to load staff data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/staff/stats")
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  // Fetch domains and categories for filters
  const fetchFilters = async () => {
    try {
      const [domainsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/domains"),
        fetch("/api/admin/categories"),
      ])
      const domainsData = await domainsRes.json()
      const categoriesData = await categoriesRes.json()
      
      if (domainsData.success) setDomains(domainsData.data)
      if (categoriesData.success) setCategories(categoriesData.data)
    } catch (error) {
      console.error("Error fetching filters:", error)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchStaff()
    fetchStats()
    fetchFilters()
  }, [pagination.page, filters])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || Object.keys(filters).length > 0) {
        setPagination((p: PaginationState) => ({ ...p, page: 1 }))
        fetchStaff()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle filter change
  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((f: FilterState) => ({ ...f, [key]: value }))
    setPagination((p: PaginationState) => ({ ...p, page: 1 }))
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({})
    setSearchQuery("")
    setPagination((p: PaginationState) => ({ ...p, page: 1 }))
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === staff.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(staff.map(s => s.id))
    }
  }

  // Handle individual select
  const handleSelect = (id: string) => {
    setSelectedIds(ids => 
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    )
  }

  // Handle action
  const handleAction = async (action: string, staffMember?: any) => {
    setActionLoading(true)
    try {
      switch (action) {
        case "suspend":
          await handleSuspend(staffMember?.id || selectedIds)
          break
        case "activate":
          await handleActivate(staffMember?.id || selectedIds)
          break
        case "reset":
          await handleResetPassword(staffMember?.id)
          break
        case "delete":
          setStaffToDelete(staffMember)
          setShowDeleteDialog(true)
          break
        case "bulk-suspend":
          setBulkAction("suspend")
          setShowBulkDialog(true)
          break
        case "bulk-activate":
          setBulkAction("activate")
          setShowBulkDialog(true)
          break
        case "bulk-export":
          await handleExport()
          break
      }
    } finally {
      setActionLoading(false)
    }
  }

  // Suspend staff
  const handleSuspend = async (ids: string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids]
    for (const id of idArray) {
      await fetch(`/api/admin/staff/${id}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend" })
      })
    }
    toast.success(`${idArray.length} account(s) suspended`)
    setSelectedIds([])
    fetchStaff()
    fetchStats()
  }

  // Activate staff
  const handleActivate = async (ids: string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids]
    for (const id of idArray) {
      await fetch(`/api/admin/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" })
      })
    }
    toast.success(`${idArray.length} account(s) activated`)
    setSelectedIds([])
    fetchStaff()
    fetchStats()
  }

  // Reset password
  const handleResetPassword = async (id: string) => {
    const res = await fetch(`/api/admin/staff/${id}/security`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_password" })
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`Password reset. Temporary password: ${data.temporaryPassword}`)
    } else {
      toast.error(data.error || "Failed to reset password")
    }
  }

  // Delete staff
  const handleDelete = async () => {
    if (!staffToDelete) return
    const res = await fetch(`/api/admin/staff/${staffToDelete.id}`, {
      method: "DELETE"
    })
    const data = await res.json()
    if (data.success) {
      toast.success("Staff deleted successfully")
      setShowDeleteDialog(false)
      setStaffToDelete(null)
      fetchStaff()
      fetchStats()
    } else {
      toast.error(data.error || "Failed to delete staff")
    }
  }

  // Export staff
  const handleExport = async () => {
    const params = new URLSearchParams()
    if (selectedIds.length > 0) {
      params.set("ids", selectedIds.join(","))
    }
    if (filters.status) params.set("includeInactive", "true")
    params.set("format", "csv")

    const res = await fetch(`/api/admin/staff/export?${params.toString()}`)
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `staff-export-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success("Staff exported successfully")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Directory</h1>
          <p className="text-white/60">Manage all staff members and their portal access</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleAction("bulk-export")}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => router.push("/admin/staff-management/staff-create")}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Staff"
            value={stats.overview.totalStaff}
            icon={Users}
            color="bg-blue-500/20"
          />
          <StatCard
            title="Active"
            value={stats.overview.activeStaff}
            icon={CheckCircle2}
            color="bg-green-500/20"
          />
          <StatCard
            title="Inactive"
            value={stats.overview.inactiveStaff}
            icon={Clock}
            color="bg-gray-500/20"
          />
          <StatCard
            title="Suspended"
            value={stats.overview.suspendedStaff}
            icon={XCircle}
            color="bg-red-500/20"
          />
          <StatCard
            title="Online Now"
            value={stats.sessions.active}
            icon={Monitor}
            color="bg-purple-500/20"
          />
          <StatCard
            title="Assignments"
            value={Object.values(stats.byRole as Record<string, number>).reduce((a: number, b: number) => a + b, 0)}
            icon={Activity}
            color="bg-amber-500/20"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search by name, email, staff ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {Object.keys(filters).length > 0 && (
            <Badge className="ml-2 bg-purple-500">{Object.keys(filters).length}</Badge>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={fetchStaff}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          domains={domains}
          categories={categories}
        />
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="bg-purple-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-white">
                <span className="font-bold">{selectedIds.length}</span> staff selected
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAction("bulk-activate")}
                  className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Activate All
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAction("bulk-suspend")}
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Suspend All
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedIds([])}
                  className="border-white/20 text-white/60"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left">
                      <Checkbox 
                        checked={selectedIds.length === staff.length && staff.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/20"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Staff ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Portals
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Assignments
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-white/50">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No staff members found</p>
                        <p className="text-sm text-white/40 mt-1">
                          Try adjusting your filters or add a new staff member
                        </p>
                      </td>
                    </tr>
                  ) : (
                    staff.map((staffMember) => (
                      <StaffRow
                        key={staffMember.id}
                        staff={staffMember}
                        isSelected={selectedIds.includes(staffMember.id)}
                        onSelect={handleSelect}
                        onAction={handleAction}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} staff
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((p: PaginationState) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-white/80 px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((p: PaginationState) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Staff Member</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete {staffToDelete?.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
