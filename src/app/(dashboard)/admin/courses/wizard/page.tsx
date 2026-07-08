"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Loader2,
  GraduationCap,
  Save,
  Plus,
  Trash2,
  FileText,
  Image,
  DollarSign,
  Search,
  BarChart,
  Settings2,
  BookOpen,
  Award,
  Layers,
  AlertCircle,
  X,
  Check,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

// MCCS Course Creation Schema with Zod
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().min(3, "Slug must be at least 3 characters").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  categoryId: z.string().min(1, "Category is required"),
  difficultyLevel: z.string().min(1, "Difficulty level is required"),
  language: z.string().default("English"),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  promoVideoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  introVideoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters").max(300),
  fullDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  software: z.array(z.object({
    name: z.string().min(1),
    version: z.string().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
    isRequired: z.boolean().default(true),
  })).optional(),
  datasets: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    sourceUrl: z.string().optional(),
    fileUrl: z.string().optional(),
    isDownloadable: z.boolean().default(false),
  })).optional(),
  careerOutcomes: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
  })).optional(),
  resources: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    type: z.string().default("link"),
    url: z.string().min(1),
    isDownloadable: z.boolean().default(true),
  })).optional(),
  isFree: z.boolean().default(true),
  price: z.number().min(0).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "UNDER_REVIEW", "PUBLISHED"]).default("DRAFT"),
  isActive: z.boolean().default(true),
  durationHours: z.number().min(0).optional(),
  instructorId: z.string().optional(),
})

type CourseFormData = z.infer<typeof courseSchema>

interface Category {
  id: string
  name: string
  slug: string
}

interface Instructor {
  id: string
  name: string
  title: string | null
  avatarUrl: string | null
}

const tabs = [
  { id: "basic", label: "Basic", icon: FileText },
  { id: "media", label: "Media", icon: Image },
  { id: "description", label: "Info", icon: BookOpen },
  { id: "outcomes", label: "Outcomes", icon: Award },
  { id: "requirements", label: "Requirements", icon: Settings2 },
  { id: "software", label: "Software", icon: Settings2 },
  { id: "careers", label: "Careers", icon: BarChart },
  { id: "resources", label: "Resources", icon: FileText },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "seo", label: "SEO", icon: Search },
  { id: "curriculum", label: "Curriculum", icon: Layers },
  { id: "publish", label: "Publish", icon: Check },
]

export default function CourseWizardPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.courseId as string | undefined
  const isEditing = !!courseId

  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditing)
  const [categories, setCategories] = useState<Category[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      language: "English",
      isFree: true,
      status: "DRAFT",
      isActive: true,
      whatYouWillLearn: [],
      objectives: [],
      requirements: [],
      software: [],
      datasets: [],
      careerOutcomes: [],
      resources: [],
      keywords: [],
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whatYouWillLearnField = useFieldArray({ control: control as any, name: "whatYouWillLearn" })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objectivesField = useFieldArray({ control: control as any, name: "objectives" })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requirementsField = useFieldArray({ control: control as any, name: "requirements" })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const softwareField = useFieldArray({ control: control as any, name: "software" })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datasetsField = useFieldArray({ control: control as any, name: "datasets" })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const careerOutcomesField = useFieldArray({ control: control as any, name: "careerOutcomes" })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resourcesField = useFieldArray({ control: control as any, name: "resources" })

  const watchedValues = watch()
  const isFree = watch("isFree")

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/mccs/categories")
      const result = await response.json()
      if (result.success) {
        setCategories(result.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [])

  const fetchInstructors = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/instructors")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setInstructors(result.data || [])
        }
      }
    } catch (error) {
      console.error("Error fetching instructors:", error)
    }
  }, [])

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return
    setInitialLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`)
      const result = await response.json()
      if (result.success) {
        const course = result.data.course
        reset({
          title: course.title,
          slug: course.slug,
          categoryId: course.categoryId,
          difficultyLevel: course.difficultyLevel,
          language: course.language || "English",
          thumbnailUrl: course.thumbnailUrl || "",
          promoVideoUrl: course.promoVideoUrl || "",
          introVideoUrl: course.introVideoUrl || "",
          shortDescription: course.shortDescription || "",
          fullDescription: course.fullDescription || "",
          targetAudience: course.targetAudience || "",
          isFree: course.isFree,
          price: course.price,
          status: course.status,
          isActive: course.isActive,
          durationHours: course.durationHours,
          instructorId: course.instructorId,
          whatYouWillLearn: course.whatYouWillLearn || [],
          requirements: course.requirements || [],
        })
      }
    } catch (error) {
      console.error("Error fetching course data:", error)
      toast.error("Failed to load course data")
    } finally {
      setInitialLoading(false)
    }
  }, [courseId, reset])

  useEffect(() => {
    fetchCategories()
    fetchInstructors()
    if (isEditing) {
      fetchCourseData()
    }
  }, [fetchCategories, fetchInstructors, isEditing, fetchCourseData])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setValue("title", title)
    if (!watchedValues.slug || watchedValues.slug === generateSlug(watchedValues.title || "")) {
      setValue("slug", generateSlug(title))
    }
  }

  const onSubmit = async (data: CourseFormData) => {
    setLoading(true)
    try {
      const url = isEditing ? `/api/admin/courses/${courseId}` : "/api/mccs/courses"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!result.success) {
        toast.error(result.error || "Failed to save course")
        return
      }

      const savedCourseId = result.data?.course?.id || courseId
      toast.success(isEditing ? "Course updated!" : "Course created!")
      
      if (!isEditing && savedCourseId) {
        router.push(`/admin/courses/${savedCourseId}/curriculum`)
      } else {
        router.push("/admin/mccs/courses")
      }
    } catch (error) {
      console.error("Error saving course:", error)
      toast.error("Failed to save course")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/mccs/courses")}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? "Save Changes" : "Create Course"}
          </Button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-400" />
            {isEditing ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-white/60 mt-2">
            Master Course Creation System - Fill in all sections
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border-white/10 grid grid-cols-4 lg:grid-cols-12 gap-1 p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "data-[state=active]:bg-purple-600 data-[state=active]:text-white",
                  "text-white/60 hover:text-white text-xs"
                )}
              >
                <tab.icon className="h-4 w-4 mr-1" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    onChange={handleTitleChange}
                    placeholder="e.g., Introduction to Machine Learning"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm">/courses/</span>
                    <Input
                      id="slug"
                      {...register("slug")}
                      placeholder="introduction-to-ml"
                      className={errors.slug ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={watchedValues.categoryId} onValueChange={(v) => setValue("categoryId", v)}>
                      <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty Level *</Label>
                    <Select value={watchedValues.difficultyLevel} onValueChange={(v) => setValue("difficultyLevel", v)}>
                      <SelectTrigger className={errors.difficultyLevel ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.difficultyLevel && <p className="text-red-500 text-sm">{errors.difficultyLevel.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={watchedValues.language} onValueChange={(v) => setValue("language", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (hours)</Label>
                    <Input type="number" min="0" {...register("durationHours", { valueAsNumber: true })} placeholder="20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="h-5 w-5 text-purple-400" />
                  Media & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input id="thumbnailUrl" {...register("thumbnailUrl")} placeholder="https://..." />
                  {watchedValues.thumbnailUrl && (
                    <img src={watchedValues.thumbnailUrl} alt="Preview" className="w-full max-w-sm rounded-lg border border-white/10 mt-2" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promoVideoUrl">Promo Video URL</Label>
                  <Input id="promoVideoUrl" {...register("promoVideoUrl")} placeholder="https://youtube.com/..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="introVideoUrl">Intro Video URL</Label>
                  <Input id="introVideoUrl" {...register("introVideoUrl")} placeholder="https://youtube.com/..." />
                  <p className="text-white/50 text-sm">Shown on course landing page</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Description */}
          <TabsContent value="description" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  Course Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea id="shortDescription" {...register("shortDescription")} rows={3} placeholder="Brief summary (max 300 chars)" className={errors.shortDescription ? "border-red-500" : ""} />
                  <p className="text-white/50 text-sm">{(watchedValues.shortDescription || "").length}/300</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Full Description</Label>
                  <Textarea id="fullDescription" {...register("fullDescription")} rows={6} placeholder="Detailed description..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea id="targetAudience" {...register("targetAudience")} rows={2} placeholder="Who is this course for?" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outcomes */}
          <TabsContent value="outcomes" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Learning Outcomes & Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>What You Will Learn</Label>
                  {whatYouWillLearnField.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input {...register(`whatYouWillLearn.${index}`)} placeholder="Key takeaway..." className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => whatYouWillLearnField.remove(index)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => whatYouWillLearnField.append("")}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>

                <div className="space-y-2">
                  <Label>Course Objectives</Label>
                  {objectivesField.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input {...register(`objectives.${index}`)} placeholder="Objective..." className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => objectivesField.remove(index)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => objectivesField.append("")}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requirements */}
          <TabsContent value="requirements" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-purple-400" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Requirements</Label>
                  {requirementsField.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input {...register(`requirements.${index}`)} placeholder="Requirement..." className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => requirementsField.remove(index)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => requirementsField.append("")}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Software */}
          <TabsContent value="software" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-purple-400" />
                  Software & Datasets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Required Software</Label>
                  {softwareField.fields.map((field, index) => (
                    <div key={field.id} className="space-y-2 p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Input {...register(`software.${index}.name`)} placeholder="Software name" className="flex-1" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => softwareField.remove(index)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input {...register(`software.${index}.version`)} placeholder="Version" />
                        <Input {...register(`software.${index}.url`)} placeholder="Download URL" />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => softwareField.append({ name: "", version: "", url: "", description: "", isRequired: true })}><Plus className="h-4 w-4 mr-1" /> Add Software</Button>
                </div>

                <div className="space-y-2">
                  <Label>Datasets</Label>
                  {datasetsField.fields.map((field, index) => (
                    <div key={field.id} className="space-y-2 p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Input {...register(`datasets.${index}.name`)} placeholder="Dataset name" className="flex-1" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => datasetsField.remove(index)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input {...register(`datasets.${index}.sourceUrl`)} placeholder="Source URL" />
                        <Input {...register(`datasets.${index}.fileUrl`)} placeholder="File URL" />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => datasetsField.append({ name: "", description: "", sourceUrl: "", fileUrl: "", isDownloadable: false })}><Plus className="h-4 w-4 mr-1" /> Add Dataset</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Careers */}
          <TabsContent value="careers" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-400" />
                  Career Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {careerOutcomesField.fields.map((field, index) => (
                  <div key={field.id} className="space-y-2 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Input {...register(`careerOutcomes.${index}.title`)} placeholder="Job title or career outcome" className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => careerOutcomesField.remove(index)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <Textarea {...register(`careerOutcomes.${index}.description`)} placeholder="Description (optional)" rows={2} />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => careerOutcomesField.append({ title: "", description: "", icon: "" })}><Plus className="h-4 w-4 mr-1" /> Add Career Outcome</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {resourcesField.fields.map((field, index) => (
                  <div key={field.id} className="space-y-2 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Input {...register(`resources.${index}.title`)} placeholder="Resource title" className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => resourcesField.remove(index)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input {...register(`resources.${index}.url`)} placeholder="URL" />
                      <Select {...register(`resources.${index}.type`)} defaultValue="link">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="download">Download</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => resourcesField.append({ title: "", description: "", type: "link", url: "", isDownloadable: true })}><Plus className="h-4 w-4 mr-1" /> Add Resource</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setValue("isFree", !isFree)} className={cn("relative inline-flex h-8 w-14 items-center rounded-full transition-colors", isFree ? "bg-green-500" : "bg-white/20")}>
                    <span className={cn("inline-block h-6 w-6 transform rounded-full bg-white transition-transform", isFree ? "translate-x-7" : "translate-x-1")} />
                  </button>
                  <span className="text-white font-medium">{isFree ? "Free Course" : "Paid Course"}</span>
                </div>

                {!isFree && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD)</Label>
                      <Input id="price" type="number" min="0" step="0.01" {...register("price", { valueAsNumber: true })} placeholder="99.99" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-purple-400" />
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input id="metaTitle" {...register("metaTitle")} placeholder="Custom title (max 60 chars)" maxLength={60} />
                  <p className="text-white/50 text-sm">{(watchedValues.metaTitle || "").length}/60</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea id="metaDescription" {...register("metaDescription")} rows={3} placeholder="Description (max 160 chars)" maxLength={160} />
                  <p className="text-white/50 text-sm">{(watchedValues.metaDescription || "").length}/160</p>
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input placeholder="Type and press Enter" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const value = (e.target as HTMLInputElement).value.trim()
                      if (value) {
                        const current = watchedValues.keywords || []
                        if (!current.includes(value)) setValue("keywords", [...current, value])
                        ;(e.target as HTMLInputElement).value = ""
                      }
                    }
                  }} />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(watchedValues.keywords || []).map((kw, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => {
                        const current = watchedValues.keywords || []
                        setValue("keywords", current.filter((_, i) => i !== index))
                      }}>
                        {kw} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Curriculum */}
          <TabsContent value="curriculum" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-400" />
                  Curriculum Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="text-center py-8">
                    <p className="text-white/60 mb-4">Build your curriculum with modules and lessons!</p>
                    <Button onClick={() => router.push(`/admin/courses/${courseId}/curriculum`)} className="bg-purple-600 hover:bg-purple-700">
                      <Layers className="h-4 w-4 mr-2" /> Open Curriculum Builder
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-white/60 mb-2">Save the course first to access the Curriculum Builder</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publish */}
          <TabsContent value="publish" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Check className="h-5 w-5 text-purple-400" />
                  Publish
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Publishing Status</Label>
                  <Select value={watchedValues.status} onValueChange={(v: any) => setValue("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" />Draft</div>
                      </SelectItem>
                      <SelectItem value="UNDER_REVIEW">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" />Under Review</div>
                      </SelectItem>
                      <SelectItem value="PUBLISHED">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Published</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-white/5 rounded-lg space-y-2">
                  <h4 className="text-white font-medium">Course Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-white/50">Title:</span><p className="text-white">{watchedValues.title || "-"}</p></div>
                    <div><span className="text-white/50">Category:</span><p className="text-white">{categories.find(c => c.id === watchedValues.categoryId)?.name || "-"}</p></div>
                    <div><span className="text-white/50">Difficulty:</span><p className="text-white">{watchedValues.difficultyLevel || "-"}</p></div>
                    <div><span className="text-white/50">Price:</span><p className="text-white">{watchedValues.isFree ? "Free" : `$${watchedValues.price}`}</p></div>
                  </div>
                </div>

                <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Check className="h-5 w-5 mr-2" />}
                  {isEditing ? "Save & Update Course" : "Create Course & Continue to Curriculum"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
