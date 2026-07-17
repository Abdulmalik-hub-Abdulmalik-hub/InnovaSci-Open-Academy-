"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Building2,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
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
import toast from "react-hot-toast"

interface Sponsor {
  id: string
  name: string
  shortName: string
  slug: string
  type: string
  logoUrl: string | null
  website: string | null
  description: string | null
  contactName: string | null
  contactEmail: string | null
  country: string | null
  status: string
  isVerified: boolean
  totalBudget: number | null
  usedBudget: number | null
  currency: string
  scholarshipCount: number
  applicationCount: number
  canViewAnalytics: boolean
  canDownloadReports: boolean
  createdAt: string
}

const sponsorTypes = [
  { value: "COMPANY", label: "Company" },
  { value: "NGO", label: "NGO" },
  { value: "FOUNDATION", label: "Foundation" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "ISLAMIC_ORG", label: "Islamic Organization" },
]

export default function ScholarshipSponsorsPage() {
  const [loading, setLoading] = useState(true)
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  useEffect(() => {
    fetchSponsors()
  }, [statusFilter, typeFilter, pagination.page])

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      if (typeFilter) params.set("type", typeFilter)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const res = await fetch(`/api/admin/scholarship-sponsors?${params}`)
      const data = await res.json()

      if (data.success) {
        setSponsors(data.data.sponsors)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error("Error fetching sponsors:", error)
      toast.error("Failed to load sponsors")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchSponsors()
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      ACTIVE: { variant: "default", label: "Active" },
      INACTIVE: { variant: "secondary", label: "Inactive" },
      SUSPENDED: { variant: "destructive", label: "Suspended" },
    }
    const config = statusMap[status] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { color: string; label: string }> = {
      COMPANY: { color: "blue", label: "Company" },
      NGO: { color: "green", label: "NGO" },
      FOUNDATION: { color: "purple", label: "Foundation" },
      GOVERNMENT: { color: "orange", label: "Government" },
      INDIVIDUAL: { color: "cyan", label: "Individual" },
      ISLAMIC_ORG: { color: "emerald", label: "Islamic Org" },
    }
    const config = typeMap[type] || { color: "gray", label: type }
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      green: "bg-green-500/20 text-green-400 border-green-500/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    }
    return (
      <Badge className={colorMap[config.color] || "bg-gray-500/20 text-gray-400"}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Sponsors</h1>
          <p className="text-white/60">Manage organizations and individuals who fund scholarships</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsor
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
                  placeholder="Search sponsors..."
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="">All Types</option>
              {sponsorTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sponsors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </>
        ) : sponsors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-lg font-medium text-white mb-2">No sponsors found</h3>
            <p className="text-white/60 mb-4">
              {search || statusFilter || typeFilter
                ? "Try adjusting your filters"
                : "Add your first sponsor to get started"}
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </div>
        ) : (
          sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                      {sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <Building2 className="h-6 w-6 text-white/40" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{sponsor.name}</h3>
                      {sponsor.shortName && (
                        <p className="text-sm text-white/60">{sponsor.shortName}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        View Students
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Manage Budget
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-400 focus:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {getStatusBadge(sponsor.status)}
                  {getTypeBadge(sponsor.type)}
                  {sponsor.isVerified && (
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-white/60 mb-4 line-clamp-2">
                  {sponsor.description || "No description available"}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/40 mb-1">Scholarships</p>
                    <p className="text-lg font-semibold text-white">{sponsor.scholarshipCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/40 mb-1">Applications</p>
                    <p className="text-lg font-semibold text-white">{sponsor.applicationCount}</p>
                  </div>
                </div>

                {sponsor.totalBudget && (
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">Budget Used</span>
                      <span className="text-white/60">
                        {formatCurrency(sponsor.usedBudget, sponsor.currency)} / {formatCurrency(sponsor.totalBudget, sponsor.currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ 
                          width: `${sponsor.totalBudget > 0 ? ((sponsor.usedBudget || 0) / sponsor.totalBudget) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {sponsor.contactEmail && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40">{sponsor.contactName || "Contact"}</p>
                    <p className="text-sm text-white/70">{sponsor.contactEmail}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="border-white/10 text-white"
          >
            Previous
          </Button>
          <span className="text-white/60 text-sm px-4">
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
    </div>
  )
}
