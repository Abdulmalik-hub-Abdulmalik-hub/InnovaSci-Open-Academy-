"use client"

import { useState, useEffect, useCallback } from "react"
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
  LayoutGrid,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Archive,
  Copy,
  X,
  Check,
  Globe,
  Lock,
  Star,
  Layers,
  Folder,
  GraduationCap,
  Loader2,
  AlertCircle
} from "lucide-react"
import toast from "react-hot-toast"

interface Domain {
  id: string
  name: string
  shortName: string | null
  slug: string
  shortDescription: string | null
  fullDescription: string | null
  thumbnailUrl: string | null
  bannerUrl: string | null
  icon: string | null
  color: string | null
  orderIndex: number
  status: string
  visibility: string
  isFeatured: boolean
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  categoryCount: number
  courseCount: number
  createdAt: string
  updatedAt: string
}

interface DomainFormData {
  name: string
  shortName: string
  shortDescription: string
  fullDescription: string
  thumbnailUrl: string
  bannerUrl: string
  icon: string
  color: string
  orderIndex: number | null
  status: string
  visibility: string
  isFeatured: boolean
  seoTitle: string
  seoDescription: string
  seoKeywords: string
}

const initialFormData: DomainFormData = {
  name: "",
  shortName: "",
  shortDescription: "",
  fullDescription: "",
  thumbnailUrl: "",
  bannerUrl: "",
  icon: "",
  color: "#6366f1",
  orderIndex: null,
  status: "DRAFT",
  visibility: "PUBLIC",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: ""
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [previewDomain, setPreviewDomain] = useState<Domain | null>(null)
  const [formData, setFormData] = useState<DomainFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/domains?includeInactive=true&includeArchived=true")
      const data = await response.json()
      
      if (data.success) {
        setDomains(data.data.domains)
      } else {
        setError(data.error || "Failed to fetch domains")
      }
    } catch (err) {
      setError("Failed to fetch domains")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         domain.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || domain.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const openModal = (domain?: Domain) => {
    if (domain) {
      setEditingDomain(domain)
      setFormData({
        name: domain.name,
        shortName: domain.shortName || "",
        shortDescription: domain.shortDescription || "",
        fullDescription: domain.fullDescription || "",
        thumbnailUrl: domain.thumbnailUrl || "",
        bannerUrl: domain.bannerUrl || "",
        icon: domain.icon || "",
        color: domain.color || "#6366f1",
        orderIndex: domain.orderIndex,
        status: domain.status,
        visibility: domain.visibility,
        isFeatured: domain.isFeatured,
        seoTitle: domain.seoTitle || "",
        seoDescription: domain.seoDescription || "",
        seoKeywords: domain.seoKeywords || ""
      })
    } else {
      setEditingDomain(null)
      setFormData(initialFormData)
    }
    setError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDomain(null)
    setFormData(initialFormData)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError("Domain name is required")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const url = editingDomain 
        ? `/api/admin/domains/${editingDomain.id}`
        : "/api/admin/domains"
      
      const method = editingDomain ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingDomain ? "Domain updated successfully" : "Domain created successfully")
        await fetchDomains()
        closeModal()
      } else {
        setError(data.error || "Failed to save domain")
      }
    } catch (err) {
      setError("Failed to save domain")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (domain: Domain) => {
    if (!confirm(`Are you sure you want to delete "${domain.name}"? This action cannot be undone.`)) return

    try {
      const response = await fetch(`/api/admin/domains/${domain.id}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Domain deleted successfully")
        await fetchDomains()
      } else {
        toast.error(data.error || "Failed to delete domain")
      }
    } catch (err) {
      toast.error("Failed to delete domain")
    }
  }

  const handleToggleStatus = async (domain: Domain) => {
    const newStatus = domain.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
    
    try {
      const response = await fetch(`/api/admin/domains/${domain.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Domain ${newStatus === "PUBLISHED" ? "published" : "unpublished"} successfully`)
        await fetchDomains()
      } else {
        toast.error(data.error || "Failed to update domain")
      }
    } catch (err) {
      toast.error("Failed to update domain")
    }
  }

  const handleToggleFeatured = async (domain: Domain) => {
    try {
      const response = await fetch(`/api/admin/domains/${domain.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !domain.isFeatured })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Domain ${domain.isFeatured ? "removed from featured" : "added to featured"}`)
        await fetchDomains()
      } else {
        toast.error(data.error || "Failed to update domain")
      }
    } catch (err) {
      toast.error("Failed to update domain")
    }
  }

  const handleDuplicate = async (domain: Domain) => {
    try {
      setSaving(true)
      const response = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${domain.name} (Copy)`,
          shortName: domain.shortName,
          shortDescription: domain.shortDescription,
          fullDescription: domain.fullDescription,
          icon: domain.icon,
          color: domain.color,
          status: "DRAFT",
          visibility: domain.visibility
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Domain duplicated successfully")
        await fetchDomains()
      } else {
        toast.error(data.error || "Failed to duplicate domain")
      }
    } catch (err) {
      toast.error("Failed to duplicate domain")
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>
      case "ARCHIVED":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Archived</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "FEATURED":
        return <Star className="h-4 w-4 text-yellow-400" />
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
            <LayoutGrid className="h-6 w-6 text-purple-400" />
            Domain Management
          </h1>
          <p className="text-gray-400 mt-1">Manage academic domains and their categories</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Domains</p>
                <p className="text-2xl font-bold text-white">{domains.length}</p>
              </div>
              <LayoutGrid className="h-10 w-10 text-purple-400/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Published</p>
                <p className="text-2xl font-bold text-green-400">
                  {domains.filter(d => d.status === "PUBLISHED").length}
                </p>
              </div>
              <Globe className="h-10 w-10 text-green-400/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Categories</p>
                <p className="text-2xl font-bold text-blue-400">
                  {domains.reduce((acc, d) => acc + d.categoryCount, 0)}
                </p>
              </div>
              <Folder className="h-10 w-10 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-amber-400">
                  {domains.reduce((acc, d) => acc + d.courseCount, 0)}
                </p>
              </div>
              <GraduationCap className="h-10 w-10 text-amber-400/30" />
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
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Domain List */}
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
      ) : filteredDomains.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-12 text-center">
            <LayoutGrid className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No domains found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery ? "Try adjusting your search query" : "Get started by creating your first domain"}
            </p>
            {!searchQuery && (
              <Button onClick={() => openModal()} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Domain
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDomains.map((domain) => (
            <Card key={domain.id} className="bg-[#1a1a2e] border-white/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {/* Icon/Color */}
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: domain.color ? `${domain.color}20` : '#6366f120' }}
                  >
                    {domain.icon || <LayoutGrid className="h-6 w-6" style={{ color: domain.color || '#6366f1' }} />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">{domain.name}</h3>
                      {getStatusBadge(domain.status)}
                      {domain.isFeatured && (
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {domain.shortDescription || "No description"}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400">Categories</p>
                      <p className="font-semibold text-white">{domain.categoryCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Courses</p>
                      <p className="font-semibold text-white">{domain.courseCount}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewDomain(domain)
                        setShowPreview(true)
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(domain)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(domain)}
                      className="text-gray-400 hover:text-white"
                    >
                      {domain.status === "PUBLISHED" ? <Archive className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(domain)}
                      disabled={saving}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(domain)}
                      disabled={domain.categoryCount > 0}
                      className="text-red-400 hover:text-red-300"
                      title={domain.categoryCount > 0 ? "Cannot delete: domain has categories" : ""}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {expandedDomain === domain.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedDomain === domain.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 p-4 bg-white/5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Slug</p>
                        <p className="text-white">{domain.slug}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Visibility</p>
                        <div className="flex items-center gap-2 text-white">
                          {getVisibilityIcon(domain.visibility)}
                          <span>{domain.visibility}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Order</p>
                        <p className="text-white">{domain.orderIndex}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Featured</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(domain)}
                          className={domain.isFeatured ? "text-yellow-400" : "text-gray-400"}
                        >
                          <Star className={`h-4 w-4 ${domain.isFeatured ? "fill-yellow-400" : ""}`} />
                        </Button>
                      </div>
                      {domain.seoTitle && (
                        <div>
                          <p className="text-sm text-gray-400">SEO Title</p>
                          <p className="text-white">{domain.seoTitle}</p>
                        </div>
                      )}
                      {domain.seoDescription && (
                        <div>
                          <p className="text-sm text-gray-400">SEO Description</p>
                          <p className="text-white line-clamp-2">{domain.seoDescription}</p>
                        </div>
                      )}
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
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDomain ? "Edit Domain" : "Create New Domain"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Domain Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Artificial Intelligence"
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="e.g., AI"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description for cards and listings"
                  rows={2}
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Detailed description for domain landing pages"
                  rows={4}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Appearance</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Settings</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
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
                      <SelectItem value="FEATURED">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Order</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    min="0"
                    value={formData.orderIndex ?? ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      orderIndex: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="0"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${formData.isFeatured ? "bg-yellow-500" : "bg-white/20"}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${formData.isFeatured ? "translate-x-7" : "translate-x-1"}`} />
                </button>
                <span className="text-white">Featured Domain</span>
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">SEO</h3>
              
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Custom title for search engines (max 60 chars)"
                  maxLength={60}
                  className="bg-white/5 border-white/10"
                />
                <p className="text-xs text-gray-500">{(formData.seoTitle || "").length}/60</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Custom description for search engines (max 160 chars)"
                  rows={2}
                  maxLength={160}
                  className="bg-white/5 border-white/10"
                />
                <p className="text-xs text-gray-500">{(formData.seoDescription || "").length}/160</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  placeholder="Comma-separated keywords"
                  className="bg-white/5 border-white/10"
                />
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
                    {editingDomain ? "Update Domain" : "Create Domain"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewDomain?.icon && <span className="text-2xl">{previewDomain.icon}</span>}
              {previewDomain?.name}
              {getStatusBadge(previewDomain?.status || "")}
            </DialogTitle>
          </DialogHeader>
          
          {previewDomain && (
            <div className="space-y-4">
              {previewDomain.bannerUrl && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <img 
                    src={previewDomain.bannerUrl} 
                    alt={previewDomain.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">{previewDomain.categoryCount}</p>
                  <p className="text-sm text-gray-400">Categories</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">{previewDomain.courseCount}</p>
                  <p className="text-sm text-gray-400">Courses</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    {getVisibilityIcon(previewDomain.visibility)}
                    <p className="text-sm text-gray-400">{previewDomain.visibility}</p>
                  </div>
                </div>
              </div>

              {previewDomain.shortDescription && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Description</h4>
                  <p className="text-gray-300">{previewDomain.shortDescription}</p>
                </div>
              )}

              {previewDomain.fullDescription && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Full Description</h4>
                  <p className="text-gray-300 whitespace-pre-wrap">{previewDomain.fullDescription}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
