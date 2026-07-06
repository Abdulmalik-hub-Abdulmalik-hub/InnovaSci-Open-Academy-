"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useCourses, Course } from "@/hooks/useCourses"
import { 
  Search, Plus, Edit, Trash2, Loader2, RefreshCw, X,
  GraduationCap, Users, BookOpen, ChevronDown, ChevronUp, Check
} from "lucide-react"

const statusColors: Record<string, string> = {
  published: "bg-green-500",
  draft: "bg-yellow-500",
  archived: "bg-gray-500",
}

const difficultyLevels = ["Beginner", "Intermediate", "Advanced"]

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// Helper to extract category name from either string or object
function getCategoryValue(cat: string | { name: string } | null | undefined): string {
  if (!cat) return ""
  if (typeof cat === 'object' && 'name' in cat && cat.name) return cat.name
  return cat as string
}

// Course Modal Component with Sectioned Form
function CourseModal({ 
  course, 
  onClose, 
  onSave,
  categories = []
}: { 
  course?: Course | null
  onClose: () => void
  onSave: () => void
  categories?: string[]
}) {
  // DEBUG: Log incoming data
  console.log("CourseModal:", {
    course,
    category: course?.category,
    categories
  })

  const [expandedSections, setExpandedSections] = useState<string[]>(["basic", "media", "publishing"])
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    title: course?.title || "",
    slug: course?.slug || "",
    category: getCategoryValue(course?.category),
    shortDescription: course?.shortDescription || "",
    price: course?.price || 0,
    isFree: course?.isFree ?? true,
    status: course?.status || "draft",
    difficultyLevel: course?.difficultyLevel || "",
    durationHours: course?.durationHours || 0,
    thumbnailUrl: course?.thumbnailUrl || "",
    introVideoUrl: course?.introVideoUrl || "",
    certificateTemplateUrl: (course as any)?.certificateTemplateId || "",
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Auto-generate slug when title changes (if not manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const generatedSlug = generateSlug(formData.title)
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
      setSlugAvailable(null)
    }
  }, [formData.title, slugManuallyEdited])

  // Check slug uniqueness
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug === course?.slug) {
      setSlugAvailable(slug === course?.slug ? true : null)
      return
    }

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
  }, [course?.slug])

  // Debounced slug check
  useEffect(() => {
    if (slugManuallyEdited && formData.slug) {
      const timer = setTimeout(() => {
        checkSlugAvailability(formData.slug)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.slug, slugManuallyEdited, checkSlugAvailability])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    const formattedSlug = generateSlug(value)
    setFormData(prev => ({ ...prev, slug: formattedSlug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    // Validate slug
    if (!formData.slug) {
      setError("Slug is required")
      setSaving(false)
      return
    }

    if (slugAvailable === false) {
      setError("This slug is already taken. Please choose a different one.")
      setSaving(false)
      return
    }

    // Validate required fields
    if (!formData.title || formData.title.trim().length < 2) {
      setError("Course title must be at least 2 characters")
      setSaving(false)
      return
    }

    try {
      const url = course ? `/api/admin/courses/${course.id}` : "/api/admin/courses"
      const method = course ? "PUT" : "POST"
      
      // Prepare data - set price to 0 if free
      const dataToSend = {
        ...formData,
        price: formData.isFree ? 0 : formData.price,
      }
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Failed to save course")
        return
      }

      onSave()
      onClose()
    } catch (err) {
      setError("Failed to save course. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full py-3 text-white font-medium hover:text-purple-400 transition-colors"
    >
      <span>{title}</span>
      {expandedSections.includes(section) ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-3xl max-h-[95vh] overflow-y-auto mt-8 mb-8">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-[#1a1a2e] z-10 border-b border-white/10">
          <CardTitle className="text-white text-xl">
            {course ? "Edit Course" : "Create New Course"}
          </CardTitle>
          <button onClick={onClose} className="text-white/60 hover:text-white p-2">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-1">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            
            {/* Basic Information Section */}
            <div className="border-b border-white/10">
              <SectionHeader title="Basic Information" section="basic" />
              {expandedSections.includes("basic") && (
                <div className="pb-6 space-y-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Course Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter course title"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/70 mb-1 block flex items-center justify-between">
                      <span>Slug (URL) *</span>
                      {slugChecking && <Loader2 className="h-3 w-3 animate-spin text-white/50" />}
                      {!slugChecking && slugAvailable === true && (
                        <span className="flex items-center text-green-400 text-xs">
                          <Check className="h-3 w-3 mr-1" /> Available
                        </span>
                      )}
                      {!slugChecking && slugAvailable === false && (
                        <span className="text-red-400 text-xs">Already taken</span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={`bg-white/5 border-white/10 text-white pr-20 ${
                          slugAvailable === false ? 'border-red-500' : ''
                        }`}
                        placeholder="auto-generated-from-title"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                        .com/course/
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      Auto-generated from title. Edit manually if needed.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70 mb-1 block">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                      >
                        <option value="">Select Category</option>
                        {categories && categories.length > 0 ? categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        )) : (
                          <option value="" disabled>No categories available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-white/70 mb-1 block">Difficulty</label>
                      <select
                        value={formData.difficultyLevel}
                        onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                      >
                        <option value="">Select Difficulty</option>
                        {difficultyLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Short Description</label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none h-24"
                      placeholder="Brief description of the course..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Media & Pricing Section */}
            <div className="border-b border-white/10">
              <SectionHeader title="Media & Pricing" section="media" />
              {expandedSections.includes("media") && (
                <div className="pb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70 mb-1 block">Price (USD)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="bg-white/5 border-white/10 text-white"
                        disabled={formData.isFree}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-white/70 mb-1 block">Duration (Hours)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.durationHours}
                        onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 0 })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="e.g. 2.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFree}
                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-sm">Free Course</span>
                    </label>
                    {formData.isFree && (
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                        Price automatically set to $0
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Course Thumbnail URL</label>
                    <Input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="https://..."
                    />
                    {formData.thumbnailUrl && (
                      <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden bg-white/5">
                        <img 
                          src={formData.thumbnailUrl} 
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Intro Video URL</label>
                    <Input
                      type="url"
                      value={formData.introVideoUrl}
                      onChange={(e) => setFormData({ ...formData, introVideoUrl: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-white/40 mt-1">
                      YouTube, Vimeo, or direct video URL
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Publishing Section */}
            <div className="border-b border-white/10">
              <SectionHeader title="Publishing" section="publishing" />
              {expandedSections.includes("publishing") && (
                <div className="pb-6 space-y-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Course Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    >
                      <option value="draft">Draft - Not visible to students</option>
                      <option value="published">Published - Visible to students</option>
                      <option value="archived">Archived - Hidden from new enrollments</option>
                    </select>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Certificate Template (Optional)</h4>
                    <Input
                      value={formData.certificateTemplateUrl}
                      onChange={(e) => setFormData({ ...formData, certificateTemplateUrl: e.target.value })}
                      className="bg-white/5 border-white/10 text-white mb-2"
                      placeholder="Certificate template URL"
                    />
                    <p className="text-xs text-white/40">
                      Leave empty to use the default certificate template
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || slugAvailable === false}
                className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  course ? "Update Course" : "Create Course"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Courses Page Component
export default function CoursesPage() {
  const { courses, loading, error, pagination, categories, fetchCourses, deleteCourse, refresh } = useCourses()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses({
        search: searchQuery,
        status: selectedStatus === "all" ? undefined : selectedStatus,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedStatus])

  const handleAddCourse = () => {
    setEditingCourse(null)
    setShowModal(true)
  }

  const handleEditCourse = (course: Course) => {
    // Ensure category is converted to string for the modal
    const normalizedCourse = {
      ...course,
      category: getCategoryValue(course.category)
    }
    setEditingCourse(normalizedCourse)
    setShowModal(true)
  }

  const handleDeleteCourse = async (id: string) => {
    setDeleting(true)
    try {
      await deleteCourse(id)
      setDeleteConfirm(null)
    } catch (err) {
      console.error("Delete error:", err)
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="bg-[#1a1a2e] border-white/10 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Error Loading Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh} className="border-red-500/20 text-red-400">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Management</h1>
          <p className="text-white/60">Create and manage your courses</p>
        </div>
        <Button 
          onClick={handleAddCourse}
          className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-white">{pagination?.total ?? 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Published</p>
                <p className="text-2xl font-bold text-green-400">
                  {(courses || []).filter(c => c.status === "published").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-white">
                  {(courses || []).reduce((acc, c) => acc + (c.stats?.enrollments || 0), 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Free Courses</p>
                <p className="text-2xl font-bold text-white">
                  {(courses || []).filter(c => c.isFree).length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>All Courses ({pagination.total})</span>
            <Button variant="ghost" size="sm" onClick={refresh} className="text-white/60 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && courses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">No courses found</p>
              <Button onClick={handleAddCourse} className="mt-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-sm text-white/60">
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Students</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Modules</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(courses || []).map((course) => (
                    <tr key={course.id} className="text-sm hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {course.thumbnailUrl ? (
                            <img 
                              src={course.thumbnailUrl} 
                              alt={course.title}
                              className="w-12 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded bg-white/10 flex items-center justify-center">
                              <GraduationCap className="h-4 w-4 text-white/40" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white line-clamp-1">{course.title}</div>
                            <div className="text-white/50 text-xs">{course.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {getCategoryValue(course.category) || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusColors[course.status] || "bg-gray-500"}`} />
                          <span className="text-white/80 capitalize">{course.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {(course.stats?.enrollments || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {course.isFree ? (
                          <Badge className="bg-green-500/20 text-green-400">Free</Badge>
                        ) : (
                          <span className="text-white">${course.price}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/80">{course.stats?.modules || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditCourse(course)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                            title="Edit Course"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(course.id)}
                            className="p-2 rounded-lg hover:bg-white/10 text-red-400"
                            title="Delete Course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {(pagination?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchCourses({ page: pagination.page - 1, limit: pagination.limit, search: searchQuery, status: selectedStatus === "all" ? undefined : selectedStatus })}
            className="border-white/20 text-white"
          >
            Previous
          </Button>
          <span className="text-white/60">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchCourses({ page: pagination.page + 1, limit: pagination.limit, search: searchQuery, status: selectedStatus === "all" ? undefined : selectedStatus })}
            className="border-white/20 text-white"
          >
            Next
          </Button>
        </div>
      )}

      {/* Course Modal */}
      {showModal && (
        <ErrorBoundary>
          <CourseModal
            course={editingCourse}
            onClose={() => setShowModal(false)}
            onSave={refresh}
            categories={categories}
          />
        </ErrorBoundary>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white">Delete Course?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                Are you sure you want to delete this course? This will also delete all modules, lessons, and enrollments.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border-white/20 text-white"
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteCourse(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}