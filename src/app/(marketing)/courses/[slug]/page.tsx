"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  BookOpen, 
  Play, 
  PlayCircle,
  Lock, 
  ChevronDown, 
  ChevronUp,
  Check,
  Share2,
  Heart,
  Star,
  Award,
  Download,
  Video,
  FileText,
  Code,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  description?: string
  orderIndex: number
  lessonType: string
  duration?: number
  isFree: boolean
  isAccessible?: boolean
}

interface Module {
  id: string
  title: string
  description?: string
  orderIndex: number
  lessons: Lesson[]
}

interface CourseData {
  id: string
  title: string
  slug: string
  category?: string
  subcategory?: string
  shortDescription?: string
  fullDescription?: string
  learningOutcomes?: string
  prerequisites?: string
  difficultyLevel?: string
  language?: string
  durationHours?: number
  thumbnailUrl: string
  promoVideoUrl?: string
  price: number
  isFree: boolean
  status: string
  totalLessons: number
  totalEnrollments: number
  totalDuration: number
  modules: Module[]
}

// Mock data for demonstration
const mockCourseData: CourseData = {
  id: "1",
  title: "Introduction to Machine Learning",
  slug: "intro-machine-learning",
  category: "AI & Data Science",
  subcategory: "Machine Learning",
  shortDescription: "Master the fundamentals of machine learning from scratch",
  fullDescription: `This comprehensive course takes you from the basics of machine learning to building production-ready models. You'll learn the mathematical foundations, implement algorithms from scratch, and work on real-world projects using industry-standard tools.

Our curriculum covers supervised and unsupervised learning, neural networks, deep learning, and model deployment. By the end of this course, you'll have the skills to tackle complex ML problems and build intelligent systems.`,
  learningOutcomes: "• Understand core ML concepts and algorithms\n• Build supervised and unsupervised learning models\n• Implement neural networks from scratch\n• Deploy models to production environments\n• Evaluate and optimize model performance",
  prerequisites: "• Basic Python programming\n• High school mathematics\n• Familiarity with data structures",
  difficultyLevel: "Beginner",
  language: "English",
  durationHours: 24,
  thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=675&fit=crop",
  promoVideoUrl: "",
  price: 0,
  isFree: true,
  status: "published",
  totalLessons: 45,
  totalEnrollments: 15234,
  totalDuration: 43200,
  modules: [
    {
      id: "m1",
      title: "Getting Started",
      description: "Introduction and setup",
      orderIndex: 0,
      lessons: [
        { id: "l1", title: "Welcome to the Course", orderIndex: 0, lessonType: "video", duration: 330, isFree: true },
        { id: "l2", title: "Course Overview & Roadmap", orderIndex: 1, lessonType: "video", duration: 765, isFree: true },
        { id: "l3", title: "Setting Up Your Environment", orderIndex: 2, lessonType: "video", duration: 1100, isFree: false },
      ]
    },
    {
      id: "m2",
      title: "Fundamentals of ML",
      description: "Core concepts and mathematics",
      orderIndex: 1,
      lessons: [
        { id: "l4", title: "What is Machine Learning?", orderIndex: 0, lessonType: "video", duration: 900, isFree: true },
        { id: "l5", title: "Types of Machine Learning", orderIndex: 1, lessonType: "video", duration: 1350, isFree: false },
        { id: "l6", title: "Mathematics Review", orderIndex: 2, lessonType: "reading", duration: 0, isFree: false },
        { id: "l7", title: "ML Fundamentals Quiz", orderIndex: 3, lessonType: "quiz", duration: 600, isFree: false },
      ]
    },
    {
      id: "m3",
      title: "Supervised Learning",
      description: "Regression and classification",
      orderIndex: 2,
      lessons: [
        { id: "l8", title: "Linear Regression", orderIndex: 0, lessonType: "video", duration: 1500, isFree: false },
        { id: "l9", title: "Logistic Regression", orderIndex: 1, lessonType: "video", duration: 1710, isFree: false },
        { id: "l10", title: "Decision Trees", orderIndex: 2, lessonType: "video", duration: 1935, isFree: false },
        { id: "l11", title: "Code Lab: Supervised Learning", orderIndex: 3, lessonType: "lab", duration: 2700, isFree: false },
      ]
    },
    {
      id: "m4",
      title: "Unsupervised Learning",
      description: "Clustering and dimensionality reduction",
      orderIndex: 3,
      lessons: [
        { id: "l12", title: "K-Means Clustering", orderIndex: 0, lessonType: "video", duration: 1800, isFree: false },
        { id: "l13", title: "Hierarchical Clustering", orderIndex: 1, lessonType: "video", duration: 1545, isFree: false },
        { id: "l14", title: "PCA & Dimensionality Reduction", orderIndex: 2, lessonType: "video", duration: 1800, isFree: false },
      ]
    },
    {
      id: "m5",
      title: "Neural Networks",
      description: "Deep learning fundamentals",
      orderIndex: 4,
      lessons: [
        { id: "l15", title: "Introduction to Neural Networks", orderIndex: 0, lessonType: "video", duration: 2100, isFree: false },
        { id: "l16", title: "Backpropagation", orderIndex: 1, lessonType: "video", duration: 2400, isFree: false },
        { id: "l17", title: "Building Your First Neural Network", orderIndex: 2, lessonType: "lab", duration: 3000, isFree: false },
      ]
    }
  ]
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const getLessonIcon = (type: string, isAccessible: boolean, isFree: boolean) => {
  const iconClass = cn(
    "w-4 h-4",
    isAccessible || isFree ? "text-emerald-500" : "text-slate-400"
  )
  
  switch (type) {
    case "video":
      return <Video className={iconClass} />
    case "quiz":
      return <BarChart3 className={iconClass} />
    case "lab":
      return <Code className={iconClass} />
    case "reading":
      return <FileText className={iconClass} />
    default:
      return <Play className={iconClass} />
  }
}

export default function CourseDetailsPage() {
  const [expandedModules, setExpandedModules] = useState<string[]>(["m1"])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [lockedLessonId, setLockedLessonId] = useState<string | null>(null)
  const [courseData, setCourseData] = useState<CourseData | null>(null)

  useEffect(() => {
    // Simulate fetching course data
    setCourseData(mockCourseData)
  }, [])

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const handleLessonClick = (lesson: Lesson) => {
    // If enrolled or lesson is free, navigate to lesson
    if (isEnrolled || lesson.isFree) {
      console.log(`Navigating to lesson: ${lesson.title}`)
      // Router.push would be used here in real app
      return
    }
    
    // Otherwise show enrollment modal
    setLockedLessonId(lesson.id)
    setShowEnrollmentModal(true)
  }

  const handleEnroll = () => {
    setIsEnrolled(true)
    setShowEnrollmentModal(false)
    setLockedLessonId(null)
  }

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
  }

  const handleShare = async () => {
    const shareData = {
      title: courseData?.title,
      text: `Check out this course: ${courseData?.title}`,
      url: window.location.href,
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading course...</div>
      </div>
    )
  }

  const freeLessonsCount = courseData.modules.reduce(
    (acc, module) => acc + module.lessons.filter(l => l.isFree).length, 
    0
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-12 lg:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Course Info */}
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                <Link href="/courses" className="hover:text-white transition-colors">
                  Courses
                </Link>
                <span>/</span>
                <span className="text-white">{courseData.category}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {courseData.difficultyLevel}
                </Badge>
                {courseData.isFree && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Free Course
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {courseData.language}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {courseData.title}
              </h1>

              {/* Short Description */}
              <p className="text-lg text-slate-300 mb-6">
                {courseData.shortDescription}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm mb-8">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{courseData.totalEnrollments.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{formatDuration(courseData.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{courseData.totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>4.8 (2,456 reviews)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                {isEnrolled ? (
                  <Link href={`/learn/${courseData.slug}`}>
                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                      <Play className="w-4 h-4" />
                      Continue Learning
                    </Button>
                  </Link>
                ) : courseData.isFree ? (
                  <Button size="lg" onClick={handleEnroll} className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                    <Check className="w-4 h-4" />
                    Enroll for Free
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => setShowEnrollmentModal(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
                    Enroll Now
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleWishlistToggle}
                  className={cn(
                    "gap-2 border-slate-600",
                    isWishlisted && "bg-red-500/10 border-red-500/50 text-red-400"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isWishlisted && "fill-red-400")} />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Button>
                
                <Button variant="ghost" size="lg" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Right: Video Preview Card */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative aspect-video rounded-xl overflow-hidden shadow-2xl"
              >
                <Image
                  src={courseData.thumbnailUrl}
                  alt={courseData.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-transform hover:scale-105">
                    <Play className="w-8 h-8 text-slate-900 ml-1" />
                  </button>
                </div>
                {/* Free Badge */}
                {courseData.isFree && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-emerald-500 text-white px-3 py-1">
                      FREE
                    </Badge>
                  </div>
                )}
              </motion.div>
              
              {/* Course Card Info */}
              <Card className="mt-4 bg-card/80 backdrop-blur border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">${courseData.price}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: June 2024
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Course Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {courseData.fullDescription}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Learning Outcomes */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                <ul className="space-y-3">
                  {courseData.learningOutcomes?.split('\n').filter(Boolean).map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{outcome.replace(/^[•]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {courseData.prerequisites && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
                  <ul className="space-y-2">
                    {courseData.prerequisites.split('\n').filter(Boolean).map((prereq, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {prereq.replace(/^[•]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Curriculum */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Course Curriculum</h2>
                  <Badge variant="secondary">
                    {freeLessonsCount} free lessons
                  </Badge>
                </div>

                <div className="space-y-3">
                  {courseData.modules.map((module) => (
                    <div key={module.id} className="border rounded-lg overflow-hidden">
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              {module.orderIndex + 1}
                            </span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">{module.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {module.lessons.length} lessons • {formatDuration(
                                module.lessons.reduce((acc, l) => acc + (l.duration || 0), 0)
                              )}
                            </p>
                          </div>
                        </div>
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      {/* Module Lessons */}
                      <AnimatePresence>
                        {expandedModules.includes(module.id) && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="divide-y">
                              {module.lessons.map((lesson) => {
                                const isAccessible = isEnrolled || lesson.isFree
                                
                                return (
                                  <div
                                    key={lesson.id}
                                    className={cn(
                                      "flex items-center gap-4 p-4 transition-colors",
                                      isAccessible 
                                        ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" 
                                        : "cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                    )}
                                    onClick={() => handleLessonClick(lesson)}
                                  >
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                      {isAccessible ? (
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                          {getLessonIcon(lesson.lessonType, isAccessible, lesson.isFree)}
                                        </div>
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                          <Lock className="w-4 h-4 text-slate-400" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        "font-medium truncate",
                                        !isAccessible && "text-muted-foreground"
                                      )}>
                                        {lesson.title}
                                      </p>
                                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="capitalize">{lesson.lessonType}</span>
                                        {lesson.duration && lesson.duration > 0 && (
                                          <>
                                            <span>•</span>
                                            <span>{formatDuration(lesson.duration)}</span>
                                          </>
                                        )}
                                        {lesson.isFree && !isEnrolled && (
                                          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            FREE
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-shrink-0">
                                      {isAccessible ? (
                                        <Button variant="ghost" size="sm" className="gap-1">
                                          <PlayCircle className="w-4 h-4" />
                                          {isEnrolled ? "Play" : "Preview"}
                                        </Button>
                                      ) : (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Lock className="w-4 h-4" />
                                          <span>Locked</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certificate */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Earn Your Certificate</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete this course and receive a verified certificate that you can share on LinkedIn and with employers.
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      View Certificate Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <Card className="overflow-hidden">
                <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={courseData.thumbnailUrl}
                    alt={courseData.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-transform hover:scale-105">
                      <Play className="w-6 h-6 text-slate-900 ml-1" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold mb-2">
                      {courseData.isFree ? "Free" : `$${courseData.price}`}
                    </div>
                    {!courseData.isFree && (
                      <p className="text-sm text-muted-foreground">
                        One-time payment • Lifetime access
                      </p>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Link href={`/learn/${courseData.slug}`} className="block">
                      <Button className="w-full bg-emerald-500 hover:bg-emerald-600 gap-2">
                        <Play className="w-4 h-4" />
                        Continue Learning
                      </Button>
                    </Link>
                  ) : courseData.isFree ? (
                    <Button onClick={handleEnroll} className="w-full bg-emerald-500 hover:bg-emerald-600 gap-2">
                      <Check className="w-4 h-4" />
                      Enroll for Free
                    </Button>
                  ) : (
                    <Button onClick={() => setShowEnrollmentModal(true)} className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                      Enroll Now
                    </Button>
                  )}

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">This course includes:</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        {formatDuration(courseData.totalDuration)} of video content
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        {courseData.totalLessons} lessons
                      </li>
                      <li className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        Downloadable resources
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        Certificate of completion
                      </li>
                      <li className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        Lifetime access
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Wishlist Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className={cn(
                        "w-5 h-5",
                        isWishlisted ? "text-red-500 fill-red-500" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">
                        {isWishlisted ? "In your wishlist" : "Add to wishlist"}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleWishlistToggle}
                    >
                      {isWishlisted ? "Remove" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {showEnrollmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEnrollmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Enroll to Access All Lessons</h3>
                <p className="text-muted-foreground">
                  {lockedLessonId && (
                    <span>
                      This lesson is part of the full course. 
                    </span>
                  )}
                  Enroll now to unlock all {courseData.totalLessons} lessons and get lifetime access.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Course Price</span>
                    <span className="font-bold text-2xl">
                      {courseData.isFree ? "Free" : `$${courseData.price}`}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Includes all modules, quizzes, and certificate
                  </div>
                </div>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                  size="lg"
                  onClick={handleEnroll}
                >
                  {courseData.isFree ? "Enroll for Free" : `Enroll Now for $${courseData.price}`}
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowEnrollmentModal(false)}
                >
                  Continue Previewing
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}