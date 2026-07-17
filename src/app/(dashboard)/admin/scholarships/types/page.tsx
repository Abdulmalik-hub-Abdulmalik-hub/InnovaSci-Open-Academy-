"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Award,
  GraduationCap,
  FlaskConical,
  Heart,
  Globe,
  Star,
  Sparkles,
  Lightbulb,
  Check,
  RefreshCw,
  Plus,
  Info,
  BookOpen,
  Users,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScholarshipType {
  id: string
  name: string
  slug: string
  shortName: string | null
  description: string | null
  objectives: string | null
  eligibility: string | null
  benefits: string | null
  icon: string | null
  color: string | null
  badge: string | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  tags: string | null
  isCustom: boolean
  isActive: boolean
  orderIndex: number
  scholarshipCount: number
}

interface TypeStats {
  total: number
  active: number
  inactive: number
  totalScholarships: number
}

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  FlaskConical,
  Heart,
  Globe,
  Star,
  Sparkles,
  Award,
  Lightbulb,
  BookOpen,
  Users,
  DollarSign,
}

const CATEGORY_DESCRIPTIONS: Record<string, { category: string; useCase: string }> = {
  "academic-excellence": {
    category: "Academic",
    useCase: "Best for merit-based awards recognizing outstanding academic achievement"
  },
  "research-innovation": {
    category: "Research & Innovation",
    useCase: "Ideal for STEM research, AI innovation, and technological advancement"
  },
  "opportunity": {
    category: "Access & Equity",
    useCase: "Perfect for need-based scholarships and underserved communities"
  },
  "global-partnership": {
    category: "International",
    useCase: "Use for government, NGO, or corporate-sponsored programs"
  },
  "leadership-impact": {
    category: "Leadership",
    useCase: "Great for community service, entrepreneurship, and social impact"
  },
  "innovation-challenge": {
    category: "Innovation",
    useCase: "Perfect for hackathon winners, competition participants, and inventors"
  },
  "custom": {
    category: "Custom",
    useCase: "Start from scratch with complete flexibility for unique programs"
  }
}

export default function ScholarshipTypesPage() {
  const { toast } = useToast()
  const [types, setTypes] = useState<ScholarshipType[]>([])
  const [stats, setStats] = useState<TypeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTypes = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/scholarships/types?includeInactive=true")
      const data = await response.json()
      
      if (data.success) {
        setTypes(data.data.types)
        setStats(data.data.stats)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch scholarship templates",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTypes()
  }, [fetchTypes])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTypes()
    setRefreshing(false)
    toast({ title: "Templates refreshed" })
  }

  const getIcon = (iconName: string | null) => {
    const Icon = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Award
    return Icon
  }

  const getTypeInfo = (slug: string) => {
    return CATEGORY_DESCRIPTIONS[slug] || { category: "Other", useCase: "Custom scholarship program" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Default Scholarship Library</h1>
          <p className="text-white/60 mt-1">
            Professional scholarship templates for quick program creation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admin/scholarships/programs/new">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Scholarship
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-blue-300 font-medium">
                Default Scholarship Templates
              </p>
              <p className="text-blue-200/80 text-sm">
                These are pre-configured professional scholarship templates. When creating a new scholarship, 
                selecting a template will automatically fill in description, objectives, eligibility criteria, 
                benefits, and SEO fields. You can modify any field after auto-fill.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/60">Total Templates</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-sm text-white/60">Available</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.totalScholarships}</div>
              <div className="text-sm text-white/60">Active Scholarships</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">
                {types.filter(t => !t.isCustom).length}
              </div>
              <div className="text-sm text-white/60">Pre-built Templates</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-[#1a1a2e] border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type, index) => {
            const Icon = getIcon(type.icon)
            const typeInfo = getTypeInfo(type.slug)
            
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-[#1a1a2e] border-white/10 hover:border-white/20 transition-all h-full ${
                  !type.isActive ? "opacity-50" : ""
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: type.color ? `${type.color}20` : "rgba(139, 92, 246, 0.2)" }}
                        >
                          <Icon
                            className="h-6 w-6"
                            style={{ color: type.color || "#8B5CF6" }}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-white text-base">
                            {type.shortName || type.name}
                          </CardTitle>
                          <p className="text-xs text-white/50">{type.slug}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          type.isCustom 
                            ? "border-teal-500/50 text-teal-400" 
                            : "border-purple-500/50 text-purple-400"
                        }`}
                      >
                        {type.isCustom ? "Custom" : "Template"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wide mb-1">
                        {typeInfo.category}
                      </p>
                      <p className="text-sm text-white/60 line-clamp-2">
                        {typeInfo.useCase}
                      </p>
                    </div>
                    
                    {type.description && (
                      <p className="text-sm text-white/50 line-clamp-2 italic">
                        "{type.description}"
                      </p>
                    )}

                    {/* Template Fields Preview */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      {type.objectives && (
                        <div className="text-xs">
                          <span className="text-white/40">Objectives: </span>
                          <span className="text-white/60">Auto-fill</span>
                        </div>
                      )}
                      {type.eligibility && (
                        <div className="text-xs">
                          <span className="text-white/40">Eligibility: </span>
                          <span className="text-white/60">Auto-fill</span>
                        </div>
                      )}
                      {type.benefits && (
                        <div className="text-xs">
                          <span className="text-white/40">Benefits: </span>
                          <span className="text-white/60">Auto-fill</span>
                        </div>
                      )}
                      {type.seoTitle && (
                        <div className="text-xs">
                          <span className="text-white/40">SEO: </span>
                          <span className="text-white/60">Auto-fill</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-xs text-white/40">
                        {type.scholarshipCount} scholarship{type.scholarshipCount !== 1 ? "s" : ""} using
                      </span>
                      {type.isActive && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* How It Works Section */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">How Template Auto-Fill Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <h4 className="text-white font-medium mb-1">Choose Template</h4>
              <p className="text-sm text-white/50">Select a scholarship type when creating a new program</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-400 font-bold">2</span>
              </div>
              <h4 className="text-white font-medium mb-1">Auto-Fill</h4>
              <p className="text-sm text-white/50">Description, objectives, eligibility, and benefits are auto-populated</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-400 font-bold">3</span>
              </div>
              <h4 className="text-white font-medium mb-1">Customize</h4>
              <p className="text-sm text-white/50">Edit any field to match your specific requirements</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-amber-400 font-bold">4</span>
              </div>
              <h4 className="text-white font-medium mb-1">Publish</h4>
              <p className="text-sm text-white/50">Save and publish your customized scholarship</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
