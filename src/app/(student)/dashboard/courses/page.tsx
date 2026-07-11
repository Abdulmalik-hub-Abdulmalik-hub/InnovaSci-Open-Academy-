"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useStudentEnrollments, getCourseCategoryName } from "@/hooks/useStudentEnrollments"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  BookOpen, Play, Search, Filter, Grid, List,
  Clock, CheckCircle2, ChevronRight, X, LayoutGrid
} from "lucide-react"

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

export default function MyCoursesPage() {
  const { enrollments, loading, error, pagination, categories, fetchEnrollments, refresh } = useStudentEnrollments()
  const [domains, setDomains] = useState<Domain[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "completed">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch domains and categories
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [domainsRes, categoriesRes] = await Promise.all([
          fetch("/api/public/domains"),
          fetch("/api/admin/categories?includeInactive=true")
        ])
        
        const domainsData = await domainsRes.json()
        if (domainsData.success) {
          setDomains(domainsData.data.domains || [])
        }
        
        const categoriesData = await categoriesRes.json()
        if (categoriesData.success) {
          setAllCategories(categoriesData.data.categories || [])
        }
      } catch (err) {
        console.error("Failed to fetch filters:", err)
      }
    }
    fetchFilters()
  }, [])

  // Filter categories based on selected domain
  const filteredCategories = allCategories.filter(
    cat => selectedDomain === "all" || cat.domainId === selectedDomain
  )

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    
    // Get category info - it could be an object with name or a string
    const courseCategoryName = getCourseCategoryName(enrollment.course.category)
    const courseCategoryId = (enrollment.course as any).categoryId
    const courseDomainId = (enrollment.course as any).domainId
    
    const matchesDomain = selectedDomain === "all" || courseDomainId === selectedDomain
    const matchesCategory = selectedCategory === "all" || 
      courseCategoryName === selectedCategory ||
      courseCategoryId === selectedCategory
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && enrollment.completed) ||
      (statusFilter === "in_progress" && !enrollment.completed)
    return matchesSearch && matchesDomain && matchesCategory && matchesStatus
  })

  if (loading && enrollments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track all your enrolled courses
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value)
              setSelectedCategory("all")
            }}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">All Domains</option>
            {domains.map(domain => (
              <option key={domain.id} value={domain.id}>
                {domain.icon ? `${domain.icon} ` : ''}{domain.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">All Categories</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {(["all", "in_progress", "completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  statusFilter === status
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "hover:bg-white/50 dark:hover:bg-gray-700/50"
                )}
              >
                {status === "all" ? "All" : status === "in_progress" ? "In Progress" : "Completed"}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "hover:bg-white/50 dark:hover:bg-gray-700/50"
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "hover:bg-white/50 dark:hover:bg-gray-700/50"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedDomain !== "all" || selectedCategory !== "all" || statusFilter !== "all" || searchQuery) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {selectedDomain !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Domain: {domains.find(d => d.id === selectedDomain)?.name || selectedDomain}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDomain("all")} />
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedCategory}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {statusFilter === "in_progress" ? "In Progress" : "Completed"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSearchQuery("")
              setSelectedDomain("all")
              setSelectedCategory("all")
              setStatusFilter("all")
            }}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Course Grid/List */}
      {filteredEnrollments.length > 0 ? (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredEnrollments.map((enrollment) => (
            viewMode === "grid" ? (
              // Grid View
              <Card 
                key={enrollment.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
                  {enrollment.course.thumbnailUrl ? (
                    <img 
                      src={enrollment.course.thumbnailUrl} 
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/20 to-brand-blue/20">
                      <BookOpen className="h-12 w-12 text-brand-purple/30" />
                    </div>
                  )}
                  
                  {/* Progress Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          enrollment.completed 
                            ? "bg-green-500" 
                            : "bg-brand-purple"
                        )}
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Completion Badge */}
                  {enrollment.completed && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </Badge>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <Link href={`/dashboard/learn/${enrollment.courseId}`}>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                        <Play className="h-5 w-5 text-brand-purple ml-0.5" />
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {(enrollment.course as any).domain && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: (enrollment.course as any).domain?.color || '#6366f1', color: (enrollment.course as any).domain?.color || '#6366f1' }}
                      >
                        {(enrollment.course as any).domain?.icon && <span className="mr-1">{(enrollment.course as any).domain.icon}</span>}
                        {(enrollment.course as any).domain?.name}
                      </Badge>
                    )}
                    {getCourseCategoryName(enrollment.course.category) && (
                      <Badge variant="outline" className="text-xs">
                        {getCourseCategoryName(enrollment.course.category)}
                      </Badge>
                    )}
                    {enrollment.course.difficultyLevel && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {enrollment.course.difficultyLevel}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-brand-purple transition-colors">
                    {enrollment.course.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {enrollment.course.durationHours || 0}h
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {enrollment.course.totalLessons} lessons
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {enrollment.progressPercent}% complete
                    </span>
                    <Link href={`/dashboard/learn/${enrollment.courseId}`}>
                      <Button 
                        size="sm"
                        className={cn(
                          enrollment.completed 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-brand-purple hover:bg-brand-purple/90"
                        )}
                      >
                        {enrollment.completed ? "Review" : "Resume"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // List View
              <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-40 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 relative">
                    {enrollment.course.thumbnailUrl ? (
                      <img 
                        src={enrollment.course.thumbnailUrl} 
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/20 to-brand-blue/20">
                        <BookOpen className="h-10 w-10 text-brand-purple/30" />
                      </div>
                    )}
                    {enrollment.completed && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getCourseCategoryName(enrollment.course.category) && (
                          <Badge variant="outline" className="text-xs">
                            {getCourseCategoryName(enrollment.course.category)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold line-clamp-1 mb-1">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {enrollment.course.shortDescription || "No description available"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                enrollment.completed 
                                  ? "bg-green-500" 
                                  : "bg-brand-purple"
                              )}
                              style={{ width: `${enrollment.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {enrollment.progressPercent}%
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {enrollment.course.durationHours || 0}h
                        </span>
                      </div>
                      <Link href={`/dashboard/learn/${enrollment.courseId}`}>
                        <Button 
                          size="sm"
                          className={cn(
                            enrollment.completed 
                              ? "bg-green-500 hover:bg-green-600" 
                              : "bg-brand-purple hover:bg-brand-purple/90"
                          )}
                        >
                          {enrollment.completed ? "Review" : "Resume"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedCategory !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "You haven't enrolled in any courses yet"}
          </p>
          {(searchQuery || selectedCategory !== "all" || statusFilter !== "all") && (
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setStatusFilter("all")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchEnrollments({ page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchEnrollments({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
