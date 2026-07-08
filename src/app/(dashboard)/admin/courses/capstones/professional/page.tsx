"use client"

import { useState, useEffect, useCallback } from "react"
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
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Layers,
  BookOpen,
  Loader2,
  Search,
} from "lucide-react"
import toast from "react-hot-toast"

interface Course {
  id: string
  title: string
  slug: string
  categoryId: string
  category?: { name: string }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface ProfessionalCapstone {
  id: string
  title: string
  slug: string
  description: string | null
  categoryId: string | null
  category?: { name: string }
  includedCourses: string[]
  requirements: string | null
  isPublished: boolean
  thumbnailUrl: string | null
}

export default function ProfessionalCapstonePage() {
  const [capstones, setCapstones] = useState<ProfessionalCapstone[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCapstone, setEditingCapstone] = useState<ProfessionalCapstone | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    categoryId: "",
    includedCourses: [] as string[],
    requirements: "",
    thumbnailUrl: "",
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [capstonesRes, coursesRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/capstones/professional"),
        fetch("/api/admin/courses?status=PUBLISHED&limit=1000"),
        fetch("/api/mccs/categories"),
      ])

      const [capstonesData, coursesData, categoriesData] = await Promise.all([
        capstonesRes.json(),
        coursesRes.json(),
        categoriesRes.json(),
      ])

      if (capstonesData.success) {
        setCapstones(capstonesData.data || [])
      }
      if (coursesData.success) {
        setCourses(coursesData.data?.courses || [])
      }
      if (categoriesData.success) {
        setCategories(categoriesData.data?.categories || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({ ...prev, title, slug: generateSlug(title) }))
  }

  const openCreateModal = () => {
    setEditingCapstone(null)
    setFormData({
      title: "",
      slug: "",
      description: "",
      categoryId: "",
      includedCourses: [],
      requirements: "",
      thumbnailUrl: "",
    })
    setShowModal(true)
  }

  const openEditModal = (capstone: ProfessionalCapstone) => {
    setEditingCapstone(capstone)
    setFormData({
      title: capstone.title,
      slug: capstone.slug,
      description: capstone.description || "",
      categoryId: capstone.categoryId || "",
      includedCourses: capstone.includedCourses || [],
      requirements: capstone.requirements || "",
      thumbnailUrl: capstone.thumbnailUrl || "",
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Title and slug are required")
      return
    }

    setSaving(true)
    try {
      const url = editingCapstone
        ? `/api/admin/capstones/professional/${editingCapstone.id}`
        : "/api/admin/capstones/professional"
      const method = editingCapstone ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!result.success) {
        toast.error(result.error || "Failed to save capstone")
        return
      }

      toast.success(editingCapstone ? "Capstone updated!" : "Capstone created!")
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error("Error saving capstone:", error)
      toast.error("Failed to save capstone")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this capstone?")) return

    try {
      const response = await fetch(`/api/admin/capstones/professional/${id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!result.success) {
        toast.error(result.error || "Failed to delete")
        return
      }
      toast.success("Capstone deleted")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const filteredCapstones = capstones.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || c.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  const filteredCourses = courses.filter(
    (c) => !formData.categoryId || c.categoryId === formData.categoryId
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-400" />
            Professional Capstones
          </h1>
          <p className="text-white/60 mt-1">
            Combine courses by category into professional certification programs
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Capstone
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search capstones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
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

      {/* Capstones List */}
      <div className="grid gap-4">
        {filteredCapstones.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Layers className="h-16 w-16 text-white/30 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No capstones yet</h3>
              <p className="text-white/60 text-center max-w-md">
                Create a professional capstone to combine courses from a specific category
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCapstones.map((capstone) => (
            <Card key={capstone.id} className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded bg-purple-100 flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        {capstone.title}
                        {capstone.isPublished && (
                          <Badge className="bg-green-500/20 text-green-400">Published</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-white/50 mt-1">
                        /capstones/{capstone.slug}
                      </CardDescription>
                    </div>
                  </div>
                  {capstone.category && (
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {capstone.category.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-white/60">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {(capstone.includedCourses || []).length} courses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(capstone)}
                      className="text-white/60 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(capstone.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCapstone ? "Edit Capstone" : "Create Professional Capstone"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Full Stack Web Developer Certification"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">/capstones/</span>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="full-stack-developer"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(v) => setFormData((p) => ({ ...p, categoryId: v, includedCourses: [] }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe this professional certification..."
                rows={3}
                className="bg-white/5 border-white/10 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Requirements</Label>
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData((p) => ({ ...p, requirements: e.target.value }))}
                placeholder="What students need to complete this capstone..."
                rows={2}
                className="bg-white/5 border-white/10 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                placeholder="https://..."
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label>Include Courses ({filteredCourses.length} available)</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={formData.includedCourses.includes(course.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((p) => ({
                            ...p,
                            includedCourses: [...p.includedCourses, course.id],
                          }))
                        } else {
                          setFormData((p) => ({
                            ...p,
                            includedCourses: p.includedCourses.filter((id) => id !== course.id),
                          }))
                        }
                      }}
                      className="h-4 w-4 rounded border-white/20"
                    />
                    <span className="text-white">{course.title}</span>
                  </label>
                ))}
                {filteredCourses.length === 0 && (
                  <p className="text-white/50 text-sm p-4 text-center">
                    Select a category first or no published courses available
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} className="border-white/20 text-white">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCapstone ? "Update Capstone" : "Create Capstone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
