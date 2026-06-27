"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, Plus, Upload, Trash2, Edit2, Check, X, 
  GripVertical, Image, Loader2, AlertCircle, CheckCircle2
} from "lucide-react"
import Link from "next/link"

interface FieldPosition {
  x: number
  y: number
  size: number
  font: string
}

interface TemplateFields {
  studentName: FieldPosition
  courseName: FieldPosition
  issueDate: FieldPosition
  certificateId: FieldPosition
}

interface CertificateTemplate {
  id: string
  name: string
  description?: string
  backgroundUrl: string
  width: number
  height: number
  fields: TemplateFields
  textColor: string
  isActive: boolean
  coursesCount: number
  createdAt: string
  updatedAt: string
}

const FIELD_TYPES = [
  { key: "studentName", label: "Student Name", defaultField: true },
  { key: "courseName", label: "Course Name", defaultField: true },
  { key: "issueDate", label: "Issue Date", defaultField: true },
  { key: "certificateId", label: "Certificate ID", defaultField: true },
] as const

function TemplateEditor({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template?: CertificateTemplate
  onSave: (data: Partial<CertificateTemplate>) => void
  onCancel: () => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<{ field: string; isDragging: boolean }>({ field: "", isDragging: false })
  const [fields, setFields] = useState<TemplateFields>(template?.fields || {
    studentName: { x: 0.5, y: 0.3, size: 48, font: "Georgia" },
    courseName: { x: 0.5, y: 0.45, size: 32, font: "Georgia" },
    issueDate: { x: 0.5, y: 0.6, size: 24, font: "Georgia" },
    certificateId: { x: 0.5, y: 0.75, size: 18, font: "Courier" },
  })
  const [name, setName] = useState(template?.name || "")
  const [description, setDescription] = useState(template?.description || "")
  const [backgroundUrl, setBackgroundUrl] = useState(template?.backgroundUrl || "")
  const [textColor, setTextColor] = useState(template?.textColor || "#1a1a2e")
  const [saving, setSaving] = useState(false)

  const handleMouseDown = (field: string) => {
    setDragState({ field, isDragging: true })
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height))
    
    setFields(prev => ({
      ...prev,
      [dragState.field]: {
        ...prev[dragState.field as keyof TemplateFields],
        x,
        y
      }
    }))
  }, [dragState])

  const handleMouseUp = () => {
    setDragState({ field: "", isDragging: false })
  }

  const handleSave = async () => {
    if (!name.trim() || !backgroundUrl.trim()) {
      alert("Name and background image are required")
      return
    }

    setSaving(true)
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      backgroundUrl: backgroundUrl.trim(),
      fields,
      textColor
    })
  }

  const handleBackgroundUpload = () => {
    // In a real app, this would open a file picker
    // For demo, we'll use a placeholder
    const placeholderUrl = "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=900&fit=crop"
    setBackgroundUrl(placeholderUrl)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel} className="text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {template ? "Edit Template" : "Create New Template"}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="border-white/20 text-white">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Preview */}
        <div className="lg:col-span-2">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Image className="h-5 w-5 text-purple-400" />
                Template Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={canvasRef}
                className="relative w-full aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden cursor-crosshair select-none"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Background Image */}
                {backgroundUrl ? (
                  <img 
                    src={backgroundUrl} 
                    alt="Template background"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">Upload a background image</p>
                    </div>
                  </div>
                )}

                {/* Draggable Fields */}
                {FIELD_TYPES.map(field => {
                  const fieldData = fields[field.key as keyof TemplateFields]
                  return (
                    <div
                      key={field.key}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move ${
                        dragState.field === field.key ? "z-20" : "z-10"
                      }`}
                      style={{ 
                        left: `${fieldData.x * 100}%`, 
                        top: `${fieldData.y * 100}%` 
                      }}
                      onMouseDown={() => handleMouseDown(field.key)}
                    >
                      {/* Field Label */}
                      <div 
                        className="px-3 py-1 rounded text-center whitespace-nowrap"
                        style={{ 
                          fontSize: `${Math.max(10, fieldData.size * 0.4)}px`,
                          color: textColor,
                          fontFamily: fieldData.font,
                          backgroundColor: "rgba(255,255,255,0.9)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                        }}
                      >
                        {field.label}
                      </div>
                      
                      {/* Drag Handle */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
                        <GripVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-sm text-gray-400 mt-4 text-center">
                Drag the field labels to position them on the certificate template
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Template Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Standard Certificate"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-white/70 mb-1 block">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Background Image */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Background Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Image URL</label>
                <Input
                  value={backgroundUrl}
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleBackgroundUpload}
                className="w-full border-white/20 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              {backgroundUrl && (
                <div className="mt-2">
                  <img 
                    src={backgroundUrl} 
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Styling */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Text Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 rounded border border-white/10 bg-transparent"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Positions */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Field Positions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {FIELD_TYPES.map(field => {
                const fieldData = fields[field.key as keyof TemplateFields]
                return (
                  <div key={field.key} className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm font-medium text-white mb-2">{field.label}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>X: {(fieldData.x * 100).toFixed(0)}%</div>
                      <div>Y: {(fieldData.y * 100).toFixed(0)}%</div>
                      <div>Size: {fieldData.size}px</div>
                      <div>Font: {fieldData.font}</div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/certificate-templates')
      const data = await res.json()
      if (data.success) {
        setTemplates(data.data.templates)
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleSave = async (templateData: Partial<CertificateTemplate>) => {
    try {
      if (editingTemplate) {
        const res = await fetch(`/api/admin/certificate-templates/${editingTemplate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        })
        const data = await res.json()
        if (data.success) {
          fetchTemplates()
          setShowEditor(false)
          setEditingTemplate(undefined)
        }
      } else {
        const res = await fetch('/api/admin/certificate-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        })
        const data = await res.json()
        if (data.success) {
          fetchTemplates()
          setShowEditor(false)
        }
      }
    } catch (error) {
      console.error("Failed to save template:", error)
      alert("Failed to save template")
    }
  }

  const handleEdit = (template: CertificateTemplate) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/certificate-templates/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchTemplates()
        setDeleteConfirm(null)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error("Failed to delete template:", error)
    }
  }

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false)
          setEditingTemplate(undefined)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/certificates">
            <Button variant="ghost" className="text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Certificates
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Certificate Templates</h1>
            <p className="text-white/60">Create and manage certificate layouts</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowEditor(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-white/50 mb-4">No certificate templates yet</p>
            <Button 
              onClick={() => setShowEditor(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <Card key={template.id} className="bg-[#1a1a2e] border-white/10 overflow-hidden">
              {/* Preview */}
              <div className="relative aspect-[4/3] bg-gray-800">
                <img 
                  src={template.backgroundUrl} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Preview"
                  }}
                />
                {/* Field indicators */}
                {Object.entries(template.fields).map(([key, field]) => (
                  <div
                    key={key}
                    className="absolute w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg"
                    style={{ 
                      left: `${field.x * 100}%`, 
                      top: `${field.y * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={`${key}: ${(field.x * 100).toFixed(0)}%, ${(field.y * 100).toFixed(0)}%`}
                  />
                ))}
                {/* Active Badge */}
                {!template.isActive && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-yellow-500/80 text-white">
                      Inactive
                    </Badge>
                  </div>
                )}
              </div>

              {/* Info */}
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-white/50 mb-3 line-clamp-2">{template.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className={`${template.coursesCount > 0 ? "text-yellow-400" : "text-white/60"}`}>
                    Used by {template.coursesCount} course{template.coursesCount !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeleteConfirm(template.id)}
                      disabled={template.coursesCount > 0}
                      title={template.coursesCount > 0 ? `This template is used by ${template.coursesCount} courses` : "Delete template"}
                      className={`${template.coursesCount > 0 ? "opacity-50 cursor-not-allowed" : "text-red-400 hover:text-red-300 hover:bg-red-500/10"}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (() => {
        const templateToDelete = templates.find(t => t.id === deleteConfirm)
        const isInUse = templateToDelete && templateToDelete.coursesCount > 0
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className={`h-5 w-5 ${isInUse ? "text-yellow-400" : "text-red-400"}`} />
                  {isInUse ? "Cannot Delete Template" : "Delete Template?"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isInUse ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                      <p className="text-yellow-400 text-sm font-medium mb-1">
                        Template is in use
                      </p>
                      <p className="text-white/60 text-sm">
                        This template is used by {templateToDelete.coursesCount} course{templateToDelete.coursesCount !== 1 ? "s" : ""}. 
                        Remove it from all courses before deleting.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setDeleteConfirm(null)}
                        className="border-white/20 text-white"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-white/60 mb-4">
                      Are you sure you want to delete this template? This action cannot be undone.
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
                        onClick={() => handleDelete(deleteConfirm)}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })()}
    </div>
  )
}