"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Loader2, BookOpen, Users, Clock, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Course {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  price: number
  isFree: boolean
  difficulty: string
  category: string | null
  duration: number | null
  totalStudents: number
  totalLessons: number
  instructor: {
    name: string | null
    avatar: string | null
  } | null
  avgRating: number | null
  isPublished: boolean
}

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export default function CoursesPage() {
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels")
  const [showFilters, setShowFilters] = useState(false)
  const [totalCourses, setTotalCourses] = useState(0)

  useEffect(() => {
    fetchCourses()
  }, [searchParams])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const q = searchParams.get("q")
      const category = searchParams.get("category")
      const difficulty = searchParams.get("difficulty")

      if (q) params.set("q", q)
      if (category) {
        setSelectedCategory(category)
        params.set("category", category)
      }
      if (difficulty) {
        setSelectedDifficulty(difficulty)
        params.set("difficulty", difficulty)
      }
      if (searchQuery) params.set("q", searchQuery)

      const response = await fetch(`/api/public/courses?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setCourses(result.data.courses)
        setTotalCourses(result.data.total)
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (selectedCategory !== "All Categories") params.set("category", selectedCategory)
    if (selectedDifficulty !== "All Levels") params.set("difficulty", selectedDifficulty)
    
    const newUrl = `/courses${params.toString() ? `?${params.toString()}` : ""}`
    window.location.href = newUrl
  }

  const categories = [
    "All Categories",
    "Artificial Intelligence",
    "Data Science",
    "Machine Learning",
    "Computational Biology",
    "Quantum Computing",
    "Drug Discovery",
    "Web Development",
    "Cloud Computing",
  ]

  const difficulties = ["All Levels", "Beginner", "Intermediate", "Advanced"]

  const filteredCourses = courses.filter(course => {
    if (selectedCategory !== "All Categories" && course.category !== selectedCategory) return false
    if (selectedDifficulty !== "All Levels" && course.difficulty !== selectedDifficulty) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/20">
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
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setSelectedCategory(selectedCategory === "All Categories" ? categories[1] : selectedCategory)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <span>{selectedCategory}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <button
                onClick={() => setSelectedDifficulty(selectedDifficulty === "All Levels" ? "Beginner" : selectedDifficulty)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <span>{selectedDifficulty}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="lg:hidden mb-8 p-4 bg-background rounded-lg border">
            <h3 className="font-medium mb-3">Category</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <h3 className="font-medium mb-3">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <Badge
                  key={diff}
                  variant={selectedDifficulty === diff ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
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
                  {course.difficulty && (
                    <Badge
                      className={`absolute top-3 right-3 ${difficultyColors[course.difficulty as keyof typeof difficultyColors] || ""}`}
                    >
                      {course.difficulty}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  {course.category && (
                    <p className="text-sm text-purple-600 font-medium mb-2">{course.category}</p>
                  )}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                  )}
                  
                  {/* Course Meta */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {course.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}h
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.totalStudents.toLocaleString()}
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
    </div>
  )
}
