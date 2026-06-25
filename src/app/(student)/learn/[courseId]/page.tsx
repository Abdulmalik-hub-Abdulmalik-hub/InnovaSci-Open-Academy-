"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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
  ToggleLeft,
  ToggleRight,
  Clock,
  FileText,
  Code,
  ExternalLink,
  Lock
} from "lucide-react"

// Mock course data
const courseData = {
  id: "1",
  title: "Introduction to Machine Learning",
  instructor: "Dr. Sarah Chen",
  progress: 78,
  totalLessons: 45,
  completedLessons: 35,
  modules: [
    {
      id: "m1",
      title: "Getting Started",
      lessons: [
        { id: "l1", title: "Welcome to the Course", duration: "5:30", completed: true, type: "video" },
        { id: "l2", title: "Course Overview", duration: "12:45", completed: true, type: "video" },
        { id: "l3", title: "Setting Up Your Environment", duration: "18:20", completed: true, type: "video" },
      ]
    },
    {
      id: "m2",
      title: "Fundamentals of ML",
      lessons: [
        { id: "l4", title: "What is Machine Learning?", duration: "15:00", completed: true, type: "video" },
        { id: "l5", title: "Types of Machine Learning", duration: "22:30", completed: true, type: "video" },
        { id: "l6", title: "ML Workflow Overview", duration: "19:45", completed: false, type: "video" },
        { id: "l7", title: "Key Concepts Quiz", duration: "10:00", completed: false, type: "quiz" },
      ]
    },
    {
      id: "m3",
      title: "Supervised Learning",
      lessons: [
        { id: "l8", title: "Linear Regression", duration: "25:00", completed: false, type: "video" },
        { id: "l9", title: "Logistic Regression", duration: "28:30", completed: false, type: "video" },
        { id: "l10", title: "Decision Trees", duration: "32:15", completed: false, type: "video" },
        { id: "l11", title: "Code Lab: Supervised Learning", duration: "45:00", completed: false, type: "lab" },
      ]
    },
    {
      id: "m4",
      title: "Unsupervised Learning",
      lessons: [
        { id: "l12", title: "Clustering Algorithms", duration: "30:00", completed: false, type: "video" },
        { id: "l13", title: "Dimensionality Reduction", duration: "25:45", completed: false, type: "video" },
        { id: "l14", title: "Association Rules", duration: "20:30", completed: false, type: "video" },
      ]
    }
  ],
  currentLesson: { moduleId: "m2", lessonId: "l6" },
  materials: [
    { id: "mat1", title: "Course Slides - Module 2", type: "slides", url: "#" },
    { id: "mat2", title: "Jupyter Notebook - ML Basics", type: "code", url: "#" },
    { id: "mat3", title: "Dataset: Sample Sales Data", type: "data", url: "#" },
    { id: "mat4", title: "Reading: ML Fundamentals Guide", type: "pdf", url: "#" },
  ]
}

type TabType = "materials" | "questions" | null

export default function CoursePlayerPage() {
  const params = useParams()
  const courseId = params.courseId as string
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedModules, setExpandedModules] = useState<string[]>(["m1", "m2"])
  const [activeTab, setActiveTab] = useState<TabType>("materials")
  const [autoplay, setAutoplay] = useState(true)
  const [currentLesson, setCurrentLesson] = useState(courseData.currentLesson)

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const getCurrentLesson = () => {
    const module = courseData.modules.find(m => m.id === currentLesson.moduleId)
    return module?.lessons.find(l => l.id === currentLesson.lessonId)
  }

  const getNextLesson = () => {
    const allLessons: { moduleId: string; lesson: typeof courseData.modules[0]["lessons"][0] }[] = []
    courseData.modules.forEach(m => {
      m.lessons.forEach(l => {
        allLessons.push({ moduleId: m.id, lesson: l })
      })
    })
    
    const currentIndex = allLessons.findIndex(
      l => l.moduleId === currentLesson.moduleId && l.lesson.id === currentLesson.lessonId
    )
    
    if (currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1]
      return { moduleId: next.moduleId, lessonId: next.lesson.id }
    }
    return null
  }

  const getPrevLesson = () => {
    const allLessons: { moduleId: string; lesson: typeof courseData.modules[0]["lessons"][0] }[] = []
    courseData.modules.forEach(m => {
      m.lessons.forEach(l => {
        allLessons.push({ moduleId: m.id, lesson: l })
      })
    })
    
    const currentIndex = allLessons.findIndex(
      l => l.moduleId === currentLesson.moduleId && l.lesson.id === currentLesson.lessonId
    )
    
    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1]
      return { moduleId: prev.moduleId, lessonId: prev.lesson.id }
    }
    return null
  }

  const handleCompleteAndNext = () => {
    // Mark current as completed
    const next = getNextLesson()
    if (next) {
      setCurrentLesson(next)
      // Auto-expand the module containing the next lesson
      if (!expandedModules.includes(next.moduleId)) {
        setExpandedModules(prev => [...prev, next.moduleId])
      }
    }
  }

  const currentLessonData = getCurrentLesson()
  const nextLesson = getNextLesson()
  const prevLesson = getPrevLesson()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sub-Header Control Bar */}
      <header className="h-14 bg-card border-b flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="hidden md:block">
            <h1 className="text-sm font-medium truncate max-w-[300px]">{courseData.title}</h1>
            <p className="text-xs text-muted-foreground">Lesson: {currentLessonData?.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Progress Bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{courseData.progress}%</span>
              </div>
              <Progress value={courseData.progress} className="h-1.5" />
            </div>
          </div>
          
          {/* Toggle Sidebar Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="gap-2"
          >
            {sidebarOpen ? (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="hidden lg:inline">Hide Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeft className="h-4 w-4" />
                <span className="hidden lg:inline">Show Sidebar</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Collapsible Sidebar - Table of Contents */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card border-r overflow-hidden flex-shrink-0"
            >
              <div className="w-[320px] h-full flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-foreground">Course Content</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {courseData.completedLessons} / {courseData.totalLessons} lessons completed
                  </p>
                </div>
                
                {/* Module List */}
                <div className="flex-1 overflow-y-auto p-2">
                  {courseData.modules.map((module) => {
                    const moduleCompleted = module.lessons.every(l => l.completed)
                    const moduleProgress = module.lessons.filter(l => l.completed).length
                    
                    return (
                      <div key={module.id} className="mb-2">
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium truncate">{module.title}</h3>
                              {moduleCompleted && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {moduleProgress}/{module.lessons.length} lessons
                            </p>
                          </div>
                          <ChevronDown className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                            expandedModules.includes(module.id) && "rotate-180"
                          )} />
                        </button>

                        {/* Lesson List */}
                        <AnimatePresence>
                          {expandedModules.includes(module.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-2 pb-2 space-y-0.5">
                                {module.lessons.map((lesson) => {
                                  const isActive = currentLesson.moduleId === module.id && currentLesson.lessonId === lesson.id
                                  
                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => setCurrentLesson({ moduleId: module.id, lessonId: lesson.id })}
                                      className={cn(
                                        "w-full flex items-center gap-3 p-2.5 rounded-md transition-colors text-left",
                                        isActive
                                          ? "bg-brand-purple/10 text-brand-purple"
                                          : "hover:bg-muted/50"
                                      )}
                                    >
                                      {/* Status Indicator */}
                                      <div className="flex-shrink-0">
                                        {lesson.completed ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <Circle className={cn(
                                            "h-4 w-4",
                                            isActive ? "text-brand-purple" : "text-muted-foreground"
                                          )} />
                                        )}
                                      </div>
                                      
                                      {/* Lesson Info */}
                                      <div className="flex-1 min-w-0">
                                        <p className={cn(
                                          "text-sm truncate",
                                          isActive && "font-medium"
                                        )}>
                                          {lesson.title}
                                        </p>
                                      </div>
                                      
                                      {/* Duration & Type */}
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {lesson.type === "video" && <PlayCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                                        {lesson.type === "quiz" && <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                                        {lesson.type === "lab" && <Code className="h-3.5 w-3.5 text-muted-foreground" />}
                                        <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Video Player & Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 lg:p-6">
            {/* Video Container */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-6">
              {/* Placeholder for actual video player */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mb-4 mx-auto">
                    <PlayCircle className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-white/80">Video Player</p>
                  <p className="text-white/60 text-sm mt-1">{currentLessonData?.title}</p>
                </div>
              </div>
              
              {/* Video Controls Overlay - Mock */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <PlayCircle className="h-6 w-6" />
                  </Button>
                  <div className="flex-1">
                    <div className="h-1 bg-white/30 rounded-full">
                      <div className="h-full w-1/3 bg-brand-purple rounded-full" />
                    </div>
                  </div>
                  <span className="text-white text-sm">6:35 / 19:45</span>
                </div>
              </div>
            </div>

            {/* Lesson Info */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">{currentLessonData?.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {currentLessonData?.duration}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                  {currentLessonData?.type === "video" && "Video Lesson"}
                  {currentLessonData?.type === "quiz" && "Quiz"}
                  {currentLessonData?.type === "lab" && "Code Lab"}
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="outline"
                onClick={() => prevLesson && setCurrentLesson(prevLesson)}
                disabled={!prevLesson}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Lesson
              </Button>
              <Button
                onClick={handleCompleteAndNext}
                disabled={!nextLesson}
                className="gap-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
              >
                {nextLesson ? (
                  <>
                    Complete and Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  "Course Completed!"
                )}
              </Button>
            </div>

            {/* Interactive Utilities Section - Tabs */}
            <Card>
              <CardContent className="p-0">
                {/* Tab Navigation */}
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab(activeTab === "materials" ? null : "materials")}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "materials"
                        ? "border-brand-purple text-brand-purple"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Course Materials
                  </button>
                  <button
                    onClick={() => setActiveTab(activeTab === "questions" ? null : "questions")}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "questions"
                        ? "border-brand-purple text-brand-purple"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Questions & Support
                  </button>
                  
                  {/* Autoplay Toggle */}
                  <div className="ml-auto flex items-center gap-3 px-6">
                    <span className="text-sm text-muted-foreground">Autoplay</span>
                    <button
                      onClick={() => setAutoplay(!autoplay)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        autoplay
                          ? "bg-brand-purple/10 text-brand-purple"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {autoplay ? (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          On
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          Off
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === "materials" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-6"
                    >
                      <h3 className="font-semibold mb-4">Download Course Resources</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {courseData.materials.map((material) => (
                          <a
                            key={material.id}
                            href={material.url}
                            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                              {material.type === "slides" && <FileText className="h-5 w-5 text-brand-blue" />}
                              {material.type === "code" && <Code className="h-5 w-5 text-brand-blue" />}
                              {material.type === "data" && <Download className="h-5 w-5 text-brand-blue" />}
                              {material.type === "pdf" && <FileText className="h-5 w-5 text-brand-blue" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{material.title}</p>
                              <p className="text-xs text-muted-foreground uppercase">{material.type}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-brand-purple transition-colors" />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "questions" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Community Q&A</h3>
                        <Button size="sm" className="gap-2 bg-brand-purple hover:bg-brand-purple/90">
                          <MessageCircle className="h-4 w-4" />
                          Ask a Question
                        </Button>
                      </div>
                      
                      {/* Sample Q&A Items */}
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-brand-purple">JD</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">John Doe</span>
                                <span className="text-xs text-muted-foreground">2 hours ago</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Can you explain the difference between supervised and unsupervised learning in more detail?
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  3 replies
                                </span>
                                <button className="text-brand-purple hover:underline">View Discussion</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-green-600">SC</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">Dr. Sarah Chen</span>
                                <Badge variant="outline" className="text-xs">Instructor</Badge>
                                <span className="text-xs text-muted-foreground">1 day ago</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Great question! In supervised learning, we have labeled training data...
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  Answered
                                </span>
                                <button className="text-brand-purple hover:underline">View Full Answer</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty State */}
                {activeTab === null && (
                  <div className="p-12 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a tab above to view content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
