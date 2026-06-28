"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useLearningPaths } from "@/hooks/useLearningPaths"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Map, BookOpen, CheckCircle2, Clock, ChevronRight, 
  Users, ArrowRight, Trophy, Share2, Zap, Award,
  Check, Play, Lock, Star, Sparkles
} from "lucide-react"

function ConfettiAnimation({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            backgroundColor: ["#10b981", "#8b5cf6", "#f59e0b", "#3b82f6", "#ec4899"][Math.floor(Math.random() * 5)],
            width: "10px",
            height: "10px",
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
          }}
        />
      ))}
    </div>
  )
}

function SVGProgressBar({ progress, isCompleted }: { progress: number; isCompleted: boolean }) {
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  return (
    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-gray-200 dark:text-gray-700"
      />
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke={isCompleted ? "#10b981" : "url(#progress-gradient)"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-500"
      />
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dy="0.3em"
        className="text-xs font-bold fill-current"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
      >
        {progress}%
      </text>
    </svg>
  )
}

function CompletionBadge({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce-in">
      <Check className="h-3 w-3" />
      Completed!
    </div>
  )
}

function RoadmapStep({ 
  course, 
  index, 
  isLast 
}: { 
  course: any
  index: number
  isLast: boolean 
}) {
  const getStepIcon = () => {
    if (course.completed) return <CheckCircle2 className="h-6 w-6 text-green-500" />
    if (course.enrolled) return <Play className="h-6 w-6 text-purple-500" />
    return <Lock className="h-6 w-6 text-gray-400" />
  }
  
  const getStepColor = () => {
    if (course.completed) return "border-green-500 bg-green-50 dark:bg-green-900/20"
    if (course.enrolled) return "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
    return "border-gray-200 dark:border-gray-700"
  }
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all",
          getStepColor()
        )}>
          {getStepIcon()}
        </div>
        {!isLast && (
          <div className={cn(
            "w-0.5 flex-1 my-2",
            course.completed ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
          )} />
        )}
      </div>
      <div className={cn(
        "flex-1 p-4 rounded-xl border-2 mb-4 transition-all hover:shadow-md",
        getStepColor()
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              Step {index + 1}
            </p>
            <h4 className="font-semibold">{course.stepTitle || course.title}</h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {course.title}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {course.durationHours && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {course.durationHours}h
                </span>
              )}
              {course.totalLessons && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.totalLessons} lessons
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {course.enrolled ? (
              <Link href={`/dashboard/learn/${course.id}`}>
                <Button size="sm" variant={course.completed ? "outline" : "default"}
                  className={cn(!course.completed && "bg-brand-purple hover:bg-brand-purple/90")}>
                  {course.completed ? "Review" : "Continue"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link href={`/courses/${course.id}`}>
                <Button size="sm" variant="outline">
                  Enroll
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        {course.enrolled && !course.completed && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all"
                  style={{ width: `${course.progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium">{course.progressPercent}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LearningPathsPage() {
  const { learningPaths, loading, error, activePath } = useLearningPaths()
  const [expandedPath, setExpandedPath] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState<string | null>(null)
  
  // Track previously completed paths for animation
  const [completedPaths, setCompletedPaths] = useState<Set<string>>(new Set())

  // Trigger confetti on completion
  useEffect(() => {
    const completedIds = Array.from(completedPaths)
    learningPaths.forEach(path => {
      if (path.stats.isCompleted && !completedIds.includes(path.id)) {
        setShowConfetti(true)
        setCompletedPaths(prev => {
          const newSet = new Set(prev)
          newSet.add(path.id)
          return newSet
        })
        setTimeout(() => setShowConfetti(false), 3000)
      }
    })
  }, [learningPaths, completedPaths])

  const handleShare = async (path: any) => {
    const shareData = {
      title: `I completed ${path.title}!`,
      text: `I just completed the ${path.title} learning path on InnovaSci Open Academy!`,
      url: window.location.origin
    }
    
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading learning paths...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
      `}</style>
      
      <ConfettiAnimation show={showConfetti} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Map className="h-8 w-8 text-brand-purple" />
            My Learning Paths
          </h1>
          <p className="text-muted-foreground mt-1">
            Structured sequences to guide your learning journey
          </p>
        </div>
        {activePath && (
          <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-900/20 gap-2 px-3 py-1">
            <Zap className="h-4 w-4" />
            Currently Active: {activePath.title}
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 border-brand-purple/20">
          <CardContent className="p-4 text-center">
            <Map className="h-8 w-8 text-brand-purple mx-auto mb-2" />
            <p className="text-2xl font-bold">{learningPaths.length}</p>
            <p className="text-xs text-muted-foreground">Total Paths</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {learningPaths.filter(p => p.stats.isCompleted).length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {learningPaths.reduce((acc, p) => acc + p.stats.enrolledCourses, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Enrolled</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {learningPaths.reduce((acc, p) => acc + p.stats.completedCourses, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Courses Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Path Banner */}
      {activePath && (
        <Card className="bg-gradient-to-r from-brand-purple to-brand-blue text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                  <Map className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Continue Learning</p>
                  <h3 className="text-xl font-bold">{activePath.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full"
                        style={{ width: `${activePath.stats.overallProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{activePath.stats.overallProgress}%</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="gap-2"
                onClick={() => setShowRoadmap(activePath.id)}
              >
                View Roadmap
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Paths Grid */}
      {learningPaths.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path) => (
            <Card 
              key={path.id} 
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group",
                path.stats.isCompleted && "ring-2 ring-green-500"
              )}
            >
              <CompletionBadge show={path.stats.isCompleted} />
              
              {/* Header with Gradient */}
              <div className="h-32 bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 relative overflow-hidden">
                {path.thumbnailUrl && (
                  <img 
                    src={path.thumbnailUrl} 
                    alt={path.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                
                {/* Difficulty Badge */}
                <Badge 
                  variant="secondary"
                  className="absolute top-3 right-3 capitalize"
                >
                  {path.difficultyLevel}
                </Badge>
              </div>

              <CardContent className="p-6 -mt-8 relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{path.title}</h3>
                    {path.subtitle && (
                      <p className="text-sm text-muted-foreground">{path.subtitle}</p>
                    )}
                  </div>
                  <SVGProgressBar 
                    progress={path.stats.overallProgress} 
                    isCompleted={path.stats.isCompleted} 
                  />
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {path.description}
                </p>

                {/* Mini Stats */}
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {path.stats.totalCourses} courses
                  </span>
                  {path.estimatedHours && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      ~{path.estimatedHours}h
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => setShowRoadmap(path.id)}
                  >
                    <Map className="h-4 w-4" />
                    Roadmap
                  </Button>
                  {path.stats.isCompleted && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShare(path)}
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Map className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Learning Paths Available</h3>
            <p className="text-muted-foreground mb-6">
              Learning paths help you organize courses into structured sequences
            </p>
            <Button asChild>
              <Link href="/">
                Browse Courses
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Roadmap Modal */}
      {showRoadmap && (() => {
        const path = learningPaths.find(p => p.id === showRoadmap)
        if (!path) return null
        
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{path.title}</h2>
                    <p className="text-sm text-muted-foreground">Your Learning Roadmap</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowRoadmap(null)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Progress Overview */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-bold">{path.stats.overallProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        path.stats.isCompleted 
                          ? "bg-green-500" 
                          : "bg-gradient-to-r from-brand-purple to-brand-blue"
                      )}
                      style={{ width: `${path.stats.overallProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{path.stats.completedCourses} completed</span>
                    <span>{path.stats.totalCourses - path.stats.completedCourses} remaining</span>
                  </div>
                </div>

                {/* Roadmap Steps */}
                <div className="space-y-0">
                  {path.courses.map((course, index) => (
                    <RoadmapStep 
                      key={course.id}
                      course={course}
                      index={index}
                      isLast={index === path.courses.length - 1}
                    />
                  ))}
                </div>

                {/* Completion Badge */}
                {path.stats.isCompleted && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 text-center">
                    <Trophy className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h4 className="font-bold text-lg">Path Completed!</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Congratulations! You&apos;ve completed all courses in this learning path.
                    </p>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => handleShare(path)}
                    >
                      <Share2 className="h-4 w-4" />
                      Share Your Achievement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })()}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-brand-purple/5 to-brand-blue/5 border-brand-purple/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6 text-brand-purple" />
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">What are Learning Paths?</h4>
              <p className="text-muted-foreground">
                Learning Paths are curated sequences of courses designed to help you master a specific skill 
                or career track. Each path guides you through the right courses in the optimal order, 
                ensuring you build a solid foundation before moving to advanced topics. Complete all courses 
                in a path to earn a special Learning Path completion badge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
