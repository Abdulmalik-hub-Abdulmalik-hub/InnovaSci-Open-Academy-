"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Folder,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Globe,
  Lock,
  Loader2,
  AlertCircle,
  LayoutGrid
} from "lucide-react"
import toast from "react-hot-toast"

interface Domain {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  thumbnailUrl: string | null
  bannerUrl: string | null
  color: string | null
  orderIndex: number
  isActive: boolean
  status: string
  visibility: string
  domainId: string | null
  domain: Domain | null
  courseCount: number
  createdAt: string
  updatedAt: string
}

interface CategoryFormData {
  name: string
  description: string
  icon: string
  color: string
  domainId: string
  thumbnailUrl: string
  bannerUrl: string
  status: string
  visibility: string
}

const initialFormData: CategoryFormData = {
  name: "",
  description: "",
  icon: "",
  color: "#6366f1",
  domainId: "",
  thumbnailUrl: "",
  bannerUrl: "",
  status: "ACTIVE",
  visibility: "PUBLIC"
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDomain, setFilterDomain] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/categories?includeInactive=true")
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data.categories)
      } else {
        setError(data.error || "Failed to fetch categories")
      }
    } catch (err) {
      setError("Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/admin/domains?includeInactive=true&includeArchived=true")
      const data = await response.json()
      
      if (data.success) {
        setDomains(data.data.domains)
      }
    } catch (err) {
      console.error("Failed to fetch domains:", err)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchDomains()
  }, [])

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDomain = filterDomain === "all" || category.domainId === filterDomain
    const matchesStatus = filterStatus === "all" || category.status === filterStatus
    return matchesSearch && matchesDomain && matchesStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError("Category name is required")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories"
      
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingCategory ? "Category updated successfully" : "Category created successfully")
        await fetchCategories()
        closeModal()
      } else {
        setError(data.error || "Failed to save category")
      }
    } catch (err) {
      setError("Failed to save category")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Category deleted successfully")
        await fetchCategories()
      } else {
        toast.error(data.error || "Failed to delete category")
      }
    } catch (err) {
      toast.error("Failed to delete category")
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Category updated successfully")
        await fetchCategories()
      } else {
        toast.error(data.error || "Failed to update category")
      }
    } catch (err) {
      toast.error("Failed to update category")
    }
  }

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        color: category.color || "#6366f1",
        domainId: category.domainId || "",
        thumbnailUrl: category.thumbnailUrl || "",
        bannerUrl: category.bannerUrl || "",
        status: category.status,
        visibility: category.visibility
      })
    } else {
      setEditingCategory(null)
      setFormData(initialFormData)
    }
    setError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData(initialFormData)
    setError(null)
  }

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inactive</Badge>
    }
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{status}</Badge>
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PRIVATE":
        return <Lock className="h-4 w-4 text-gray-400" />
      default:
        return <Globe className="h-4 w-4 text-blue-400" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Folder className="h-6 w-6 text-purple-400" />
            Category Management
          </h1>
          <p className="text-gray-400 mt-1">Manage course categories within domains</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Categories</p>
                <p className="text-2xl font-bold text-white">{categories.length}</p>
              </div>
              <Folder className="h-10 w-10 text-purple-400/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Categories</p>
                <p className="text-2xl font-bold text-green-400">
                  {categories.filter(c => c.isActive).length}
                </p>
              </div>
              <Check className="h-10 w-10 text-green-400/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Domains</p>
                <p className="text-2xl font-bold text-blue-400">{domains.length}</p>
              </div>
              <LayoutGrid className="h-10 w-10 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="">No Domain</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    <div className="flex items-center gap-2">
                      {domain.icon && <span>{domain.icon}</span>}
                      {domain.color && (
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.color }} />
                      )}
                      <span>{domain.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[150px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48 bg-white/10" />
                    <Skeleton className="h-4 w-32 bg-white/10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-12 text-center">
            <Folder className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No categories found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || filterDomain !== "all" || filterStatus !== "all" 
                ? "Try adjusting your filters"
                : "Get started by creating your first category"}
            </p>
            {!searchQuery && filterDomain === "all" && filterStatus === "all" && (
              <Button onClick={() => openModal()} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="bg-[#1a1a2e] border-white/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {/* Icon/Color */}
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color ? `${category.color}20` : '#6366f120' }}
                  >
                    {category.icon || <Folder className="h-6 w-6" style={{ color: category.color || '#6366f1' }} />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">{category.name}</h3>
                      {getStatusBadge(category.status, category.isActive)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {category.domain ? (
                        <span className="text-purple-400">
                          {category.domain.icon && <span className="mr-1">{category.domain.icon}</span>}
                          {category.domain.name}
                        </span>
                      ) : (
                        <span className="text-gray-500">No Domain</span>
                      )}
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400 truncate">{category.description || "No description"}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400">Courses</p>
                      <p className="font-semibold text-white">{category.courseCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Visibility</p>
                      <div className="flex items-center justify-center gap-1">
                        {getVisibilityIcon(category.visibility)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(category)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(category)}
                      className="text-gray-400 hover:text-white"
                    >
                      {category.isActive ? <Lock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      disabled={category.courseCount > 0}
                      className="text-red-400 hover:text-red-300"
                      title={category.courseCount > 0 ? "Cannot delete: category has courses" : ""}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {expandedCategory === category.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 p-4 bg-white/5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Slug</p>
                        <p className="text-white">{category.slug}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Order</p>
                        <p className="text-white">{category.orderIndex}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="domainId">Domain *</Label>
              <Select value={formData.domainId} onValueChange={(v) => setFormData({ ...formData, domainId: v })}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Domain</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <div className="flex items-center gap-2">
                        {domain.icon && <span>{domain.icon}</span>}
                        {domain.color && (
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.color }} />
                        )}
                        <span>{domain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Machine Learning"
                className="bg-white/5 border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., 🤖"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 border border-white/10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#6366f1"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(v) => setFormData({ ...formData, visibility: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} className="border-white/10 text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {editingCategory ? "Update" : "Create"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
