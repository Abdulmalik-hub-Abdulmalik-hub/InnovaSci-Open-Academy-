"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, BookOpen, Play, LayoutGrid, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Course } from "@/hooks/useDomainFilter"

interface CourseCardProps {
  course: Course
  showDomain?: boolean
  showCategory?: boolean
  showDifficulty?: boolean
  variant?: "default" | "compact" | "list"
  className?: string
}

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

export function CourseCard({ 
  course, 
  showDomain = true,
  showCategory = true,
  showDifficulty = true,
  variant = "default",
  className 
}: CourseCardProps) {
  const difficultyLabel = difficultyLabels[course.difficultyLevel || ""] || course.difficultyLevel
  
  if (variant === "list") {
    return (
      <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
        <Link href={`/courses/${course.slug}`} className="flex">
          <div className="w-40 h-32 flex-shrink-0 relative">
            {course.thumbnailUrl ? (
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white/50" />
              </div>
            )}
            {course.isFree && (
              <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                Free
              </Badge>
            )}
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {showDomain && course.domain && (
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: course.domain.color || '#6366f1', color: course.domain.color || '#6366f1' }}
                  >
                    <LayoutGrid className="h-3 w-3 mr-1" />
                    {course.domain.icon && <span className="mr-1">{course.domain.icon}</span>}
                    {course.domain.name}
                  </Badge>
                )}
                {showDifficulty && course.difficultyLevel && (
                  <Badge className={cn("text-xs", difficultyColors[course.difficultyLevel])}>
                    {difficultyLabel}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold line-clamp-1 mb-1">{course.title}</h3>
              {course.shortDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2">{course.shortDescription}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {course.durationHours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.durationHours}h
                  </span>
                )}
                {course.enrollments !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrollments.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="font-bold">
                {course.isFree ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span>${course.price}</span>
                )}
              </span>
            </div>
          </div>
        </Link>
      </Card>
    )
  }
  
  if (variant === "compact") {
    return (
      <Link href={`/courses/${course.slug}`}>
        <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow h-full", className)}>
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
              <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                Free
              </Badge>
            )}
            {showDifficulty && course.difficultyLevel && (
              <Badge className={cn("absolute top-2 right-2 text-xs", difficultyColors[course.difficultyLevel])}>
                {difficultyLabel}
              </Badge>
            )}
          </div>
          <CardContent className="p-3">
            {showDomain && course.domain && (
              <Badge 
                variant="outline" 
                className="text-xs mb-2 block w-fit"
                style={{ borderColor: course.domain.color || '#6366f1', color: course.domain.color || '#6366f1' }}
              >
                {course.domain.icon && <span className="mr-1">{course.domain.icon}</span>}
                {course.domain.name}
              </Badge>
            )}
            <h3 className="font-semibold text-sm line-clamp-2">{course.title}</h3>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex items-center justify-between text-xs text-muted-foreground">
            {course.durationHours && <span>{course.durationHours}h</span>}
            {course.enrollments !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {course.enrollments.toLocaleString()}
              </span>
            )}
          </CardFooter>
        </Card>
      </Link>
    )
  }
  
  // Default variant - Full card clickable
  return (
    <Link 
      href={`/courses/${course.slug}`}
      className="block h-full focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-purple))] focus:ring-offset-2 rounded-lg"
      aria-label={`View course: ${course.title}`}
    >
      <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-200 h-full group cursor-pointer", className)}>
        <div className="relative aspect-video">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {course.isFree && (
            <Badge className="absolute top-3 left-3 bg-green-500 text-white">
              Free
            </Badge>
          )}
          {showDifficulty && course.difficultyLevel && (
            <Badge className={cn("absolute top-3 right-3", difficultyColors[course.difficultyLevel])}>
              {difficultyLabel}
            </Badge>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="h-6 w-6 text-purple-600 ml-1" />
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          {showDomain && course.domain && (
            <Badge 
              variant="outline" 
              className="text-xs mb-2 block w-fit"
              style={{ borderColor: course.domain.color || '#6366f1', color: course.domain.color || '#6366f1' }}
            >
              {course.domain.icon && <span className="mr-1">{course.domain.icon}</span>}
              {course.domain.name}
            </Badge>
          )}
          {showCategory && course.category && (
            <p className="text-sm text-purple-600 font-medium mb-2">{course.category}</p>
          )}
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-[hsl(var(--brand-purple))] group-focus-visible:text-[hsl(var(--brand-purple))] transition-colors">{course.title}</h3>
          {course.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.shortDescription}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {course.durationHours && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.durationHours}h
              </span>
            )}
            {course.enrollments !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.enrollments.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="font-bold text-lg">
            {course.isFree ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span>${course.price}</span>
            )}
          </span>
          <span className="flex items-center gap-1 text-purple-600 text-sm font-medium">
            View Course
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </CardFooter>
        
        {/* Active/Click feedback overlay */}
        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-active:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </Link>
  )
}

interface CourseGridProps {
  courses: Course[]
  loading?: boolean
  showDomain?: boolean
  showCategory?: boolean
  showDifficulty?: boolean
  emptyMessage?: string
  emptyDescription?: string
  className?: string
}

export function CourseGrid({
  courses,
  loading,
  showDomain = true,
  showCategory = true,
  showDifficulty = true,
  emptyMessage = "No courses found",
  emptyDescription = "Try adjusting your search or filters",
  className
}: CourseGridProps) {
  if (loading) {
    return (
      <div className={cn("grid gap-6", className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded animate-pulse mb-2 w-1/3" />
              <div className="h-6 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  if (courses.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground">{emptyDescription}</p>
      </div>
    )
  }
  
  return (
    <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          showDomain={showDomain}
          showCategory={showCategory}
          showDifficulty={showDifficulty}
        />
      ))}
    </div>
  )
}

interface FeaturedCoursesProps {
  courses: Course[]
  title?: string
  description?: string
  className?: string
}

export function FeaturedCourses({
  courses,
  title = "Featured Courses",
  description = "Hand-picked courses by our experts",
  className
}: FeaturedCoursesProps) {
  if (courses.length === 0) return null
  
  return (
    <section className={cn("py-12 sm:py-16 md:py-20 bg-muted/50", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        <CourseGrid 
          courses={courses.slice(0, 4)} 
          showDomain={true}
          showCategory={true}
          showDifficulty={true}
        />
      </div>
    </section>
  )
}

interface PopularCoursesProps {
  courses: Course[]
  className?: string
}

export function PopularCourses({ courses, className }: PopularCoursesProps) {
  if (courses.length === 0) return null
  
  return (
    <section className={cn("py-8", className)}>
      <CourseGrid 
        courses={courses.slice(0, 8)} 
        showDomain={true}
        showCategory={true}
        showDifficulty={true}
      />
    </section>
  )
}

interface NewestCoursesProps {
  courses: Course[]
  className?: string
}

export function NewestCourses({ courses, className }: NewestCoursesProps) {
  if (courses.length === 0) return null
  
  return (
    <section className={cn("py-8", className)}>
      <CourseGrid 
        courses={courses.slice(0, 8)} 
        showDomain={true}
        showCategory={true}
        showDifficulty={true}
      />
    </section>
  )
}
