"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  BookOpen, Award, Clock, TrendingUp, Play, 
  ChevronRight, Calendar, Target, List, 
  GraduationCap, ChevronDown, CheckCircle2,
  Bookmark, Search, Flame, Trophy, Star, Zap, Bell, Settings,
  Grid, List as ListIcon, BookMarked, Users, TrendingDown, Plus
} from "lucide-react"

// Extended mock data
const enrolledCourses = [
  { 
    id: "1", 
    title: "Introduction to Machine Learning", 
    progress: 78, 
    lessons: 45, 
    completed: 35,
    lastLesson: "Neural Network Basics",
    instructor: "Dr. Sarah Chen",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    category: "AI & ML",
    rating: 4.8,
    students: 2340
  },
  { 
    id: "2", 
    title: "Computational Biology Fundamentals", 
    progress: 45, 
    lessons: 62, 
    completed: 28,
    lastLesson: "DNA Sequencing",
    instructor: "Prof. Michael Torres",
    thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop",
    category: "Bioinformatics",
    rating: 4.6,
    students: 1230
  },
  { 
    id: "3", 
    title: "Python for Scientific Computing", 
    progress: 92, 
    lessons: 35, 
    completed: 32,
    lastLesson: "Final Project",
    instructor: "Dr. James Miller",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    category: "Programming",
    rating: 4.9,
    students: 5670
  },
  { 
    id: "4", 
    title: "Data Structures & Algorithms", 
    progress: 15, 
    lessons: 80, 
    completed: 12,
    lastLesson: "Arrays and Linked Lists",
    instructor: "Dr. Emily Watson",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop",
    category: "Computer Science",
    rating: 4.7,
    students: 3450
  },
]

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

// Achievements/Badges
const achievements = [
  { id: "a1", name: "First Course", icon: BookOpen, earned: true, color: "bg-blue-500" },
  { id: "a2", name: "7 Day Streak", icon: Flame, earned: true, color: "bg-orange-500" },
  { id: "a3", name: "First Certificate", icon: Award, earned: true, color: "bg-amber-500" },
  { id: "a4", name: "Fast Learner", icon: Zap, earned: true, color: "bg-purple-500" },
  { id: "a5", name: "Team Player", icon: Users, earned: false, color: "bg-gray-400" },
  { id: "a6", name: "Master", icon: Trophy, earned: false, color: "bg-gray-400" },
]

// Bookmarked courses
const bookmarkedCourses = [
  { id: "b1", title: "Advanced Deep Learning", instructor: "Dr. Alex Kim", thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=100&h=100&fit=crop" },
  { id: "b2", title: "Cloud Computing Essentials", instructor: "Prof. Lisa Wang", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop" },
]

// Recommended courses
const recommendedCourses = [
  { id: "r1", title: "Natural Language Processing", instructor: "Dr. Sarah Chen", students: 1890, rating: 4.9, thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=100&h=100&fit=crop" },
  { id: "r2", title: "Computer Vision Fundamentals", instructor: "Prof. Michael Torres", students: 2340, rating: 4.7, thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop" },
  { id: "r3", title: "Reinforcement Learning", instructor: "Dr. James Miller", students: 980, rating: 4.8, thumbnail: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=100&h=100&fit=crop" },
]

// Weekly study data
const weeklyStudyData = {
  "Mon": 45, "Tue": 60, "Wed": 30, "Thu": 90, "Fri": 0, "Sat": 0, "Sun": 0
}

// Streak calendar data
const streakCalendar = [
  { date: "18", day: "Mon", studied: true, hours: 2.5 },
  { date: "19", day: "Tue", studied: true, hours: 1.5 },
  { date: "20", day: "Wed", studied: true, hours: 3 },
  { date: "21", day: "Thu", studied: false, hours: 0 },
  { date: "22", day: "Fri", studied: true, hours: 2 },
  { date: "23", day: "Sat", studied: true, hours: 1 },
  { date: "24", day: "Sun", studied: true, hours: 2.5 },
]

type ViewMode = "courses" | "paths"
type GridView = "grid" | "list"

export default function StudentDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("courses")
  const [gridView, setGridView] = useState<GridView>("grid")
  const [expandedPath, setExpandedPath] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "AI & ML", "Programming", "Bioinformatics", "Computer Science"]
  
  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const currentStreak = 7
  const totalHoursThisWeek = Object.values(weeklyStudyData).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Learning</h1>
          <p className="text-muted-foreground mt-1">Track your progress and continue learning</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-brand-purple to-brand-blue">
            <Target className="h-4 w-4" />
            Daily Goal
          </Button>
        </div>
      </div>

      {/* Continue Watching Banner */}
      {enrolledCourses.find(c => c.progress < 100) && (
        <Card className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 border-brand-purple/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/20">
                  <img src={enrolledCourses[0].thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Continue watching</p>
                  <h3 className="font-semibold">{enrolledCourses[0].title}</h3>
                  <p className="text-sm text-muted-foreground">Last: {enrolledCourses[0].lastLesson}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{enrolledCourses[0].progress}% complete</p>
                  <p className="text-xs text-muted-foreground">{enrolledCourses[0].completed}/{enrolledCourses[0].lessons} lessons</p>
                </div>
                <div className="w-32 hidden md:block">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full" style={{ width: `${enrolledCourses[0].progress}%` }} />
                  </div>
                </div>
                <Button size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Resume
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-brand-purple" />
              </div>
              <div>
                <p className="text-lg font-bold">{enrolledCourses.length}</p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Award className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{recentCertificates.length}</p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{totalHoursThisWeek}h</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{achievements.filter(a => a.earned).length}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Bookmark className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{bookmarkedCourses.length}</p>
                <p className="text-xs text-muted-foreground">Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
            <div className="flex items-center gap-2">
              {viewMode === "courses" && (
                <>
                  <Button 
                    variant={gridView === "grid" ? "secondary" : "ghost"} 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setGridView("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={gridView === "list" ? "secondary" : "ghost"} 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setGridView("list")}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          {viewMode === "courses" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search courses..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize text-xs"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Courses Grid View */}
          {viewMode === "courses" && gridView === "grid" && (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="relative h-36 overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/50 backdrop-blur-sm text-white text-xs">
                        {course.category}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold line-clamp-1 mb-1">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{course.instructor}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{course.completed}/{course.lessons} lessons</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button className="flex-1 gap-1" size="sm">
                        <Play className="h-3 w-3" />
                        {course.progress > 0 ? "Continue" : "Start"}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Courses List View */}
          {viewMode === "courses" && gridView === "list" && (
            <div className="space-y-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">{course.instructor}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{course.rating}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{course.completed}/{course.lessons} lessons</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                          <Button className="gap-1" size="sm">
                            <Play className="h-3 w-3" />
                            {course.progress > 0 ? "Continue" : "Start"}
                          </Button>
                        </div>
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
                            <h3 className="font-semibold">{path.name}</h3>
                            <p className="text-sm text-muted-foreground">{path.description}</p>
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
                          const course = enrolledCourses.find(c => c.title === courseName)
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
                              {course && (
                                <img src={course.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                              )}
                              <span className={cn(
                                "flex-1",
                                isCompleted && "text-muted-foreground line-through"
                              )}>
                                {courseName}
                              </span>
                              {!isCompleted && (
                                <Button variant="outline" size="sm" className="text-brand-purple">
                                  Start
                                </Button>
                              )}
                              {isCompleted && (
                                <Button variant="ghost" size="sm" className="text-green-600">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Completed
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
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Study Streak Calendar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  {currentStreak} Day Streak
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {streakCalendar.map((day, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "aspect-square rounded flex flex-col items-center justify-center text-xs",
                      day.studied 
                        ? "bg-gradient-to-br from-brand-purple to-brand-blue text-white" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="font-bold">{day.date}</span>
                    <span className="text-[8px] opacity-70">{day.studied ? `${day.hours}h` : '—'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {achievements.map((ach) => {
                  const Icon = ach.icon
                  return (
                    <div 
                      key={ach.id}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg transition-all",
                        ach.earned 
                          ? "bg-muted hover:bg-muted/80 cursor-pointer" 
                          : "bg-muted/50 opacity-50"
                      )}
                      title={ach.name}
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-1", ach.color)}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs text-center">{ach.name}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bookmarks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-purple-500" />
                  Saved Courses
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookmarkedCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <img src={course.thumbnail} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.instructor}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </CardContent>
          </Card>

          {/* Recommended */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-purple" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <img src={course.thumbnail} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{course.students.toLocaleString()} students</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(weeklyStudyData).map(([day, minutes]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-8">{day}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          minutes > 0 ? "bg-gradient-to-r from-brand-purple to-brand-blue" : "bg-muted-foreground/20"
                        )}
                        style={{ width: `${Math.min((minutes / 60) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{minutes > 0 ? `${minutes}m` : '—'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Certificates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCertificates.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cert.title}</p>
                    <p className="text-xs text-muted-foreground">{cert.date}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-brand-purple" size="sm">
                View All Certificates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
