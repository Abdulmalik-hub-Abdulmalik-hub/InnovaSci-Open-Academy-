"use client"

import Link from "next/link"
import { useStudentLearningHistory } from "@/hooks/useStudentLearningHistory"
import { getCourseCategoryName } from "@/hooks/useStudentEnrollments"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, Play, Clock, ChevronRight, RefreshCw, 
  CheckCircle2, BarChart3
} from "lucide-react"

export default function LearningHistoryPage() {
  const { history, loading, error, pagination, fetchHistory, refresh } = useStudentLearningHistory()

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your learning history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-brand-purple" />
            Learning History
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and resume learning
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-brand-purple/10 dark:bg-brand-purple/20 rounded-lg border border-brand-purple/20">
            <p className="text-2xl font-bold text-brand-purple">
              {history.length}
            </p>
            <p className="text-xs text-brand-purple/80">
              Courses Started
            </p>
          </div>
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {history.filter(h => h.isCompleted).length}
            </p>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              Completed
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchHistory()}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* History List */}
      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item) => (
            <Card 
              key={item.courseId} 
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <div className="w-full md:w-56 h-36 bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
                  {item.course.thumbnailUrl ? (
                    <img 
                      src={item.course.thumbnailUrl} 
                      alt={item.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/20 to-brand-blue/20">
                      <BookOpen className="h-12 w-12 text-brand-purple/30" />
                    </div>
                  )}
                  
                  {/* Completion Badge */}
                  {item.isCompleted && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-500 text-white gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {getCourseCategoryName(item.course.category) && (
                        <Badge variant="outline" className="text-xs">
                          {getCourseCategoryName(item.course.category)}
                        </Badge>
                      )}
                      {item.course.difficultyLevel && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.course.difficultyLevel}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-1">
                      {item.course.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {item.course.totalLessons} lessons
                      </span>
                      {item.course.durationHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {item.course.durationHours}h
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {item.completedLessons}/{item.course.totalLessons} completed
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{item.progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            item.isCompleted 
                              ? "bg-green-500" 
                              : "bg-gradient-to-r from-brand-purple to-brand-blue"
                          }`}
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resume Button */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">
                      {item.isCompleted 
                        ? "Review the course content" 
                        : `${item.course.totalLessons - item.completedLessons} lessons remaining`
                      }
                    </span>
                    {item.nextLessonId && (
                      <Link href={`/dashboard/learn/${item.courseId}?lesson=${item.nextLessonId}`}>
                        <Button 
                          size="sm"
                          className={item.isCompleted 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-brand-purple hover:bg-brand-purple/90"
                          }
                        >
                          {item.isCompleted ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Review
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Resume Learning
                            </>
                          )}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Your learning journey starts here</h3>
          <p className="text-muted-foreground mb-6">
            Explore our course catalog and start learning today!
          </p>
          <Button asChild>
            <Link href="/courses">
              Browse Course Catalog
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchHistory({ page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchHistory({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}