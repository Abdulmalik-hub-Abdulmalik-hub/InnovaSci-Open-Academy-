"use client"

import { useState, useEffect } from "react"

interface Lesson {
  id?: string
  title: string
  description: string
  orderIndex: number
  lessonType: string
  duration: number | null
  videoUrl: string
  isPreview: boolean
  isFree: boolean
  isExercise: boolean
  exerciseDescription: string
  exerciseFilesUrl: string
  solutionVideoUrl: string
}

interface Module {
  id?: string
  title: string
  description: string
  orderIndex: number
  lessons: Lesson[]
}

interface LessonEditorProps {
  courseId: string
  initialModules?: Module[]
  onSave?: (modules: Module[]) => void
}

export default function LessonEditor({ courseId, initialModules = [], onSave }: LessonEditorProps) {
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  useEffect(() => {
    if (courseId && initialModules.length === 0) {
      fetchModules()
    } else {
      setModules(initialModules)
      setLoading(false)
    }
  }, [courseId])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/modules?courseId=${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setModules(data.data.modules.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description || "",
          orderIndex: m.orderIndex,
          lessons: m.lessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            description: l.description || "",
            orderIndex: l.orderIndex,
            lessonType: l.lessonType,
            duration: l.duration,
            videoUrl: l.videoUrl || "",
            isPreview: l.isPreview,
            isFree: l.isFree,
            isExercise: l.isExercise,
            exerciseDescription: l.exerciseDescription || "",
            exerciseFilesUrl: l.exerciseFilesUrl || "",
            solutionVideoUrl: l.solutionVideoUrl || ""
          }))
        })))
      }
    } catch (err) {
      setError("Failed to fetch modules")
    } finally {
      setLoading(false)
    }
  }

  const handleAddModule = () => {
    const newModule: Module = {
      title: "",
      description: "",
      orderIndex: modules.length,
      lessons: []
    }
    setModules([...modules, newModule])
    setExpandedModule(`new-${modules.length}`)
  }

  const handleDeleteModule = async (index: number) => {
    const module = modules[index]
    if (!confirm("Are you sure you want to delete this module and all its lessons?")) return

    if (module.id) {
      try {
        const response = await fetch(`/api/admin/modules/${module.id}`, {
          method: "DELETE"
        })
        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Failed to delete module")
          return
        }
      } catch (err) {
        setError("Failed to delete module")
        return
      }
    }

    setModules(modules.filter((_, i) => i !== index))
    updateModuleOrders()
  }

  const handleAddLesson = (moduleIndex: number) => {
    const newLesson: Lesson = {
      title: "",
      description: "",
      orderIndex: modules[moduleIndex].lessons.length,
      lessonType: "video",
      duration: null,
      videoUrl: "",
      isPreview: false,
      isFree: false,
      isExercise: false,
      exerciseDescription: "",
      exerciseFilesUrl: "",
      solutionVideoUrl: ""
    }
    
    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons.push(newLesson)
    setModules(updatedModules)
  }

  const handleDeleteLesson = async (moduleIndex: number, lessonIndex: number) => {
    const lesson = modules[moduleIndex].lessons[lessonIndex]
    if (lesson.id) {
      try {
        const response = await fetch(`/api/admin/lessons/${lesson.id}`, {
          method: "DELETE"
        })
        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Failed to delete lesson")
          return
        }
      } catch (err) {
        setError("Failed to delete lesson")
        return
      }
    }

    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons.splice(lessonIndex, 1)
    setModules(updatedModules)
    updateLessonOrders(moduleIndex)
  }

  const updateModule = (index: number, field: keyof Module, value: any) => {
    const updatedModules = [...modules]
    ;(updatedModules[index] as any)[field] = value
    setModules(updatedModules)
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    const updatedModules = [...modules]
    ;(updatedModules[moduleIndex].lessons[lessonIndex] as any)[field] = value
    setModules(updatedModules)
  }

  const updateModuleOrders = () => {
    const updatedModules = modules.map((m, i) => ({ ...m, orderIndex: i }))
    setModules(updatedModules)
  }

  const updateLessonOrders = (moduleIndex: number) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.map((l, i) => ({
      ...l,
      orderIndex: i
    }))
    setModules(updatedModules)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validate
      for (const module of modules) {
        if (!module.title.trim()) {
          setError("All modules must have a title")
          return
        }
        for (const lesson of module.lessons) {
          if (!lesson.title.trim()) {
            setError("All lessons must have a title")
            return
          }
          if (lesson.lessonType === "video" && !lesson.videoUrl) {
            setError("Video lessons must have a video URL")
            return
          }
        }
      }

      // Save each module
      for (const module of modules) {
        const moduleData = {
          courseId,
          title: module.title,
          description: module.description,
          orderIndex: module.orderIndex,
          lessons: module.lessons.map((l, i) => ({
            ...l,
            orderIndex: i
          }))
        }

        let response
        if (module.id) {
          response = await fetch(`/api/admin/modules/${module.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(moduleData)
          })
        } else {
          response = await fetch("/api/admin/modules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(moduleData)
          })
        }

        const data = await response.json()
        if (!data.success) {
          setError(data.error || "Failed to save module")
          return
        }
      }

      onSave?.(modules)
      await fetchModules()
    } catch (err) {
      setError("Failed to save modules")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Content</h3>
        <div className="flex gap-2">
          <button
            onClick={fetchModules}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Refresh
          </button>
          <button
            onClick={handleAddModule}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Module
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {modules.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No modules yet. Add your first module to start building your course content.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <div key={`module-${moduleIndex}`} className="bg-white border rounded-lg overflow-hidden">
              {/* Module Header */}
              <div 
                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedModule(expandedModule === module.id || expandedModule === `new-${moduleIndex}` ? null : module.id || `new-${moduleIndex}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                  <span className="font-medium">
                    Module {moduleIndex + 1}: {module.title || "Untitled Module"}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"})
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteModule(moduleIndex)
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>

              {/* Module Content */}
              {expandedModule === module.id || expandedModule === `new-${moduleIndex}` ? (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Module Title *
                      </label>
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => updateModule(moduleIndex, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Getting Started"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={module.description}
                        onChange={(e) => updateModule(moduleIndex, "description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                        placeholder="Optional module description..."
                      />
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-800">Lessons</h4>
                      <button
                        onClick={() => handleAddLesson(moduleIndex)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        + Add Lesson
                      </button>
                    </div>

                    {module.lessons.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No lessons yet. Add your first lesson.</p>
                    ) : (
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <LessonForm
                            key={`lesson-${moduleIndex}-${lessonIndex}`}
                            lesson={lesson}
                            onChange={(field, value) => updateLesson(moduleIndex, lessonIndex, field, value)}
                            onDelete={() => handleDeleteLesson(moduleIndex, lessonIndex)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {modules.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      )}
    </div>
  )
}

interface LessonFormProps {
  lesson: Lesson
  onChange: (field: keyof Lesson, value: any) => void
  onDelete: () => void
}

function LessonForm({ lesson, onChange, onDelete }: LessonFormProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="bg-white p-3 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
          <span className="text-sm">
            {lesson.title || "Untitled Lesson"}
            {lesson.lessonType === "exercise" && (
              <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Exercise</span>
            )}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      </div>

      {expanded && (
        <div className="p-4 bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Title *
              </label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => onChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Introduction to Variables"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Type
              </label>
              <select
                value={lesson.lessonType}
                onChange={(e) => onChange("lessonType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="exercise">Exercise/Project</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={lesson.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={2}
            />
          </div>

          {lesson.lessonType === "video" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL *
              </label>
              <input
                type="url"
                value={lesson.videoUrl}
                onChange={(e) => onChange("videoUrl", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={lesson.duration || ""}
                onChange={(e) => onChange("duration", e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="300"
              />
            </div>

            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lesson.isPreview}
                  onChange={(e) => onChange("isPreview", e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Preview</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lesson.isFree}
                  onChange={(e) => onChange("isFree", e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Free</span>
              </label>
            </div>
          </div>

          {/* Exercise Fields */}
          {lesson.lessonType === "exercise" && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-900">Exercise Settings</h5>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Description
                </label>
                <textarea
                  value={lesson.exerciseDescription}
                  onChange={(e) => onChange("exerciseDescription", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Describe what students need to build..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starter Files URL
                  </label>
                  <input
                    type="url"
                    value={lesson.exerciseFilesUrl}
                    onChange={(e) => onChange("exerciseFilesUrl", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solution Video URL
                  </label>
                  <input
                    type="url"
                    value={lesson.solutionVideoUrl}
                    onChange={(e) => onChange("solutionVideoUrl", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
