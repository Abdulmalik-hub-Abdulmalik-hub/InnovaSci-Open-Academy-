"use client"

import { useState, useEffect } from "react"
import { StudentProjectHub } from "@/components/student/StudentProjectHub"
import { Loader2 } from "lucide-react"

interface EnrolledCourse {
  id: string
  title: string
  completedLessons: number
  totalLessons: number
}

export default function StudentProjectsPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [completedCourses, setCompletedCourses] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user (in a real app, this would come from auth)
        const userResponse = await fetch("/api/student/me")
        const userData = await userResponse.json()
        
        if (userData.success) {
          setUserId(userData.data.user.id)
          
          // Get enrolled courses with progress
          const enrollmentsResponse = await fetch("/api/student/enrollments")
          const enrollmentsData = await enrollmentsResponse.json()
          
          if (enrollmentsData.success) {
            const courses = enrollmentsData.data.enrollments.map((e: any) => ({
              id: e.course.id,
              title: e.course.title,
              completedLessons: Math.floor((e.progressPercent / 100) * (e.course.stats?.lessons || 1)),
              totalLessons: e.course.stats?.lessons || 1,
            }))
            setEnrolledCourses(courses)
            
            // Get completed courses
            const completed = enrollmentsData.data.enrollments
              .filter((e: any) => e.status === "completed")
              .map((e: any) => e.course.id)
            setCompletedCourses(completed)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Please log in to view your projects.</p>
      </div>
    )
  }

  return (
    <StudentProjectHub
      userId={userId}
      enrolledCourses={enrolledCourses}
      completedCourses={completedCourses}
    />
  )
}
