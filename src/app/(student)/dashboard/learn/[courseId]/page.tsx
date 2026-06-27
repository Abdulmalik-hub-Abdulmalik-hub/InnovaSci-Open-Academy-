"use client"

import { useState, useEffect, useRef, use, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft,
  ChevronRight, CheckCircle2, Circle, ChevronDown, Menu,
  X, Clock, BookOpen, Lock, Settings, SkipForward, 
  List, RotateCcw, Loader2
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
        { id: "l1", title: "Welcome to the Course", description: "An overview of what you'll learn in this comprehensive machine learning course.", orderIndex: 0, lessonType: "video", duration: 300, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: true, completed: true },
        { id: "l2", title: "Course Overview", description: "Deep dive into the course structure and learning path.", orderIndex: 1, lessonType: "video", duration: 600, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: true, completed: true },
        { id: "l3", title: "Setting Up Your Environment", description: "Configure your development environment for ML coding.", orderIndex: 2, lessonType: "video", duration: 900, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: true },
      ]
    },
    {
      id: "m2",
      title: "Fundamentals of ML",
      description: "Core concepts",
      orderIndex: 1,
      lessonsCount: 4,
      lessons: [
        { id: "l4", title: "What is Machine Learning?", description: "Understanding the fundamentals of ML and its applications.", orderIndex: 0, lessonType: "video", duration: 720, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: true },
        { id: "l5", title: "Types of Machine Learning", description: "Supervised, unsupervised, and reinforcement learning explained.", orderIndex: 1, lessonType: "video", duration: 840, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: true },
        { id: "l6", title: "Supervised vs Unsupervised", description: "Comparing the two main approaches to machine learning.", orderIndex: 2, lessonType: "video", duration: 660, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: true },
        { id: "l7", title: "ML Workflow", description: "The complete workflow from data to deployed model.", orderIndex: 3, lessonType: "video", duration: 780, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: false },
      ]
    },
    {
      id: "m3",
      title: "Neural Network Basics",
      description: "Deep learning fundamentals",
      orderIndex: 2,
      lessonsCount: 3,
      lessons: [
        { id: "l8", title: "Introduction to Neural Networks", description: "Understanding how neural networks work.", orderIndex: 0, lessonType: "video", duration: 900, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: false },
        { id: "l9", title: "Perceptrons", description: "The building blocks of neural networks.", orderIndex: 1, lessonType: "video", duration: 720, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: false },
        { id: "l10", title: "Activation Functions", description: "Understanding ReLU, Sigmoid, and other activation functions.", orderIndex: 2, lessonType: "video", duration: 600, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", isPreview: false, completed: false },
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
  const [played, setPlayed] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedModules, setExpandedModules] = useState<string[]>(["m1", "m2"])
  const [showMarkComplete, setShowMarkComplete] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false)
  const [seeking, setSeeking] = useState(false)
  const [showControls, setShowControls] = useState(true)
  
  const playerRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressUpdateInterval = useRef<NodeJS.Timeout>()
  const controlsTimeout = useRef<NodeJS.Timeout>()

  // Calculate total progress
  const getTotalProgress = useCallback((): number => {
    const total = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const completed = course.modules.reduce((acc, m) => 
      acc + m.lessons.filter(l => l.completed).length, 0
    )
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [course.modules])

  // Get current lesson index
  const getCurrentLessonIndex = useCallback((): number => {
    return course.modules.flatMap(m => m.lessons).findIndex(l => l.id === currentLesson?.id)
  }, [course.modules, currentLesson?.id])

  // Find first incomplete lesson
  const findFirstIncompleteLesson = useCallback((): Lesson | null => {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed) {
          return lesson
        }
      }
    }
    return null
  }, [course.modules])

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
  }, [course, findFirstIncompleteLesson])

  // Progress tracking - send to API every 15 seconds
  useEffect(() => {
    if (isPlaying && currentLesson && playerRef.current) {
      progressUpdateInterval.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.currentTime
          const videoDuration = playerRef.current.duration
          const progressPercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0
          
          // Send progress to API (debounced)
          fetch('/api/student/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lessonId: currentLesson.id,
              courseId: courseId,
              watchTime: Math.floor(currentTime),
              lastPosition: Math.floor(currentTime),
              completed: false
            })
          }).catch(console.error)
          
          // Auto-advance at 90%
          if (progressPercent >= 90 && !currentLesson.completed && !isAutoAdvancing) {
            setIsAutoAdvancing(true)
            handleMarkComplete(true)
          }
        }
      }, 15000) // Every 15 seconds
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current)
      }
    }
  }, [isPlaying, currentLesson, courseId, isAutoAdvancing])

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  // Select a lesson
  const selectLesson = (lesson: Lesson, moduleIndex: number) => {
    setCurrentLesson(lesson)
    setCurrentModuleIndex(moduleIndex)
    setPlayed(0)
    setIsPlaying(false)
    setIsAutoAdvancing(false)
    setShowMarkComplete(false)
    
    // Expand the module containing this lesson
    if (!expandedModules.includes(lesson.id.split('-')[0] + '-' + lesson.id.split('-')[1])) {
      const moduleId = course.modules[moduleIndex].id
      if (!expandedModules.includes(moduleId)) {
        setExpandedModules(prev => [...prev, moduleId])
      }
    }
  }

  // Handle progress update from player
  const handleProgress = (state: { played: number; loaded: number }) => {
    if (!seeking) {
      setPlayed(state.played * 100)
      setLoaded(state.loaded * 100)
    }
  }

  // Handle seek
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value))
  }

  const handleSeekMouseDown = () => {
    setSeeking(true)
  }

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false)
    if (playerRef.current) {
      const seekPercent = parseFloat(e.currentTarget.value)
      playerRef.current.currentTime = (seekPercent / 100) * playerRef.current.duration
    }
    
    // Send progress update on seek
    if (currentLesson && playerRef.current) {
      const seekTime = (parseFloat(e.currentTarget.value) / 100) * duration
      fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          courseId: courseId,
          watchTime: Math.floor(seekTime),
          lastPosition: Math.floor(seekTime),
          completed: false
        })
      }).catch(console.error)
    }
  }

  // Mark lesson as complete
  const handleMarkComplete = async (auto = false) => {
    if (!currentLesson || isMarkingComplete) return
    
    setIsMarkingComplete(true)
    
    // Update local state
    const updatedModules = course.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson =>
        lesson.id === currentLesson.id ? { ...lesson, completed: true } : lesson
      )
    }))
    setCourse({ ...course, modules: updatedModules })
    setShowMarkComplete(false)
    
    // Send to API
    try {
      await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          courseId: courseId,
          completed: true
        })
      })
    } catch (error) {
      console.error('Failed to mark complete:', error)
    }
    
    setIsMarkingComplete(false)
    
    // Auto-advance after marking complete
    if (auto) {
      setTimeout(() => {
        handleNextLesson()
      }, 1000)
    }
  }

  // Go to next lesson
  const handleNextLesson = useCallback(() => {
    const allLessons = course.modules.flatMap(m => m.lessons)
    const currentIndex = getCurrentLessonIndex()
    
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      const nextModuleIndex = course.modules.findIndex(m => 
        m.lessons.some(l => l.id === nextLesson.id)
      )
      selectLesson(nextLesson, nextModuleIndex)
      
      // Expand the next module
      if (nextModuleIndex >= 0) {
        const moduleId = course.modules[nextModuleIndex].id
        if (!expandedModules.includes(moduleId)) {
          setExpandedModules(prev => [...prev, moduleId])
        }
      }
    }
  }, [course.modules, getCurrentLessonIndex, expandedModules])

  // Go to previous lesson
  const handlePrevLesson = useCallback(() => {
    const allLessons = course.modules.flatMap(m => m.lessons)
    const currentIndex = getCurrentLessonIndex()
    
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1]
      const prevModuleIndex = course.modules.findIndex(m => 
        m.lessons.some(l => l.id === prevLesson.id)
      )
      selectLesson(prevLesson, prevModuleIndex)
    }
  }, [course.modules, getCurrentLessonIndex])

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false)
    if (!currentLesson?.completed) {
      handleMarkComplete()
    }
    handleNextLesson()
  }

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Show/hide controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const currentTime = duration * (played / 100)

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-[#0a0a0f] text-white flex">
      {/* Sidebar - Course Curriculum */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-80 bg-gray-900/95 dark:bg-[#12121a] border-r border-gray-800 z-40 flex flex-col",
        "transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard/courses" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Courses
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <h2 className="font-semibold text-white line-clamp-2">{course.title}</h2>
          
          {/* Course Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>{getTotalProgress()}% complete</span>
              <span>{course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0)}/{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all duration-500"
                style={{ width: `${getTotalProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module List */}
        <nav className="flex-1 overflow-y-auto py-2">
          {course.modules.map((module, moduleIndex) => {
            const moduleCompleted = module.lessons.every(l => l.completed)
            const moduleLessonsCompleted = module.lessons.filter(l => l.completed).length
            
            return (
              <div key={module.id} className="mb-1">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/50 transition-colors",
                    expandedModules.includes(module.id) && "bg-gray-800/30"
                  )}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{moduleIndex + 1}.</span>
                      <span className="text-sm font-medium text-white line-clamp-1">{module.title}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-5">
                      {moduleLessonsCompleted}/{module.lessons.length} lessons
                      {moduleCompleted && " • Completed"}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-400 transition-transform flex-shrink-0",
                    expandedModules.includes(module.id) && "rotate-180"
                  )} />
                </button>

                {/* Lessons List */}
                {expandedModules.includes(module.id) && (
                  <div className="bg-gray-800/20">
                    {module.lessons.map((lesson) => {
                      const isCurrentLesson = lesson.id === currentLesson?.id
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(lesson, moduleIndex)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isCurrentLesson 
                              ? "bg-brand-purple/20 border-l-2 border-brand-purple" 
                              : "hover:bg-gray-800/50 border-l-2 border-transparent"
                          )}
                        >
                          {/* Status Icon */}
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                            lesson.completed 
                              ? "bg-green-500/20 text-green-500" 
                              : isCurrentLesson
                                ? "bg-brand-purple text-white"
                                : "bg-gray-700 text-gray-400"
                          )}>
                            {lesson.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : isCurrentLesson ? (
                              <Play className="h-3 w-3 ml-0.5" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </div>
                          
                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm line-clamp-1",
                              isCurrentLesson ? "text-white font-medium" : "text-gray-300"
                            )}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{formatDuration(lesson.duration || 0)}</span>
                              {lesson.isPreview && (
                                <span className="text-brand-purple">Preview</span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-purple/20 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-brand-purple" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Course Progress</p>
              <p className="text-sm font-medium">{getCurrentLessonIndex() + 1} of {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        sidebarOpen ? "lg:ml-80" : ""
      )}>
        {/* Video Player Area */}
        <div 
          ref={containerRef}
          className="relative bg-black aspect-video max-h-[70vh] mx-auto w-full group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <video
            ref={playerRef}
            src={currentLesson?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
            className="w-full h-full"
            onTimeUpdate={() => {
              if (playerRef.current && !seeking) {
                const progress = (playerRef.current.currentTime / playerRef.current.duration) * 100
                setPlayed(progress)
              }
            }}
            onLoadedMetadata={() => {
              if (playerRef.current) {
                setDuration(playerRef.current.duration)
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleVideoEnd}
          />

          {/* Mobile Toggle Button */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          )}

          {/* Center Play Button Overlay */}
          {!isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={() => {
                if (playerRef.current) {
                  playerRef.current.play()
                }
              }}
            >
              <div className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-105">
                <Play className="h-8 w-8 text-gray-900 ml-1" />
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-4 px-4 transition-opacity duration-300",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}>
            {/* Progress Bar */}
            <div className="mb-3 group/progress">
              <input
                type="range"
                min={0}
                max={100}
                value={played}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-purple hover:h-2 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:group-hover/progress:opacity-100"
                style={{
                  background: `linear-gradient(to right, #7C3AED ${played}%, #4B5563 ${played}%)`
                }}
              />
              {/* Buffered Progress */}
              <div 
                className="h-1 bg-gray-500/50 rounded-full -mt-1 pointer-events-none"
                style={{ width: `${loaded}%` }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Play/Pause */}
                <button
                  onClick={() => {
                    if (playerRef.current) {
                      if (isPlaying) {
                        playerRef.current.pause()
                      } else {
                        playerRef.current.play()
                      }
                    }
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white" />
                  )}
                </button>

                {/* Previous */}
                <button
                  onClick={handlePrevLesson}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4 text-white" />
                </button>

                {/* Next */}
                <button
                  onClick={handleNextLesson}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <SkipForward className="h-4 w-4 text-white" />
                </button>

                {/* Volume */}
                <button
                  onClick={() => {
                    if (playerRef.current) {
                      playerRef.current.muted = !isMuted
                      setIsMuted(!isMuted)
                    }
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>

                {/* Time */}
                <span className="text-sm text-white/80 ml-2 tabular-nums">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Mark Complete */}
                {currentLesson && !currentLesson.completed && (
                  <button
                    onClick={() => handleMarkComplete()}
                    disabled={isMarkingComplete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isMarkingComplete ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Mark Complete
                  </button>
                )}

                {currentLesson?.completed && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-400 bg-green-500/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </span>
                )}

                {/* Next Lesson */}
                <button
                  onClick={handleNextLesson}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Next Lesson"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={() => containerRef.current?.requestFullscreen()}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Maximize className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Info */}
        <div className="flex-1 bg-gray-900 dark:bg-[#0a0a0f]">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-brand-purple/20 text-brand-purple">
                    Lesson {getCurrentLessonIndex() + 1}
                  </Badge>
                  {currentLesson?.isPreview && (
                    <Badge variant="outline" className="border-brand-purple text-brand-purple">
                      Preview
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{currentLesson?.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatDuration(duration)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {course.modules[currentModuleIndex]?.title}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleNextLesson}
                className="bg-brand-purple hover:bg-brand-purple/90 flex-shrink-0"
              >
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Mark Complete Prompt */}
            {showMarkComplete && !currentLesson?.completed && (
              <Card className="mb-6 bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <p className="text-sm text-gray-300">Did you finish watching this lesson?</p>
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
                        className="bg-green-600 hover:bg-green-500"
                        onClick={() => handleMarkComplete()}
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
            {currentLesson?.description && (
              <Card className="bg-gray-800/30 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">About this lesson</h3>
                  <p className="text-gray-400 leading-relaxed">{currentLesson.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Course Progress Summary */}
            <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300">Your Progress</h3>
                <span className="text-sm text-brand-purple font-medium">{getTotalProgress()}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all duration-500"
                  style={{ width: `${getTotalProgress()}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0)} lessons completed</span>
                <span>{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} total lessons</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}