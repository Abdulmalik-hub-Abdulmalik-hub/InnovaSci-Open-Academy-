"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, BookOpen, ArrowRight, Play, Loader2 } from "lucide-react"
import { useDomainFilter, type Course } from "@/hooks/useDomainFilter"

// Difficulty colors for badges
const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const difficultyLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
}

// Fallback thumbnail images by category
const fallbackThumbnails = [
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop",
]

function getCourseThumbnail(course: Course, index: number): string {
  if (course.thumbnailUrl) {
    return course.thumbnailUrl
  }
  // Use category-based or index-based fallback
  return fallbackThumbnails[index % fallbackThumbnails.length]
}

// Build navigation URL following Domain → Category → Difficulty → Course hierarchy
function buildCourseNavigationUrl(course: Course): string {
  // Primary: Navigate directly to course detail page
  // The course page will show the hierarchy breadcrumb
  if (course.slug) {
    return `/courses/${course.slug}`
  }
  // Fallback to course ID if no slug
  return `/courses/${course.id}`
}

// Build domain filter URL for "Explore by Domain" navigation
function buildDomainFilterUrl(course: Course): string {
  const params = new URLSearchParams()
  
  if (course.domainId) {
    params.set("domainId", course.domainId)
  }
  if (course.categoryId) {
    params.set("categoryId", course.categoryId)
  }
  if (course.difficultyLevel) {
    params.set("difficultyLevel", course.difficultyLevel)
  }
  
  const queryString = params.toString()
  return queryString ? `/courses?${queryString}` : "/courses"
}

// Single Course Card with full clickability
interface CourseCardProps {
  course: Course
  index: number
}

function CourseCard({ course, index }: CourseCardProps) {
  const thumbnail = getCourseThumbnail(course, index)
  const difficultyLabel = difficultyLabels[course.difficultyLevel || ""] || course.difficultyLevel
  const courseUrl = buildCourseNavigationUrl(course)
  
  // Get difficulty color
  const difficultyColor = difficultyColors[course.difficultyLevel || ""] || difficultyColors.BEGINNER
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link 
        href={courseUrl}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-purple))] focus:ring-offset-2 rounded-lg"
        aria-label={`View course: ${course.title}`}
      >
        <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer relative">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Domain Badge */}
            {course.domain && (
              <Badge 
                className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs"
                style={{ 
                  backgroundColor: course.domain.color ? `${course.domain.color}ee` : 'hsl(var(--brand-purple)/0.9)',
                  color: 'white',
                  border: 'none'
                }}
              >
                {course.domain.icon && <span className="mr-1">{course.domain.icon}</span>}
                {course.domain.name}
              </Badge>
            )}

            {/* Difficulty Badge */}
            {course.difficultyLevel && (
              <Badge 
                className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-xs ${difficultyColor}`}
              >
                {difficultyLabel}
              </Badge>
            )}

            {/* Free Badge */}
            {course.isFree && (
              <Badge className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-green-500 text-white text-xs">
                Free
              </Badge>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--brand-purple))] ml-0.5 sm:ml-1" />
              </div>
            </div>
          </div>

          {/* Card Header - Title */}
          <CardHeader className="p-3 sm:p-4">
            <h3 className="font-semibold line-clamp-2 group-hover:text-[hsl(var(--brand-purple))] group-focus-visible:text-[hsl(var(--brand-purple))] transition-colors text-sm sm:text-base">
              {course.title}
            </h3>
            {course.category && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {course.category}
              </p>
            )}
          </CardHeader>

          {/* Card Content - Meta info */}
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              {course.durationHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {course.durationHours}h
                </div>
              )}
              {course.enrollments !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {course.enrollments.toLocaleString()}
                </div>
              )}
              {course.durationHours && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {Math.floor(course.durationHours * 3)} lessons
                </div>
              )}
            </div>
          </CardContent>

          {/* Card Footer - Price & CTA */}
          <CardFooter className="p-3 sm:p-4 pt-0 flex items-center justify-between gap-2">
            <div className="font-bold text-sm sm:text-base">
              {course.isFree ? (
                <span className="text-green-600">Free</span>
              ) : (
                <span>${course.price}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[hsl(var(--brand-purple))] text-xs sm:text-sm font-medium">
              View Course
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardFooter>
          
          {/* Active/Click feedback overlay */}
          <div className="absolute inset-0 bg-[hsl(var(--brand-purple))]/5 opacity-0 group-active:opacity-100 transition-opacity pointer-events-none" />
        </Card>
      </Link>
    </motion.div>
  )
}

export function CourseCatalog() {
  const { courses, loading, totalCourses } = useDomainFilter()
  
  // Display up to 4 courses on the landing page
  const displayCourses = useMemo(() => {
    return courses.slice(0, 4)
  }, [courses])
  
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Explore Our <span className="bg-gradient-to-r from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] bg-clip-text text-transparent">Courses</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Discover world-class courses taught by leading experts in AI, Data Science, Computational Biology, and more.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && courses.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Course Grid - Responsive */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        )}

        {/* Empty State - Show placeholder cards when no courses */}
        {!loading && displayCourses.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[0, 1, 2, 3].map((index) => (
              <Card key={index} className="h-full overflow-hidden">
                <div className="relative aspect-video bg-muted animate-pulse" />
                <CardHeader className="p-3 sm:p-4">
                  <div className="h-5 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="flex gap-4">
                    <div className="h-4 bg-muted rounded animate-pulse w-12" />
                    <div className="h-4 bg-muted rounded animate-pulse w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-12"
        >
          <Link href="/courses">
            <Button size="lg" variant="outline" className="gap-2">
              View All Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
