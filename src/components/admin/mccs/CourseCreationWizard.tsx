"use client"

import { useState, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  basicInfoSchema,
  brandingMediaSchema,
  learningInfoSchema,
  prerequisitesSchema,
  pricingSchema,
  seoSchema,
  publishingSchema,
} from "@/lib/validations/mccs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  Loader2,
  BookOpen,
  Image,
  Target,
  Lock,
  DollarSign,
  Search,
  Eye,
  Layers,
  Edit2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import toast from "react-hot-toast"

// Step definitions
const WIZARD_STEPS = [
  { id: "basic", title: "Basic Info", icon: BookOpen },
  { id: "branding", title: "Branding & Media", icon: Image },
  { id: "learning", title: "Learning Info", icon: Target },
  { id: "prerequisites", title: "Prerequisites", icon: Lock },
  { id: "curriculum", title: "Curriculum", icon: Layers },
  { id: "pricing", title: "Pricing", icon: DollarSign },
  { id: "seo", title: "SEO", icon: Search },
  { id: "publishing", title: "Publishing", icon: Eye },
]

// Combined schema
const courseFormSchema = basicInfoSchema
  .merge(brandingMediaSchema)
  .merge(learningInfoSchema)
  .merge(prerequisitesSchema)
  .merge(pricingSchema)
  .merge(seoSchema)
  .merge(publishingSchema)

type CourseFormData = z.infer<typeof courseFormSchema>

interface WizardModule {
  id?: string
  title: string
  description?: string
  orderIndex: number
  isPreview: boolean
  lessons: WizardLesson[]
  isExpanded?: boolean
  isEditing?: boolean
}

interface WizardLesson {
  id?: string
  title: string
  description?: string
  orderIndex: number
  lessonType: "VIDEO" | "TEXT" | "QUIZ" | "EXERCISE" | "LIVE" | "RESOURCE"
  videoUrl?: string
  videoDuration?: number
  isPreview: boolean
  isFree: boolean
  isActive: boolean
  content?: string
  isEditing?: boolean
}

interface CourseCreationWizardProps {
  courseId?: string
  initialData?: Partial<CourseFormData>
  modules?: WizardModule[]
  categories: { id: string; name: string }[]
  difficultyLevels: { id: string; name: string; categoryId?: string }[]
  prerequisites: { id: string; title: string }[]
  onSave: () => void
  onCancel: () => void
}

export function CourseCreationWizard({
  courseId,
  initialData,
  modules: initialModules = [],
  categories,
  difficultyLevels,
  prerequisites,
  onSave,
  onCancel,
}: CourseCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [modules, setModules] = useState<WizardModule[]>(initialModules)
  const [saving, setSaving] = useState(false)

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      categoryId: initialData?.categoryId || "",
      difficultyLevelId: initialData?.difficultyLevelId || null,
      shortDescription: initialData?.shortDescription || "",
      fullDescription: initialData?.fullDescription || "",
      targetAudience: initialData?.targetAudience || "",
      language: initialData?.language || "English",
      durationHours: initialData?.durationHours || 0,
      thumbnailUrl: initialData?.thumbnailUrl || null,
      introVideoUrl: initialData?.introVideoUrl || null,
      promoVideoUrl: initialData?.promoVideoUrl || null,
      trailerVideoUrl: initialData?.trailerVideoUrl || null,
      isFree: initialData?.isFree ?? true,
      price: initialData?.price || 0,
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      keywords: initialData?.keywords || [],
      status: initialData?.status || "DRAFT",
      isActive: initialData?.isActive ?? true,
    },
  })

  useEffect(() => {
    const title = form.watch("title")
    if (title && !form.getValues("slug")) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
      form.setValue("slug", slug)
    }
  }, [form.watch("title")])

  const goToNextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const addModule = () => {
    const newModule: WizardModule = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      orderIndex: modules.length,
      isPreview: false,
      lessons: [],
      isExpanded: true,
      isEditing: true,
    }
    setModules([...modules, newModule])
  }

  const updateModule = (index: number, updates: Partial<WizardModule>) => {
    const newModules = [...modules]
    newModules[index] = { ...newModules[index], ...updates }
    setModules(newModules)
  }

  const deleteModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index).map((m, i) => ({ ...m, orderIndex: i })))
  }

  const addLesson = (moduleIndex: number) => {
    const module = modules[moduleIndex]
    const newLesson: WizardLesson = {
      id: `temp-lesson-${Date.now()}`,
      title: "",
      orderIndex: module.lessons.length,
      lessonType: "VIDEO",
      isPreview: false,
      isFree: false,
      isActive: true,
      isEditing: true,
    }
    const newModules = [...modules]
    newModules[moduleIndex].lessons.push(newLesson)
    setModules(newModules)
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: Partial<WizardLesson>) => {
    const newModules = [...modules]
    newModules[moduleIndex].lessons[lessonIndex] = {
      ...newModules[moduleIndex].lessons[lessonIndex],
      ...updates,
    }
    setModules(newModules)
  }

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules]
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    )
    newModules[moduleIndex].lessons.forEach((l, i) => (l.orderIndex = i))
    setModules(newModules)
  }

  const onSubmit = async (data: CourseFormData) => {
    setSaving(true)
    try {
      const courseData = {
        ...data,
        modules: modules.map((m) => ({
          title: m.title,
          description: m.description,
          orderIndex: m.orderIndex,
          isPreview: m.isPreview,
          lessons: m.lessons.map((l) => ({
            title: l.title,
            description: l.description,
            orderIndex: l.orderIndex,
            lessonType: l.lessonType,
            videoUrl: l.videoUrl,
            videoDuration: l.videoDuration,
            isPreview: l.isPreview,
            isFree: l.isFree,
            isActive: l.isActive,
            content: l.content,
          })),
        })),
      }

      const url = courseId ? `/api/mccs/courses/${courseId}` : "/api/mccs/courses"
      const method = courseId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "full", data: courseData }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to save course")
      }

      toast.success(courseId ? "Course updated successfully" : "Course created successfully")
      onSave()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save course")
    } finally {
      setSaving(false)
    }
  }

  const filteredDifficultyLevels = difficultyLevels.filter(
    (dl) => !dl.categoryId || dl.categoryId === form.watch("categoryId")
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {courseId ? "Edit Course" : "Create New Course"}
              </h1>
            </div>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {courseId ? "Update Course" : "Create Course"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`flex flex-col items-center gap-2 ${
                  index <= currentStep ? "text-purple-600 dark:text-purple-400" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    index < currentStep
                      ? "bg-purple-600 border-purple-600 text-white"
                      : index === currentStep
                      ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-full bg-purple-600 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = WIZARD_STEPS[currentStep].icon
                  return <StepIcon className="h-5 w-5" />
                })()}
                {WIZARD_STEPS[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Title *</label>
                      <Input {...form.register("title")} placeholder="Enter course title" className="dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL Slug *</label>
                      <Input {...form.register("slug")} placeholder="course-url-slug" className="dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                      <Select value={form.watch("categoryId")} onValueChange={(value) => form.setValue("categoryId", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty Level</label>
                      <Select value={form.watch("difficultyLevelId") || ""} onValueChange={(value) => form.setValue("difficultyLevelId", value || null)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredDifficultyLevels.map((dl) => (
                            <SelectItem key={dl.id} value={dl.id}>{dl.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
                    <Textarea {...form.register("shortDescription")} placeholder="Brief description" rows={3} className="dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Description</label>
                    <Textarea {...form.register("fullDescription")} placeholder="Detailed description" rows={6} className="dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail Image URL</label>
                    <Input {...form.register("thumbnailUrl")} placeholder="https://example.com/thumbnail.jpg" className="dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Intro Video URL</label>
                    <Input {...form.register("introVideoUrl")} placeholder="https://youtube.com/watch?v=..." className="dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Outcomes</label>
                    <p className="text-sm text-gray-500">What will students be able to do after completing this course?</p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Prerequisites</label>
                    <p className="text-sm text-gray-500">Select courses that should be completed before this one.</p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Course Modules & Lessons</h3>
                    </div>
                    <Button type="button" onClick={addModule} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {modules.map((module, moduleIndex) => (
                      <div key={module.id || moduleIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                          <div className="flex-1">
                            {module.isEditing ? (
                              <Input value={module.title} onChange={(e) => updateModule(moduleIndex, { title: e.target.value })} placeholder="Module title" className="dark:bg-gray-700 dark:border-gray-600" />
                            ) : (
                              <h4 className="font-medium text-gray-900 dark:text-white">{module.title}</h4>
                            )}
                          </div>
                          <Badge variant="outline">{module.lessons.length} lessons</Badge>
                          <Button type="button" variant="ghost" size="sm" onClick={() => updateModule(moduleIndex, { isEditing: !module.isEditing })}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => deleteModule(moduleIndex)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="p-4 space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id || lessonIndex} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{lesson.title || "Untitled Lesson"}</span>
                              <Badge variant="secondary" className="text-xs">{lesson.lessonType}</Badge>
                              <Button type="button" variant="ghost" size="sm" onClick={() => deleteLesson(moduleIndex, lessonIndex)}>
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          <Button type="button" variant="ghost" size="sm" onClick={() => addLesson(moduleIndex)} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...form.register("isFree")} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This course is free</span>
                    </label>
                  </div>
                  {!form.watch("isFree") && (
                    <div className="space-y-2 max-w-xs">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price (USD)</label>
                      <Input type="number" step="0.01" min="0" {...form.register("price")} className="dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                  )}
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</label>
                    <Input {...form.register("metaTitle")} placeholder="SEO-optimized title" maxLength={70} className="dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                    <Textarea {...form.register("metaDescription")} placeholder="SEO-optimized description" rows={3} maxLength={160} className="dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Status</label>
                    <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "ARCHIVED")}>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft - Not visible to students</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review - Pending approval</SelectItem>
                        <SelectItem value="PUBLISHED">Published - Visible to students</SelectItem>
                        <SelectItem value="ARCHIVED">Archived - Hidden from marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mt-6">
            <Button type="button" variant="outline" onClick={goToPrevStep} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep < WIZARD_STEPS.length - 1 ? (
              <Button type="button" onClick={goToNextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Check className="h-4 w-4 mr-2" />{courseId ? "Update Course" : "Create Course"}</>}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CourseCreationWizard
