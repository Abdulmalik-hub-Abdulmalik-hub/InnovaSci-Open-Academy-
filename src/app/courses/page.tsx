"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Search, Filter, Loader2, BookOpen, Users, Clock, ChevronDown, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  domainId: string | null
}

interface Course {
  id: string
  title: string
  slug: string
  shortDescription: string | null
  thumbnailUrl: string | null
  price: number
  isFree: boolean
  difficultyLevel: string | null
  category: string | null
  categoryId: string | null
  domainId: string | null
  domain: {
    id: string
    name: string
    slug: string
    color: string | null
    icon: string | null
  } | null
  durationHours: number | null
  enrollments: number
}

const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const difficulties = ["All Levels", "BEGINNER", "INTERMEDIATE", "ADVANCED"]

function CoursesContent() {
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All Levels")
  const [showFilters, setShowFilters] = useState(false)
  const [totalCourses, setTotalCourses] = useState(0)

  // Fetch domains and categories
  const fetchFilters = async () => {
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
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [selectedDomain, selectedCategory, selectedDifficulty])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (selectedDomain && selectedDomain !== "all") {
        params.set("domainId", selectedDomain)
      }
      if (selectedCategory && selectedCategory !== "all") {
        params.set("categoryId", selectedCategory)
      }
      if (selectedDifficulty && selectedDifficulty !== "All Levels") {
        params.set("difficultyLevel", selectedDifficulty)
      }
      if (searchQuery) {
        params.set("q", searchQuery)
      }

      const response = await fetch(`/api/public/courses?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setCourses(result.data)
        setTotalCourses(result.data.length)
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDomainChange = (domainId: string) => {
    setSelectedDomain(domainId)
    // Reset category when domain changes
    setSelectedCategory("all")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCourses()
  }

  // Filter categories based on selected domain
  const filteredCategories = categories.filter(
    cat => !selectedDomain || selectedDomain === "all" || cat.domainId === selectedDomain
  )

  const getDifficultyLabel = (difficulty: string | null) => {
    switch (difficulty) {
      case "BEGINNER": return "Beginner"
      case "INTERMEDIATE": return "Intermediate"
      case "ADVANCED": return "Advanced"
      default: return difficulty || ""
    }
  }

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Our <span className="text-yellow-300">Courses</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover world-class courses taught by leading experts in AI, Data Science, Computational Biology, and more.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white text-gray-900 border-0 focus-visible:ring-2 focus-visible:ring-yellow-300"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">{totalCourses} courses found</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Domain Filter */}
            <Select value={selectedDomain} onValueChange={handleDomainChange}>
              <SelectTrigger className="w-[200px]">
                <LayoutGrid className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    <div className="flex items-center gap-2">
                      {domain.icon && <span>{domain.icon}</span>}
                      {domain.color && (
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.color }} />
                      )}
                      <span>{domain.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]" disabled={!selectedDomain && filteredCategories.length === 0}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff === "All Levels" ? diff : getDifficultyLabel(diff)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="lg:hidden mb-8 p-4 bg-background rounded-lg border space-y-4">
            <div>
              <h3 className="font-medium mb-3">Domain</h3>
              <Select value={selectedDomain} onValueChange={handleDomainChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <div className="flex items-center gap-2">
                        {domain.icon && <span>{domain.icon}</span>}
                        <span>{domain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium mb-3">Category</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium mb-3">Difficulty</h3>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => (
                  <Badge
                    key={diff}
                    variant={selectedDifficulty === diff ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedDifficulty(diff)}
                  >
                    {diff === "All Levels" ? diff : getDifficultyLabel(diff)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white/50" />
                    </div>
                  )}
                  {course.isFree && (
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                      Free
                    </Badge>
                  )}
                  {course.difficultyLevel && (
                    <Badge
                      className={`absolute top-3 right-3 ${difficultyColors[course.difficultyLevel] || ""}`}
                    >
                      {getDifficultyLabel(course.difficultyLevel)}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Domain Badge */}
                  {course.domain && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: course.domain.color || '#6366f1', color: course.domain.color || '#6366f1' }}
                      >
                        {course.domain.icon && <span className="mr-1">{course.domain.icon}</span>}
                        {course.domain.name}
                      </Badge>
                    </div>
                  )}
                  
                  {course.category && (
                    <p className="text-sm text-purple-600 font-medium mb-2">{course.category}</p>
                  )}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  {course.shortDescription && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.shortDescription}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {course.durationHours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.durationHours}h
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrollments.toLocaleString()}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <div className="font-bold text-lg">
                    {course.isFree ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>${course.price}</span>
                    )}
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm">View Course</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/20 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  )
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/20">
        <CoursesContent />
      </div>
    </Suspense>
  )
}
