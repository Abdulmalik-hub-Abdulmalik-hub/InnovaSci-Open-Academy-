"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Download,
  MessageCircle,
  Clock,
  FileText,
  Code,
  Lock,
  Loader2,
  AlertCircle,
  Github,
  Eye,
} from "lucide-react"

interface ModuleLesson {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonType: string
  duration: number | null
  videoUrl: string | null
  isPreview: boolean
  isFree: boolean
  isExercise: boolean
  exerciseDescription: string | null
  exerciseFilesUrl: string | null
  solutionVideoUrl: string | null
  completed?: boolean
}

interface Module {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonsCount: number
  lessons: ModuleLesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  introVideoUrl?: string
  thumbnailUrl?: string
  totalLessons?: number
  completedLessons?: number
  curriculum?: {
    modules: Module[]
    totalLessons: number
    totalDuration: number
  }
}

type TabType = "materials" | "questions" | null

export default function CoursePlayerPage() {
  const params = useParams()
  const courseId = params.courseId as string
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("materials")
  const [autoplay, setAutoplay] = useState(true)
  const [currentLesson, setCurrentLesson] = useState<ModuleLesson | null>(null)
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [videoPlaying, setVideoPlaying] = useState(false)

  // Fetch course data
  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/public/courses/${courseId}/curriculum`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setCourse(result.data)
          
          // Initialize with first incomplete lesson or first lesson
          const modules = result.data.curriculum?.modules || []
          const firstIncomplete = findFirstIncompleteLesson(modules)
          
          if (firstIncomplete) {
            setCurrentLesson(firstIncomplete)
            const moduleWithLesson = modules.find((m: Module) => 
              m.lessons.some(l => l.id === firstIncomplete.id)
            )
            if (moduleWithLesson) {
              setCurrentModuleId(moduleWithLesson.id)
              setExpandedModules([moduleWithLesson.id])
            }
          } else if (modules[0]?.lessons[0]) {
            setCurrentLesson(modules[0].lessons[0])
            setCurrentModuleId(modules[0].id)
            setExpandedModules([modules[0].id])
          }
        } else {
          setError(result.error || "Failed to load course")
        }
      } catch (err) {
        console.error("Failed to fetch course:", err)
        setError("Failed to load course. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourse()
  }, [courseId])

  // Find first incomplete lesson helper
  const findFirstIncompleteLesson = (modules: Module[]): ModuleLesson | null => {
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed) {
          return lesson
        }
      }
    }
    return null
  }

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  // Select lesson
  const selectLesson = (lesson: ModuleLesson, moduleId: string) => {
    setCurrentLesson(lesson)
    setCurrentModuleId(moduleId)
    if (!expandedModules.includes(moduleId)) {
      setExpandedModules(prev => [...prev, moduleId])
    }
  }

  // Mark lesson complete
  const markComplete = () => {
    if (!currentLesson || !course || !course.curriculum) return
    
    setCourse(prev => {
      if (!prev || !prev.curriculum) return prev
      
      return {
        ...prev,
        curriculum: {
          ...prev.curriculum,
          modules: prev.curriculum.modules.map(m => ({
            ...m,
            lessons: m.lessons.map(l => 
              l.id === currentLesson.id ? { ...l, completed: true } : l
            )
          }))
        }
      }
    })
    
    // Move to next lesson
    const modules = course?.curriculum?.modules || []
    let foundCurrent = false
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent) {
          selectLesson(lesson, module.id)
          return
        }
        if (lesson.id === currentLesson.id) {
          foundCurrent = true
        }
      }
    }
  }

  // Calculate progress
  const getProgress = (): number => {
    if (!course?.curriculum?.modules) return 0
    const allLessons = course.curriculum.modules.flatMap(m => m.lessons)
    const completed = allLessons.filter(l => l.completed).length
    return allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0
  }

  // Format duration
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white/60">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Course</h2>
            <p className="text-white/60 mb-4">{error || "Course not found"}</p>
            <Button asChild variant="outline" className="border-white/20 text-white">
              <Link href="/dashboard/courses">Back to Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const modules = course.curriculum?.modules || []
  const progress = getProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="h-14 bg-black/20 border-b border-white/10 flex items-center px-4 sticky top-0 z-50">
        <Link href="/dashboard/courses" className="flex items-center gap-2 text-white/60 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Courses</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white font-medium">{course.title}</p>
            <p className="text-white/40 text-sm">{progress}% Complete</p>
          </div>
          <Progress value={progress} className="w-24 h-2" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 320 : 0 }}
          className="bg-black/20 border-r border-white/10 overflow-hidden"
        >
          <div className="w-80 p-4">
            <div className="mb-4">
              <h2 className="text-white font-semibold mb-2">Course Content</h2>
              <p className="text-white/40 text-sm">
                {modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
              </p>
            </div>

            <div className="space-y-2">
              {modules.map((module: Module) => (
                <div key={module.id} className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white text-sm font-medium">{module.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-white/40 transition-transform",
                        expandedModules.includes(module.id) && "rotate-180"
                      )}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {expandedModules.includes(module.id) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          {module.lessons.map((lesson: ModuleLesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => selectLesson(lesson, module.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                                currentLesson?.id === lesson.id
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "hover:bg-white/5 text-white/70"
                              )}
                            >
                              {lesson.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{lesson.title}</p>
                                <p className="text-xs text-white/40">
                                  {formatDuration(lesson.duration)} • {lesson.lessonType}
                                </p>
                              </div>
                              {lesson.isExercise && (
                                <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                                  Exercise
                                </Badge>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-r-lg z-40"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-white" />
          ) : (
            <PanelLeft className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto">
              {/* Video Section */}
              {currentLesson.videoUrl && (
                <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
                  <iframe
                    src={currentLesson.videoUrl.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Exercise Section */}
              {currentLesson.isExercise && currentLesson.exerciseDescription && (
                <Card className="bg-white/5 border-white/10 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Github className="h-5 w-5 text-purple-400" />
                      <h3 className="text-white font-semibold">Exercise</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-white/80 whitespace-pre-wrap">
                        {currentLesson.exerciseDescription}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      {currentLesson.exerciseFilesUrl && (
                        <Button variant="outline" size="sm" asChild className="border-white/20 text-white">
                          <a href={currentLesson.exerciseFilesUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download Starter Files
                          </a>
                        </Button>
                      )}
                      {currentLesson.solutionVideoUrl && (
                        <Button variant="outline" size="sm" asChild className="border-white/20 text-white">
                          <a href={currentLesson.solutionVideoUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Solution
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lesson Info */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {currentLesson.title}
                  </h1>
                  <div className="flex items-center gap-4 text-white/60">
                    {currentLesson.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(currentLesson.duration)}
                      </span>
                    )}
                    <Badge variant="outline" className="border-white/20 text-white/60">
                      {currentLesson.lessonType}
                    </Badge>
                    {currentLesson.isExercise && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Exercise
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoplay(!autoplay)}
                    className="border-white/20 text-white"
                  >
                    Autoplay: {autoplay ? "On" : "Off"}
                  </Button>
                  <Button
                    onClick={markComplete}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </div>

              {/* Lesson Description */}
              {currentLesson.description && (
                <Card className="bg-white/5 border-white/10 mb-6">
                  <CardContent className="p-6">
                    <p className="text-white/80 whitespace-pre-wrap">
                      {currentLesson.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="outline" className="border-white/20 text-white" disabled>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button variant="outline" className="border-white/20 text-white">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <PlayCircle className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Select a Lesson</h2>
              <p className="text-white/60">Choose a lesson from the sidebar to begin</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}