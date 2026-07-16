"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Award,
  Plus,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  Copy,
  GripVertical,
  MoreVertical,
  Search,
  GraduationCap,
  FlaskConical,
  Heart,
  Globe,
  Star,
  Sparkles,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Database,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScholarshipType {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  isActive: boolean
  orderIndex: number
  scholarshipCount: number
  createdAt: string
  updatedAt: string
}

interface TypeStats {
  total: number
  active: number
  inactive: number
  totalScholarships: number
}

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  FlaskConical,
  Heart,
  Globe,
  Star,
  Sparkles,
  Award,
}

const COLOR_OPTIONS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Pink", value: "#EC4899" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Red", value: "#EF4444" },
  { name: "Teal", value: "#14B8A6" },
]

export default function ScholarshipTypesPage() {
  const { toast } = useToast()
  const [types, setTypes] = useState<ScholarshipType[]>([])
  const [stats, setStats] = useState<TypeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<ScholarshipType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "Award",
    color: "#8B5CF6",
  })

  const fetchTypes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/scholarships/types?includeInactive=${showArchived}`)
      const data = await response.json()
      
      if (data.success) {
        setTypes(data.data.types)
        setStats(data.data.stats)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch scholarship types",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [showArchived, toast])

  useEffect(() => {
    fetchTypes()
  }, [fetchTypes])

  // Handle seed default types
  const handleSeedDefaults = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch("/api/admin/scholarships/types/seed", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Seeded: ${data.data.summary.created} created, ${data.data.summary.updated} updated, ${data.data.summary.skipped} skipped`,
        })
        fetchTypes()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to seed scholarship types",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  // Handle reorder save
  const handleSaveOrder = async (reorderedTypes: ScholarshipType[]) => {
    setIsReordering(true)
    try {
      const response = await fetch("/api/admin/scholarships/types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeIds: reorderedTypes.map(t => t.id),
        }),
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Scholarship types reordered successfully",
        })
        setTypes(data.data.types)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reorder scholarship types",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setIsReordering(false)
    }
  }

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingType ? formData.slug : generateSlug(name),
    })
  }

  const handleOpenModal = (type?: ScholarshipType) => {
    if (type) {
      setEditingType(type)
      setFormData({
        name: type.name,
        slug: type.slug,
        description: type.description || "",
        icon: type.icon || "Award",
        color: type.color || "#8B5CF6",
      })
    } else {
      setEditingType(null)
      setFormData({
        name: "",
        slug: "",
        description: "",
        icon: "Award",
        color: "#8B5CF6",
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" })
      return
    }
    if (!formData.slug.trim()) {
      toast({ title: "Error", description: "Slug is required", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingType
        ? `/api/admin/scholarships/types/${editingType.id}`
        : "/api/admin/scholarships/types"
      
      const response = await fetch(url, {
        method: editingType ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingType
            ? "Scholarship type updated successfully"
            : "Scholarship type created successfully",
        })
        setIsModalOpen(false)
        fetchTypes()
      } else {
        toast({ title: "Error", description: data.error || "Failed to save scholarship type", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (type: ScholarshipType) => {
    try {
      const response = await fetch(`/api/admin/scholarships/types/${type.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !type.isActive }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: type.isActive
            ? "Scholarship type archived"
            : "Scholarship type restored",
        })
        fetchTypes()
      } else {
        toast({ title: "Error", description: data.error || "Failed to update scholarship type", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" })
    }
  }

  const handleDuplicate = (type: ScholarshipType) => {
    handleOpenModal()
    setFormData({
      name: `${type.name} (Copy)`,
      slug: `${type.slug}-copy`,
      description: type.description || "",
      icon: type.icon || "Award",
      color: type.color || "#8B5CF6",
    })
  }

  const handleDelete = async (type: ScholarshipType) => {
    if (type.scholarshipCount > 0) {
      toast({
        title: "Error",
        description: `Cannot delete: ${type.scholarshipCount} scholarship(s) are attached to this type`,
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Are you sure you want to delete "${type.name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/scholarships/types/${type.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({ title: "Success", description: "Scholarship type deleted successfully" })
        fetchTypes()
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete scholarship type", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredTypes = types.filter((type) =>
    type.name.toLowerCase().includes(search.toLowerCase()) ||
    type.slug.toLowerCase().includes(search.toLowerCase())
  )

  const getIcon = (iconName: string) => {
    return ICON_MAP[iconName] || Award
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Types</h1>
          <p className="text-white/60 mt-1">
            Manage scholarship categories and classifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Database className={`h-4 w-4 mr-2 ${isSeeding ? "animate-spin" : ""}`} />
            {isSeeding ? "Seeding..." : "Seed Defaults"}
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Type
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/60">Total Types</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-sm text-white/60">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-400">{stats.inactive}</div>
              <div className="text-sm text-white/60">Archived</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.totalScholarships}</div>
              <div className="text-sm text-white/60">Total Scholarships</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Button
          variant={showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(!showArchived)}
          className={showArchived ? "bg-purple-500" : "border-white/20 text-white hover:bg-white/10"}
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? "Showing All" : "Show Archived"}
        </Button>
      </div>

      {/* Reorder Info */}
      <Card className="bg-purple-500/10 border-purple-500/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">Drag to reorder scholarship types</p>
              <p className="text-xs text-white/60">The order determines how types appear in dropdowns</p>
            </div>
          </div>
          <Button
            onClick={() => {
              const reordered = [...types].sort((a, b) => a.orderIndex - b.orderIndex)
              handleSaveOrder(reordered)
            }}
            disabled={isReordering}
            size="sm"
            variant="outline"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            {isReordering ? "Saving..." : "Reset Order"}
          </Button>
        </CardContent>
      </Card>

      {/* Types List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTypes.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/80 mb-2">No types found</h3>
            <p className="text-white/50 mb-4">
              {search ? "Try adjusting your search" : "Create your first scholarship type or seed defaults"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleSeedDefaults}
                disabled={isSeeding}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Database className="h-4 w-4 mr-2" />
                Seed Defaults
              </Button>
              <Button
                onClick={() => handleOpenModal()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Reorder.Group axis="y" values={filteredTypes} onReorder={handleSaveOrder} className="space-y-3">
          {filteredTypes.map((type) => {
            const Icon = getIcon(type.icon || "Award")
            return (
              <Reorder.Item key={type.id} value={type}>
                <Card
                  className={`bg-[#1a1a2e] border-white/10 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing ${
                    !type.isActive ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-5 w-5 text-white/40" />
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: type.color ? `${type.color}20` : "rgba(139, 92, 246, 0.2)" }}
                      >
                        <Icon className="h-5 w-5" style={{ color: type.color || "#8B5CF6" }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{type.name}</h3>
                          <Badge
                            variant="outline"
                            className={type.isActive ? "border-green-500/50 text-green-400" : "border-amber-500/50 text-amber-400"}
                          >
                            {type.isActive ? "Active" : "Archived"}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/50">{type.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-white/50">
                        {type.scholarshipCount} scholarship{type.scholarshipCount !== 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/60 hover:text-white"
                          onClick={() => {
                            const currentIndex = filteredTypes.findIndex(t => t.id === type.id)
                            if (currentIndex > 0) {
                              const reordered = [...filteredTypes]
                              const temp = reordered[currentIndex]
                              reordered[currentIndex] = reordered[currentIndex - 1]
                              reordered[currentIndex - 1] = temp
                              handleSaveOrder(reordered)
                            }
                          }}
                          disabled={filteredTypes.findIndex(t => t.id === type.id) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/60 hover:text-white"
                          onClick={() => {
                            const currentIndex = filteredTypes.findIndex(t => t.id === type.id)
                            if (currentIndex < filteredTypes.length - 1) {
                              const reordered = [...filteredTypes]
                              const temp = reordered[currentIndex]
                              reordered[currentIndex] = reordered[currentIndex + 1]
                              reordered[currentIndex + 1] = temp
                              handleSaveOrder(reordered)
                            }
                          }}
                          disabled={filteredTypes.findIndex(t => t.id === type.id) === filteredTypes.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white/60">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1a1a2e] border-white/10">
                          <DropdownMenuItem
                            onClick={() => handleOpenModal(type)}
                            className="text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handleOpenModal()
                              setFormData({
                                name: `${type.name} (Copy)`,
                                slug: `${type.slug}-copy`,
                                description: type.description || "",
                                icon: type.icon || "Award",
                                color: type.color || "#8B5CF6",
                              })
                            }}
                            className="text-white hover:bg-white/10"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(type)}
                            className="text-white hover:bg-white/10"
                          >
                            {type.isActive ? (
                              <>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </>
                            ) : (
                              <>
                                <ArchiveRestore className="h-4 w-4 mr-2" />
                                Restore
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(type)}
                            className="text-red-400 hover:bg-red-500/10"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </Reorder.Item>
            </motion.div>
          ))}
        </Reorder.Group>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingType ? "Edit Scholarship Type" : "Create Scholarship Type"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Merit Scholarship"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                placeholder="e.g., merit-scholarship"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this scholarship type is for..."
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ICON_MAP).map(([name, Icon]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: name })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      formData.icon === name
                        ? "bg-purple-500 text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      formData.color === color.value
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]"
                        : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isSubmitting ? "Saving..." : editingType ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
