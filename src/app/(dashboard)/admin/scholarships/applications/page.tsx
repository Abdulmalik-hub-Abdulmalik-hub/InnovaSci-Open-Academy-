"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Mail,
  MoreHorizontal,
  User,
  FileText,
  Calendar,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

interface Application {
  id: string
  applicationNumber: string
  trackingCode: string
  scholarship: {
    id: string
    name: string
    slug: string
    scholarshipType: { name: string; color: string } | null
  }
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string | null
  country: string | null
  state: string | null
  gender: string | null
  nationality: string | null
  highestDegree: string | null
  institution: string | null
  employmentStatus: string | null
  status: string
  subStatus: string | null
  decision: string | null
  reviewScore: number | null
  awardAmount: number | null
  interviewScheduledAt: string | null
  submittedAt: string | null
  createdAt: string
  documentCount: number
  hasRegisteredAccount: boolean
}

export default function ScholarshipApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  useEffect(() => {
    fetchApplications()
  }, [statusFilter, pagination.page])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const res = await fetch(`/api/admin/scholarship-applications?${params}`)
      const data = await res.json()

      if (data.success) {
        setApplications(data.data.applications)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchApplications()
  }

  const viewDetails = (application: Application) => {
    setSelectedApplication(application)
    setShowDetailDialog(true)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "success" | "destructive" | "warning"; label: string }> = {
      SUBMITTED: { variant: "secondary", label: "Submitted" },
      UNDER_REVIEW: { variant: "warning", label: "Under Review" },
      INTERVIEW: { variant: "warning", label: "Interview" },
      APPROVED: { variant: "success", label: "Approved" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      WAITLISTED: { variant: "warning", label: "Waitlisted" },
      AWARDED: { variant: "success", label: "Awarded" },
      ENROLLED: { variant: "success", label: "Enrolled" },
      WITHDRAWN: { variant: "destructive", label: "Withdrawn" },
      EXPIRED: { variant: "secondary", label: "Expired" },
    }
    const config = statusMap[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Applications</h1>
          <p className="text-white/60">Review and manage scholarship applications</p>
        </div>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search by name, email, or application number..."
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
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INTERVIEW">Interview</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="AWARDED">Awarded</option>
              <option value="ENROLLED">Enrolled</option>
            </select>
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Applications ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-lg font-medium text-white mb-2">No applications found</h3>
              <p className="text-white/60">
                {search || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Applications will appear here when students apply"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Applicant</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Scholarship</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Country</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Submitted</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-white/60" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{app.fullName}</p>
                            <p className="text-sm text-white/60">{app.email}</p>
                            <p className="text-xs text-white/40">{app.applicationNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white">{app.scholarship.name}</p>
                        {app.scholarship.scholarshipType && (
                          <p className="text-xs" style={{ color: app.scholarship.scholarshipType.color }}>
                            {app.scholarship.scholarshipType.name}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(app.status)}
                        {app.reviewScore && (
                          <p className="text-xs text-white/60 mt-1">Score: {app.reviewScore}%</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white/80">
                        {app.country || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {formatDate(app.submittedAt || app.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewDetails(app)}
                            className="text-white/60 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="h-4 w-4 mr-2 text-red-400" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Application Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Application Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedApplication.fullName}</h3>
                    <p className="text-white/60">{selectedApplication.email}</p>
                    <p className="text-sm text-white/40">{selectedApplication.applicationNumber}</p>
                  </div>
                  {getStatusBadge(selectedApplication.status)}
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/60 mb-1">Scholarship</p>
                    <p className="text-white font-medium">{selectedApplication.scholarship.name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/60 mb-1">Tracking Code</p>
                    <p className="text-white font-mono">{selectedApplication.trackingCode}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/60 mb-1">Country</p>
                    <p className="text-white">{selectedApplication.country || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/60 mb-1">Documents</p>
                    <p className="text-white">{selectedApplication.documentCount} uploaded</p>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-white/60">Phone:</span> <span className="text-white">{selectedApplication.phone || "N/A"}</span></div>
                    <div><span className="text-white/60">Gender:</span> <span className="text-white">{selectedApplication.gender || "N/A"}</span></div>
                    <div><span className="text-white/60">Nationality:</span> <span className="text-white">{selectedApplication.nationality || "N/A"}</span></div>
                    <div><span className="text-white/60">State:</span> <span className="text-white">{selectedApplication.state || "N/A"}</span></div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Education & Employment
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-white/60">Degree:</span> <span className="text-white">{selectedApplication.highestDegree || "N/A"}</span></div>
                    <div><span className="text-white/60">Institution:</span> <span className="text-white">{selectedApplication.institution || "N/A"}</span></div>
                    <div><span className="text-white/60">Status:</span> <span className="text-white">{selectedApplication.employmentStatus || "N/A"}</span></div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Submitted:</span>
                      <span className="text-white">{formatDate(selectedApplication.submittedAt)}</span>
                    </div>
                    {selectedApplication.interviewScheduledAt && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Interview:</span>
                        <span className="text-yellow-400">{formatDate(selectedApplication.interviewScheduledAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
