"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, Award, Clock, TrendingUp, Play, 
  ChevronRight, Calendar, Target
} from "lucide-react"

const enrolledCourses = [
  { 
    id: "1", 
    title: "Introduction to Machine Learning", 
    progress: 78, 
    lessons: 45, 
    completed: 35,
    instructor: "Dr. Sarah Chen"
  },
  { 
    id: "2", 
    title: "Computational Biology Fundamentals", 
    progress: 45, 
    lessons: 62, 
    completed: 28,
    instructor: "Prof. Michael Torres"
  },
  { 
    id: "3", 
    title: "Python for Scientific Computing", 
    progress: 92, 
    lessons: 35, 
    completed: 32,
    instructor: "Dr. James Miller"
  },
]

const recentCertificates = [
  { title: "Data Science Fundamentals", date: "2024-06-15", code: "ISA-2024-1234" },
  { title: "Introduction to Statistics", date: "2024-05-20", code: "ISA-2024-0987" },
]

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Abdulmalik!</h1>
          <p className="text-gray-500 dark:text-white/60">Continue your learning journey</p>
        </div>
        <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
          <Target className="h-4 w-4 mr-2" />
          Set Daily Goal
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#1a1a2e]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-gray-500 dark:text-white/60">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1a1a2e]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-gray-500 dark:text-white/60">Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1a1a2e]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">48h</p>
                <p className="text-sm text-gray-500 dark:text-white/60">Learning Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1a1a2e]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-sm text-gray-500 dark:text-white/60">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <Card className="bg-white dark:bg-[#1a1a2e]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-500" />
              Continue Learning
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {enrolledCourses.map((course) => (
            <div 
              key={course.id} 
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-white/60">{course.instructor}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{course.progress}%</span>
                </div>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
                Continue
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Certificates */}
        <Card className="bg-white dark:bg-[#1a1a2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Recent Certificates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCertificates.map((cert, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <div>
                  <p className="font-medium">{cert.title}</p>
                  <p className="text-sm text-gray-500 dark:text-white/60">
                    Issued: {cert.date}
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  {cert.code}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Learning Calendar */}
        <Card className="bg-white dark:bg-[#1a1a2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => (
                <div 
                  key={day} 
                  className={`flex items-center justify-between p-2 rounded ${
                    i < 3 ? "bg-green-50 dark:bg-green-500/10" : "bg-gray-50 dark:bg-white/5"
                  }`}
                >
                  <span>{day}</span>
                  <span className="text-sm text-gray-500">
                    {i < 3 ? "1.5h" : i < 5 ? "0h" : "Rest"}
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
