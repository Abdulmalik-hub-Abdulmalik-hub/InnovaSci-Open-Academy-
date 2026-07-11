"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  GraduationCap, ArrowRight, Clock, BookOpen, 
  Search, X, ChevronRight,
  BookMarked, Play
} from "lucide-react"

// Types
interface Domain {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
  domainId: string | null
  domain?: Domain
}

interface Course {
  id: string
  title: string
  slug: string
  shortDescription: string | null
  thumbnailUrl: string | null
  price: number
  isFree: boolean
  durationHours: number | null
  difficultyLevel: string | null
  totalLessons: number | null
  enrollments: number
  category: {
    id: string
    name: string
    slug: string
    color: string | null
    domain: Domain
  } | null
}

interface LearningPath {
  id: string
  title: string
  slug: string
  subtitle: string | null
  description: string | null
  thumbnailUrl: string | null
  difficultyLevel: string
  estimatedHours: number | null
  totalCourses: number
  requiredCourses: number
  domains: Domain[]
  categories: Category[]
  difficultyLevels: string[]
  courses: Course[]
}

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
}

const colorMap: Record<string, string> = {
  purple: "border-purple-500 bg-purple-500/5",
  blue: "border-blue-500 bg-blue-500/5",
  teal: "border-teal-500 bg-teal-500/5",
  amber: "border-amber-500 bg-amber-500/5",
  green: "border-green-500 bg-green-500/5",
  pink: "border-pink-500 bg-pink-500/5",
  orange: "border-orange-500 bg-orange-500/5",
  indigo: "border-indigo-500 bg-indigo-500/5",
}

export default function LearningPathsPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  
  // Data states
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Fetch filters (domains and categories)
  const fetchFilters = useCallback(async () => {
    try {
      const [domainsRes, categoriesRes] = await Promise.all([
        fetch("/api/public/domains"),
        fetch("/api/admin/categories?includeInactive=true")
      ])
      
      const domainsData = await domainsRes.json()
      if (domainsData.success && domainsData.data?.domains) {
        setDomains(domainsData.data.domains || [])
      }
      
      const categoriesData = await categoriesRes.json()
      if (categoriesData.success && categoriesData.data?.categories) {
        setCategories(categoriesData.data.categories || [])
      }
    } catch (err) {
      console.error("Failed to fetch filters:", err)
    }
  }, [])
  
  // Fetch learning paths with filters
  const fetchLearningPaths = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (searchQuery) params.set("q", searchQuery)
      if (selectedDomain) params.set("domainId", selectedDomain)
      if (selectedCategory) params.set("categoryId", selectedCategory)
      if (selectedDifficulty && selectedDifficulty !== "all") {
        params.set("difficultyLevel", selectedDifficulty)
      }
      
      const response = await fetch(`/api/learning-paths?${params.toString()}`)
      const result = await response.json()
      
      if (result.success && result.data?.learningPaths) {
        setLearningPaths(result.data.learningPaths)
      } else {
        setLearningPaths([])
      }
    } catch (err) {
      console.error("Failed to fetch learning paths:", err)
      setLearningPaths([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedDomain, selectedCategory, selectedDifficulty])
  
  useEffect(() => {
    fetchFilters()
  }, [fetchFilters])
  
  useEffect(() => {
    fetchLearningPaths()
  }, [fetchLearningPaths])
  
  // Filter categories based on selected domain
  const filteredCategories = useMemo(() => {
    if (!selectedDomain) return categories
    return categories.filter(cat => cat.domainId === selectedDomain)
  }, [categories, selectedDomain])
  
  // Handle filter changes
  const handleDomainChange = (domainId: string) => {
    setSelectedDomain(domainId)
    setSelectedCategory("") // Reset category when domain changes
  }
  
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedDomain("")
    setSelectedCategory("")
    setSelectedDifficulty("all")
  }
  
  const hasActiveFilters = searchQuery || selectedDomain || selectedCategory || selectedDifficulty !== "all"
  
  const getDomainColor = (domain: Domain | undefined) => {
    if (domain?.color) return domain.color
    return "purple"
  }

  // Calculate total lessons from all courses
  const getTotalLessons = (path: LearningPath) => {
    return path.courses.reduce((sum, course) => sum + (course.totalLessons || 0), 0)
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#2563EB]/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Breadcrumbs */}
            <nav className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Learning Paths</span>
            </nav>
            
            <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-[#7C3AED]/30 text-[#7C3AED]">
              <GraduationCap className="h-3.5 w-3.5 mr-1" />
              Curated Learning Roadmaps
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
              Your Learning Path to Mastery
            </h1>
            <p className="text-lg text-muted-foreground">
              Follow structured, sequential roadmaps designed by experts. 
              Master scientific computing step by step with clear progression paths.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm min-w-[180px]"
            >
              <option value="">All Domains</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.icon ? `${domain.icon} ` : ""}{domain.name}
                </option>
              ))}
            </select>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedDomain && filteredCategories.length === 0}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm min-w-[180px] disabled:opacity-50"
            >
              <option value="">All Categories</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm min-w-[150px]"
            >
              <option value="all">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
          
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              {selectedDomain && domains.find(d => d.id === selectedDomain) && (
                <Badge variant="secondary" className="gap-1">
                  {domains.find(d => d.id === selectedDomain)?.icon} {domains.find(d => d.id === selectedDomain)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDomain("")} />
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
                </Badge>
              )}
              {selectedDifficulty !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {DIFFICULTY_LABELS[selectedDifficulty]}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDifficulty("all")} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Learning Paths Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : learningPaths.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {learningPaths.length} learning path{learningPaths.length !== 1 ? "s" : ""}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningPaths.map((path, index) => {
                  const domain = path.domains[0]
                  const colorKey = getDomainColor(domain)
                  const colorClass = colorMap[colorKey] || colorMap.purple
                  const totalLessons = getTotalLessons(path)
                  
                  return (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className={cn(
                        "h-full overflow-hidden hover:shadow-lg transition-all duration-300 group border-l-4",
                        colorClass.split(" ")[0]
                      )}>
                        {/* Thumbnail */}
                        <div className="relative h-36 overflow-hidden">
                          {path.thumbnailUrl ? (
                            <Image
                              src={path.thumbnailUrl}
                              alt={path.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                              <GraduationCap className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {path.domains.slice(0, 2).map((d) => (
                              <Badge 
                                key={d.id} 
                                variant="secondary" 
                                className="text-xs backdrop-blur-sm"
                                style={{ 
                                  backgroundColor: d.color ? `${d.color}30` : undefined,
                                  borderColor: d.color || undefined
                                }}
                              >
                                {d.icon && <span className="mr-1">{d.icon}</span>}
                                {d.name}
                              </Badge>
                            ))}
                          </div>
                          
                          <Badge 
                            className={cn(
                              "absolute top-2 right-2",
                              DIFFICULTY_COLORS[path.difficultyLevel?.toUpperCase()] || DIFFICULTY_COLORS.BEGINNER
                            )}
                          >
                            {DIFFICULTY_LABELS[path.difficultyLevel?.toUpperCase()] || path.difficultyLevel}
                          </Badge>
                        </div>
                        
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-1 group-hover:text-[hsl(var(--brand-purple))] transition-colors">
                            {path.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">
                            {path.description || path.subtitle || `Structured path covering ${path.totalCourses} courses`}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {/* Stats */}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              {path.totalCourses} courses
                            </span>
                            {path.estimatedHours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {path.estimatedHours}h
                              </span>
                            )}
                            {totalLessons > 0 && (
                              <span className="flex items-center gap-1">
                                <Play className="h-3.5 w-3.5" />
                                {totalLessons} lessons
                              </span>
                            )}
                          </div>
                          
                          {/* Categories */}
                          {path.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {path.categories.slice(0, 2).map((cat) => (
                                <Badge key={cat.id} variant="outline" className="text-xs">
                                  {cat.name}
                                </Badge>
                              ))}
                              {path.categories.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{path.categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Action */}
                          <Link href={`/learning-paths/${path.slug}`}>
                            <Button className="w-full group/btn text-sm">
                              Explore Path
                              <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookMarked className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Learning Paths Found</h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters 
                  ? "Try adjusting your filters to find more learning paths."
                  : "Learning paths will appear here once they are created."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are mastering scientific computing 
              through our structured learning paths.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-[#7C3AED] hover:bg-white/90 font-semibold">
                Get Started for Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
