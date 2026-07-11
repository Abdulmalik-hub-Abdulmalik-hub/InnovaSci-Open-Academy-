"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

// Types
export interface Domain {
  id: string
  name: string
  slug: string
  shortName?: string | null
  shortDescription?: string | null
  fullDescription?: string | null
  thumbnailUrl?: string | null
  bannerUrl?: string | null
  icon?: string | null
  color?: string | null
  isFeatured?: boolean
  categoryCount?: number
  courseCount?: number
  categories?: Category[]
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  color?: string | null
  courseCount?: number
  domainId?: string | null
}

export interface Course {
  id: string
  title: string
  slug: string
  shortDescription?: string | null
  thumbnailUrl?: string | null
  price: number
  isFree: boolean
  difficultyLevel?: string | null
  category?: string | null
  categoryId?: string | null
  domainId?: string | null
  domain?: Domain | null
  durationHours?: number | null
  enrollments?: number
}

export interface FilterState {
  searchQuery: string
  selectedDomain: string
  selectedCategory: string
  selectedDifficulty: string
}

export interface UseDomainFilterReturn {
  // Data
  domains: Domain[]
  categories: Category[]
  filteredCategories: Category[]
  courses: Course[]
  
  // Filter State
  filters: FilterState
  setSearchQuery: (query: string) => void
  setSelectedDomain: (domainId: string) => void
  setSelectedCategory: (categoryId: string) => void
  setSelectedDifficulty: (difficulty: string) => void
  resetFilters: () => void
  
  // Loading States
  loading: boolean
  coursesLoading: boolean
  filtersLoading: boolean
  
  // Metadata
  totalCourses: number
  
  // Utilities
  getDifficultyLabel: (difficulty: string | null) => string
  hasActiveFilters: boolean
}

const DIFFICULTY_LABELS: Record<string, string> = {
  "BEGINNER": "Beginner",
  "INTERMEDIATE": "Intermediate",
  "ADVANCED": "Advanced",
  "All Levels": "All Levels",
  "All Difficulty Levels": "All Difficulty Levels",
}

export const DIFFICULTIES = ["All Levels", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const

export function useDomainFilter(initialFilters?: Partial<FilterState>): UseDomainFilterReturn {
  // Data states
  const [domains, setDomains] = useState<Domain[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [totalCourses, setTotalCourses] = useState(0)
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: initialFilters?.searchQuery || "",
    selectedDomain: initialFilters?.selectedDomain || "",
    selectedCategory: initialFilters?.selectedCategory || "",
    selectedDifficulty: initialFilters?.selectedDifficulty || "All Levels",
  })
  
  // Loading states
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(false)
  
  // Fetch domains and categories
  const fetchFilters = useCallback(async () => {
    setFiltersLoading(true)
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
    } finally {
      setFiltersLoading(false)
    }
  }, [])
  
  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters.searchQuery) {
        params.set("q", filters.searchQuery)
      }
      if (filters.selectedDomain) {
        params.set("domainId", filters.selectedDomain)
      }
      if (filters.selectedCategory) {
        params.set("categoryId", filters.selectedCategory)
      }
      if (filters.selectedDifficulty && filters.selectedDifficulty !== "All Levels") {
        params.set("difficultyLevel", filters.selectedDifficulty)
      }
      
      const response = await fetch(`/api/public/courses?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setCourses(result.data || [])
        setTotalCourses(result.data?.length || 0)
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err)
      setCourses([])
      setTotalCourses(0)
    } finally {
      setCoursesLoading(false)
    }
  }, [filters.searchQuery, filters.selectedDomain, filters.selectedCategory, filters.selectedDifficulty])
  
  // Initial fetch
  useEffect(() => {
    fetchFilters()
  }, [fetchFilters])
  
  // Fetch courses when filters change
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])
  
  // Filter categories based on selected domain
  const filteredCategories = useMemo(() => {
    if (!filters.selectedDomain) {
      return categories
    }
    return categories.filter(cat => cat.domainId === filters.selectedDomain)
  }, [categories, filters.selectedDomain])
  
  // Setters
  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }))
  }, [])
  
  const setSelectedDomain = useCallback((domainId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      selectedDomain: domainId,
      selectedCategory: "" // Reset category when domain changes
    }))
  }, [])
  
  const setSelectedCategory = useCallback((categoryId: string) => {
    setFilters(prev => ({ ...prev, selectedCategory: categoryId }))
  }, [])
  
  const setSelectedDifficulty = useCallback((difficulty: string) => {
    setFilters(prev => ({ ...prev, selectedDifficulty: difficulty }))
  }, [])
  
  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      selectedDomain: "",
      selectedCategory: "",
      selectedDifficulty: "All Levels",
    })
  }, [])
  
  // Utilities
  const getDifficultyLabel = useCallback((difficulty: string | null | undefined): string => {
    if (!difficulty) return ""
    return DIFFICULTY_LABELS[difficulty] || difficulty
  }, [])
  
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchQuery ||
      filters.selectedDomain ||
      filters.selectedCategory ||
      filters.selectedDifficulty !== "All Levels"
    )
  }, [filters])
  
  const loading = filtersLoading || coursesLoading
  
  return {
    domains,
    categories,
    filteredCategories,
    courses,
    filters,
    setSearchQuery,
    setSelectedDomain,
    setSelectedCategory,
    setSelectedDifficulty,
    resetFilters,
    loading,
    coursesLoading,
    filtersLoading,
    totalCourses,
    getDifficultyLabel,
    hasActiveFilters,
  }
}

// Helper function to get domain by ID
export function getDomainById(domains: Domain[], id: string): Domain | undefined {
  return domains.find(d => d.id === id)
}

// Helper function to get category by ID
export function getCategoryById(categories: Category[], id: string): Category | undefined {
  return categories.find(c => c.id === id)
}

// Helper function to format course for display
export function formatCourseDomain(course: Course): string {
  return course.domain?.name || ""
}

export function formatCourseCategory(course: Course): string {
  return course.category || ""
}

export function formatCourseDifficulty(course: Course): string {
  switch (course.difficultyLevel) {
    case "BEGINNER": return "Beginner"
    case "INTERMEDIATE": return "Intermediate"
    case "ADVANCED": return "Advanced"
    default: return course.difficultyLevel || ""
  }
}
