"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ChevronRight, Loader2, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDomainFilter, type Domain, type Category, type Course } from "@/hooks/useDomainFilter"

export default function DomainsPage() {
  const {
    domains,
    categories,
    filteredCategories,
    courses,
    filters,
    setSearchQuery,
    setSelectedDomain,
    setSelectedCategory,
    resetFilters,
    loading,
    totalCourses,
  } = useDomainFilter()

  const selectedDomainData = domains.find(d => d.id === filters.selectedDomain)
  const selectedCategoryData = categories.find(c => c.id === filters.selectedCategory)

  if (loading && domains.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-muted-foreground">Loading domains...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="text-yellow-300">Domains</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Browse our courses organized by scientific and technological domains. Find your area of interest and start learning.
          </p>
          
          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search within domains..."
                value={filters.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white text-gray-900 border-0 focus-visible:ring-2 focus-visible:ring-yellow-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Domain & Category Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Domain List */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Domains
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedDomain("")
                      setSelectedCategory("")
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                      !filters.selectedDomain 
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>All Domains</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {domains.map((domain) => (
                    <button
                      key={domain.id}
                      onClick={() => {
                        setSelectedDomain(domain.id)
                        setSelectedCategory("")
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                        filters.selectedDomain === domain.id 
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {domain.icon && <span className="text-xl">{domain.icon}</span>}
                        <div>
                          <span className="font-medium">{domain.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {(domain as any).categoryCount || 0} categories • {(domain as any).courseCount || 0} courses
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category List (when domain selected) */}
              {filters.selectedDomain && filteredCategories.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Categories in {selectedDomainData?.name}
                  </h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        !filters.selectedCategory 
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                          : "hover:bg-muted"
                      }`}
                    >
                      All Categories
                    </button>
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          filters.selectedCategory === cat.id 
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                            : "hover:bg-muted"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Selected Domain/Category Info */}
            {filters.selectedDomain ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {selectedDomainData?.icon && (
                    <span className="text-3xl">{selectedDomainData.icon}</span>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedDomainData?.name}
                    </h2>
                    {filters.selectedCategory && selectedCategoryData && (
                      <p className="text-muted-foreground">
                        {selectedCategoryData.name}
                      </p>
                    )}
                  </div>
                </div>
                {selectedDomainData?.shortDescription && (
                  <p className="text-muted-foreground">{selectedDomainData.shortDescription}</p>
                )}
                {totalCourses > 0 && (
                  <p className="text-muted-foreground mt-2">{totalCourses} courses available</p>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">All Domains</h2>
                <p className="text-muted-foreground">
                  Select a domain to explore its courses
                </p>
              </div>
            )}

            {/* Domain Cards (when no domain selected) */}
            {!filters.selectedDomain && (
              <div className="grid md:grid-cols-2 gap-6">
                {domains.map((domain) => (
                  <Card 
                    key={domain.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => setSelectedDomain(domain.id)}
                  >
                    <div className="aspect-video relative">
                      {(domain as any).bannerUrl ? (
                        <Image
                          src={(domain as any).bannerUrl}
                          alt={domain.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div 
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ backgroundColor: domain.color || '#6366f1' }}
                        >
                          <span className="text-6xl">{domain.icon || '📚'}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {domain.icon && <span>{domain.icon}</span>}
                          {domain.name}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground line-clamp-2">
                        {domain.shortDescription || "Explore courses in this domain"}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {(domain as any).categoryCount || 0} categories
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {(domain as any).courseCount || 0} courses
                      </span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Courses List (when domain or category selected) */}
            {(filters.selectedDomain || filters.selectedCategory) && (
              <>
                {courses.length === 0 ? (
                  <div className="text-center py-20">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No courses found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or selecting a different domain
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{totalCourses} courses found</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      {courses.map((course) => (
                        <Link key={course.id} href={`/courses/${course.slug}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                            <div className="aspect-video relative">
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
                                  className={`absolute top-3 right-3 ${
                                    course.difficultyLevel === "BEGINNER" ? "bg-green-100 text-green-800" :
                                    course.difficultyLevel === "INTERMEDIATE" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {course.difficultyLevel === "BEGINNER" ? "Beginner" :
                                   course.difficultyLevel === "INTERMEDIATE" ? "Intermediate" :
                                   course.difficultyLevel === "ADVANCED" ? "Advanced" : course.difficultyLevel}
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-4">
                              {/* Domain Badge */}
                              {course.domain && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs mb-2"
                                  style={{ borderColor: course.domain.color || '#6366f1', color: course.domain.color || '#6366f1' }}
                                >
                                  {course.domain.icon && <span className="mr-1">{course.domain.icon}</span>}
                                  {course.domain.name}
                                </Badge>
                              )}
                              {course.category && (
                                <p className="text-sm text-purple-600 font-medium mb-2">{course.category}</p>
                              )}
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                              {course.shortDescription && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{course.shortDescription}</p>
                              )}
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {course.durationHours && (
                                  <span>{course.durationHours}h</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {course.enrollments?.toLocaleString() || 0}
                                </span>
                              </div>
                              <Button size="sm" variant="ghost">
                                View Course
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
