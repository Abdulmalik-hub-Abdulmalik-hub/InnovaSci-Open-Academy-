"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  Award,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  Eye,
  Layers,
  BookOpen,
  Trophy,
  CheckCircle2,
  X,
  GripVertical,
} from "lucide-react"
import toast from "react-hot-toast"

// Types
interface DifficultyLevel {
  id: string
  name: string
  category: { name: string }
}

interface Category {
  id: string
  name: string
}

interface DifficultyCapstone {
  id: string
  title: string
  slug: string
  description?: string
  difficultyLevel: DifficultyLevel
  requiredCourses: number
  projectTitle?: string
  courses: Array<{
    id: string
    title: string
    thumbnailUrl?: string
    isRequired: boolean
    status: string
  }>
  submissionCount: number
  isActive: boolean
}

interface ProfessionalCapstone {
  id: string
  title: string
  slug: string
  description?: string
  category: Category
  requiredDifficultyLevels: number
  requiredCourses: number
  projectTitle?: string
  projectDeliverables?: string[]
  submissionCount: number
  isActive: boolean
}

export default function CapstoneManagementPage() {
  const [activeTab, setActiveTab] = useState("difficulty")
  const [loading, setLoading] = useState(true)
  const [difficultyCapstones, setDifficultyCapstones] = useState<DifficultyCapstone[]>([])
  const [professionalCapstones, setProfessionalCapstones] = useState<ProfessionalCapstone[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([])
  const [search, setSearch] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createType, setCreateType] = useState<"difficulty" | "professional">("difficulty")
  const [creating, setCreating] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    difficultyLevelId: "",
    categoryId: "",
    projectTitle: "",
    projectDescription: "",
    requiredCourses: 1,
    requiredDifficultyLevels: 1,
  })

  // Fetch capstones
  const fetchCapstones = async () => {
    setLoading(true)
    try {
      // Fetch difficulty level capstones
      const difficultyRes = await fetch("/api/mccs/capstones/difficulty-level")
      const difficultyData = await difficultyRes.json()
      if (difficultyData.success) {
        setDifficultyCapstones(difficultyData.data.capstones)
      }

      // Fetch professional capstones
      const professionalRes = await fetch("/api/mccs/capstones/professional")
      const professionalData = await professionalRes.json()
      if (professionalData.success) {
        setProfessionalCapstones(professionalData.data.capstones)
      }

      // Fetch categories
      const categoriesRes = await fetch("/api/mccs/categories")
      const categoriesData = await categoriesRes.json()
      if (categoriesData.success) {
        setCategories(categoriesData.data.categories)
      }

      // Fetch difficulty levels
      const levelsRes = await fetch("/api/mccs/difficulty-levels")
      const levelsData = await levelsRes.json()
      if (levelsData.success) {
        setDifficultyLevels(levelsData.data.difficultyLevels)
      }
    } catch (error) {
      console.error("Error fetching capstones:", error)
      toast.error("Failed to fetch capstones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCapstones()
  }, [])

  // Create capstone
  const handleCreate = async () => {
    if (!formData.title || !formData.slug) {
      toast.error("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      const endpoint =
        createType === "difficulty"
          ? "/api/mccs/capstones/difficulty-level"
          : "/api/mccs/capstones/professional"

      const payload = {
        ...formData,
        requiredCourseIds: selectedCourses,
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      toast.success(
        `${createType === "difficulty" ? "Difficulty Level" : "Professional"} Capstone created successfully`
      )
      setShowCreateModal(false)
      resetForm()
      fetchCapstones()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create capstone")
    } finally {
      setCreating(false)
    }
  }

  // Delete capstone
  const handleDelete = async (id: string, type: "difficulty" | "professional") => {
    if (!confirm("Are you sure you want to delete this capstone?")) {
      return
    }

    try {
      const endpoint =
        type === "difficulty"
          ? `/api/mccs/capstones/difficulty-level/${id}`
          : `/api/mccs/capstones/professional/${id}`

      const response = await fetch(endpoint, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      toast.success("Capstone deleted successfully")
      fetchCapstones()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete capstone")
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      difficultyLevelId: "",
      categoryId: "",
      projectTitle: "",
      projectDescription: "",
      requiredCourses: 1,
      requiredDifficultyLevels: 1,
    })
    setSelectedCourses([])
  }

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  // Filter capstones by search
  const filterCapstones = <T extends { title: string }>(capstones: T[]): T[] => {
    if (!search) return capstones
    return capstones.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-7 w-7 text-purple-600" />
            Capstone Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage Difficulty Level and Professional Capstones
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateType(activeTab as "difficulty" | "professional")
            setShowCreateModal(true)
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Capstone
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="difficulty" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Difficulty Level Capstones
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Professional Capstones
          </TabsTrigger>
        </TabsList>

        {/* Difficulty Level Capstones */}
        <TabsContent value="difficulty" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Difficulty Level Capstones</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search capstones..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : filterCapstones(difficultyCapstones).length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No difficulty level capstones found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filterCapstones(difficultyCapstones).map((capstone) => (
                    <div
                      key={capstone.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Layers className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {capstone.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {capstone.difficultyLevel.category.name} &rarr;{" "}
                              {capstone.difficultyLevel.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {capstone.requiredCourses} courses required
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {capstone.submissionCount} submissions
                              </Badge>
                              {capstone.isActive ? (
                                <Badge className="bg-green-500/20 text-green-500 border-0">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-500/20 text-gray-500 border-0">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(capstone.id, "difficulty")}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {capstone.courses.length > 0 && (
                        <div className="mt-3 ml-16">
                          <p className="text-xs text-gray-500 mb-2">Included Courses:</p>
                          <div className="flex flex-wrap gap-2">
                            {capstone.courses.map((course) => (
                              <div
                                key={course.id}
                                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
                              >
                                {course.isRequired ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : (
                                  <BookOpen className="h-3 w-3 text-gray-400" />
                                )}
                                <span className="text-xs">{course.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Capstones */}
        <TabsContent value="professional" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Professional Capstones</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search capstones..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : filterCapstones(professionalCapstones).length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No professional capstones found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filterCapstones(professionalCapstones).map((capstone) => (
                    <div
                      key={capstone.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center flex-shrink-0">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {capstone.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {capstone.category.name} Category
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {capstone.requiredDifficultyLevels} difficulty levels
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {capstone.requiredCourses} courses
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {capstone.submissionCount} submissions
                              </Badge>
                              {capstone.isActive ? (
                                <Badge className="bg-green-500/20 text-green-500 border-0">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-500/20 text-gray-500 border-0">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(capstone.id, "professional")}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Capstone Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Create {createType === "difficulty" ? "Difficulty Level" : "Professional"} Capstone
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }}
                placeholder="Capstone title"
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="capstone-slug"
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Capstone description"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {createType === "difficulty" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Difficulty Level *
                  </label>
                  <Select
                    value={formData.difficultyLevelId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficultyLevelId: value })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((dl) => (
                        <SelectItem key={dl.id} value={dl.id}>
                          {dl.category.name} &rarr; {dl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required Courses
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.requiredCourses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requiredCourses: parseInt(e.target.value) || 1,
                      })
                    }
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category *
                  </label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Required Difficulty Levels
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.requiredDifficultyLevels}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiredDifficultyLevels: parseInt(e.target.value) || 1,
                        })
                      }
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Required Courses
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.requiredCourses}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiredCourses: parseInt(e.target.value) || 1,
                        })
                      }
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Title
              </label>
              <Input
                value={formData.projectTitle}
                onChange={(e) =>
                  setFormData({ ...formData, projectTitle: e.target.value })
                }
                placeholder="Capstone project title"
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Requirements
              </label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) =>
                  setFormData({ ...formData, projectDescription: e.target.value })
                }
                placeholder="Project requirements and deliverables"
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Capstone
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
