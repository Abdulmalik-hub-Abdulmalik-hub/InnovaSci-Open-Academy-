"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  Award, Search, Filter, RefreshCw, CheckCircle, DollarSign, Users,
  Calendar, Download, MoreVertical, Eye, Edit, XCircle
} from "lucide-react"
import toast from "react-hot-toast"

interface Award {
  id: string
  awardNumber: string
  firstName: string
  lastName: string
  email: string
  status: string
  amount: number
  currency: string
  coverageType: string
  startDate: string
  endDate: string | null
  scholarship: {
    name: string
    slug: string
    type: { name: string }
  }
  sponsor: {
    name: string
    logoUrl: string | null
  } | null
  acceptedAt: string | null
  paymentStatus: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  PENDING_ACCEPTANCE: { color: "text-yellow-400", bg: "bg-yellow-500/20" },
  ACTIVE: { color: "text-green-400", bg: "bg-green-500/20" },
  COMPLETED: { color: "text-blue-400", bg: "bg-blue-500/20" },
  CANCELLED: { color: "text-red-400", bg: "bg-red-500/20" },
  SUSPENDED: { color: "text-orange-400", bg: "bg-orange-500/20" },
  EXPIRED: { color: "text-gray-400", bg: "bg-gray-500/20" },
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchAwards = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      })
      if (search) params.append("search", search)
      if (statusFilter) params.append("status", statusFilter)

      const response = await fetch(`/api/admin/scholarships/awards?${params}`)
      const data = await response.json()

      if (data.success) {
        setAwards(data.data.awards)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      toast.error("Failed to fetch awards")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAwards()
  }, [search, statusFilter, currentPage])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.PENDING_ACCEPTANCE
    return (
      <Badge className={`${config.bg} ${config.color} border-0`}>
        {status.replace("_", " ")}
      </Badge>
    )
  }

  // Calculate totals
  const totalAmount = awards.reduce((sum, a) => sum + a.amount, 0)
  const activeCount = awards.filter((a) => a.status === "ACTIVE").length
  const pendingCount = awards.filter((a) => a.status === "PENDING_ACCEPTANCE").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Awards</h1>
          <p className="text-white/60 mt-1">
            Manage awarded scholarships and recipients
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Awards</p>
              <p className="text-2xl font-bold text-white">{pagination?.total || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Pending Acceptance</p>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount, "USD")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search by name, email, or award number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
              >
                <option value="">All Status</option>
                <option value="PENDING_ACCEPTANCE">Pending Acceptance</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="EXPIRED">Expired</option>
              </select>
              <Button
                variant="outline"
                onClick={fetchAwards}
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
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : awards.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/80 mb-2">No awards found</h3>
              <p className="text-white/50">Awards will appear here when applications are approved</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Recipient</TableHead>
                    <TableHead className="text-white/70">Scholarship</TableHead>
                    <TableHead className="text-white/70">Amount</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Start Date</TableHead>
                    <TableHead className="text-white/70">Payment</TableHead>
                    <TableHead className="text-white/70 w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awards.map((award) => (
                    <TableRow key={award.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">
                            {award.firstName} {award.lastName}
                          </p>
                          <p className="text-sm text-white/50">{award.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white">{award.scholarship.name}</p>
                          <p className="text-xs text-white/50">{award.scholarship.type.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-400">
                          {formatCurrency(award.amount, award.currency)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(award.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-white/70">
                          <Calendar className="h-4 w-4" />
                          {formatDate(award.startDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${award.paymentStatus === "PAID" ? "border-green-500/50 text-green-400" : ""}
                            ${award.paymentStatus === "PENDING" ? "border-yellow-500/50 text-yellow-400" : ""}
                            ${award.paymentStatus === "PROCESSING" ? "border-blue-500/50 text-blue-400" : ""}
                          `}
                        >
                          {award.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
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
    </div>
  )
}
