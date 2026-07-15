"use client"

import { useState } from "react"
import Link from "next/link"
import { useStudentDashboard } from "@/hooks/useStudentDashboard"
import { getCourseCategoryName } from "@/hooks/useStudentEnrollments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { 
  BookOpen, Award, Clock, TrendingUp, Play, 
  ChevronRight, Calendar, Target, CheckCircle2,
  Trophy, Flame, ArrowRight, Sparkles, HelpCircle,
  Heart, List, Eye, FileText, PlayCircle
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
          <div className="w-10 h-10 border-4 border-[hsl(var(--brand-purple)) border-t-transparent rounded-full animate-spin" />
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pick up where you left off
        </p>
      </div>

      {/* Continue Learning - Hero Section */}
      {data?.currentEnrollment ? (
        <Link href={`/dashboard/learn/${data.currentEnrollment.courseId}`}>
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-lg">
            <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }} />
              </div>
              
              <div className="relative flex flex-col md:flex-row gap-6 items-center">
                {/* Thumbnail */}
                <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden flex-shrink-0 relative shadow-2xl">
                  {data.currentEnrollment.course.thumbnailUrl ? (
                    <img 
                      src={data.currentEnrollment.course.thumbnailUrl} 
                      alt={data.currentEnrollment.course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-purple/30 to-brand-blue/30 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="h-7 w-7 text-[hsl(var(--brand-purple))] ml-1" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-[hsl(var(--brand-purple))/20 text-[hsl(var(--brand-purple))] text-xs font-medium rounded-full">
                      Continue Learning
                    </span>
                    {getCourseCategoryName(data.currentEnrollment.course.category) && (
                      <span className="px-2.5 py-0.5 bg-white/10 text-gray-300 text-xs font-medium rounded-full">
                        {getCourseCategoryName(data.currentEnrollment.course.category)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[hsl(var(--brand-purple))] transition-colors">
                    {data.currentEnrollment.course.title}
                  </h2>
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all"
                          style={{ width: `${data.currentEnrollment.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm whitespace-nowrap">
                        {data.currentEnrollment.progressPercent}% complete
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 justify-center md:justify-start">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {data.currentEnrollment.course.totalLessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {data.currentEnrollment.course.durationHours || 0}h total
                      </span>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg px-8 h-12 text-base group-hover:shadow-xl transition-all">
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Resume Learning
                    <ChevronRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ) : (
        <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--brand-purple))/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-[hsl(var(--brand-purple))]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Your Learning Journey</h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
              Browse our catalog and enroll in courses to begin learning
            </p>
            <Button asChild className="bg-[hsl(var(--brand-purple)) hover:bg-[hsl(var(--brand-purple))/90">
              <Link href="/">
                Browse Courses
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand-purple))/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-[hsl(var(--brand-purple))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEnrolled}</p>
              <p className="text-xs text-gray-500">Enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand-teal))/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-[hsl(var(--brand-teal))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completedCourses}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand-blue))/10 flex items-center justify-center">
              <Flame className="h-6 w-6 text-[hsl(var(--brand-blue))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalHoursLearned}h</p>
              <p className="text-xs text-gray-500">Learned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand-purple))/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-[hsl(var(--brand-purple))]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.certificatesEarned}</p>
              <p className="text-xs text-gray-500">Certificates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Courses</h2>
              <Link href="/dashboard/courses">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--brand-purple))] text-sm h-8">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.enrollments?.slice(0, 4).map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-all bg-white dark:bg-gray-800 border-0">
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0 relative">
                      {enrollment.course.thumbnailUrl ? (
                        <img 
                          src={enrollment.course.thumbnailUrl} 
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      {/* Progress indicator */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                        <div 
                          className={cn(
                            "h-full transition-all",
                            enrollment.completed ? "bg-green-500" : "bg-[hsl(var(--brand-purple))"
                          )}
                          style={{ width: `${enrollment.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <CardContent className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {enrollment.progressPercent}% complete
                        </p>
                      </div>
                      <Link href={`/dashboard/learn/${enrollment.courseId}`} className="mt-2">
                        <Button 
                          size="sm" 
                          className={cn(
                            "w-full text-xs h-8",
                            enrollment.completed 
                              ? "bg-green-500 hover:bg-green-600 text-white" 
                              : "bg-[hsl(var(--brand-purple)) hover:bg-[hsl(var(--brand-purple))/90"
                          )}
                        >
                          {enrollment.completed ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Resume
                            </>
                          )}
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
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            
            <Card className="bg-white dark:bg-gray-800 border-0">
              <CardContent className="p-0">
                {data?.recentActivity && data.recentActivity.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.recentActivity.slice(0, 5).map((activity, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.lesson}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {activity.course}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Clock className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-brand-purple/5 to-brand-blue/5 border-[hsl(var(--brand-purple))/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-[hsl(var(--brand-purple))]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/support" className="block">
                <Button variant="outline" className="w-full justify-start h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <HelpCircle className="h-4 w-4 mr-2 text-[hsl(var(--brand-purple))]" />
                  Get Help & Support
                </Button>
              </Link>
              <Link href="/dashboard/wishlist" className="block">
                <Button variant="outline" className="w-full justify-start h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <Heart className="h-4 w-4 mr-2 text-[hsl(var(--brand-purple))]" />
                  My Wishlist
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Certificates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-[hsl(var(--brand-purple))]" />
                My Certificates
              </h2>
              <Link href="/dashboard/certificates">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--brand-purple))] h-7 text-xs">
                  View All
                </Button>
              </Link>
            </div>
            
            <Card className="bg-white dark:bg-gray-800 border-0">
              <CardContent className="p-4 space-y-3">
                {data?.certificates?.length ? (
                  data.certificates.map((cert) => (
                    <Link 
                      key={cert.id} 
                      href={`/dashboard/certificates/${cert.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand-purple))/10 flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-[hsl(var(--brand-purple))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {cert.course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Award className="h-10 w-10 text-[hsl(var(--brand-purple))]/30 dark:text-[hsl(var(--brand-purple))]/40 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      Complete courses to earn certificates
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[hsl(var(--brand-blue))]" />
                Recommended
              </h2>
            </div>
            
            <Card className="bg-white dark:bg-gray-800 border-0">
              <CardContent className="p-4 space-y-4">
                {data?.recommendedCourses?.length ? (
                  data.recommendedCourses.slice(0, 3).map((course) => (
                    <Link 
                      key={course.id} 
                      href={`/courses/${course.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                        {course.thumbnailUrl ? (
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/10 to-brand-blue/10">
                            <BookOpen className="h-6 w-6 text-[hsl(var(--brand-purple))]/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-[hsl(var(--brand-purple))] transition-colors">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {course.studentCount?.toLocaleString()} students
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Enroll in more courses to get recommendations
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
