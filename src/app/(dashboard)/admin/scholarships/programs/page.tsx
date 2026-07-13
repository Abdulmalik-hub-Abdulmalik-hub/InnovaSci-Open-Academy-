"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  Award, Plus, Search, MoreVertical, Edit, Trash2, Copy, Archive,
  Eye, EyeOff, Star, StarOff, ExternalLink, ArrowUpDown, Filter,
  RefreshCw, Calendar, DollarSign, Users, Globe, Lock, Check
} from "lucide-react"
import toast from "react-hot-toast"

interface Scholarship {
  id: string
  name: string
  shortName: string | null
  slug: string
  description: string | null
  status: string
  visibility: string
  isFeatured: boolean
  type: { id: string; name: string; color: string | null }
  awardAmount: number | null
  currency: string
  coverageType: string
  maxRecipients: number | null
  currentRecipients: number
  openingDate: string | null
  closingDate: string | null
  applicationCount: number
  awardCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ScholarshipProgramsPage() {
  const router = useRouter()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchScholarships = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      })
      if (search) params.append("search", search)
      if (statusFilter) params.append("status", statusFilter)

      const response = await fetch(`/api/admin/scholarships/programs?${params}`)
      const data = await response.json()

      if (data.success) {
        setScholarships(data.data.scholarships)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      toast.error("Failed to fetch scholarships")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [search, statusFilter, currentPage])

  const handleAction = async (action: string, scholarship: Scholarship) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/scholarships/programs/${scholarship.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "publish" ? "PUBLISHED" : action === "close" ? "CLOSED" : action === "archive" ? "ARCHIVED" : undefined,
          isFeatured: action === "feature" ? true : action === "unfeature" ? false : undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Scholarship ${action === "publish" ? "published" : action === "close" ? "closed" : action === "archive" ? "archived" : action === "feature" ? "featured" : "unfeatured"} successfully`)
        fetchScholarships()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error("Failed to perform action")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedScholarship) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/scholarships/programs/${selectedScholarship.id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Scholarship deleted successfully")
        setDeleteDialogOpen(false)
        fetchScholarships()
      } else {
        toast.error(data.error)
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
      const response = await fetch("/api/admin/scholarships/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${scholarship.name} (Copy)`,
          slug: `${scholarship.slug}-copy-${Date.now()}`,
          typeId: "", // Will need to fetch type first
          status: "DRAFT",
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Scholarship duplicated successfully")
        router.push(`/admin/scholarships/programs/${data.data.id}`)
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error("Failed to duplicate scholarship")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      DRAFT: { bg: "bg-gray-500/20", text: "text-gray-400" },
      PUBLISHED: { bg: "bg-green-500/20", text: "text-green-400" },
      CLOSED: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
      ARCHIVED: { bg: "bg-red-500/20", text: "text-red-400" },
    }
    const variant = variants[status] || variants.DRAFT
    return (
      <Badge className={`${variant.bg} ${variant.text} border-0`}>
        {status}
      </Badge>
    )
  }

  const getVisibilityIcon = (visibility: string) => {
    if (visibility === "PUBLIC") return <Globe className="h-4 w-4 text-green-400" />
    if (visibility === "PRIVATE") return <Lock className="h-4 w-4 text-yellow-400" />
    return <Star className="h-4 w-4 text-purple-400" />
  }

  const formatDate = (date: string | null) => {
    if (!date) return "No deadline"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return "Not specified"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Programs</h1>
          <p className="text-white/60 mt-1">
            Create and manage scholarship programs
          </p>
        </div>
        <Link href="/admin/scholarships/programs/new">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Scholarship
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search scholarships..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-white/20 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter || "All Status"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1a1a2e] border-white/10">
                  <DropdownMenuItem onClick={() => { setStatusFilter(""); setCurrentPage(1) }}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("DRAFT"); setCurrentPage(1) }}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("PUBLISHED"); setCurrentPage(1) }}>
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("CLOSED"); setCurrentPage(1) }}>
                    Closed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("ARCHIVED"); setCurrentPage(1) }}>
                    Archived
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                onClick={fetchScholarships}
                className="border-white/20 text-white"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              All Scholarships ({pagination?.total || 0})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/80 mb-2">No scholarships found</h3>
              <p className="text-white/50 mb-4">Create your first scholarship to get started</p>
              <Link href="/admin/scholarships/programs/new">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Scholarship
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Scholarship</TableHead>
                    <TableHead className="text-white/70">Type</TableHead>
                    <TableHead className="text-white/70">Award</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Deadline</TableHead>
                    <TableHead className="text-white/70">Applications</TableHead>
                    <TableHead className="text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship) => (
                    <TableRow key={scholarship.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <Award className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {scholarship.name}
                              {scholarship.isFeatured && (
                                <Star className="inline-block h-4 w-4 text-amber-400 ml-1" />
                              )}
                            </p>
                            <p className="text-sm text-white/50">/{scholarship.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getVisibilityIcon(scholarship.visibility)}
                          <Badge
                            className="border-0"
                            style={{ backgroundColor: scholarship.type.color ? `${scholarship.type.color}20` : undefined }}
                          >
                            <span style={{ color: scholarship.type.color || "#fff" }}>
                              {scholarship.type.name}
                            </span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white">
                          {formatCurrency(scholarship.awardAmount, scholarship.currency)}
                          {scholarship.maxRecipients && (
                            <p className="text-sm text-white/50">
                              {scholarship.currentRecipients}/{scholarship.maxRecipients} slots
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(scholarship.status)}</TableCell>
                      <TableCell>
                        <div className="text-white/70">
                          {scholarship.closingDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(scholarship.closingDate)}
                            </div>
                          ) : (
                            <span className="text-white/50">No deadline</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="text-white font-medium">{scholarship.applicationCount}</div>
                          <div className="text-xs text-white/50">{scholarship.awardCount} awarded</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1a1a2e] border-white/10">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/scholarships/programs/${scholarship.id}`)}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`/scholarships/apply/${scholarship.slug}`, "_blank")}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Public Page
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("duplicate", scholarship)}
                              disabled={actionLoading}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {scholarship.status === "DRAFT" && (
                              <DropdownMenuItem
                                onClick={() => handleAction("publish", scholarship)}
                                disabled={actionLoading}
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {scholarship.status === "PUBLISHED" && (
                              <DropdownMenuItem
                                onClick={() => handleAction("close", scholarship)}
                                disabled={actionLoading}
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                              >
                                <EyeOff className="h-4 w-4 mr-2" />
                                Close
                              </DropdownMenuItem>
                            )}
                            {scholarship.status !== "ARCHIVED" && (
                              <DropdownMenuItem
                                onClick={() => handleAction("archive", scholarship)}
                                disabled={actionLoading}
                                className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleAction(scholarship.isFeatured ? "unfeature" : "feature", scholarship)}
                              disabled={actionLoading}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              {scholarship.isFeatured ? (
                                <>
                                  <StarOff className="h-4 w-4 mr-2" />
                                  Remove Feature
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Feature
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedScholarship(scholarship)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Scholarship</DialogTitle>
          </DialogHeader>
          <p className="text-white/70">
            Are you sure you want to delete "{selectedScholarship?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
