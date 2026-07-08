"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
  CheckCircle,
  Layers,
  BookOpen,
  Loader2,
  Search,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Course {
  id: string
  title: string
  slug: string
  difficultyLevel: string
}

interface DifficultyCapstone {
  id: string
  title: string
  slug: string
  description: string | null
  difficultyLevel: string
  includedCourses: string[]
  isPublished: boolean
  thumbnailUrl: string | null
}

const difficultyLevels = [
  { value: "BEGINNER", label: "Beginner", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "INTERMEDIATE", label: "Intermediate", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "ADVANCED", label: "Advanced", color: "bg-red-500/20 text-red-400 border-red-500/30" },
]

export default function DifficultyCapstonePage() {
  const router = useRouter()
  const [capstones, setCapstones] = useState<DifficultyCapstone[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCapstone, setEditingCapstone] = useState<DifficultyCapstone | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    difficultyLevel: "BEGINNER",
    includedCourses: [] as string[],
    thumbnailUrl: "",
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [capstonesRes, coursesRes] = await Promise.all([
        fetch("/api/admin/capstones/difficulty"),
        fetch("/api/admin/courses?status=PUBLISHED&limit=1000"),
      ])

      const capstonesData = await capstonesRes.json()
      const coursesData = await coursesRes.json()

      if (capstonesData.success) {
        setCapstones(capstonesData.data || [])
      }

      if (coursesData.success) {
        setCourses(coursesData.data?.courses || [])
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
      difficultyLevel: "BEGINNER",
      includedCourses: [],
      thumbnailUrl: "",
    })
    setShowModal(true)
  }

  const openEditModal = (capstone: DifficultyCapstone) => {
    setEditingCapstone(capstone)
    setFormData({
      title: capstone.title,
      slug: capstone.slug,
      description: capstone.description || "",
      difficultyLevel: capstone.difficultyLevel,
      includedCourses: capstone.includedCourses || [],
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
        ? `/api/admin/capstones/difficulty/${editingCapstone.id}`
        : "/api/admin/capstones/difficulty"
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
      const response = await fetch(`/api/admin/capstones/difficulty/${id}`, {
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
    const matchesLevel = filterLevel === "all" || c.difficultyLevel === filterLevel
    return matchesSearch && matchesLevel
  })

  const filteredCourses = courses.filter(
    (c) => c.difficultyLevel === formData.difficultyLevel
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
            Difficulty Level Capstones
          </h1>
          <p className="text-white/60 mt-1">
            Combine courses by difficulty level into comprehensive capstone programs
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
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
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
                Create a capstone to combine courses of a specific difficulty level into one comprehensive program
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCapstones.map((capstone) => {
            const levelInfo = difficultyLevels.find((l) => l.value === capstone.difficultyLevel)
            return (
              <Card key={capstone.id} className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded bg-purple-100 flex items-center justify-center">
                        <Layers className="h-8 w-8 text-purple-600" />
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
                    <Badge className={levelInfo?.color}>
                      {levelInfo?.label}
                    </Badge>
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
            )
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCapstone ? "Edit Capstone" : "Create Difficulty Level Capstone"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Complete Beginner Python Developer"
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
                  placeholder="complete-python-developer"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level *</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, difficultyLevel: v, includedCourses: [] }))
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe this capstone program..."
                rows={3}
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
                    No published courses found for this difficulty level
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
