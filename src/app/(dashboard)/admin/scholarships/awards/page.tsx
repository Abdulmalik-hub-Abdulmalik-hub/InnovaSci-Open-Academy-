"use client"

import { useState, useEffect } from "react"
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
  Award,
  Search,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Users,
} from "lucide-react"
import { format } from "date-fns"

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-500/20 text-amber-400", icon: Clock, label: "Pending" },
  ACCEPTED: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Accepted" },
  DECLINED: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Declined" },
  REVOKED: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Revoked" },
  EXPIRED: { color: "bg-gray-500/20 text-gray-400", icon: Clock, label: "Expired" },
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  const fetchAwards = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)

      const response = await fetch(`/api/admin/awards?${params}`)
      const data = await response.json()
      
      setAwards(data.awards || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotal(data.pagination?.total || 0)
      setStatusCounts(data.statusCounts || {})
    } catch (error) {
      console.error("Error fetching awards:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAwards()
  }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchAwards()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            Scholarship Awards
          </h1>
          <p className="text-white/60 mt-1">Manage issued scholarships and awards</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = statusConfig[status] || { color: "bg-gray-500/20 text-gray-400", icon: Clock, label: status }
          const Icon = config.icon
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
              className={`cursor-pointer transition-all ${statusFilter === status ? "ring-2 ring-amber-500" : ""}`}
            >
              <Card className={`bg-[#1a1a2e] border-white/10 ${statusFilter === status ? "border-amber-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{config.label}</p>
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
                placeholder="Search by name, email, or award number..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="DECLINED">Declined</SelectItem>
                <SelectItem value="REVOKED">Revoked</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Awards Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Awards ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : awards.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No awards found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/60">Award</TableHead>
                    <TableHead className="text-white/60">Recipient</TableHead>
                    <TableHead className="text-white/60">Scholarship</TableHead>
                    <TableHead className="text-white/60">Amount</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Issued</TableHead>
                    <TableHead className="text-white/60 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awards.map((award) => {
                    const config = statusConfig[award.status] || { color: "bg-gray-500/20 text-gray-400", icon: Clock, label: award.status }
                    
                    return (
                      <TableRow key={award.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium font-mono">{award.awardNumber}</p>
                            <p className="text-white/50 text-sm">ID: {award.id.slice(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <span className="text-amber-400 font-medium">
                                {award.recipientName?.split(" ").map((word: string) => word[0]).join("").slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{award.recipientName}</p>
                              <p className="text-white/50 text-sm">{award.recipientEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-white">{award.scholarship?.name}</p>
                        </TableCell>
                        <TableCell>
                          {award.amount ? (
                            <p className="text-green-400 font-medium">
                              {award.currency} {Number(award.amount).toLocaleString()}
                            </p>
                          ) : (
                            <span className="text-white/50">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color}>
                            <config.icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/60">
                          {award.issuedAt 
                            ? format(new Date(award.issuedAt), "MMM d, yyyy")
                            : "Not issued"
                          }
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
                                <a href={`/admin/scholarships/awards/${award.id}`} className="flex items-center w-full">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </a>
                              </DropdownMenuItem>
                              {award.awardLetterUrl && (
                                <DropdownMenuItem className="cursor-pointer">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Letter
                                </DropdownMenuItem>
                              )}
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
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} awards
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
