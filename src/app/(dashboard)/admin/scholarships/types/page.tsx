"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Edit, 
  Trash2,
  Award,
  GraduationCap,
  Heart,
  Briefcase,
  Microscope,
  Sparkles,
  Users,
  Rocket,
  Building2,
  Moon,
  Percent,
  DollarSign,
  Crown,
  Wallet,
  GripVertical,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

interface ScholarshipType {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  orderIndex: number
  isActive: boolean
  scholarshipCount: number
  createdAt: string
}

const iconOptions = [
  { value: "GraduationCap", label: "Graduation Cap", icon: GraduationCap },
  { value: "Award", label: "Award", icon: Award },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Briefcase", label: "Briefcase", icon: Briefcase },
  { value: "Microscope", label: "Microscope", icon: Microscope },
  { value: "Sparkles", label: "Sparkles", icon: Sparkles },
  { value: "Users", label: "Users", icon: Users },
  { value: "Rocket", label: "Rocket", icon: Rocket },
  { value: "Building2", label: "Building", icon: Building2 },
  { value: "Moon", label: "Moon", icon: Moon },
  { value: "Percent", label: "Percent", icon: Percent },
  { value: "DollarSign", label: "Dollar", icon: DollarSign },
  { value: "Crown", label: "Crown", icon: Crown },
  { value: "Wallet", label: "Wallet", icon: Wallet },
]

const colorOptions = [
  { value: "#7C3AED", label: "Purple" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#10B981", label: "Emerald" },
  { value: "#EC4899", label: "Pink" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Violet" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#059669", label: "Green" },
  { value: "#14B8A6", label: "Teal" },
  { value: "#F97316", label: "Orange" },
  { value: "#64748B", label: "Slate" },
]

export default function ScholarshipTypesPage() {
  const [loading, setLoading] = useState(true)
  const [types, setTypes] = useState<ScholarshipType[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingType, setEditingType] = useState<ScholarshipType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Award",
    color: "#7C3AED",
  })

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/scholarship-types")
      const data = await res.json()

      if (data.success) {
        setTypes(data.data.types)
      }
    } catch (error) {
      console.error("Error fetching types:", error)
      toast.error("Failed to load scholarship types")
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingType(null)
    setFormData({
      name: "",
      description: "",
      icon: "Award",
      color: "#7C3AED",
    })
    setShowDialog(true)
  }

  const openEditDialog = (type: ScholarshipType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description || "",
      icon: type.icon || "Award",
      color: type.color || "#7C3AED",
    })
    setShowDialog(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    setSubmitting(true)
    try {
      // In a real implementation, this would call the API
      toast.success(editingType ? "Scholarship type updated" : "Scholarship type created")
      setShowDialog(false)
      fetchTypes()
    } catch (error) {
      toast.error("Failed to save scholarship type")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (type: ScholarshipType) => {
    try {
      // In a real implementation, this would call the API
      toast.success(`${type.name} ${type.isActive ? "deactivated" : "activated"}`)
      fetchTypes()
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(i => i.value === iconName)
    return iconOption?.icon || Award
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Types</h1>
          <p className="text-white/60">Manage scholarship categories and classifications</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </div>

      {/* Types Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </>
        ) : types.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Award className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-lg font-medium text-white mb-2">No scholarship types</h3>
            <p className="text-white/60 mb-4">
              Create your first scholarship type to categorize scholarships
            </p>
            <Button onClick={openCreateDialog} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>
        ) : (
          types.map((type) => {
            const IconComponent = getIconComponent(type.icon || "Award")
            return (
              <Card 
                key={type.id} 
                className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors ${
                  !type.isActive ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${type.color || "#7C3AED"}20` }}
                    >
                      <IconComponent 
                        className="h-6 w-6" 
                        style={{ color: type.color || "#7C3AED" }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={type.isActive ? "success" : "secondary"}>
                        {type.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white h-8 w-8">
                            <GripVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                          <DropdownMenuItem onClick={() => openEditDialog(type)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(type)}>
                            {type.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 focus:text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{type.name}</h3>
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">
                    {type.description || "No description"}
                  </p>

                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Scholarships</span>
                      <span className="text-lg font-semibold text-white">{type.scholarshipCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingType ? "Edit Scholarship Type" : "Create Scholarship Type"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/20 text-white mt-1"
                placeholder="e.g., Merit Scholarships"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/20 text-white mt-1"
                placeholder="Describe this scholarship type..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: opt.value }))}
                        className={`p-3 rounded-lg border transition-colors ${
                          formData.icon === opt.value
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <Icon className={`h-5 w-5 mx-auto ${formData.icon === opt.value ? "text-purple-400" : "text-white/60"}`} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: opt.value }))}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === opt.value ? "ring-2 ring-white scale-110" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: opt.value }}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/60 mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  {(() => {
                    const Icon = getIconComponent(formData.icon)
                    return <Icon className="h-5 w-5" style={{ color: formData.color }} />
                  })()}
                </div>
                <div>
                  <p className="font-medium text-white">{formData.name || "Type Name"}</p>
                  <p className="text-xs text-white/60">
                    {formData.description ? `${formData.description.substring(0, 50)}...` : "Description"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !formData.name.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingType ? "Save Changes" : "Create Type"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
