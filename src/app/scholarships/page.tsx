"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Award, Search, Calendar, DollarSign, Users, Clock, Star,
  Filter, ArrowRight, Globe, GraduationCap, Heart, BookOpen,
  Briefcase, Code, Palette, BarChart3
} from "lucide-react"

interface Scholarship {
  id: string
  name: string
  shortName: string | null
  slug: string
  description: string | null
  type: { id: string; name: string; icon: string | null; color: string | null }
  awardAmount: number | null
  currency: string
  coverageType: string
  maxRecipients: number | null
  currentRecipients: number
  openingDate: string | null
  closingDate: string | null
  isFeatured: boolean
  thumbnailUrl: string | null
  bannerUrl: string | null
  icon: string | null
  color: string | null
  benefits: string | null
  applicationCount: number
  remainingSlots: number | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const typeIcons: Record<string, React.ElementType> = {
  "merit": GraduationCap,
  "need-based": Heart,
  "research": BookOpen,
  "women-in-stem": Users,
  "community-impact": Globe,
  "founder": Briefcase,
  "sponsored": Star,
  "zakat": Heart,
  "waqf": Heart,
  "default": Award,
};

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchScholarships = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      })
      if (search) params.append("search", search)
      if (featuredOnly) params.append("featured", "true")

      const response = await fetch(`/api/public/scholarships?${params}`)
      const data = await response.json()

      if (data.success) {
        setScholarships(data.data.scholarships)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch scholarships:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [search, featuredOnly, currentPage])

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return "Varies"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Rolling"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDaysRemaining = (closingDate: string | null) => {
    if (!closingDate) return null
    const days = Math.ceil((new Date(closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const getCoverageLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL: "Full Scholarship",
      PARTIAL: "Partial Scholarship",
      TUITION_WAIVER: "Tuition Waiver",
      FINANCIAL_AID: "Financial Aid",
    }
    return labels[type] || type
  }

  const getTypeIcon = (typeName: string) => {
    const name = typeName.toLowerCase().replace(/[^a-z]/g, "-")
    for (const key of Object.keys(typeIcons)) {
      if (name.includes(key)) return typeIcons[key]
    }
    return typeIcons.default
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4 border-purple-500/50 text-purple-300">
              <Award className="h-4 w-4 mr-1" />
              Scholarships & Financial Aid
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Pursue Your Dreams
              <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                With Confidence
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Discover scholarship opportunities that match your goals. From merit-based awards to need-based support, find the funding you need to succeed.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                placeholder="Search scholarships by name, description, or keywords..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant={featuredOnly ? "default" : "outline"}
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={featuredOnly ? "bg-purple-500" : "border-white/20 text-white hover:bg-white/10"}
              >
                <Star className="h-4 w-4 mr-2" />
                Featured Only
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scholarships Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-white/60">
              {pagination ? `${pagination.total} scholarships available` : "Loading..."}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-20">
              <Award className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white/80 mb-2">No scholarships found</h3>
              <p className="text-white/50 mb-6">
                {search ? "Try adjusting your search terms" : "Check back soon for new opportunities"}
              </p>
              {search && (
                <Button
                  onClick={() => setSearch("")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.map((scholarship, index) => {
                const TypeIcon = getTypeIcon(scholarship.type.name)
                const daysRemaining = getDaysRemaining(scholarship.closingDate)

                return (
                  <motion.div
                    key={scholarship.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all hover:bg-white/[0.07] h-full flex flex-col">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: scholarship.type.color ? `${scholarship.type.color}20` : "rgba(139, 92, 246, 0.2)" }}
                          >
                            <TypeIcon
                              className="h-6 w-6"
                              style={{ color: scholarship.type.color || "#8B5CF6" }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {scholarship.isFeatured && (
                              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            )}
                            <Badge
                              variant="outline"
                              className="border-white/20 text-white/70"
                            >
                              {scholarship.type.name}
                            </Badge>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                          {scholarship.name}
                        </h3>

                        {/* Description */}
                        <p className="text-white/60 text-sm mb-4 line-clamp-3 flex-1">
                          {scholarship.description || scholarship.benefits || "No description available"}
                        </p>

                        {/* Award Info */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1 text-white">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <span className="font-medium">
                              {formatCurrency(scholarship.awardAmount, scholarship.currency)}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-white/20 text-white/70"
                          >
                            {getCoverageLabel(scholarship.coverageType)}
                          </Badge>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-white/50 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {daysRemaining !== null ? (
                                daysRemaining > 0 ? (
                                  <span className="text-amber-400">{daysRemaining} days left</span>
                                ) : (
                                  <span className="text-red-400">Closed</span>
                                )
                              ) : (
                                "Rolling"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{scholarship.applicationCount} applied</span>
                          </div>
                        </div>

                        {/* Deadline */}
                        <div className="text-xs text-white/40 mb-4">
                          Deadline: {formatDate(scholarship.closingDate)}
                        </div>

                        {/* Action */}
                        <Link href={`/scholarships/apply/${scholarship.slug}`} className="mt-auto">
                          <Button
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          >
                            Apply Now
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
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
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-white/60 mb-8">
            Check your application status or browse all available scholarships
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/scholarships/track">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Track Application
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
