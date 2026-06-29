"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  ChevronDown, 
  ChevronUp,
  Play, 
  PlayCircle,
  Lock, 
  Video,
  FileText,
  Code,
  BarChart3,
  Check
} from "lucide-react"

export interface CurriculumLesson {
  id: string
  title: string
  description?: string
  orderIndex: number
  lessonType: string
  duration?: number
  isFree: boolean
  isAccessible?: boolean
  isExercise?: boolean
  exerciseDescription?: string
  exerciseFilesUrl?: string
  solutionVideoUrl?: string
}

export interface CurriculumModule {
  id: string
  title: string
  description?: string
  orderIndex: number
  lessons: CurriculumLesson[]
}

export interface CourseCurriculumProps {
  modules: CurriculumModule[]
  totalLessons: number
  totalDuration: number
  isEnrolled: boolean
  onLessonClick?: (lesson: CurriculumLesson) => void
  onEnrollClick?: () => void
  className?: string
  showHeader?: boolean
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const getLessonIcon = (type: string, isAccessible: boolean, isFree: boolean, isExercise?: boolean) => {
  const iconClass = cn(
    "w-4 h-4",
    isAccessible || isFree ? "text-emerald-500" : "text-slate-400"
  )
  
  if (isExercise) {
    return <Code className={iconClass} />
  }
  
  switch (type) {
    case "video":
      return <Video className={iconClass} />
    case "reading":
      return <FileText className={iconClass} />
    default:
      return <Play className={iconClass} />
  }
}

export function CourseCurriculum({
  modules,
  totalLessons,
  totalDuration,
  isEnrolled,
  onLessonClick,
  onEnrollClick,
  className,
  showHeader = true
}: CourseCurriculumProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    modules.length > 0 ? [modules[0].id] : []
  )

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const handleLessonClick = (lesson: CurriculumLesson) => {
    const isAccessible = isEnrolled || lesson.isFree
    
    if (!isAccessible && onEnrollClick) {
      onEnrollClick()
      return
    }
    
    onLessonClick?.(lesson)
  }

  const freeLessonsCount = modules.reduce(
    (acc, module) => acc + module.lessons.filter(l => l.isFree).length, 
    0
  )

  return (
    <Card className={cn("", className)}>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Course Curriculum</CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{totalLessons} lessons</span>
              <span>•</span>
              <span>{formatDuration(totalDuration)}</span>
              {freeLessonsCount > 0 && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {freeLessonsCount} free
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-lg overflow-hidden">
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {module.orderIndex + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {module.lessons.length} lessons • {formatDuration(
                        module.lessons.reduce((acc, l) => acc + (l.duration || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
                {expandedModules.includes(module.id) ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  lesson.isExercise 
                                    ? "bg-amber-100 dark:bg-amber-900/30" 
                                    : "bg-emerald-100 dark:bg-emerald-900/30"
                                )}>
                                  {getLessonIcon(lesson.lessonType, isAccessible, lesson.isFree, lesson.isExercise)}
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <Lock className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  "font-medium truncate",
                                  !isAccessible && "text-muted-foreground"
                                )}>
                                  {lesson.title}
                                </p>
                                {lesson.isExercise && (
                                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                                    Project
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className={cn(
                                  lesson.isExercise ? "text-amber-600 dark:text-amber-400" : ""
                                )}>
                                  {lesson.isExercise ? "Exercise" : lesson.lessonType.charAt(0).toUpperCase() + lesson.lessonType.slice(1)}
                                </span>
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
                                <Button variant="ghost" size="sm" className={cn("gap-1", lesson.isExercise && "text-amber-600 hover:text-amber-700 dark:text-amber-400")}>
                                  {lesson.isExercise ? (
                                    <>
                                      <Code className="w-4 h-4" />
                                      {isEnrolled ? "Start" : "Preview"}
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle className="w-4 h-4" />
                                      {isEnrolled ? "Play" : "Preview"}
                                    </>
                                  )}
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
  )
}