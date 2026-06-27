"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CertificateTemplateSelector } from "@/components/admin/CertificateTemplateSelector"
import { useCourses, Course } from "@/hooks/useCourses"
import { 
  Search, Plus, Edit, Trash2, Eye, Loader2, RefreshCw, X,
  BookOpen, Users, DollarSign, GraduationCap, Award
} from "lucide-react"

const statusColors: Record<string, string> = {
  published: "bg-green-500",
  draft: "bg-yellow-500",
  archived: "bg-gray-500",
}

function CourseModal({ 
  course, 
  onClose, 
  onSave 
}: { 
  course?: Course | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    title: course?.title || "",
    slug: course?.slug || "",
    category: course?.category || "",
    shortDescription: course?.shortDescription || "",
    fullDescription: "",
    price: course?.price || 0,
    isFree: course?.isFree ?? true,
    status: course?.status || "draft",
    difficultyLevel: course?.difficultyLevel || "",
    durationHours: course?.durationHours || 0,
    thumbnailUrl: course?.thumbnailUrl || "",
    certificateTemplateId: (course as any)?.certificateTemplateId || null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const url = course ? `/api/admin/courses/${course.id}` : "/api/admin/courses"
      const method = course ? "PUT" : "POST"
      
      // Auto-generate slug from title if empty
      const dataToSend = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
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
      setError("Failed to save course")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-[#1a1a2e] z-10">
          <CardTitle className="text-white">
            {course ? "Edit Course" : "Create New Course"}
          </CardTitle>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-white/70 mb-1 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-white/70 mb-1 block">Slug (URL)</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="auto-generated-from-title"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-1 block">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-1 block">Difficulty</label>
                <select
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="">Select</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-white/70 mb-1 block">Short Description</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none h-20"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-1 block">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-1 block">Duration (hours)</label>
                <Input
                  type="number"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-1 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Free Course
                </label>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-white/70 mb-1 block">Thumbnail URL</label>
                <Input
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-purple-400" />
                  <label className="text-sm text-white/70">Certificate Template</label>
                </div>
                <CertificateTemplateSelector
                  value={formData.certificateTemplateId}
                  onChange={(templateId) => setFormData({ ...formData, certificateTemplateId: templateId })}
                />
              </div>

              <div className="col-span-2 flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/20 text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (course ? "Save Changes" : "Create Course")}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CoursesPage() {
  const { courses, loading, error, pagination, categories, fetchCourses, createCourse, updateCourse, deleteCourse, refresh } = useCourses()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses({
        page: 1,
        limit: 20,
        search: searchQuery,
        status: selectedStatus,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedStatus])

  const handleAddCourse = () => {
    setEditingCourse(null)
    setShowModal(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowModal(true)
  }

  const handleDeleteCourse = async (id: string) => {
    const result = await deleteCourse(id)
    if (result.success) {
      setDeleteConfirm(null)
    }
  }

  // Calculate stats
  const stats = {
    total: pagination.total,
    published: courses.filter(c => c.status === "published").length,
    draft: courses.filter(c => c.status === "draft").length,
    totalStudents: courses.reduce((acc, c) => acc + (c.stats?.enrollments || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Management</h1>
          <p className="text-white/60">Create, manage, and publish courses</p>
        </div>
        <Button onClick={handleAddCourse} className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/60">Total Courses</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.published}</div>
              <div className="text-sm text-white/60">Published</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Edit className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{stats.draft}</div>
              <div className="text-sm text-white/60">Drafts</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.totalStudents.toLocaleString()}</div>
              <div className="text-sm text-white/60">Total Students</div>
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
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
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

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-red-400">{error}</span>
            <Button variant="outline" size="sm" onClick={refresh} className="border-red-500/20 text-red-400">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

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
                  {courses.map((course) => (
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
                      <td className="px-4 py-3 text-white/80">{course.category || "-"}</td>
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
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(course.id)}
                            className="p-2 rounded-lg hover:bg-white/10 text-red-400"
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchCourses({ page: pagination.page - 1, limit: pagination.limit, search: searchQuery, status: selectedStatus })}
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
            onClick={() => fetchCourses({ page: pagination.page + 1, limit: pagination.limit, search: searchQuery, status: selectedStatus })}
            className="border-white/20 text-white"
          >
            Next
          </Button>
        </div>
      )}

      {/* Course Modal */}
      {showModal && (
        <CourseModal
          course={editingCourse}
          onClose={() => setShowModal(false)}
          onSave={refresh}
        />
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
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteCourse(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
