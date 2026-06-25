"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { 
  BookOpen, Award, Clock, TrendingUp, Play, 
  ChevronRight, Calendar, Target, List, 
  GraduationCap, ChevronDown, CheckCircle2,
  Download, MessageCircle, ToggleLeft, ToggleRight
} from "lucide-react"

// Mock data for enrolled courses
const enrolledCourses = [
  { 
    id: "1", 
    title: "Introduction to Machine Learning", 
    progress: 78, 
    lessons: 45, 
    completed: 35,
    instructor: "Dr. Sarah Chen",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop"
  },
  { 
    id: "2", 
    title: "Computational Biology Fundamentals", 
    progress: 45, 
    lessons: 62, 
    completed: 28,
    instructor: "Prof. Michael Torres",
    thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop"
  },
  { 
    id: "3", 
    title: "Python for Scientific Computing", 
    progress: 92, 
    lessons: 35, 
    completed: 32,
    instructor: "Dr. James Miller",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop"
  },
  { 
    id: "4", 
    title: "Data Structures & Algorithms", 
    progress: 15, 
    lessons: 80, 
    completed: 12,
    instructor: "Dr. Emily Watson",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop"
  },
]

// Mock learning paths
const learningPaths = [
  { 
    id: "lp1",
    name: "Data Science Foundations",
    description: "Master the fundamentals of data science",
    courses: ["Introduction to Machine Learning", "Python for Scientific Computing", "Data Structures & Algorithms"],
    progress: 65,
    totalCourses: 3,
    completedCourses: 1
  },
  { 
    id: "lp2",
    name: "Computational Biology Track",
    description: "Explore the intersection of biology and computing",
    courses: ["Computational Biology Fundamentals"],
    progress: 45,
    totalCourses: 4,
    completedCourses: 1
  },
]

const recentCertificates = [
  { title: "Data Science Fundamentals", date: "2024-06-15", code: "ISA-2024-1234" },
  { title: "Introduction to Statistics", date: "2024-05-20", code: "ISA-2024-0987" },
]

type ViewMode = "courses" | "paths"

export default function StudentDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("courses")
  const [expandedPath, setExpandedPath] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Welcome Section - Mosh Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, Abdulmalik!</h1>
          <p className="text-muted-foreground mt-1">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
          >
            <Target className="h-4 w-4" />
            Set Daily Goal
          </Button>
        </div>
      </div>

      {/* Stats Grid - Compact Mosh Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <p className="text-xl font-bold">{enrolledCourses.length}</p>
                <p className="text-xs text-muted-foreground">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{recentCertificates.length}</p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold">48h</p>
                <p className="text-xs text-muted-foreground">Learning Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold">7</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle - My Courses / Learning Paths */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setViewMode("courses")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              viewMode === "courses"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="h-4 w-4" />
            My Courses
          </button>
          <button
            onClick={() => setViewMode("paths")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              viewMode === "paths"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GraduationCap className="h-4 w-4" />
            Learning Paths
          </button>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View All
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Courses Grid View */}
      {viewMode === "courses" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all group">
              {/* Course Thumbnail */}
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between text-white text-xs">
                    <span>{course.lessons} lessons</span>
                    <span className="font-medium">{course.progress}% complete</span>
                  </div>
                </div>
                <Link 
                  href={`/learn/${course.id}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Button size="sm" className="bg-white text-gray-900 hover:bg-white/90">
                    <Play className="h-4 w-4 mr-2" />
                    Continue
                  </Button>
                </Link>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>
                
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{course.completed}/{course.lessons} lessons</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Learning Paths View */}
      {viewMode === "paths" && (
        <div className="space-y-4">
          {learningPaths.map((path) => (
            <Card key={path.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                className="w-full text-left"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{path.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{path.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{path.completedCourses}/{path.totalCourses} courses</p>
                        <p className="text-xs text-muted-foreground">completed</p>
                      </div>
                      <div className="w-32 hidden md:block">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{path.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full"
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        expandedPath === path.id && "rotate-180"
                      )} />
                    </div>
                  </div>
                </CardContent>
              </button>

              {/* Expanded Course List */}
              {expandedPath === path.id && (
                <div className="border-t bg-muted/30 p-4">
                  <div className="space-y-2">
                    {path.courses.map((courseName, idx) => {
                      const isCompleted = idx < path.completedCourses
                      return (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors"
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            isCompleted ? "bg-green-500 text-white" : "bg-muted"
                          )}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-medium text-muted-foreground">{idx + 1}</span>
                            )}
                          </div>
                          <span className={cn(
                            "flex-1",
                            isCompleted && "text-muted-foreground line-through"
                          )}>
                            {courseName}
                          </span>
                          {!isCompleted && (
                            <Button variant="ghost" size="sm" className="text-brand-purple">
                              Start
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Two Column Layout - Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Certificates */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Recent Certificates
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-brand-purple">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCertificates.map((cert, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{cert.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Issued: {cert.date}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-500 text-amber-600 font-mono text-xs">
                  {cert.code}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => (
                <div 
                  key={day} 
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-lg transition-colors",
                    i < 3 ? "bg-green-50 dark:bg-green-500/10" : "bg-muted/50"
                  )}
                >
                  <span className="text-sm font-medium">{day}</span>
                  <span className="text-sm text-muted-foreground">
                    {i < 3 ? "1.5h studied" : i < 5 ? "0h" : "Rest day"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
