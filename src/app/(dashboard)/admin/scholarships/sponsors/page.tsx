"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Building, Plus, Search, RefreshCw, MoreVertical, Edit, Trash2,
  Eye, ExternalLink, Globe, Mail, Phone, DollarSign, Award
} from "lucide-react"
import toast from "react-hot-toast"

interface Sponsor {
  id: string
  name: string
  shortName: string | null
  slug: string
  type: string
  logoUrl: string | null
  website: string | null
  description: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: string
  isVerified: boolean
  totalContributed: number | null
  scholarshipCount: number
  awardCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const typeConfig: Record<string, { color: string; label: string }> = {
  COMPANY: { color: "text-blue-400", label: "Company" },
  NGO: { color: "text-green-400", label: "NGO" },
  FOUNDATION: { color: "text-purple-400", label: "Foundation" },
  GOVERNMENT: { color: "text-red-400", label: "Government" },
  INDIVIDUAL: { color: "text-amber-400", label: "Individual" },
  ISLAMIC_ORG: { color: "text-emerald-400", label: "Islamic Organization" },
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchSponsors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      })
      if (search) params.append("search", search)
      if (typeFilter) params.append("type", typeFilter)

      const response = await fetch(`/api/admin/scholarships/sponsors?${params}`)
      const data = await response.json()

      if (data.success) {
        setSponsors(data.data.sponsors)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      toast.error("Failed to fetch sponsors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSponsors()
  }, [search, typeFilter, currentPage])

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeConfig = (type: string) => {
    return typeConfig[type] || { color: "text-gray-400", label: type }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Sponsors</h1>
          <p className="text-white/60 mt-1">
            Manage organizations and individuals sponsoring scholarships
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Building className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Sponsors</p>
              <p className="text-2xl font-bold text-white">{pagination?.total || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Award className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Active Sponsors</p>
              <p className="text-2xl font-bold text-white">
                {sponsors.filter((s) => s.status === "ACTIVE").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Contributed</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(sponsors.reduce((sum, s) => sum + (s.totalContributed || 0), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Scholarships</p>
              <p className="text-2xl font-bold text-white">
                {sponsors.reduce((sum, s) => sum + s.scholarshipCount, 0)}
              </p>
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
                placeholder="Search sponsors..."
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
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
              >
                <option value="">All Types</option>
                <option value="COMPANY">Company</option>
                <option value="NGO">NGO</option>
                <option value="FOUNDATION">Foundation</option>
                <option value="GOVERNMENT">Government</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="ISLAMIC_ORG">Islamic Organization</option>
              </select>
              <Button
                variant="outline"
                onClick={fetchSponsors}
                className="border-white/20 text-white"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sponsors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-16 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sponsors.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/80 mb-2">No sponsors found</h3>
            <p className="text-white/50 mb-4">Add your first sponsor to get started</p>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => {
            const type = getTypeConfig(sponsor.type)
            return (
              <Card key={sponsor.id} className="bg-[#1a1a2e] border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                      {sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building className="h-7 w-7 text-purple-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {sponsor.isVerified && (
                        <Badge className="bg-green-500/20 text-green-400 border-0">
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline" className={`${type.color} border-current`}>
                        {type.label}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{sponsor.name}</h3>
                  {sponsor.shortName && (
                    <p className="text-sm text-white/50 mb-3">/{sponsor.slug}</p>
                  )}
                  {sponsor.description && (
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">{sponsor.description}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    {sponsor.website && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Globe className="h-4 w-4" />
                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="hover:text-white truncate">
                          {sponsor.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {sponsor.contactEmail && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{sponsor.contactEmail}</span>
                      </div>
                    )}
                    {sponsor.contactPhone && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Phone className="h-4 w-4" />
                        <span>{sponsor.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-white/50">Scholarships</p>
                        <p className="text-white font-medium">{sponsor.scholarshipCount}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Awards</p>
                        <p className="text-white font-medium">{sponsor.awardCount}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Contributed</p>
                        <p className="text-green-400 font-medium">{formatCurrency(sponsor.totalContributed)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white hover:bg-white/10">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white hover:bg-white/10">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Previous
          </Button>
          <span className="text-white/60 px-4">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
