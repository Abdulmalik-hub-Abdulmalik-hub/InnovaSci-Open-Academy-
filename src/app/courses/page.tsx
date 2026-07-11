"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useDomainFilter } from "@/hooks/useDomainFilter"
import { 
  CourseSearchFilters, 
  CourseGrid 
} from "@/components/search"

function CoursesContent() {
  const searchParams = useSearchParams()
  
  const {
    domains,
    filteredCategories,
    courses,
    filters,
    setSearchQuery,
    setSelectedDomain,
    setSelectedCategory,
    setSelectedDifficulty,
    resetFilters,
    loading,
    totalCourses,
  } = useDomainFilter({
    searchQuery: searchParams.get("q") || undefined,
    selectedDomain: searchParams.get("domainId") || undefined,
    selectedCategory: searchParams.get("categoryId") || undefined,
    selectedDifficulty: "All Levels",
  })

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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Filters */}
        <CourseSearchFilters
          filters={filters}
          domains={domains}
          categories={filteredCategories}
          totalCourses={totalCourses}
          loading={loading}
          onSearchChange={setSearchQuery}
          onDomainChange={setSelectedDomain}
          onCategoryChange={setSelectedCategory}
          onDifficultyChange={setSelectedDifficulty}
          onClearAll={resetFilters}
          showSearch={false}
        />

        {/* Course Grid */}
        <div className="mt-8">
          <CourseGrid
            courses={courses}
            loading={loading}
            showDomain={true}
            showCategory={true}
            showDifficulty={true}
            emptyMessage="No courses found"
            emptyDescription="Try adjusting your search or filters"
          />
        </div>
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
