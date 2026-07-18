"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
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
  GraduationCap,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Star,
  ArrowRight,
  Clock,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

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

const typeColors: Record<string, string> = {
  FORCEWORK: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MERIT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  NEED_BASED: "bg-green-500/20 text-green-400 border-green-500/30",
  RESEARCH_INNOVATION: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  SPECIAL_NEED: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  COMMUNITY_IMPACT: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  FOUNDER: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  SPONSORED: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  ZAKAT_WAQF: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  TUITION_WAIVER: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  PARTIAL: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  FULL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FINANCIAL_AID: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchScholarships = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "12")
      if (search) params.set("search", search)
      if (typeFilter) params.set("type", typeFilter)

      const response = await fetch(`/api/public/scholarships?${params}`)
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

  useEffect(() => {
    fetchScholarships()
  }, [page, typeFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchScholarships()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <GraduationCap className="h-5 w-5 text-purple-400" />
              <span className="text-white/80 text-sm font-medium">Scholarships & Financial Aid</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Empower Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Academic Journey</span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10">
              Discover scholarship opportunities that can help you achieve your educational goals. 
              From merit-based awards to need-based support, find the perfect opportunity for you.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Search scholarships..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-14 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/40 rounded-xl"
                  />
                </div>
                <Button 
                  type="submit"
                  className="h-14 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl"
                >
                  Search
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-white/60">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {typeFilter && (
              <Button 
                variant="ghost" 
                className="text-white/60 hover:text-white"
                onClick={() => setTypeFilter("")}
              >
                Clear filters
              </Button>
            )}
            
            <div className="ml-auto text-white/60 text-sm">
              {total} scholarship{total !== 1 ? "s" : ""} available
            </div>
          </div>
        </div>
      </section>

      {/* Scholarships Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="h-40 bg-white/10 rounded-lg animate-pulse mb-4" />
                    <div className="h-6 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-white/10 rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No scholarships found</h3>
              <p className="text-white/60 mb-6">Try adjusting your search or filters</p>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => { setSearch(""); setTypeFilter(""); }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((scholarship, index) => (
                  <motion.div
                    key={scholarship.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/scholarships/${scholarship.slug}`}>
                      <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          {scholarship.bannerUrl ? (
                            <img 
                              src={scholarship.bannerUrl} 
                              alt={scholarship.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: scholarship.color || "#7C3AED" }}
                            >
                              <span className="text-6xl">{scholarship.icon || "🎓"}</span>
                            </div>
                          )}
                          
                          {/* Featured Badge */}
                          {scholarship.isFeatured && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-amber-500 text-white flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Featured
                              </Badge>
                            </div>
                          )}
                          
                          {/* Type Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge className={typeColors[scholarship.type] || "bg-gray-500/20 text-gray-400"}>
                              {typeLabels[scholarship.type] || scholarship.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          {/* Title */}
                          <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                            {scholarship.name}
                          </h3>
                          
                          {/* Description */}
                          <p className="text-white/60 text-sm mb-4 line-clamp-2">
                            {scholarship.description || "No description available"}
                          </p>
                          
                          {/* Meta Info */}
                          <div className="space-y-2 mb-4">
                            {scholarship.awardAmount && (
                              <div className="flex items-center gap-2 text-white/60 text-sm">
                                <DollarSign className="h-4 w-4 text-green-400" />
                                <span>
                                  {scholarship.currency || "USD"} {Number(scholarship.awardAmount).toLocaleString()}
                                  {scholarship.availableSlots && ` • ${scholarship.availableSlots} slots`}
                                </span>
                              </div>
                            )}
                            
                            {scholarship.closingDate && (
                              <div className="flex items-center gap-2 text-white/60 text-sm">
                                <Clock className="h-4 w-4 text-amber-400" />
                                <span>
                                  Closes {formatDistanceToNow(new Date(scholarship.closingDate), { addSuffix: true })}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Domains */}
                          {scholarship.domains && scholarship.domains.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {scholarship.domains.slice(0, 3).map((d: any) => (
                                <Badge key={d.domain.id} variant="outline" className="border-white/20 text-white/60 text-xs">
                                  {d.domain.name}
                                </Badge>
                              ))}
                              {scholarship.domains.length > 3 && (
                                <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                                  +{scholarship.domains.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Apply Button */}
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-white/60 text-sm">
                              {scholarship._count?.applications || 0} applications
                            </span>
                            <Button 
                              variant="ghost" 
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 p-0"
                            >
                              View Details
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-white/10 text-white"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                          className={page === pageNum ? "bg-purple-500" : "border-white/10 text-white"}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-white/10 text-white"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Can&apos;t find the right scholarship?</h2>
          <p className="text-white/70 mb-8">
            Check back regularly for new opportunities or contact us to learn about other funding options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/scholarships/track">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Track Your Application
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
