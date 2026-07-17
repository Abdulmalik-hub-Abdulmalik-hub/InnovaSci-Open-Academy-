"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Users,
  Clock,
  ExternalLink,
  GraduationCap,
  Award,
  Heart,
  Briefcase,
  Microscope,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface Scholarship {
  id: string
  name: string
  shortName: string
  slug: string
  description: string
  scholarshipType: {
    id: string
    name: string
    icon: string
    color: string
  } | null
  awardAmount: number | null
  currency: string
  coverageType: string
  availableSlots: number | null
  openingDate: string | null
  closingDate: string | null
  isFeatured: boolean
  thumbnailUrl: string | null
  applicationCount: number
  sponsors: { id: string; name: string; logoUrl: string | null }[]
  isOpen: boolean
  daysRemaining: number | null
}

const iconMap: Record<string, any> = {
  GraduationCap: GraduationCap,
  Award: Award,
  Heart: Heart,
  Briefcase: Briefcase,
  Microscope: Microscope,
  Sparkles: Sparkles,
}

export default function PublicScholarshipsPage() {
  const [loading, setLoading] = useState(true)
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [showFeatured, setShowFeatured] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 })

  useEffect(() => {
    fetchScholarships()
  }, [selectedType, showFeatured, pagination.page])

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (selectedType) params.set("type", selectedType)
      if (showFeatured) params.set("featured", "true")
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const res = await fetch(`/api/public/scholarships?${params}`)
      const data = await res.json()

      if (data.success) {
        setScholarships(data.data.scholarships)
        setTypes(data.data.filters?.types || [])
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error("Error fetching scholarships:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchScholarships()
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCoverageLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL: "Full Scholarship",
      PARTIAL: "Partial Scholarship",
      FULL_TUITION: "Full Tuition",
      PARTIAL_TUITION: "Partial Tuition",
      MONTHLY_STIPEND: "Monthly Stipend",
      ONE_TIME: "One-time Grant",
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm mb-6">
              <GraduationCap className="h-4 w-4" />
              Scholarships & Financial Aid
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Transform Your Future with
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Scholarships</span>
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Discover fully-funded and partially-funded scholarships to pursue your academic and professional goals
            </p>
            
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  placeholder="Search scholarships..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 -mt-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-white/60" />
                <span className="text-white/60 text-sm">Filter by:</span>
              </div>
              
              {/* Type Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedType(""); setPagination(prev => ({ ...prev, page: 1 })) }}
                  className={selectedType === "" ? "bg-purple-600" : "border-white/20 text-white hover:bg-white/10"}
                >
                  All Types
                </Button>
                {types.map((type) => {
                  const Icon = iconMap[type.icon] || Award
                  return (
                    <Button
                      key={type.id}
                      variant={selectedType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setSelectedType(type.id); setPagination(prev => ({ ...prev, page: 1 })) }}
                      className={selectedType === type.id ? "bg-purple-600" : "border-white/20 text-white hover:bg-white/10"}
                      style={selectedType !== type.id && type.color ? { borderColor: type.color + "40" } : {}}
                    >
                      <Icon className="h-4 w-4 mr-1" style={type.color ? { color: type.color } : {}} />
                      {type.name}
                    </Button>
                  )
                })}
              </div>

              <div className="ml-auto">
                <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFeatured}
                    onChange={(e) => { setShowFeatured(e.target.checked); setPagination(prev => ({ ...prev, page: 1 })) }}
                    className="rounded border-white/20 bg-white/10"
                  />
                  Featured only
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scholarships Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : scholarships.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-semibold text-white mb-2">No scholarships found</h3>
            <p className="text-white/60">
              {search || selectedType
                ? "Try adjusting your search or filters"
                : "Check back soon for new scholarship opportunities"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {scholarships.map((scholarship) => {
                const TypeIcon = scholarship.scholarshipType?.icon 
                  ? (iconMap[scholarship.scholarshipType.icon] || Award) 
                  : Award
                
                return (
                  <Card 
                    key={scholarship.id} 
                    className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden"
                  >
                    {/* Banner */}
                    <div className="relative h-40 bg-gradient-to-br from-purple-600/30 to-blue-600/30">
                      {scholarship.thumbnailUrl ? (
                        <img 
                          src={scholarship.thumbnailUrl} 
                          alt="" 
                          className="w-full h-full object-cover opacity-60"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TypeIcon 
                            className="h-20 w-20 text-white/20" 
                            style={scholarship.scholarshipType?.color ? { color: scholarship.scholarshipType.color + "40" } : {}}
                          />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                        <div className="flex flex-wrap gap-2">
                          {scholarship.isFeatured && (
                            <Badge className="bg-yellow-500 text-yellow-950">Featured</Badge>
                          )}
                          {scholarship.scholarshipType && (
                            <Badge 
                              style={{ backgroundColor: scholarship.scholarshipType.color + "90", color: "white" }}
                            >
                              {scholarship.scholarshipType.name}
                            </Badge>
                          )}
                        </div>
                        {scholarship.daysRemaining !== null && scholarship.daysRemaining <= 7 && scholarship.daysRemaining > 0 && (
                          <Badge variant="destructive" className="bg-red-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {scholarship.daysRemaining}d left
                          </Badge>
                        )}
                      </div>

                      {/* Coverage Type */}
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {getCoverageLabel(scholarship.coverageType)}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                        {scholarship.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {scholarship.description || "No description available"}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {scholarship.awardAmount && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <div>
                              <p className="text-xs text-white/40">Award</p>
                              <p className="text-sm font-semibold text-green-400">
                                {formatCurrency(scholarship.awardAmount, scholarship.currency)}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-white/40">Applications</p>
                            <p className="text-sm font-semibold text-blue-400">
                              {scholarship.applicationCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Deadline */}
                      {scholarship.closingDate && (
                        <div className="flex items-center gap-2 mb-4 text-sm">
                          <Calendar className="h-4 w-4 text-white/40" />
                          <span className="text-white/60">
                            Deadline: {new Date(scholarship.closingDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      )}

                      {/* Sponsors */}
                      {scholarship.sponsors.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs text-white/40">Sponsored by:</span>
                          <div className="flex -space-x-2">
                            {scholarship.sponsors.slice(0, 3).map((sponsor) => (
                              <div 
                                key={sponsor.id}
                                className="w-6 h-6 rounded-full bg-white/20 border-2 border-slate-900 flex items-center justify-center overflow-hidden"
                                title={sponsor.name}
                              >
                                {sponsor.logoUrl ? (
                                  <img src={sponsor.logoUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] text-white/60">
                                    {sponsor.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <Link href={`/scholarships/apply/${scholarship.slug}`} className="block">
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          disabled={!scholarship.isOpen}
                        >
                          {scholarship.isOpen ? (
                            <>
                              Apply Now
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </>
                          ) : (
                            "Applications Closed"
                          )}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                <span className="text-white/60 text-sm px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Track Application CTA */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Track Your Application</h3>
            <p className="text-white/70 mb-6">
              Already applied? Check your application status using your tracking code
            </p>
            <Link href="/scholarships/track">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <ExternalLink className="h-4 w-4 mr-2" />
                Track Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
