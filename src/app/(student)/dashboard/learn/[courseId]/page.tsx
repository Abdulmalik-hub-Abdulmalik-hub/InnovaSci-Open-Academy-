"use client"

import { useState, useEffect, useRef, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft,
  ChevronRight, CheckCircle2, Circle, ChevronDown, Menu,
  X, Clock, BookOpen, Lock, Settings, SkipForward
} from "lucide-react"

interface Module {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonsCount: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonType: string
  duration: number | null
  videoUrl: string | null
  isPreview: boolean
  completed: boolean
}

interface CoursePlayerProps {
  courseId: string
}

// Mock course data
const mockCourseData = {
  id: "course-1",
  title: "Introduction to Machine Learning",
  thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
  totalLessons: 45,
  completedLessons: 35,
  modules: [
    {
      id: "m1",
      title: "Getting Started",
      description: "Introduction to the course",
      orderIndex: 0,
      lessonsCount: 3,
      lessons: [
        { id: "l1", title: "Welcome to the Course", description: null, orderIndex: 0, lessonType: "video", duration: 300, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: true, completed: true },
        { id: "l2", title: "Course Overview", description: null, orderIndex: 1, lessonType: "video", duration: 600, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: true, completed: true },
        { id: "l3", title: "Setting Up Your Environment", description: null, orderIndex: 2, lessonType: "video", duration: 900, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: true },
      ]
    },
    {
      id: "m2",
      title: "Fundamentals of ML",
      description: "Core concepts",
      orderIndex: 1,
      lessonsCount: 4,
      lessons: [
        { id: "l4", title: "What is Machine Learning?", description: null, orderIndex: 0, lessonType: "video", duration: 720, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: true },
        { id: "l5", title: "Types of Machine Learning", description: null, orderIndex: 1, lessonType: "video", duration: 840, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: true },
        { id: "l6", title: "Supervised vs Unsupervised", description: null, orderIndex: 2, lessonType: "video", duration: 660, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: true },
        { id: "l7", title: "ML Workflow", description: null, orderIndex: 3, lessonType: "video", duration: 780, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: false },
      ]
    },
    {
      id: "m3",
      title: "Neural Network Basics",
      description: "Deep learning fundamentals",
      orderIndex: 2,
      lessonsCount: 3,
      lessons: [
        { id: "l8", title: "Introduction to Neural Networks", description: null, orderIndex: 0, lessonType: "video", duration: 900, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: false },
        { id: "l9", title: "Perceptrons", description: null, orderIndex: 1, lessonType: "video", duration: 720, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: false },
        { id: "l10", title: "Activation Functions", description: null, orderIndex: 2, lessonType: "video", duration: 600, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: false },
      ]
    }
  ] as Module[]
}

export default function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.courseId
  
  const [course, setCourse] = useState(mockCourseData)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedModules, setExpandedModules] = useState<string[]>([course.modules[0]?.id])
  const [showMarkComplete, setShowMarkComplete] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<NodeJS.Timeout>()

  // Initialize with first incomplete lesson
  useEffect(() => {
    const firstIncomplete = findFirstIncompleteLesson()
    if (firstIncomplete) {
      const moduleIndex = course.modules.findIndex(m => 
        m.lessons.some(l => l.id === firstIncomplete.id)
      )
      setCurrentLesson(firstIncomplete)
      setCurrentModuleIndex(moduleIndex >= 0 ? moduleIndex : 0)
    } else if (course.modules[0]?.lessons[0]) {
      setCurrentLesson(course.modules[0].lessons[0])
    }
  }, [course])

  const findFirstIncompleteLesson = (): Lesson | null => {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed) {
          return lesson
        }
      }
    }
    return null
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const selectLesson = (lesson: Lesson, moduleIndex: number) => {
    setCurrentLesson(lesson)
    setCurrentModuleIndex(moduleIndex)
    setProgress(0)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoProgress = () => {
    if (videoRef.current && currentLesson) {
      const videoProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(videoProgress)
      
      // Auto-advance to next lesson at 90%
      if (videoProgress >= 90 && !currentLesson.completed) {
        handleMarkComplete()
        handleNextLesson()
      }
    }
  }

  const handleMarkComplete = () => {
    if (currentLesson) {
      // Update local state
      const updatedModules = course.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson =>
          lesson.id === currentLesson.id ? { ...lesson, completed: true } : lesson
        )
      }))
      setCourse({ ...course, modules: updatedModules })
      setShowMarkComplete(false)
      
      // In production, this would call the API
      console.log(`Marked lesson ${currentLesson.id} as complete`)
    }
  }

  const handleNextLesson = () => {
    const allLessons = course.modules.flatMap(m => m.lessons)
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id)
    
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      const nextModuleIndex = course.modules.findIndex(m => 
        m.lessons.some(l => l.id === nextLesson.id)
      )
      selectLesson(nextLesson, nextModuleIndex)
      
      // Expand the next module
      if (nextModuleIndex >= 0) {
        setExpandedModules(prev => {
          const moduleId = course.modules[nextModuleIndex].id
          return prev.includes(moduleId) ? prev : [...prev, moduleId]
        })
      }
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    if (currentLesson && !currentLesson.completed) {
      handleMarkComplete()
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateProgress = () => {
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const completedLessons = course.modules.reduce(
      (acc, m) => acc + m.lessons.filter(l => l.completed).length, 0
    )
    return Math.round((completedLessons / totalLessons) * 100)
  }

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-gray-900/95 backdrop-blur border-b border-gray-800 z-40 flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white hover:bg-gray-800 mr-4"
          asChild
        >
          <Link href="/dashboard/courses">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>
        </Button>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium truncate">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-4 ml-4">
          <div className="flex items-center gap-2">
            <Progress 
              value={calculateProgress()} 
              className="w-24 h-2 bg-gray-700 [&>div]:bg-brand-purple" 
            />
            <span className="text-sm text-gray-400">{calculateProgress()}%</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white hover:bg-gray-800 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside className={cn(
          "fixed top-14 left-0 bottom-0 w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto transition-transform lg:translate-x-0 z-50",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <h2 className="font-semibold">Course Content</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Modules List */}
          <nav className="p-2">
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id} className="mb-2">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{module.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {module.lessons.filter(l => l.completed).length}/{module.lessons.length} lessons
                    </p>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-2",
                      expandedModules.includes(module.id) && "rotate-180"
                    )}
                  />
                </button>

                {/* Lessons List */}
                {expandedModules.includes(module.id) && (
                  <div className="ml-2 border-l border-gray-700">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson, moduleIndex)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 text-left transition-colors",
                          currentLesson.id === lesson.id
                            ? "bg-brand-purple/20 border-l-2 border-brand-purple"
                            : "hover:bg-gray-700/30 border-l-2 border-transparent"
                        )}
                      >
                        {lesson.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            currentLesson.id === lesson.id && "text-brand-purple font-medium"
                          )}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">
                              {formatDuration(lesson.duration)}
                            </span>
                            {lesson.isPreview && (
                              <Badge variant="outline" className="text-xs py-0 px-1.5">
                                Preview
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-h-[calc(100vh-56px)] transition-all",
          sidebarOpen ? "lg:ml-80" : ""
        )}>
          {/* Video Player */}
          <div className="bg-black aspect-video max-h-[70vh] mx-auto relative">
            <video
              ref={videoRef}
              src={currentLesson.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
              className="w-full h-full"
              onTimeUpdate={handleVideoProgress}
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div 
                className="h-1 bg-gray-600 rounded-full mb-4 cursor-pointer group"
                onClick={(e) => {
                  if (videoRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pos = (e.clientX - rect.left) / rect.width
                    videoRef.current.currentTime = pos * videoRef.current.duration
                  }
                }}
              >
                <div 
                  className="h-full bg-brand-purple rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>

                  <span className="text-sm text-gray-300 ml-2">
                    {formatDuration(videoRef.current?.currentTime ? videoRef.current.currentTime * (currentLesson.duration ? currentLesson.duration / 100 : 1) : 0)} 
                    / 
                    {formatDuration(currentLesson.duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!currentLesson.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white/30 hover:bg-white/20 hover:text-white"
                      onClick={() => setShowMarkComplete(true)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
                    onClick={handleNextLesson}
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20 hidden lg:block"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
                    onClick={() => {
                      if (videoRef.current) {
                        if (videoRef.current.requestFullscreen) {
                          videoRef.current.requestFullscreen()
                        }
                      }
                    }}
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(currentLesson.duration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.modules[currentModuleIndex]?.title}
                  </span>
                  {currentLesson.completed && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                className="flex-shrink-0"
                onClick={handleNextLesson}
              >
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Mark Complete Modal */}
            {showMarkComplete && (
              <Card className="mb-6 bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Did you finish watching this lesson?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMarkComplete(false)}
                      >
                        Not Yet
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={handleMarkComplete}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Yes, Mark Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lesson Description */}
            {currentLesson.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300">{currentLesson.description}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
