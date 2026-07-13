"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import {
  FileText, Search, Filter, RefreshCw, Eye, CheckCircle,
  XCircle, Clock, AlertCircle, Users, ChevronDown, ArrowUpDown,
  MoreVertical, UserCheck, UserX, Mail, Calendar
} from "lucide-react"
import toast from "react-hot-toast"

interface Application {
  id: string
  applicationNumber: string
  trackingNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  status: string
  submittedAt: string
  scholarship: {
    id: string
    name: string
    slug: string
    type: { name: string }
    awardAmount: number | null
  }
  reviewScore: number | null
  reviewerRecommendation: string | null
  hasUserAccount: boolean
  reviewsCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  SUBMITTED: { color: "text-blue-400", bg: "bg-blue-500/20", icon: FileText },
  UNDER_REVIEW: { color: "text-yellow-400", bg: "bg-yellow-500/20", icon: Clock },
  INTERVIEW: { color: "text-purple-400", bg: "bg-purple-500/20", icon: Users },
  ADDITIONAL_INFO: { color: "text-orange-400", bg: "bg-orange-500/20", icon: AlertCircle },
  APPROVED: { color: "text-green-400", bg: "bg-green-500/20", icon: CheckCircle },
  REJECTED: { color: "text-red-400", bg: "bg-red-500/20", icon: XCircle },
  WITHDRAWN: { color: "text-gray-400", bg: "bg-gray-500/20", icon: UserX },
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      })
      if (search) params.append("search", search)
      if (statusFilter) params.append("status", statusFilter)

      const response = await fetch(`/api/admin/scholarships/applications?${params}`)
      const data = await response.json()

      if (data.success) {
        setApplications(data.data.applications)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      toast.error("Failed to fetch applications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [search, statusFilter, currentPage])

  const handleStatusUpdate = async (ids: string[], newStatus: string) => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/scholarships/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds: ids, status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Updated ${ids.length} application(s)`)
        setBulkDialogOpen(false)
        setSelectedIds([])
        fetchApplications()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error("Failed to update applications")
    } finally {
      setActionLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(applications.map((a) => a.id))
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.SUBMITTED
    return (
      <Badge className={`${config.bg} ${config.color} border-0 flex items-center gap-1`}>
        <config.icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Applications</h1>
          <p className="text-white/60 mt-1">
            Review and manage scholarship applications
          </p>
        </div>
        {selectedIds.length > 0 && (
          <Button
            onClick={() => setBulkDialogOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Update {selectedIds.length} Selected
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search by name, email, or application number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-white/20 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter || "All Status"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1a1a2e] border-white/10">
                  <DropdownMenuItem onClick={() => { setStatusFilter(""); setCurrentPage(1) }}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => { setStatusFilter("SUBMITTED"); setCurrentPage(1) }}>
                    <FileText className="h-4 w-4 mr-2 text-blue-400" />
                    Submitted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("UNDER_REVIEW"); setCurrentPage(1) }}>
                    <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                    Under Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("INTERVIEW"); setCurrentPage(1) }}>
                    <Users className="h-4 w-4 mr-2 text-purple-400" />
                    Interview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("APPROVED"); setCurrentPage(1) }}>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter("REJECTED"); setCurrentPage(1) }}>
                    <XCircle className="h-4 w-4 mr-2 text-red-400" />
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                onClick={fetchApplications}
                className="border-white/20 text-white"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/80 mb-2">No applications found</h3>
              <p className="text-white/50">
                {search || statusFilter ? "Try adjusting your filters" : "Applications will appear here when submitted"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === applications.length}
                        onChange={toggleSelectAll}
                        className="rounded border-white/20 bg-white/5"
                      />
                    </TableHead>
                    <TableHead className="text-white/70">Applicant</TableHead>
                    <TableHead className="text-white/70">Scholarship</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Submitted</TableHead>
                    <TableHead className="text-white/70">Score</TableHead>
                    <TableHead className="text-white/70 w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="rounded border-white/20 bg-white/5"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">
                            {app.firstName} {app.lastName}
                          </p>
                          <p className="text-sm text-white/50">{app.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white">{app.scholarship.name}</p>
                          <p className="text-xs text-white/50">
                            {app.scholarship.type.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <div className="text-white/70 text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(app.submittedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.reviewScore !== null ? (
                          <span className={`font-medium ${
                            app.reviewScore >= 80 ? "text-green-400" :
                            app.reviewScore >= 60 ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {app.reviewScore.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
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
                              onClick={() => router.push(`/admin/scholarships/applications/${app.id}`)}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate([app.id], "UNDER_REVIEW")}
                              disabled={app.status !== "SUBMITTED"}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Mark Under Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate([app.id], "INTERVIEW")}
                              disabled={app.status !== "UNDER_REVIEW"}
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate([app.id], "APPROVED")}
                              disabled={!["UNDER_REVIEW", "INTERVIEW"].includes(app.status)}
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate([app.id], "REJECTED")}
                              disabled={!["SUBMITTED", "UNDER_REVIEW", "INTERVIEW"].includes(app.status)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
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
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                Showing {(currentPage - 1) * 15 + 1} to {Math.min(currentPage * 15, pagination.total)} of {pagination.total}
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

      {/* Bulk Update Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Bulk Update Applications</DialogTitle>
            <DialogDescription className="text-white/60">
              Update {selectedIds.length} selected application(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              onClick={() => handleStatusUpdate(selectedIds, "UNDER_REVIEW")}
              disabled={actionLoading}
              className="w-full justify-start bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
            >
              <Clock className="h-4 w-4 mr-2" />
              Mark as Under Review
            </Button>
            <Button
              onClick={() => handleStatusUpdate(selectedIds, "INTERVIEW")}
              disabled={actionLoading}
              className="w-full justify-start bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
            >
              <Users className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
            <Button
              onClick={() => handleStatusUpdate(selectedIds, "APPROVED")}
              disabled={actionLoading}
              className="w-full justify-start bg-green-500/20 text-green-400 hover:bg-green-500/30"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All
            </Button>
            <Button
              onClick={() => handleStatusUpdate(selectedIds, "REJECTED")}
              disabled={actionLoading}
              className="w-full justify-start bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject All
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDialogOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
