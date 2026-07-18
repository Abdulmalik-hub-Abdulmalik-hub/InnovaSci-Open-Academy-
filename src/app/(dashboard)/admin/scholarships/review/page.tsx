"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Download,
  FileText,
  User,
  Calendar,
  Loader2,
  MoreHorizontal,
  Mail,
  ClipboardCheck,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Pause
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
  DialogFooter,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

interface ReviewApplication {
  id: string
  applicationNumber: string
  trackingCode: string
  scholarship: {
    id: string
    name: string
    slug: string
    reviewRubricId: string | null
    requireInterview: boolean
  }
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string | null
  country: string | null
  gender: string | null
  highestDegree: string | null
  institution: string | null
  status: string
  subStatus: string | null
  reviewScore: number | null
  interviewScore: number | null
  decision: string | null
  submittedAt: string | null
  createdAt: string
  documentCount: number
}

export default function ScholarshipReviewPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<ReviewApplication[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("UNDER_REVIEW")
  const [selectedApplication, setSelectedApplication] = useState<ReviewApplication | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
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

  const viewDetails = (application: ReviewApplication) => {
    setSelectedApplication(application)
    setShowDetailDialog(true)
  }

  const updateStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/scholarship-applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Application status updated to ${newStatus}`)
        setShowDetailDialog(false)
        fetchApplications()
      } else {
        toast.error(data.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating application:", error)
      toast.error("Failed to update application")
    } finally {
      setProcessing(false)
    }
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
    }
    const config = statusMap[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A"
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
          <h1 className="text-2xl font-bold text-white">Review Queue</h1>
          <p className="text-white/60">Review and evaluate scholarship applications</p>
        </div>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Under Review</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Interview</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <User className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Approved</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <ThumbsDown className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
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
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INTERVIEW">Interview</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WAITLISTED">Waitlisted</option>
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
          <CardTitle className="text-white">Applications ({pagination.total})</CardTitle>
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
              <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-lg font-medium text-white mb-2">No applications to review</h3>
              <p className="text-white/60">
                {statusFilter ? `${statusFilter} applications will appear here` : "Applications awaiting review will appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Applicant</th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Scholarship</th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Education</th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Documents</th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{app.fullName}</p>
                          <p className="text-white/60 text-sm">{app.email}</p>
                          <p className="text-white/40 text-sm">{app.country}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white">{app.scholarship.name}</p>
                          <p className="text-white/40 text-sm">{app.applicationNumber}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white text-sm">{app.highestDegree || "N/A"}</p>
                          <p className="text-white/60 text-sm">{app.institution || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-white/40" />
                          <span className="text-white">{app.documentCount}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => viewDetails(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="border-white/20">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                              <DropdownMenuItem onClick={() => updateStatus(app.id, "UNDER_REVIEW")}>
                                <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                                Mark Under Review
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(app.id, "INTERVIEW")}>
                                <User className="h-4 w-4 mr-2 text-purple-400" />
                                Schedule Interview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateStatus(app.id, "APPROVED")}>
                                <ThumbsUp className="h-4 w-4 mr-2 text-green-400" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(app.id, "REJECTED")}>
                                <ThumbsDown className="h-4 w-4 mr-2 text-red-400" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(app.id, "WAITLISTED")}>
                                <Pause className="h-4 w-4 mr-2 text-orange-400" />
                                Waitlist
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
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

      {/* Review Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Review Application</DialogTitle>
            <DialogDescription className="text-white/60">
              Review the application details and make a decision
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
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

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-bold text-white">{selectedApplication.documentCount}</p>
                  <p className="text-xs text-white/60">Documents</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                  <p className="text-2xl font-bold text-white">
                    {selectedApplication.reviewScore ? `${selectedApplication.reviewScore}%` : "N/A"}
                  </p>
                  <p className="text-xs text-white/60">Review Score</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <User className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold text-white">
                    {selectedApplication.interviewScore ? `${selectedApplication.interviewScore}%` : "N/A"}
                  </p>
                  <p className="text-xs text-white/60">Interview</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-green-400" />
                  <p className="text-lg font-bold text-white">{formatDate(selectedApplication.submittedAt)}</p>
                  <p className="text-xs text-white/60">Submitted</p>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-sm font-medium text-white/60 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Phone:</span>
                      <span className="text-white">{selectedApplication.phone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Country:</span>
                      <span className="text-white">{selectedApplication.country || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Gender:</span>
                      <span className="text-white">{selectedApplication.gender || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-sm font-medium text-white/60 mb-3">Scholarship</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Program:</span>
                      <span className="text-white">{selectedApplication.scholarship.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Tracking Code:</span>
                      <span className="text-white font-mono">{selectedApplication.trackingCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Interview Required:</span>
                      <span className="text-white">{selectedApplication.scholarship.requireInterview ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="p-4 rounded-lg bg-white/5">
                <h4 className="text-sm font-medium text-white/60 mb-3">Education</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Highest Degree:</span>
                    <span className="text-white ml-2">{selectedApplication.highestDegree || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Institution:</span>
                    <span className="text-white ml-2">{selectedApplication.institution || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => updateStatus(selectedApplication.id, "APPROVED")}
                  disabled={processing}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => updateStatus(selectedApplication.id, "INTERVIEW")}
                  disabled={processing}
                >
                  <User className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button 
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={() => updateStatus(selectedApplication.id, "WAITLISTED")}
                  disabled={processing}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Waitlist
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() => updateStatus(selectedApplication.id, "REJECTED")}
                  disabled={processing}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
