"use client"

import { useState } from "react"
import Link from "next/link"
import { useStudentDashboard } from "@/hooks/useStudentDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { 
  BookOpen, Award, Clock, TrendingUp, Play, 
  ChevronRight, Calendar, Target, CheckCircle2,
  Trophy, Flame, ArrowRight, Sparkles, HelpCircle
} from "lucide-react"

export default function StudentDashboard() {
  const { data, loading, error, refresh } = useStudentDashboard()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setIsRefreshing(false)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your learning hub...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500">Failed to load dashboard: {error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    )
  }

  const stats = data?.stats || {
    totalEnrolled: 0,
    completedCourses: 0,
    totalHoursLearned: 0,
    certificatesEarned: 0
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back!
          </h1>
          <p className="text-muted-foreground mt-1">
            Pick up where you left off and keep making progress.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 lg:gap-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-brand-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEnrolled}</p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completedCourses}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalHoursLearned}h</p>
              <p className="text-xs text-muted-foreground">Learned</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.certificatesEarned}</p>
              <p className="text-xs text-muted-foreground">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning - Primary CTA */}
      {data?.currentEnrollment && (
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-brand-purple via-purple-600 to-indigo-600 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Thumbnail */}
              <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden flex-shrink-0 relative">
                {data.currentEnrollment.course.thumbnailUrl ? (
                  <img 
                    src={data.currentEnrollment.course.thumbnailUrl} 
                    alt={data.currentEnrollment.course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800/50 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/50" />
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="h-6 w-6 text-brand-purple ml-1" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                    Continue Learning
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {data.currentEnrollment.course.title}
                  </h2>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {data.currentEnrollment.course.durationHours}h total
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {data.currentEnrollment.course.totalLessons} lessons
                    </span>
                    {data.currentEnrollment.course.category && (
                      <Badge variant="secondary" className="bg-white/10 text-white border-0">
                        {data.currentEnrollment.course.category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${data.currentEnrollment.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">
                      {data.currentEnrollment.progressPercent}%
                    </span>
                  </div>
                  <Link href={`/dashboard/learn/${data.currentEnrollment.courseId}`}>
                    <Button className="bg-white text-brand-purple hover:bg-white/90 font-semibold shadow-lg">
                      <Play className="h-4 w-4 mr-2" />
                      Resume Course
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-purple" />
                My Courses
              </h2>
              <Link href="/dashboard/courses">
                <Button variant="ghost" size="sm" className="text-brand-purple">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.enrollments?.slice(0, 4).map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    <div className="w-28 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 relative">
                      {enrollment.course.thumbnailUrl ? (
                        <img 
                          src={enrollment.course.thumbnailUrl} 
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/20 to-brand-blue/20">
                          <BookOpen className="h-8 w-8 text-brand-purple/50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="flex-1 p-4">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2">
                        {enrollment.course.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              enrollment.completed 
                                ? "bg-green-500" 
                                : "bg-brand-purple"
                            )}
                            style={{ width: `${enrollment.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {enrollment.progressPercent}%
                        </span>
                      </div>
                      <Link href={`/dashboard/learn/${enrollment.courseId}`}>
                        <Button 
                          variant={enrollment.completed ? "outline" : "default"}
                          size="sm" 
                          className={cn(
                            "w-full text-xs h-8",
                            !enrollment.completed && "bg-brand-purple hover:bg-brand-purple/90"
                          )}
                        >
                          {enrollment.completed ? "Review" : "Resume"}
                        </Button>
                      </Link>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-purple" />
                Recent Activity
              </h2>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {data?.recentActivity && data.recentActivity.length > 0 ? (
                  <div className="divide-y">
                    {data.recentActivity.slice(0, 5).map((activity, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Completed: {activity.lesson}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.course}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Recommended Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Recommended
              </h2>
            </div>
            
            <Card>
              <CardContent className="p-4 space-y-4">
                {data?.recommendedCourses?.length ? (
                  data.recommendedCourses.map((course) => (
                    <Link 
                      key={course.id} 
                      href={`/courses/${course.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        {course.thumbnailUrl ? (
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/10 to-brand-blue/10">
                            <BookOpen className="h-6 w-6 text-brand-purple/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-brand-purple transition-colors">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {course.studentCount?.toLocaleString()} students
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Enroll in more courses to get recommendations
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Certificates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                My Certificates
              </h2>
              <Link href="/dashboard/certificates">
                <Button variant="ghost" size="sm" className="text-brand-purple h-8">
                  View All
                </Button>
              </Link>
            </div>
            
            <Card>
              <CardContent className="p-4 space-y-3">
                {data?.certificates?.length ? (
                  data.certificates.map((cert) => (
                    <Link 
                      key={cert.id} 
                      href={`/dashboard/certificates/${cert.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {cert.course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Issued {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Complete courses to earn certificates
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-brand-purple/5 to-brand-blue/5 border-brand-purple/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-purple" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/learning-paths" className="block">
                <Button variant="outline" className="w-full justify-start h-11">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Learning Paths
                </Button>
              </Link>
              <Link href="/dashboard/support" className="block">
                <Button variant="outline" className="w-full justify-start h-11">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Get Help & Support
                </Button>
              </Link>
              <Link href="/dashboard/quizzes" className="block">
                <Button variant="outline" className="w-full justify-start h-11">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Practice & Quizzes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
