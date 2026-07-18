"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Award,
  CheckCircle,
  XCircle,
  DollarSign,
  Download,
  Eye,
  Calendar,
  Loader2,
  User,
  FileText,
  Mail,
  MoreHorizontal,
  AlertCircle
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

interface AwardApplication {
  id: string
  applicationNumber: string
  trackingCode: string
  scholarship: {
    id: string
    name: string
    slug: string
    awardAmount: number | null
    currency: string
    availableSlots: number | null
  }
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string | null
  country: string | null
  status: string
  reviewScore: number | null
  awardAmount: number | null
  interviewScore: number | null
  decision: string | null
  submittedAt: string | null
  createdAt: string
}

export default function ScholarshipAwardsPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<AwardApplication[]>([])
  const [search, setSearch] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<AwardApplication | null>(null)
  const [showAwardDialog, setShowAwardDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [awardAmount, setAwardAmount] = useState("")
  const [processing, setProcessing] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  useEffect(() => {
    fetchApplications()
  }, [pagination.page])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      // Fetch only APPROVED applications that could be awarded
      params.set("status", "APPROVED")
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

  const openAwardDialog = (application: AwardApplication) => {
    setSelectedApplication(application)
    setAwardAmount(application.scholarship.awardAmount?.toString() || "")
    setShowAwardDialog(true)
  }

  const viewDetails = (application: AwardApplication) => {
    setSelectedApplication(application)
    setShowDetailDialog(true)
  }

  const handleAward = async () => {
    if (!selectedApplication) return
    
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/scholarship-applications/${selectedApplication.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "AWARDED",
          awardAmount: parseFloat(awardAmount)
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Award granted to ${selectedApplication.fullName}!`)
        setShowAwardDialog(false)
        fetchApplications()
      } else {
        toast.error(data.error || "Failed to award scholarship")
      }
    } catch (error) {
      console.error("Error awarding scholarship:", error)
      toast.error("Failed to award scholarship")
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
          <h1 className="text-2xl font-bold text-white">Award Management</h1>
          <p className="text-white/60">Grant scholarships to approved applicants</p>
        </div>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Ready to Award</p>
                <p className="text-3xl font-bold text-white">{applications.length}</p>
              </div>
              <Award className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Total Awarded</p>
                <p className="text-3xl font-bold text-white">-</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-white">$0</p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm">Enrolled</p>
                <p className="text-3xl font-bold text-white">-</p>
              </div>
              <User className="h-10 w-10 text-orange-400" />
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
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Approved Applications ({pagination.total})</CardTitle>
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
              <Award className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-lg font-medium text-white mb-2">No approved applications</h3>
              <p className="text-white/60">
                Approved applications ready for awards will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Applicant</th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Scholarship</th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Score</th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium">Award Amount</th>
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
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white">{app.scholarship.name}</p>
                          <p className="text-white/40 text-sm">{app.applicationNumber}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-400 font-medium">
                          {app.reviewScore ? `${app.reviewScore}%` : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white">
                          {app.scholarship.awardAmount 
                            ? `${app.scholarship.currency} ${app.scholarship.awardAmount.toLocaleString()}`
                            : "Not set"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openAwardDialog(app)}
                          >
                            <Award className="h-4 w-4 mr-1" />
                            Award
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="border-white/20">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                              <DropdownMenuItem onClick={() => viewDetails(app)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
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

      {/* Award Dialog */}
      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Grant Scholarship Award</DialogTitle>
            <DialogDescription className="text-white/60">
              You are about to award a scholarship to {selectedApplication?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-white/5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Applicant</p>
                  <p className="text-white">{selectedApplication?.fullName}</p>
                </div>
                <div>
                  <p className="text-white/60">Scholarship</p>
                  <p className="text-white">{selectedApplication?.scholarship.name}</p>
                </div>
                <div>
                  <p className="text-white/60">Review Score</p>
                  <p className="text-green-400">{selectedApplication?.reviewScore}%</p>
                </div>
                <div>
                  <p className="text-white/60">Suggested Amount</p>
                  <p className="text-white">
                    {selectedApplication?.scholarship.currency} {selectedApplication?.scholarship.awardAmount?.toLocaleString() || "Not set"}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-white/60 mb-2 block">Award Amount ({selectedApplication?.scholarship.currency || "USD"})</label>
              <Input
                type="number"
                value={awardAmount}
                onChange={(e) => setAwardAmount(e.target.value)}
                placeholder="Enter award amount"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAwardDialog(false)}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAward}
              disabled={processing || !awardAmount}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Grant Award
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 mt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedApplication.fullName}</h3>
                  <p className="text-white/60">{selectedApplication.email}</p>
                  <p className="text-sm text-white/40">{selectedApplication.applicationNumber}</p>
                </div>
                {getStatusBadge(selectedApplication.status)}
              </div>

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
                  <p className="text-xs text-white/60 mb-1">Review Score</p>
                  <p className="text-green-400 font-medium">{selectedApplication.reviewScore}%</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-white/60 mb-1">Country</p>
                  <p className="text-white">{selectedApplication.country || "N/A"}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowDetailDialog(false)
                    openAwardDialog(selectedApplication)
                  }}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Award Scholarship
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
