"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Edit,
  Video,
  FileText,
  CheckCircle,
  Loader2,
  GraduationCap,
  Layers,
  BookOpen,
  Save,
  X,
  ChevronUp,
  MoreVertical,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

// Types
interface Lesson {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonType: string
  duration: number | null
  videoUrl: string | null
  isPreview: boolean
  isExercise: boolean
  exerciseDescription: string | null
  exerciseFilesUrl: string | null
  solutionVideoUrl: string | null
}

interface Module {
  id: string
  title: string
  description: string | null
  orderIndex: number
  lessonsCount: number
  lessons: Lesson[]
  isExpanded?: boolean
}

interface Course {
  id: string
  title: string
  slug: string
}

const lessonTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4 text-blue-400" />,
  reading: <FileText className="h-4 w-4 text-green-400" />,
  exercise: <CheckCircle className="h-4 w-4 text-purple-400" />,
}

const lessonTypeColors: Record<string, string> = {
  video: "bg-blue-500/10 border-blue-500/30",
  reading: "bg-green-500/10 border-green-500/30",
  exercise: "bg-purple-500/10 border-purple-500/30",
}

export default function CurriculumBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Module modal state
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" })

  // Lesson modal state
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    lessonType: "video",
    duration: "",
    videoUrl: "",
    isPreview: false,
    isExercise: false,
    exerciseDescription: "",
    exerciseFilesUrl: "",
    solutionVideoUrl: "",
  })

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Fetch course and modules
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`)
      const result = await response.json()

      if (result.success) {
        setCourse({ id: courseId, title: result.data.courseTitle, slug: "" })
        setModules(result.data.modules || [])
        // Auto-expand first module if none are expanded
        if (result.data.modules?.length > 0 && expandedModules.size === 0) {
          setExpandedModules(new Set([result.data.modules[0].id]))
        }
      } else {
        toast.error(result.error || "Failed to fetch course data")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load curriculum")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  // Module CRUD
  const openAddModule = () => {
    setEditingModule(null)
    setModuleForm({ title: "", description: "" })
    setShowModuleModal(true)
  }

  const openEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleForm({ title: module.title, description: module.description || "" })
    setShowModuleModal(true)
  }

  const handleSaveModule = async () => {
    if (!moduleForm.title.trim()) {
      toast.error("Module title is required")
      return
    }

    setSaving(true)
    try {
      if (editingModule) {
        // Update module
        const response = await fetch(`/api/admin/courses/${courseId}/modules/${editingModule.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: moduleForm.title.trim(),
            description: moduleForm.description.trim(),
          }),
        })
        const result = await response.json()
        if (!result.success) {
          toast.error(result.error || "Failed to update module")
          return
        }
        toast.success("Module updated")
      } else {
        // Create module
        const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: moduleForm.title.trim(),
            description: moduleForm.description.trim(),
          }),
        })
        const result = await response.json()
        if (!result.success) {
          toast.error(result.error || "Failed to create module")
          return
        }
        toast.success("Module created")
      }
      setShowModuleModal(false)
      fetchData()
    } catch (error) {
      console.error("Error saving module:", error)
      toast.error("Failed to save module")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module and all its lessons?")) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!result.success) {
        toast.error(result.error || "Failed to delete module")
        return
      }
      toast.success("Module deleted")
      fetchData()
    } catch (error) {
      console.error("Error deleting module:", error)
      toast.error("Failed to delete module")
    } finally {
      setSaving(false)
    }
  }

  // Lesson CRUD
  const openAddLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    setEditingLesson(null)
    setLessonForm({
      title: "",
      description: "",
      lessonType: "video",
      duration: "",
      videoUrl: "",
      isPreview: false,
      isExercise: false,
      exerciseDescription: "",
      exerciseFilesUrl: "",
      solutionVideoUrl: "",
    })
    setShowLessonModal(true)
  }

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      lessonType: lesson.lessonType,
      duration: lesson.duration?.toString() || "",
      videoUrl: lesson.videoUrl || "",
      isPreview: lesson.isPreview,
      isExercise: lesson.isExercise,
      exerciseDescription: lesson.exerciseDescription || "",
      exerciseFilesUrl: lesson.exerciseFilesUrl || "",
      solutionVideoUrl: lesson.solutionVideoUrl || "",
    })
    setShowLessonModal(true)
  }

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) {
      toast.error("Lesson title is required")
      return
    }

    if (lessonForm.isExercise && !lessonForm.exerciseDescription.trim()) {
      toast.error("Exercise description is required for exercise lessons")
      return
    }

    setSaving(true)
    try {
      const endpoint = editingLesson
        ? `/api/admin/courses/${courseId}/modules/${editingLesson.id.replace(/^lesson-/, "")}/lessons/${editingLesson.id}`
        : `/api/admin/courses/${courseId}/modules/${selectedModuleId}/lessons`

      const method = editingLesson ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonForm.title.trim(),
          description: lessonForm.description.trim(),
          lessonType: lessonForm.lessonType,
          duration: lessonForm.duration ? parseInt(lessonForm.duration) : null,
          videoUrl: lessonForm.videoUrl.trim() || null,
          isPreview: lessonForm.isPreview,
          isExercise: lessonForm.isExercise,
          exerciseDescription: lessonForm.isExercise ? lessonForm.exerciseDescription.trim() : null,
          exerciseFilesUrl: lessonForm.isExercise ? lessonForm.exerciseFilesUrl.trim() || null : null,
          solutionVideoUrl: lessonForm.isExercise ? lessonForm.solutionVideoUrl.trim() || null : null,
        }),
      })

      const result = await response.json()
      if (!result.success) {
        toast.error(result.error || "Failed to save lesson")
        return
      }
      toast.success(editingLesson ? "Lesson updated" : "Lesson created")
      setShowLessonModal(false)
      fetchData()
    } catch (error) {
      console.error("Error saving lesson:", error)
      toast.error("Failed to save lesson")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    setSaving(true)
    try {
      // Find the module that contains this lesson
      const module = modules.find((m) =>
        m.lessons.some((l) => l.id === lessonId)
      )
      if (!module) return

      const response = await fetch(`/api/admin/courses/${courseId}/modules/${module.id}/lessons/${lessonId}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!result.success) {
        toast.error(result.error || "Failed to delete lesson")
        return
      }
      toast.success("Lesson deleted")
      fetchData()
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast.error("Failed to delete lesson")
    } finally {
      setSaving(false)
    }
  }

  // Reorder modules
  const moveModule = async (moduleId: string, direction: "up" | "down") => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const newIndex = direction === "up" ? moduleIndex - 1 : moduleIndex + 1
    if (newIndex < 0 || newIndex >= modules.length) return

    const newModules = [...modules]
    const [removed] = newModules.splice(moduleIndex, 1)
    newModules.splice(newIndex, 0, removed)

    setModules(newModules)

    // Save new order
    try {
      await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleIds: newModules.map((m) => m.id),
        }),
      })
      toast.success("Modules reordered")
    } catch (error) {
      console.error("Error reordering modules:", error)
      toast.error("Failed to reorder modules")
      fetchData() // Revert
    }
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/mccs/courses")}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={openAddModule}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </div>

        {/* Course Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Curriculum Builder</h1>
          </div>
          <div className="flex items-center gap-4 text-white/60">
            <p className="text-lg">{course?.title || "Loading..."}</p>
            <Badge className="bg-purple-500/20 text-purple-400">
              <Layers className="h-3 w-3 mr-1" />
              {modules.length} Modules
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400">
              <BookOpen className="h-3 w-3 mr-1" />
              {totalLessons} Lessons
            </Badge>
          </div>
        </div>

        {/* Curriculum */}
        <div className="space-y-4">
          {modules.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Layers className="h-16 w-16 text-white/30 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No modules yet</h3>
                <p className="text-white/60 mb-6 text-center max-w-md">
                  Start building your curriculum by adding modules. Each module can contain multiple lessons.
                </p>
                <Button onClick={openAddModule} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Module
                </Button>
              </CardContent>
            </Card>
          ) : (
            modules.map((module, index) => (
              <Card
                key={module.id}
                className={cn(
                  "bg-white/5 border-white/10 transition-all",
                  expandedModules.has(module.id) && "border-purple-500/30"
                )}
              >
                <CardHeader className="cursor-pointer" onClick={() => toggleModule(module.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-white/40 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveModule(module.id, "up")
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-white/40 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveModule(module.id, "down")
                          }}
                          disabled={index === modules.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <GripVertical className="h-5 w-5 text-white/30 cursor-grab" />
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-5 w-5 text-purple-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-white/50" />
                      )}
                    </div>
                    <div className="flex-1 ml-4">
                      <CardTitle className="text-white text-lg">{module.title}</CardTitle>
                      {module.description && (
                        <CardDescription className="text-white/50 line-clamp-1">
                          {module.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-white/20 text-white/60">
                        {module.lessonsCount} lessons
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModule(module)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteModule(module.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedModules.has(module.id) && (
                  <CardContent className="border-t border-white/10 pt-4">
                    {/* Lessons */}
                    <div className="space-y-2 mb-4">
                      {module.lessons.length === 0 ? (
                        <div className="text-center py-8 text-white/40">
                          <p>No lessons in this module yet</p>
                        </div>
                      ) : (
                        module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all",
                              lessonTypeColors[lesson.lessonType] || "bg-white/5 border-white/10"
                            )}
                          >
                            <GripVertical className="h-4 w-4 text-white/30 cursor-grab" />
                            {lessonTypeIcons[lesson.lessonType]}
                            <div className="flex-1">
                              <p className="text-white font-medium">{lesson.title}</p>
                              {lesson.description && (
                                <p className="text-white/50 text-sm line-clamp-1">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {lesson.isPreview && (
                                <Badge className="bg-green-500/20 text-green-400 text-xs">
                                  Preview
                                </Badge>
                              )}
                              {lesson.duration && (
                                <span className="text-white/40 text-sm">
                                  {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, "0")}
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/60 hover:text-white"
                                onClick={() => openEditLesson(lesson)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Lesson Button */}
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40"
                      onClick={() => openAddLesson(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Module Modal */}
        <Dialog open={showModuleModal} onOpenChange={setShowModuleModal}>
          <DialogContent className="bg-[#1a1a2e] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingModule ? "Edit Module" : "Add Module"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Module Title *</Label>
                <Input
                  id="module-title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g., Introduction to Python"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description">Description</Label>
                <Textarea
                  id="module-description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Optional module description..."
                  rows={3}
                  className="bg-white/5 border-white/10 text-white resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModuleModal(false)} className="border-white/20 text-white">
                Cancel
              </Button>
              <Button onClick={handleSaveModule} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingModule ? "Update Module" : "Create Module"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lesson Modal */}
        <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
          <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLesson ? "Edit Lesson" : "Add Lesson"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title *</Label>
                <Input
                  id="lesson-title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="e.g., Variables and Data Types"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-description">Description</Label>
                <Textarea
                  id="lesson-description"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="Optional lesson description..."
                  rows={2}
                  className="bg-white/5 border-white/10 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-type">Lesson Type</Label>
                  <Select
                    value={lessonForm.lessonType}
                    onValueChange={(value) => setLessonForm({ ...lessonForm, lessonType: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-duration">Duration (seconds)</Label>
                  <Input
                    id="lesson-duration"
                    type="number"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    placeholder="e.g., 300"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-video">Video URL</Label>
                <Input
                  id="lesson-video"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLessonForm({ ...lessonForm, isPreview: !lessonForm.isPreview })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    lessonForm.isPreview ? "bg-green-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      lessonForm.isPreview ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-white">Free Preview</span>
              </div>

              {lessonForm.lessonType === "exercise" && (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLessonForm({ ...lessonForm, isExercise: !lessonForm.isExercise })}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        lessonForm.isExercise ? "bg-purple-500" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          lessonForm.isExercise ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-white">Mark as Exercise</span>
                  </div>

                  {lessonForm.isExercise && (
                    <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                      <div className="space-y-2">
                        <Label htmlFor="exercise-description">Exercise Description *</Label>
                        <Textarea
                          id="exercise-description"
                          value={lessonForm.exerciseDescription}
                          onChange={(e) => setLessonForm({ ...lessonForm, exerciseDescription: e.target.value })}
                          placeholder="Describe the exercise task..."
                          rows={4}
                          className="bg-white/5 border-white/10 text-white resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exercise-files">Starter Files URL</Label>
                        <Input
                          id="exercise-files"
                          value={lessonForm.exerciseFilesUrl}
                          onChange={(e) => setLessonForm({ ...lessonForm, exerciseFilesUrl: e.target.value })}
                          placeholder="https://..."
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="solution-video">Solution Video URL</Label>
                        <Input
                          id="solution-video"
                          value={lessonForm.solutionVideoUrl}
                          onChange={(e) => setLessonForm({ ...lessonForm, solutionVideoUrl: e.target.value })}
                          placeholder="https://..."
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLessonModal(false)} className="border-white/20 text-white">
                Cancel
              </Button>
              <Button onClick={handleSaveLesson} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingLesson ? "Update Lesson" : "Add Lesson"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
