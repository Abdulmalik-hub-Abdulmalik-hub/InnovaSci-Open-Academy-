"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { 
  GraduationCap, ArrowRight, Clock, BookOpen, Users, 
  ChevronRight, CheckCircle2, Play, Award, Lock, Unlock,
  ChevronDown, ChevronUp
} from "lucide-react"

// Types
interface Domain {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  fullDescription: string | null
  color: string | null
  icon: string | null
  bannerUrl: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  bannerUrl: string | null
  icon?: string | null
  domain: Domain
}

interface Module {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonsCount: number
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
  introVideoUrl: string | null
  modules: Module[]
  category: Category | null
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
  totalLessons: number
  totalDuration: number
  totalEnrollments: number
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

export default function LearningPathDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  
  const fetchLearningPath = useCallback(async () => {
    if (!slug) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/learning-paths/${slug}`)
      const result = await response.json()
      
      if (result.success && result.data?.learningPath) {
        setLearningPath(result.data.learningPath)
      } else {
        setError(result.error || "Learning path not found")
      }
    } catch (err) {
      console.error("Failed to fetch learning path:", err)
      setError("Failed to load learning path")
    } finally {
      setLoading(false)
    }
  }, [slug])
  
  useEffect(() => {
    fetchLearningPath()
  }, [fetchLearningPath])
  
  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev)
      if (next.has(courseId)) {
        next.delete(courseId)
      } else {
        next.add(courseId)
      }
      return next
    })
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 py-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !learningPath) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Learning Path Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The learning path you are looking for does not exist."}</p>
          <Link href="/learning-paths">
            <Button>
              Browse All Learning Paths
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  
  const domain = learningPath.domains[0]
  const category = learningPath.categories[0]
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Domain Banner */}
      <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#2563EB]/10">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 pt-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/learning-paths" className="hover:text-foreground transition-colors">Learning Paths</Link>
            {domain && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/domains/${domain.slug}`} className="hover:text-foreground transition-colors">
                  {domain.icon && <span className="mr-1">{domain.icon}</span>}
                  {domain.name}
                </Link>
              </>
            )}
            {category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{category.name}</span>
              </>
            )}
          </nav>
        </div>
        
        {/* Hero */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            {/* Domain Badge */}
            {domain && (
              <Badge 
                variant="secondary" 
                className="mb-4 text-sm px-3 py-1"
                style={{ 
                  backgroundColor: domain.color ? `${domain.color}20` : undefined,
                  borderColor: domain.color || undefined
                }}
              >
                {domain.icon && <span className="mr-1">{domain.icon}</span>}
                {domain.name}
              </Badge>
            )}
            
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
              {learningPath.title}
            </h1>
            
            {learningPath.subtitle && (
              <p className="text-xl text-muted-foreground mb-4">
                {learningPath.subtitle}
              </p>
            )}
            
            {learningPath.description && (
              <p className="text-lg text-muted-foreground mb-6">
                {learningPath.description}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Badge 
                className={cn(
                  "text-sm px-3 py-1",
                  DIFFICULTY_COLORS[learningPath.difficultyLevel?.toUpperCase()] || DIFFICULTY_COLORS.BEGINNER
                )}
              >
                {DIFFICULTY_LABELS[learningPath.difficultyLevel?.toUpperCase()] || learningPath.difficultyLevel}
              </Badge>
              
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                {learningPath.totalCourses} courses
              </span>
              
              {learningPath.estimatedHours && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {learningPath.estimatedHours}h estimated
                </span>
              )}
              
              {learningPath.totalLessons > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Play className="h-4 w-4" />
                  {learningPath.totalLessons} lessons
                </span>
              )}
              
              {learningPath.totalEnrollments > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {learningPath.totalEnrollments.toLocaleString()} enrolled
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
                  <Unlock className="h-4 w-4 mr-2" />
                  Enroll Now - Free
                </Button>
              </Link>
              <Link href="#courses">
                <Button size="lg" variant="outline">
                  View Curriculum
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12" id="courses">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
            
            {learningPath.courses.map((course, index) => {
              const isExpanded = expandedCourses.has(course.id)
              const courseCategory = course.category
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => toggleCourse(course.id)}
                      className="w-full text-left"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-4">
                          {/* Course Number */}
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white",
                            isExpanded ? "bg-gradient-to-r from-[#7C3AED] to-[#2563EB]" : "bg-muted text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-lg line-clamp-2">
                                {course.title}
                              </CardTitle>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            
                            {/* Course Meta */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {courseCategory && (
                                <Badge variant="outline" className="text-xs">
                                  {courseCategory.icon && <span className="mr-1">{courseCategory.icon}</span>}
                                  {courseCategory.name}
                                </Badge>
                              )}
                              {course.difficultyLevel && (
                                <Badge 
                                  className={cn("text-xs", DIFFICULTY_COLORS[course.difficultyLevel.toUpperCase()])}
                                >
                                  {DIFFICULTY_LABELS[course.difficultyLevel.toUpperCase()]}
                                </Badge>
                              )}
                              {course.isFree && (
                                <Badge className="bg-green-500/10 text-green-600 text-xs">Free</Badge>
                              )}
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              {course.durationHours && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {course.durationHours}h
                                </span>
                              )}
                              {course.totalLessons && (
                                <span className="flex items-center gap-1">
                                  <Play className="h-3.5 w-3.5" />
                                  {course.totalLessons} lessons
                                </span>
                              )}
                              {course.enrollments > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {course.enrollments.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </button>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="pl-14 space-y-4">
                          {/* Thumbnail */}
                          {course.thumbnailUrl && (
                            <div className="relative h-40 rounded-lg overflow-hidden">
                              <Image
                                src={course.thumbnailUrl}
                                alt={course.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Description */}
                          {course.shortDescription && (
                            <p className="text-sm text-muted-foreground">
                              {course.shortDescription}
                            </p>
                          )}
                          
                          {/* Modules */}
                          {course.modules.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Modules</h4>
                              <div className="space-y-1">
                                {course.modules.map((module, mIndex) => (
                                  <div 
                                    key={module.id}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                                  >
                                    <span className="text-muted-foreground">{mIndex + 1}.</span>
                                    <span className="flex-1">{module.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {module.lessonsCount} lessons
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Action */}
                          <Link href={`/courses/${course.slug}`}>
                            <Button className="w-full mt-2">
                              View Course Details
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              )
            })}
            
            {/* Capstone Section */}
            {learningPath.requiredCourses > 0 && (
              <Card className="border-2 border-dashed border-muted-foreground/30">
                <CardContent className="py-8 text-center">
                  <Award className="h-12 w-12 text-[#7C3AED] mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Complete & Earn Certificate</h3>
                  <p className="text-muted-foreground mb-4">
                    Finish all {learningPath.requiredCourses} required courses to unlock your certificate.
                  </p>
                  <Badge className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white">
                    Certificate Included
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Ready to Start?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{learningPath.totalCourses} comprehensive courses</span>
                  </div>
                  {learningPath.totalLessons > 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{learningPath.totalLessons} detailed lessons</span>
                    </div>
                  )}
                  {learningPath.estimatedHours && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{learningPath.estimatedHours} hours of content</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Certificate upon completion</span>
                  </div>
                </div>
                
                <Link href="/auth/signup">
                  <Button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
                    Enroll Now - Free
                  </Button>
                </Link>
                
                <p className="text-xs text-center text-muted-foreground">
                  Sign up for free to start learning
                </p>
              </CardContent>
            </Card>
            
            {/* Domain Info */}
            {domain && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {domain.icon && <span>{domain.icon}</span>}
                    {domain.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {domain.shortDescription && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {domain.shortDescription}
                    </p>
                  )}
                  <Link href={`/domains/${domain.slug}`}>
                    <Button variant="outline" className="w-full">
                      Explore Domain
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Learning Journey Today
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are mastering scientific computing through our structured learning paths.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-[#7C3AED] hover:bg-white/90 font-semibold">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
