"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  FileCode,
  Trophy,
  Award,
  ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

// Types
interface Course {
  id: string
  title: string
  slug: string
  status: string
  category?: string
  difficultyLevel?: string
  thumbnailUrl?: string
  price: number
  isFree: boolean
  stats: {
    enrollments: number
    modules: number
    lessons: number
    exercises: number
    miniProjects: number
  }
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface DifficultyLevel {
  id: string
  name: string
  slug: string
  categoryId?: string
}

// Status colors
const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-yellow-500/20", text: "text-yellow-500", label: "Draft" },
  UNDER_REVIEW: { bg: "bg-blue-500/20", text: "text-blue-500", label: "Under Review" },
  PUBLISHED: { bg: "bg-green-500/20", text: "text-green-500", label: "Published" },
  ARCHIVED: { bg: "bg-gray-500/20", text: "text-gray-500", label: "Archived" },
}

export default function MCCSCourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(pagination.page))
      params.set("limit", String(pagination.limit))
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (categoryFilter !== "all") params.set("categoryId", categoryFilter)

      const response = await fetch(`/api/mccs/courses?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setCourses(result.data.courses)
        setPagination(result.data.pagination)
        setCategories(result.data.filters.categories)
        setDifficultyLevels(result.data.filters.difficultyLevels)
      } else {
        toast.error(result.error || "Failed to fetch courses")
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to fetch courses")
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, statusFilter, categoryFilter])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Delete course
  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    setDeleting(courseId)
    try {
      const response = await fetch(`/api/mccs/courses/${courseId}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        toast.success("Course deleted successfully")
        fetchCourses()
      } else {
        toast.error(result.error || "Failed to delete course")
      }
    } catch (error) {
      toast.error("Failed to delete course")
    } finally {
      setDeleting(null)
    }
  }

  // Open course details
  const openCourseDetails = (course: Course) => {
    setSelectedCourse(course)
    setShowDetailsModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-purple-600" />
            Master Course Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage courses with the new MCCS system
          </p>
        </div>
        <Link href="/admin/mccs/courses/create">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 dark:bg-gray-700 dark:border-gray-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40 dark:bg-gray-700 dark:border-gray-600">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Courses</CardTitle>
            <span className="text-sm text-gray-500">
              {pagination.total} course{pagination.total !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No courses found</p>
              <Link href="/admin/mccs/courses/create">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Modules</th>
                    <th className="px-4 py-3">Students</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-12 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-purple-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {course.title}
                            </div>
                            <div className="text-gray-500 text-xs">/{course.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`${statusColors[course.status]?.bg} ${statusColors[course.status]?.text} border-0`}
                        >
                          {statusColors[course.status]?.label || course.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {course.category || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {course.difficultyLevel || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {course.isFree ? (
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            Free
                          </Badge>
                        ) : (
                          <span className="text-gray-900 dark:text-white">
                            ${course.price.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {course.stats.modules}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {course.stats.enrollments.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/mccs/courses/${course.id}`}>
                            <Button variant="ghost" size="sm" title="Edit Course">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Details"
                            onClick={() => openCourseDetails(course)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            onClick={() => handleDelete(course.id)}
                            disabled={deleting === course.id}
                          >
                            {deleting === course.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
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
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Course Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Course Details
            </DialogTitle>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Header */}
              <div className="flex items-start gap-4">
                {selectedCourse.thumbnailUrl && (
                  <img
                    src={selectedCourse.thumbnailUrl}
                    alt={selectedCourse.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-gray-500 text-sm">/{selectedCourse.slug}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={`${statusColors[selectedCourse.status]?.bg} ${statusColors[selectedCourse.status]?.text} border-0`}
                    >
                      {statusColors[selectedCourse.status]?.label}
                    </Badge>
                    {selectedCourse.category && (
                      <Badge variant="outline">{selectedCourse.category}</Badge>
                    )}
                    {selectedCourse.difficultyLevel && (
                      <Badge variant="outline">{selectedCourse.difficultyLevel}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <Layers className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedCourse.stats.modules}
                  </div>
                  <div className="text-xs text-gray-500">Modules</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedCourse.stats.lessons}
                  </div>
                  <div className="text-xs text-gray-500">Lessons</div>
                </div>

                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 text-center">
                  <FileCode className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-teal-600">
                    {selectedCourse.stats.exercises}
                  </div>
                  <div className="text-xs text-gray-500">Exercises</div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedCourse.stats.miniProjects}
                  </div>
                  <div className="text-xs text-gray-500">Mini Projects</div>
                </div>
              </div>

              {/* Enrollment Stats */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Enrollment Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCourse.stats.enrollments.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total Enrolled</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCourse.isFree ? (
                        <Badge variant="outline" className="text-green-500">
                          Free
                        </Badge>
                      ) : (
                        `$${selectedCourse.price.toFixed(2)}`
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Price</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Date(selectedCourse.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">Created</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                <Link href={`/admin/mccs/courses/${selectedCourse.id}`}>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Course
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
