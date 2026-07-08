"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  GraduationCap,
  FileText,
  Image,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"
import toast from "react-hot-toast"

interface Category {
  id: string
  name: string
  slug: string
}

interface FormData {
  title: string
  slug: string
  categoryId: string
  shortDescription: string
  fullDescription: string
  price: string
  isFree: boolean
  status: string
  thumbnailUrl: string
}

type Step = {
  id: string
  title: string
  description: string
}

const steps: Step[] = [
  { id: "basics", title: "Basic Info", description: "Course title, slug, and category" },
  { id: "details", title: "Details", description: "Description and pricing" },
  { id: "media", title: "Media", description: "Thumbnail and intro video" },
  { id: "review", title: "Review", description: "Confirm and create" },
]

export default function CreateCoursePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    categoryId: "",
    shortDescription: "",
    fullDescription: "",
    price: "0",
    isFree: true,
    status: "DRAFT",
    thumbnailUrl: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const generatedSlug = generateSlug(formData.title)
      setFormData((prev) => ({ ...prev, slug: generatedSlug }))
      setSlugAvailable(null)
    }
  }, [formData.title, slugManuallyEdited])

  useEffect(() => {
    if (slugManuallyEdited && formData.slug) {
      const timer = setTimeout(() => {
        checkSlugAvailability(formData.slug)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.slug, slugManuallyEdited])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/mccs/categories")
      const result = await response.json()
      if (result.success) {
        setCategories(result.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setCategoriesLoading(false)
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  const checkSlugAvailability = async (slug: string) => {
    setSlugChecking(true)
    try {
      const response = await fetch(`/api/admin/courses?slug=${encodeURIComponent(slug)}`)
      const result = await response.json()
      setSlugAvailable(result.data?.courses?.length === 0)
    } catch {
      setSlugAvailable(true)
    } finally {
      setSlugChecking(false)
    }
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    const formattedSlug = generateSlug(value)
    setFormData((prev) => ({ ...prev, slug: formattedSlug }))
  }

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepIndex === 0) {
      if (!formData.title.trim()) {
        newErrors.title = "Course title is required"
      } else if (formData.title.trim().length < 3) {
        newErrors.title = "Course title must be at least 3 characters"
      }
      if (!formData.slug) {
        newErrors.slug = "Slug is required"
      }
      if (slugAvailable === false) {
        newErrors.slug = "This slug is already taken"
      }
      if (!formData.categoryId) {
        newErrors.categoryId = "Please select a category"
      }
    }

    if (stepIndex === 1) {
      if (!formData.shortDescription.trim()) {
        newErrors.shortDescription = "Short description is required"
      } else if (formData.shortDescription.length > 200) {
        newErrors.shortDescription = "Short description must be under 200 characters"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      toast.error("Please complete all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/mccs/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          slug: formData.slug,
          categoryId: formData.categoryId,
          shortDescription: formData.shortDescription.trim(),
          fullDescription: formData.fullDescription.trim(),
          price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
          isFree: formData.isFree,
          status: formData.status,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.error || "Failed to create course")
        return
      }

      toast.success("Course created successfully!")
      router.push("/admin/mccs/courses")
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error("Failed to create course. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Course Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="e.g., Introduction to Machine Learning"
                className={`bg-white/5 border-white/10 text-white ${
                  errors.title ? "border-red-500" : ""
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white">
                URL Slug <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">/courses/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="introduction-to-machine-learning"
                  className={`bg-white/5 border-white/10 text-white ${
                    errors.slug ? "border-red-500" : ""
                  }`}
                />
              </div>
              {slugChecking && (
                <p className="text-white/50 text-sm flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking availability...
                </p>
              )}
              {slugAvailable === true && (
                <p className="text-green-500 text-sm flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Slug is available
                </p>
              )}
              {slugAvailable === false && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  This slug is already taken
                </p>
              )}
              {errors.slug && !slugAvailable && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.slug}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => updateFormData("categoryId", value)}
              >
                <SelectTrigger
                  className={`bg-white/5 border-white/10 text-white ${
                    errors.categoryId ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.categoryId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">
                Initial Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData("status", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft - Not visible to students</SelectItem>
                  <SelectItem value="PUBLISHED">Published - Visible to students</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shortDescription" className="text-white">
                Short Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateFormData("shortDescription", e.target.value)}
                placeholder="A brief summary of the course (shown in course cards)"
                rows={3}
                className={`bg-white/5 border-white/10 text-white resize-none ${
                  errors.shortDescription ? "border-red-500" : ""
                }`}
              />
              <div className="flex justify-between text-xs">
                {errors.shortDescription ? (
                  <p className="text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.shortDescription}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  className={formData.shortDescription.length > 180 ? "text-yellow-500" : "text-white/50"}
                >
                  {formData.shortDescription.length}/200
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription" className="text-white">
                Full Description
              </Label>
              <Textarea
                id="fullDescription"
                value={formData.fullDescription}
                onChange={(e) => updateFormData("fullDescription", e.target.value)}
                placeholder="Detailed course description..."
                rows={6}
                className="bg-white/5 border-white/10 text-white resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="price" className="text-white">
                  Price (USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  disabled={formData.isFree}
                  className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => updateFormData("isFree", !formData.isFree)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    formData.isFree ? "bg-green-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      formData.isFree ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-white font-medium">
                  {formData.isFree ? "Free Course" : "Paid Course"}
                </span>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="thumbnail" className="text-white">
                Thumbnail URL
              </Label>
              <Input
                id="thumbnail"
                value={formData.thumbnailUrl}
                onChange={(e) => updateFormData("thumbnailUrl", e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-white/50 text-sm">
                Enter a URL to an image (recommended size: 1280x720px)
              </p>
              {formData.thumbnailUrl && (
                <div className="mt-4">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full max-w-md rounded-lg border border-white/10"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium text-white">Course Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Title:</span>
                  <p className="text-white">{formData.title}</p>
                </div>
                <div>
                  <span className="text-white/50">Slug:</span>
                  <p className="text-white">/courses/{formData.slug}</p>
                </div>
                <div>
                  <span className="text-white/50">Category:</span>
                  <p className="text-white">
                    {categories.find((c) => c.id === formData.categoryId)?.name || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-white/50">Status:</span>
                  <Badge
                    className={
                      formData.status === "PUBLISHED"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }
                  >
                    {formData.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-white/50">Price:</span>
                  <p className="text-white">{formData.isFree ? "Free" : `$${formData.price}`}</p>
                </div>
                <div>
                  <span className="text-white/50">Has Thumbnail:</span>
                  <p className="text-white">{formData.thumbnailUrl ? "Yes" : "No"}</p>
                </div>
              </div>
              <div>
                <span className="text-white/50 text-sm">Short Description:</span>
                <p className="text-white text-sm mt-1">{formData.shortDescription || "-"}</p>
              </div>
            </div>
            <p className="text-white/70 text-sm">
              Click "Create Course" to save this course. You can add modules and lessons after
              creation.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-400" />
            Create New Course
          </h1>
          <p className="text-white/60 mt-2">Master Course Creation System - Step by step wizard</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                      index < currentStep
                        ? "bg-green-500 text-white"
                        : index === currentStep
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-white/50"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      index <= currentStep ? "text-white" : "text-white/50"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                      index < currentStep ? "bg-green-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {currentStep === 0 && <FileText className="h-5 w-5 text-purple-400" />}
              {currentStep === 1 && <FileText className="h-5 w-5 text-purple-400" />}
              {currentStep === 2 && <Image className="h-5 w-5 text-purple-400" />}
              {currentStep === 3 && <CheckCircle2 className="h-5 w-5 text-purple-400" />}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-white/60">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
