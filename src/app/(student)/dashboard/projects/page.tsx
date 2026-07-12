"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Code2,
  FolderOpen,
  Lock,
  Unlock,
  ChevronRight,
  CheckCircle2,
  Clock,
  Upload,
  ExternalLink,
  Github,
  Trophy,
  Layers,
  BookOpen,
  Loader2,
  Plus,
  Eye,
  Send,
  X,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"

interface ProjectSubmission {
  id: string
  title: string
  description: string | null
  submissionUrl: string | null
  status: string
  grade: number | null
  feedback: string | null
  submittedAt: string | null
  gradedAt: string | null
  capstoneId: string | null
  course: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string | null
  } | null
  miniProject: {
    id: string
    title: string
    description: string | null
    deliverables: string[] | null
  } | null
}

interface AvailableProject {
  id: string
  title: string
  type: "mini_project" | "capstone"
  courseId?: string
  courseTitle?: string
  difficulty?: string
  isLocked: boolean
  modulesCompleted?: number
  totalModules?: number
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NOT_STARTED: { 
    label: "Not Started", 
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: <Clock className="h-3 w-3" />
  },
  DRAFT: { 
    label: "Draft", 
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: <Clock className="h-3 w-3" />
  },
  IN_PROGRESS: { 
    label: "In Progress", 
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: <Loader2 className="h-3 w-3 animate-spin" />
  },
  SUBMITTED: { 
    label: "Submitted", 
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: <Send className="h-3 w-3" />
  },
  UNDER_REVIEW: { 
    label: "Under Review", 
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: <Clock className="h-3 w-3 animate-spin" />
  },
  REVISION_REQUIRED: { 
    label: "Revision Required", 
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: <AlertCircle className="h-3 w-3" />
  },
  RESUBMITTED: { 
    label: "Resubmitted", 
    color: "bg-indigo-100 text-indigo-700 border-indigo-300",
    icon: <Send className="h-3 w-3" />
  },
  APPROVED: { 
    label: "Approved", 
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  REJECTED: { 
    label: "Rejected", 
    color: "bg-red-100 text-red-700 border-red-300",
    icon: <X className="h-3 w-3" />
  },
  COMPLETED: { 
    label: "Completed", 
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  GRADED: { 
    label: "Graded", 
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="h-3 w-3" />
  },
}

export default function StudentProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  
  // Dialog states
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectSubmission | AvailableProject | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [submissionUrl, setSubmissionUrl] = useState("")
  const [submissionNote, setSubmissionNote] = useState("")
  
  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/student/projects")
      const data = await response.json()
      
      if (data.success) {
        setProjects(data.data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  const fetchAvailableProjects = useCallback(async () => {
    try {
      // Fetch enrolled courses with their mini-projects
      const coursesRes = await fetch("/api/student/enrollments")
      const coursesData = await coursesRes.json()
      
      if (coursesData.success) {
        const available: AvailableProject[] = []
        
        for (const enrollment of coursesData.data) {
          if (!enrollment.course) continue
          
          // Check completion status
          const progress = enrollment.progress || 0
          const isLocked = progress < 50 // Lock projects until 50% complete
          
          // Get mini-projects for the course
          const miniProjectsRes = await fetch(`/api/admin/courses/${enrollment.course.id}/mini-project`)
          const miniProjectsData = await miniProjectsRes.json()
          
          if (miniProjectsData.success && miniProjectsData.data) {
            available.push({
              id: miniProjectsData.data.id,
              title: miniProjectsData.data.title,
              type: "mini_project",
              courseId: enrollment.course.id,
              courseTitle: enrollment.course.title,
              isLocked,
              modulesCompleted: Math.floor(progress * (enrollment.course.modulesCount || 10) / 100),
              totalModules: enrollment.course.modulesCount || 10,
            })
          }
        }
        
        // Also fetch capstone projects
        const capstoneRes = await fetch("/api/admin/capstones/difficulty")
        const capstoneData = await capstoneRes.json()
        
        if (capstoneData.success) {
          for (const capstone of capstoneData.data) {
            // Check if user has courses in this difficulty level
            const hasRequiredCourses = coursesData.data.some(
              (e: { course: { difficultyLevel: string }; progress?: number }) => 
                e.course?.difficultyLevel === capstone.difficultyLevel && 
                (e.progress || 0) >= 100
            )
            
            available.push({
              id: capstone.id,
              title: capstone.title,
              type: "capstone",
              courseTitle: capstone.difficultyLevel,
              difficulty: capstone.difficultyLevel,
              isLocked: !hasRequiredCourses,
            })
          }
        }
        
        setAvailableProjects(available)
      }
    } catch (error) {
      console.error("Error fetching available projects:", error)
    }
  }, [])
  
  useEffect(() => {
    fetchProjects()
    fetchAvailableProjects()
  }, [fetchProjects, fetchAvailableProjects])
  
  const handleStartProject = async (project: AvailableProject) => {
    if (project.isLocked) {
      toast.error("Complete more course modules to unlock this project!")
      return
    }
    
    try {
      const response = await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          miniProjectId: project.type === "mini_project" ? project.id : undefined,
          capstoneId: project.type === "capstone" ? project.id : undefined,
          courseId: project.courseId,
          status: "not_started",
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Project started! Good luck!")
        fetchProjects()
        setActiveTab("active")
      }
    } catch (error) {
      console.error("Error starting project:", error)
      toast.error("Failed to start project")
    }
  }
  
  const handleSubmitProject = async () => {
    if (!selectedProject) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: (selectedProject as ProjectSubmission).id,
          submissionUrl,
          description: submissionNote,
          status: "submitted",
          action: "submit",
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || "Project submitted successfully!")
        setSubmitDialogOpen(false)
        setSubmissionUrl("")
        setSubmissionNote("")
        fetchProjects()
        setActiveTab("submitted")
      } else {
        toast.error(data.error || "Failed to submit project")
      }
    } catch (error) {
      console.error("Error submitting project:", error)
      toast.error("Failed to submit project")
    } finally {
      setSubmitting(false)
    }
  }
  
  const openSubmitDialog = (project: ProjectSubmission) => {
    setSelectedProject(project)
    setSubmissionUrl(project.submissionUrl || "")
    setSubmissionNote(project.description || "")
    setSubmitDialogOpen(true)
  }
  
  const openDetailsDialog = (project: ProjectSubmission) => {
    setSelectedProject(project)
    setDetailsDialogOpen(true)
  }
  
  const activeProjects = projects.filter(p => !["graded", "GRADED", "approved", "APPROVED", "completed", "COMPLETED"].includes(p.status?.toLowerCase() || ""))
  const completedProjects = projects.filter(p => ["graded", "GRADED", "approved", "APPROVED", "completed", "COMPLETED"].includes(p.status?.toLowerCase() || ""))
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your course projects, mini-projects, and capstone submissions
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => setActiveTab("available")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Start New Project
        </Button>
      </div>
      
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
              </div>
              <Code2 className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => ["SUBMITTED", "submitted"].includes(p.status || "")).length}
                </p>
              </div>
              <Send className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedProjects.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Grade</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.grade).length > 0
                    ? Math.round(
                        projects
                          .filter(p => p.grade)
                          .reduce((acc, p) => acc + (p.grade || 0), 0) /
                        projects.filter(p => p.grade).length
                      )
                    : "N/A"}
                </p>
              </div>
              <Layers className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            <FolderOpen className="h-4 w-4 mr-2" />
            Active Projects
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="available">
            <Lock className="h-4 w-4 mr-2" />
            Available Projects
          </TabsTrigger>
        </TabsList>
        
        {/* Active Projects */}
        <TabsContent value="active" className="space-y-4">
          {activeProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No Active Projects</h3>
              <p className="text-muted-foreground">
                Start a project from the Available Projects tab
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500" />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge className={statusConfig[project.status]?.color}>
                        {statusConfig[project.status]?.icon}
                        <span className="ml-1">{statusConfig[project.status]?.label}</span>
                      </Badge>
                      {project.grade && (
                        <Badge variant="outline" className="bg-green-50">
                          Grade: {project.grade}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 mt-2">{project.title}</CardTitle>
                    {project.course && (
                      <CardDescription className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {project.course.title}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.miniProject?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.miniProject.description}
                      </p>
                    )}
                    
                    {/* Breadcrumb Navigation */}
                    {project.course && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-xs"
                          onClick={() => router.push(`/courses/${project.course!.slug}`)}
                        >
                          <ChevronRight className="h-3 w-3" />
                          {project.course.title}
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openDetailsDialog(project)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      {!["SUBMITTED", "submitted", "UNDER_REVIEW", "REVISION_REQUIRED", "RESUBMITTED", "APPROVED", "REJECTED"].includes(project.status) && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                          onClick={() => openSubmitDialog(project)}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Completed Projects */}
        <TabsContent value="completed" className="space-y-4">
          {completedProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No Completed Projects</h3>
              <p className="text-muted-foreground">
                Complete and submit your projects to see them here
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="overflow-hidden border-green-200"
                >
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                      {project.grade && (
                        <Badge 
                          variant="outline" 
                          className={project.grade >= 70 ? "bg-green-50" : "bg-amber-50"}
                        >
                          {project.grade}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 mt-2">{project.title}</CardTitle>
                    {project.course && (
                      <CardDescription>{project.course.title}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.feedback && (
                      <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                        <p className="text-xs font-medium text-amber-800 mb-1">Feedback:</p>
                        <p className="text-xs text-amber-700 line-clamp-2">{project.feedback}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openDetailsDialog(project)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {project.submissionUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <a href={project.submissionUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Live
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Available Projects */}
        <TabsContent value="available" className="space-y-4">
          {availableProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No Projects Available Yet</h3>
              <p className="text-muted-foreground">
                Enroll in courses to unlock projects
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProjects.map((project) => (
                <Card 
                  key={project.id}
                  className={`overflow-hidden transition-all ${
                    project.isLocked 
                      ? "opacity-75 grayscale" 
                      : "hover:shadow-lg hover:border-purple-300"
                  }`}
                >
                  <div className={`h-2 ${
                    project.isLocked 
                      ? "bg-gray-300" 
                      : project.type === "capstone" 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                        : "bg-gradient-to-r from-purple-500 to-blue-500"
                  }`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge variant={project.type === "capstone" ? "default" : "secondary"}>
                        {project.type === "capstone" ? (
                          <><Trophy className="h-3 w-3 mr-1" /> Capstone</>
                        ) : (
                          <><Code2 className="h-3 w-3 mr-1" /> Mini-Project</>
                        )}
                      </Badge>
                      {project.isLocked ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Unlock className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 mt-2">{project.title}</CardTitle>
                    <CardDescription>
                      {project.courseTitle && (
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {project.courseTitle}
                        </span>
                      )}
                      {project.difficulty && (
                        <Badge variant="outline" className="mt-1">
                          {project.difficulty}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.isLocked && (
                      <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-xs text-gray-600">
                          Complete {project.modulesCompleted || 0}/{project.totalModules || 0} modules to unlock
                        </p>
                        <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 transition-all"
                            style={{ 
                              width: `${((project.modulesCompleted || 0) / (project.totalModules || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className={`w-full ${
                        project.isLocked 
                          ? "bg-gray-400 hover:bg-gray-500" 
                          : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      }`}
                      disabled={project.isLocked || !!projects.find(p => 
                        p.miniProject?.id === project.id || p.capstoneId === project.id
                      )}
                      onClick={() => handleStartProject(project)}
                    >
                      {project.isLocked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      ) : projects.find(p => 
                        p.miniProject?.id === project.id || p.capstoneId === project.id
                      ) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Already Started
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Start Project
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Submit Project Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Project</DialogTitle>
            <DialogDescription>
              Submit your project by providing a link to your repository or live demo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submissionUrl">GitHub Repository or Live URL *</Label>
              <div className="flex gap-2">
                <Github className="h-5 w-5 mt-2.5 text-muted-foreground" />
                <Input
                  id="submissionUrl"
                  placeholder="https://github.com/username/project"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="submissionNote">Additional Notes</Label>
              <Textarea
                id="submissionNote"
                placeholder="Describe what you've built, challenges faced, and key features..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitProject}
              disabled={!submissionUrl || submitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Project Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedProject.title}</DialogTitle>
                  <Badge className={statusConfig[(selectedProject as ProjectSubmission).status]?.color}>
                    {statusConfig[(selectedProject as ProjectSubmission).status]?.label}
                  </Badge>
                </div>
                {(selectedProject as ProjectSubmission).course && (
                  <DialogDescription className="flex items-center mt-1">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {(selectedProject as ProjectSubmission).course!.title}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Breadcrumb */}
                {(selectedProject as ProjectSubmission).course && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Course</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-purple-600"
                      onClick={() => router.push(`/courses/${(selectedProject as ProjectSubmission).course!.slug}`)}
                    >
                      {(selectedProject as ProjectSubmission).course!.title}
                    </Button>
                  </div>
                )}
                
                {/* Mini Project Details */}
                {(selectedProject as ProjectSubmission).miniProject && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Project Requirements</h4>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-900 whitespace-pre-wrap">
                        {(selectedProject as ProjectSubmission).miniProject?.description || 
                         "No description provided."}
                      </p>
                    </div>
                    
                    {(selectedProject as ProjectSubmission).miniProject?.deliverables && (
                      <>
                        <h4 className="font-semibold">Deliverables</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {((selectedProject as ProjectSubmission).miniProject?.deliverables || []).map(
                            (item, idx) => (
                              <li key={idx} className="text-sm">{item}</li>
                            )
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                )}
                
                {/* Submission Info */}
                {(selectedProject as ProjectSubmission).submissionUrl && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Submission</h4>
                    <a 
                      href={(selectedProject as ProjectSubmission).submissionUrl!} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                    >
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 truncate">
                        {(selectedProject as ProjectSubmission).submissionUrl}
                      </span>
                    </a>
                  </div>
                )}
                
                {/* Feedback */}
                {(selectedProject as ProjectSubmission).feedback && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Instructor Feedback</h4>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-900 whitespace-pre-wrap">
                        {(selectedProject as ProjectSubmission).feedback}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Grade */}
                {(selectedProject as ProjectSubmission).grade && (
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600">Grade</p>
                      <p className="text-3xl font-bold text-green-700">
                        {(selectedProject as ProjectSubmission).grade}%
                      </p>
                    </div>
                    {(selectedProject as ProjectSubmission).gradedAt && (
                      <div className="ml-auto text-right">
                        <p className="text-xs text-green-600">Graded on</p>
                        <p className="text-sm text-green-700">
                          {new Date((selectedProject as ProjectSubmission).gradedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {!["SUBMITTED", "submitted", "UNDER_REVIEW", "REVISION_REQUIRED", "RESUBMITTED", "APPROVED", "REJECTED"].includes((selectedProject as ProjectSubmission).status || "") && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setDetailsDialogOpen(false)
                      openSubmitDialog(selectedProject as ProjectSubmission)
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Project
                  </Button>
                )}
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
