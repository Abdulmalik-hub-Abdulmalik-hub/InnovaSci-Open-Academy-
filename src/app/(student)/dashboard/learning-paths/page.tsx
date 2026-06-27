"use client"

import { useState } from "react"
import Link from "next/link"
import { useLearningPaths } from "@/hooks/useLearningPaths"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { 
  Map, BookOpen, CheckCircle2, Clock, ChevronRight, 
  Play, Lock, Users, ArrowRight
} from "lucide-react"

export default function LearningPathsPage() {
  const { learningPaths, loading, error } = useLearningPaths()
  const [expandedPath, setExpandedPath] = useState<string | null>(null)

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learning Paths</h1>
        <p className="text-muted-foreground mt-1">
          Structured sequences to guide your learning journey
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-purple/10 flex items-center justify-center">
              <Map className="h-6 w-6 text-brand-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{learningPaths.length}</p>
              <p className="text-sm text-muted-foreground">Total Paths</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {learningPaths.reduce((acc, p) => acc + p.stats.completedCourses, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {learningPaths.reduce((acc, p) => acc + p.stats.enrolledCourses, 0)}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths */}
      {learningPaths.length > 0 ? (
        <div className="space-y-6">
          {learningPaths.map((path) => (
            <Card 
              key={path.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Path Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 flex items-center justify-center">
                    {path.thumbnailUrl ? (
                      <img 
                        src={path.thumbnailUrl} 
                        alt={path.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Map className="h-10 w-10 text-brand-purple/50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold">{path.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {path.description}
                        </p>
                      </div>
                      <Badge 
                        variant={path.stats.overallProgress === 100 ? "default" : "secondary"}
                        className={cn(
                          path.stats.overallProgress === 100 
                            ? "bg-green-500" 
                            : "bg-brand-purple"
                        )}
                      >
                        {path.stats.overallProgress}% Complete
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all"
                          style={{ width: `${path.stats.overallProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {path.stats.totalCourses} Courses
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {path.stats.completedCourses} Completed
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {path.stats.enrolledCourses} Enrolled
                      </span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <ChevronRight 
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform hidden md:block",
                      expandedPath === path.id && "rotate-90"
                    )}
                  />
                </div>
              </div>

              {/* Expanded Courses */}
              {expandedPath === path.id && (
                <CardContent className="border-t bg-gray-50/50 dark:bg-gray-800/50 p-6">
                  <h4 className="font-semibold mb-4">Courses in this Path</h4>
                  <div className="space-y-3">
                    {path.courses.map((course, index) => (
                      <div 
                        key={course.id}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                      >
                        {/* Order Number */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                          course.completed
                            ? "bg-green-500 text-white"
                            : course.enrolled
                              ? "bg-brand-purple text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        )}>
                          {course.completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium line-clamp-1">
                            {course.title}
                          </h5>
                          <div className="flex items-center gap-3 mt-1">
                            {course.durationHours && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.durationHours}h
                              </span>
                            )}
                            {course.enrolled && (
                              <>
                                <div className="w-16 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full",
                                      course.completed 
                                        ? "bg-green-500" 
                                        : "bg-brand-purple"
                                    )}
                                    style={{ width: `${course.progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {course.progressPercent}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {course.enrolled ? (
                          <Link href={`/dashboard/learn/${course.id}`}>
                            <Button size="sm" variant="outline">
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
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Map className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Learning Paths Available</h3>
          <p className="text-muted-foreground mb-6">
            Learning paths help you organize courses into structured sequences
          </p>
          <Button asChild>
            <a href="/">
              Browse Courses
            </a>
          </Button>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-brand-purple/5 to-brand-blue/5 border-brand-purple/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
              <Map className="h-6 w-6 text-brand-purple" />
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
