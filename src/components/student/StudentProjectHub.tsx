"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Layers,
  Lock,
  CheckCircle2,
  Clock,
  FileCode,
  Trophy,
  Play,
  Upload,
  AlertCircle,
} from "lucide-react"

interface AvailableProject {
  id: string
  title: string
  description?: string
  type: "exercise" | "mini-project" | "difficulty-capstone" | "professional-capstone"
  courseId?: string
  courseTitle?: string
  status: "locked" | "available" | "in-progress" | "submitted" | "completed"
  progress?: number
}

interface StudentProjectHubProps {
  userId: string
  enrolledCourses: { id: string; title: string; completedLessons: number; totalLessons: number }[]
  completedCourses: string[]
}

const statusColors = {
  locked: "bg-gray-500/20 text-gray-500 border-gray-500",
  available: "bg-green-500/20 text-green-500 border-green-500",
  "in-progress": "bg-blue-500/20 text-blue-500 border-blue-500",
  submitted: "bg-yellow-500/20 text-yellow-500 border-yellow-500",
  completed: "bg-purple-500/20 text-purple-500 border-purple-500",
}

export function StudentProjectHub({
  userId,
  enrolledCourses,
  completedCourses,
}: StudentProjectHubProps) {
  const [activeTab, setActiveTab] = useState("active")
  const [loading, setLoading] = useState(true)
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([])

  useEffect(() => {
    fetchProjects()
  }, [userId])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/mccs/student/projects")
      const result = await response.json()
      if (result.success) {
        setAvailableProjects(result.data.projects || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="h-7 w-7 text-purple-600" />
          My Projects
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Access and manage your course projects and exercises
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProjects
              .filter((p) => p.status !== "completed")
              .slice(0, 6)
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
          {availableProjects.filter((p) => p.status !== "completed").length === 0 && (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active projects</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProjects
              .filter((p) => p.status === "completed")
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
          {availableProjects.filter((p) => p.status === "completed").length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No completed projects yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectCard({ project }: { project: AvailableProject }) {
  const isLocked = project.status === "locked"

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        isLocked ? "opacity-75" : "cursor-pointer"
      }`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isLocked
            ? "bg-gray-400"
            : project.status === "in-progress"
            ? "bg-blue-500"
            : "bg-purple-500"
        }`}
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isLocked
                ? "bg-gray-100 dark:bg-gray-800"
                : project.type === "mini-project"
                ? "bg-blue-100 dark:bg-blue-900/30"
                : "bg-purple-100 dark:bg-purple-900/30"
            }`}
          >
            {isLocked ? (
              <Lock className="h-5 w-5 text-gray-400" />
            ) : project.type === "mini-project" ? (
              <Trophy className="h-5 w-5 text-blue-600" />
            ) : (
              <FileCode className="h-5 w-5 text-purple-600" />
            )}
          </div>
          <Badge className={statusColors[project.status]}>
            {project.status.replace("-", " ")}
          </Badge>
        </div>

        <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
          {project.title}
        </h4>

        {project.courseTitle && (
          <p className="text-sm text-gray-500 mb-3">{project.courseTitle}</p>
        )}

        {project.progress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1" />
          </div>
        )}

        {isLocked && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <AlertCircle className="h-4 w-4" />
            Complete required courses to unlock
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StudentProjectHub
