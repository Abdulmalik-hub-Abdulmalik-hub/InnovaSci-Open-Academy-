"use client"

import { useState } from "react"
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
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Archive,
  Star,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Calendar,
  Filter,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

const scholarshipTypes = [
  { value: "", label: "All Types" },
  { value: "FORCEWORK", label: "Forcework" },
  { value: "MERIT", label: "Merit" },
  { value: "NEED_BASED", label: "Need-Based" },
  { value: "RESEARCH_INNOVATION", label: "Research & Innovation" },
  { value: "SPECIAL_NEED", label: "Special Need" },
  { value: "COMMUNITY_IMPACT", label: "Community Impact" },
  { value: "FOUNDER", label: "Founder" },
  { value: "SPONSORED", label: "Sponsored" },
  { value: "ZAKAT_WAQF", label: "Zakat & Waqf" },
  { value: "TUITION_WAIVER", label: "Tuition Waiver" },
  { value: "PARTIAL", label: "Partial" },
  { value: "FULL", label: "Full" },
  { value: "FINANCIAL_AID", label: "Financial Aid" },
]

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400",
  PUBLISHED: "bg-green-500/20 text-green-400",
  CLOSED: "bg-amber-500/20 text-amber-400",
  ARCHIVED: "bg-red-500/20 text-red-400",
  DISABLED: "bg-gray-500/20 text-gray-400",
}

const typeLabels: Record<string, string> = {
  FORCEWORK: "Forcework",
  MERIT: "Merit",
  NEED_BASED: "Need-Based",
  RESEARCH_INNOVATION: "Research & Innovation",
  SPECIAL_NEED: "Special Need",
  COMMUNITY_IMPACT: "Community Impact",
  FOUNDER: "Founder",
  SPONSORED: "Sponsored",
  ZAKAT_WAQF: "Zakat & Waqf",
  TUITION_WAIVER: "Tuition Waiver",
  PARTIAL: "Partial",
  FULL: "Full",
  FINANCIAL_AID: "Financial Aid",
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchScholarships = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "10")
      if (search) params.set("search", search)
      if (typeFilter) params.set("type", typeFilter)
      if (statusFilter) params.set("status", statusFilter)

      const response = await fetch(`/api/admin/scholarships?${params}`)
      const data = await response.json()
      
      setScholarships(data.scholarships || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (error) {
      console.error("Error fetching scholarships:", error)
    } finally {
      setLoading(false)
    }
  }

  useState(() => {
    fetchScholarships()
  })

  const handleAction = async (id: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/scholarships/${id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      
      if (response.ok) {
        fetchScholarships()
      }
    } catch (error) {
      console.error("Error performing action:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            Scholarships & Financial Aid
          </h1>
          <p className="text-white/60 mt-1">Manage scholarship programs and applications</p>
        </div>
        <Link href="/admin/scholarships/create">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Scholarship
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Scholarships</p>
                  <p className="text-2xl font-bold text-white">{total}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active</p>
                  <p className="text-2xl font-bold text-green-400">
                    {scholarships.filter(s => s.status === "PUBLISHED").length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Featured</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {scholarships.filter(s => s.isFeatured).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {scholarships.reduce((acc, s) => acc + (s._count?.applications || 0), 0)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/scholarships/applications">
          <Card className="bg-[#1a1a2e] border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Applications</p>
                <p className="text-white/50 text-sm">View & manage</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/scholarships/sponsors">
          <Card className="bg-[#1a1a2e] border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Sponsors</p>
                <p className="text-white/50 text-sm">Manage sponsors</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/scholarships/awards">
          <Card className="bg-[#1a1a2e] border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium">Awards</p>
                <p className="text-white/50 text-sm">Issue & manage</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/scholarships/analytics">
          <Card className="bg-[#1a1a2e] border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Analytics</p>
                <p className="text-white/50 text-sm">View reports</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search scholarships..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Scholarship Type" />
              </SelectTrigger>
              <SelectContent>
                {scholarshipTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
                <SelectItem value="DISABLED">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => { setPage(1); fetchScholarships() }}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Scholarships</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No scholarships found</p>
              <Link href="/admin/scholarships/create">
                <Button className="mt-4 bg-purple-500 hover:bg-purple-600">
                  Create your first scholarship
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/60">Scholarship</TableHead>
                    <TableHead className="text-white/60">Type</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Applications</TableHead>
                    <TableHead className="text-white/60">Deadline</TableHead>
                    <TableHead className="text-white/60">Created</TableHead>
                    <TableHead className="text-white/60 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship) => (
                    <TableRow key={scholarship.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {scholarship.thumbnailUrl ? (
                            <img 
                              src={scholarship.thumbnailUrl} 
                              alt={scholarship.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-purple-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {scholarship.name}
                              {scholarship.isFeatured && (
                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                              )}
                            </p>
                            <p className="text-white/50 text-sm">/{scholarship.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[scholarship.status]}>
                          {typeLabels[scholarship.type] || scholarship.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[scholarship.status]}>
                          {scholarship.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {scholarship._count?.applications || 0}
                      </TableCell>
                      <TableCell className="text-white/60">
                        {scholarship.closingDate 
                          ? format(new Date(scholarship.closingDate), "MMM d, yyyy")
                          : "No deadline"}
                      </TableCell>
                      <TableCell className="text-white/60">
                        {formatDistanceToNow(new Date(scholarship.createdAt), { addSuffix: true })}
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
                              <Link href={`/scholarships/${scholarship.slug}`} className="flex items-center w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Public Page
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/admin/scholarships/${scholarship.id}`} className="flex items-center w-full">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleAction(scholarship.id, "duplicate")}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {scholarship.status === "DRAFT" && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-green-400"
                                onClick={() => handleAction(scholarship.id, "publish")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {scholarship.status === "PUBLISHED" && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-amber-400"
                                onClick={() => handleAction(scholarship.id, "close")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Close Applications
                              </DropdownMenuItem>
                            )}
                            {scholarship.status === "CLOSED" && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-blue-400"
                                onClick={() => handleAction(scholarship.id, "reopen")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Reopen
                              </DropdownMenuItem>
                            )}
                            {scholarship.isFeatured ? (
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleAction(scholarship.id, "unfeature")}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Remove Featured
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleAction(scholarship.id, "feature")}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Feature
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer text-red-400"
                              onClick={() => handleAction(scholarship.id, "archive")}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-white/60 text-sm">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} scholarships
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
