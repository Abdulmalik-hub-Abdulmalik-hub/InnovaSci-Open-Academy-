"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  GraduationCap,
  Mail,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

const statusConfig: Record<string, { color: string; icon: any }> = {
  DRAFT: { color: "bg-gray-500/20 text-gray-400", icon: Clock },
  SUBMITTED: { color: "bg-blue-500/20 text-blue-400", icon: Mail },
  UNDER_REVIEW: { color: "bg-purple-500/20 text-purple-400", icon: Clock },
  INTERVIEW: { color: "bg-amber-500/20 text-amber-400", icon: User },
  APPROVED: { color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  REJECTED: { color: "bg-red-500/20 text-red-400", icon: XCircle },
  AWARDED: { color: "bg-emerald-500/20 text-emerald-400", icon: GraduationCap },
  EXPIRED: { color: "bg-gray-500/20 text-gray-400", icon: Clock },
  WITHDRAWN: { color: "bg-gray-500/20 text-gray-400", icon: XCircle },
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [scholarshipFilter, setScholarshipFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      if (scholarshipFilter) params.set("scholarshipId", scholarshipFilter)

      const response = await fetch(`/api/admin/applications?${params}`)
      const data = await response.json()
      
      setApplications(data.applications || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotal(data.pagination?.total || 0)
      setStatusCounts(data.statusCounts || {})
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [page, statusFilter, scholarshipFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchApplications()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            Scholarship Applications
          </h1>
          <p className="text-white/60 mt-1">Review and manage scholarship applications</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = statusConfig[status] || { color: "bg-gray-500/20 text-gray-400", icon: Clock }
          const Icon = config.icon
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
              className={`cursor-pointer transition-all ${statusFilter === status ? "ring-2 ring-purple-500" : ""}`}
            >
              <Card className={`bg-[#1a1a2e] border-white/10 ${statusFilter === status ? "border-purple-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{status.replace("_", " ")}</p>
                      <p className="text-2xl font-bold text-white">{count}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search by name, email, or application number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="INTERVIEW">Interview</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="AWARDED">Awarded</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            All Applications ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No applications found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/60">Applicant</TableHead>
                    <TableHead className="text-white/60">Scholarship</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Submitted</TableHead>
                    <TableHead className="text-white/60">Reviews</TableHead>
                    <TableHead className="text-white/60 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const config = statusConfig[app.status] || { color: "bg-gray-500/20 text-gray-400", icon: Clock }
                    const Icon = config.icon
                    
                    return (
                      <TableRow key={app.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-purple-400 font-medium">
                                {app.firstName?.charAt(0)}{app.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{app.firstName} {app.lastName}</p>
                              <p className="text-white/50 text-sm">{app.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">{app.scholarship?.name}</p>
                            <p className="text-white/50 text-sm">{app.applicationNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {app.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/60">
                          {app.submittedAt 
                            ? formatDistanceToNow(new Date(app.submittedAt), { addSuffix: true })
                            : "Not submitted"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {app.reviews?.map((review: any) => (
                              <Badge 
                                key={review.id} 
                                variant="outline" 
                                className={`border-white/20 ${
                                  review.status === "COMPLETED" ? "text-green-400" : "text-amber-400"
                                }`}
                              >
                                {review.totalScore ? `${review.totalScore}/100` : "Pending"}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4 text-white/60" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                              <DropdownMenuItem>
                                <Link href={`/admin/scholarships/applications/${app.id}`} className="flex items-center w-full">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <a href={`mailto:${app.email}`} className="flex items-center w-full">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </a>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-white/60 text-sm">
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} applications
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-white/10 text-white"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-white/10 text-white"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
