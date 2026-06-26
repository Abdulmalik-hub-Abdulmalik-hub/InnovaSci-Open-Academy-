"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useMaterials, Material } from "@/hooks/useMaterials"
import {
  Search,
  Plus,
  Upload,
  FileText,
  Trash2,
  Edit,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  X,
  File,
  Image,
  Video,
  Music,
  Archive,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const fileTypeIcons: Record<string, React.ElementType> = {
  PDF: FileText,
  DOC: FileText,
  DOCX: FileText,
  PPT: FileText,
  PPTX: FileText,
  XLS: FileText,
  XLSX: FileText,
  TXT: FileText,
  JPG: Image,
  JPEG: Image,
  PNG: Image,
  GIF: Image,
  WEBP: Image,
  MP4: Video,
  WEBM: Video,
  MP3: Music,
  WAV: Music,
  ZIP: Archive,
  RAR: Archive,
}

const fileTypeColors: Record<string, string> = {
  PDF: "bg-red-500/20 text-red-400",
  DOC: "bg-blue-500/20 text-blue-400",
  DOCX: "bg-blue-500/20 text-blue-400",
  PPT: "bg-orange-500/20 text-orange-400",
  PPTX: "bg-orange-500/20 text-orange-400",
  XLS: "bg-green-500/20 text-green-400",
  XLSX: "bg-green-500/20 text-green-400",
  TXT: "bg-gray-500/20 text-gray-400",
  JPG: "bg-purple-500/20 text-purple-400",
  JPEG: "bg-purple-500/20 text-purple-400",
  PNG: "bg-purple-500/20 text-purple-400",
  GIF: "bg-purple-500/20 text-purple-400",
  WEBP: "bg-purple-500/20 text-purple-400",
  MP4: "bg-pink-500/20 text-pink-400",
  WEBM: "bg-pink-500/20 text-pink-400",
  MP3: "bg-yellow-500/20 text-yellow-400",
  WAV: "bg-yellow-500/20 text-yellow-400",
  ZIP: "bg-cyan-500/20 text-cyan-400",
  RAR: "bg-cyan-500/20 text-cyan-400",
}

function FileIcon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  const Icon = fileTypeIcons[type.toUpperCase()] || File
  const colorClass = fileTypeColors[type.toUpperCase()] || "bg-gray-500/20 text-gray-400"

  return (
    <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
      <Icon className={className} />
    </div>
  )
}

function UploadModal({
  lessons,
  onClose,
  onUpload,
}: {
  lessons: { id: string; title: string }[]
  onClose: () => void
  onUpload: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [lessonId, setLessonId] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [downloadAllowed, setDownloadAllowed] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
      if (!title) {
        const fileName = files[0].name.replace(/\.[^/.]+$/, "")
        setTitle(fileName)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
      if (!title) {
        const fileName = files[0].name.replace(/\.[^/.]+$/, "")
        setTitle(fileName)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedFile) {
      setError("Please select a file")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title")
      return
    }

    if (!lessonId) {
      setError("Please select a lesson")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", title.trim())
      formData.append("lessonId", lessonId)
      formData.append("visibility", visibility)
      formData.append("downloadAllowed", String(downloadAllowed))

      const response = await fetch("/api/admin/materials", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Failed to upload material")
        return
      }

      onUpload()
      onClose()
    } catch (err) {
      setError("Failed to upload material")
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-400" />
            Upload Material
          </CardTitle>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* File Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/20 hover:border-white/40"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mp3,.wav,.zip,.rar"
              />

              {selectedFile ? (
                <div className="flex items-center gap-4">
                  <FileIcon type={selectedFile.name.split(".").pop() || ""} className="h-8 w-8" />
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-white/50 text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 text-white/40 mx-auto" />
                  <p className="text-white/60">
                    Drag and drop a file here, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-white/40 text-xs">
                    PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, Images, Videos, Audio, ZIP, RAR
                  </p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-sm text-white/70 mb-1 block">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter material title"
                required
              />
            </div>

            {/* Lesson */}
            <div>
              <label className="text-sm text-white/70 mb-1 block">Lesson *</label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                required
              >
                <option value="">Select a lesson</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="text-sm text-white/70 mb-1 block">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Download Allowed */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="downloadAllowed"
                checked={downloadAllowed}
                onChange={(e) => setDownloadAllowed(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="downloadAllowed" className="text-sm text-white/70">
                Allow students to download this material
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MaterialsPage() {
  const {
    materials,
    loading,
    error,
    pagination,
    lessons,
    fetchMaterials,
    uploadMaterial,
    deleteMaterial,
    refresh,
  } = useMaterials()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLesson, setSelectedLesson] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMaterials({
        page: 1,
        limit: 20,
        search: searchQuery,
        lessonId: selectedLesson,
        type: selectedType,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedLesson, selectedType])

  const handleDeleteMaterial = async (id: string) => {
    setDeleting(true)
    const result = await deleteMaterial(id)
    setDeleting(false)
    if (result.success) {
      setDeleteConfirm(null)
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Materials</h1>
          <p className="text-white/60">Upload and manage course learning materials</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search materials..."
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="">All Lessons</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="">All Types</option>
              <option value="PDF">PDF</option>
              <option value="DOC">DOC</option>
              <option value="DOCX">DOCX</option>
              <option value="PPT">PPT</option>
              <option value="PPTX">PPTX</option>
              <option value="XLS">XLS</option>
              <option value="XLSX">XLSX</option>
              <option value="VIDEO">VIDEO</option>
              <option value="AUDIO">AUDIO</option>
              <option value="IMAGE">IMAGE</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="border-red-500/20 text-red-400"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Materials Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>All Materials ({pagination.total})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              className="text-white/60 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && materials.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">No materials found</p>
              <p className="text-white/40 text-sm mt-1">
                Upload your first learning material to get started
              </p>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-sm text-white/60">
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Lesson</th>
                    <th className="px-4 py-3">Visibility</th>
                    <th className="px-4 py-3">Download</th>
                    <th className="px-4 py-3">Uploaded</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {materials.map((material) => (
                    <tr key={material.id} className="text-sm hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileIcon type={material.type || "FILE"} />
                          <div className="min-w-0">
                            <div className="font-medium text-white line-clamp-1 max-w-[200px]">
                              {material.title}
                            </div>
                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/40 text-xs hover:text-purple-400 flex items-center gap-1"
                            >
                              View file
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={fileTypeColors[material.type || "FILE"]}>
                          {material.type || "FILE"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {material.lesson ? (
                          <div>
                            <div className="line-clamp-1 max-w-[150px]">{material.lesson.title}</div>
                            {material.lesson.courseTitle && (
                              <div className="text-white/40 text-xs">
                                {material.lesson.courseTitle}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            material.visibility === "public"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {material.visibility}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {material.downloadAllowed ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-white/40" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {formatDate(material.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                            title="View file"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          {material.downloadAllowed && (
                            <a
                              href={material.fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(material.id)}
                            className="p-2 rounded-lg hover:bg-white/10 text-red-400"
                            title="Delete material"
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
            onClick={() =>
              fetchMaterials({
                page: pagination.page - 1,
                limit: pagination.limit,
                search: searchQuery,
                lessonId: selectedLesson,
                type: selectedType,
              })
            }
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
            onClick={() =>
              fetchMaterials({
                page: pagination.page + 1,
                limit: pagination.limit,
                search: searchQuery,
                lessonId: selectedLesson,
                type: selectedType,
              })
            }
            className="border-white/20 text-white"
          >
            Next
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          lessons={lessons}
          onClose={() => setShowUploadModal(false)}
          onUpload={refresh}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white">Delete Material?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                Are you sure you want to delete this material? The file will be permanently
                removed from storage.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border-white/20 text-white"
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteMaterial(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}