"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Archive,
  Star,
  ExternalLink,
  Calendar,
  Users,
  DollarSign,
  X,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

interface Scholarship {
  id: string
  name: string
  shortName: string
  slug: string
  description: string
  scholarshipType: {
    id: string
    name: string
    icon: string
    color: string
  } | null
  status: string
  visibility: string
  applicationStatus: string
  awardAmount: number | null
  currency: string
  coverageType: string
  availableSlots: number | null
  openingDate: string | null
  closingDate: string | null
  isFeatured: boolean
  thumbnailUrl: string | null
  applicationCount: number
  sponsors: { id: string; name: string; logoUrl: string | null }[]
  createdAt: string
}

export default function ScholarshipProgramsPage() {
  const [loading, setLoading] = useState(true)
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  useEffect(() => {
    fetchScholarships()
  }, [statusFilter, pagination.page])

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      if (typeFilter) params.set("scholarshipTypeId", typeFilter)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const res = await fetch(`/api/admin/scholarships?${params}`)
      const data = await res.json()

      if (data.success) {
        setScholarships(data.data.scholarships)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error("Error fetching scholarships:", error)
      toast.error("Failed to load scholarships")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchScholarships()
  }

  const handleStatusChange = async (scholarshipId: string, newStatus: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/scholarships/${scholarshipId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Scholarship ${newStatus.toLowerCase()} successfully`)
        fetchScholarships()
      } else {
        toast.error(data.error || "Failed to update status")
      }
    } catch (error) {
      toast.error("Failed to update status")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedScholarship) return
    
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/scholarships/${selectedScholarship.id}`, {
        method: "DELETE"
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message || "Scholarship deleted")
        setShowDeleteDialog(false)
        setSelectedScholarship(null)
        fetchScholarships()
      } else {
        toast.error(data.error || "Failed to delete scholarship")
      }
    } catch (error) {
      toast.error("Failed to delete scholarship")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDuplicate = async (scholarship: Scholarship) => {
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${scholarship.name} (Copy)`,
          scholarshipTypeId: scholarship.scholarshipType?.id,
          description: scholarship.description,
          status: "DRAFT",
        })
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success("Scholarship duplicated")
        fetchScholarships()
      } else {
        toast.error(data.error || "Failed to duplicate scholarship")
      }
    } catch (error) {
      toast.error("Failed to duplicate scholarship")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "purple"; label: string }> = {
      DRAFT: { variant: "secondary", label: "Draft" },
      PUBLISHED: { variant: "default", label: "Published" },
      CLOSED: { variant: "purple", label: "Closed" },
      ARCHIVED: { variant: "destructive", label: "Archived" },
    }
    const config = statusMap[status] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getApplicationStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      OPEN: { variant: "default", label: "Open" },
      CLOSED: { variant: "destructive", label: "Closed" },
      PAUSED: { variant: "secondary", label: "Paused" },
      BY_INVITATION: { variant: "secondary", label: "By Invitation" },
    }
    const config = statusMap[status] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Programs</h1>
          <p className="text-white/60">Create and manage scholarship programs</p>
        </div>
        <Link href="/admin/scholarships/programs/create">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Scholarship
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search scholarships..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Scholarships ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <Plus className="h-8 w-8 text-white/40" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No scholarships found</h3>
              <p className="text-white/60 mb-4">
                {search || statusFilter || typeFilter
                  ? "Try adjusting your filters"
                  : "Get started by creating your first scholarship program"}
              </p>
              <Link href="/admin/scholarships/programs/create">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Scholarship
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {scholarships.map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Scholarship Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          {scholarship.thumbnailUrl ? (
                            <img src={scholarship.thumbnailUrl} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <span className="text-xl">🎓</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white">{scholarship.name}</h3>
                            {scholarship.isFeatured && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                          </div>
                          <p className="text-sm text-white/60 truncate">{scholarship.description || "No description"}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {getStatusBadge(scholarship.status)}
                            {getApplicationStatusBadge(scholarship.applicationStatus)}
                            {scholarship.scholarshipType && (
                              <Badge
                                variant="secondary"
                                style={{ backgroundColor: `${scholarship.scholarshipType.color}20`, color: scholarship.scholarshipType.color }}
                              >
                                {scholarship.scholarshipType.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-white/60">Applications</p>
                        <p className="text-lg font-semibold text-white">{scholarship.applicationCount}</p>
                      </div>
                      {scholarship.awardAmount && (
                        <div className="text-center">
                          <p className="text-white/60">Award</p>
                          <p className="text-lg font-semibold text-green-400">
                            {scholarship.currency} {scholarship.awardAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-white/60">Deadline</p>
                        <p className="text-lg font-semibold text-white">{formatDate(scholarship.closingDate)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/scholarships/programs/${scholarship.id}`}>
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/scholarships/programs/${scholarship.id}/edit`}>
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                          <DropdownMenuItem onClick={() => window.open(`/scholarships/${scholarship.slug}`, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Public Page
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(scholarship)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {scholarship.status === "DRAFT" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(solarship.id, "PUBLISHED")}>
                              <Star className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {scholarship.status === "PUBLISHED" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(solarship.id, "CLOSED")}>
                              <Archive className="h-4 w-4 mr-2" />
                              Close
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-400 focus:text-red-400"
                            onClick={() => { setSelectedScholarship(scholarship); setShowDeleteDialog(true) }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="border-white/10 text-white"
              >
                Previous
              </Button>
              <span className="text-white/60 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="border-white/10 text-white"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Scholarship</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete "{selectedScholarship?.name}"?
              {selectedScholarship && selectedScholarship.applicationCount > 0 && (
                <span className="block mt-2 text-yellow-400">
                  ⚠️ This scholarship has {selectedScholarship.applicationCount} applications and will be archived instead.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => { setShowDeleteDialog(false); setSelectedScholarship(null) }}
              className="border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
