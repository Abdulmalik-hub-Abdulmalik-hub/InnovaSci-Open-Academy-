"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useVideos, Video } from "@/hooks/useVideos"
import { 
  Search, Plus, Edit, Trash2, Upload, X, Loader2, 
  Play, Film, Clock, FolderOpen, ExternalLink
} from "lucide-react"

const providerColors: Record<string, string> = {
  youtube: "bg-red-500/20 text-red-400",
  vimeo: "bg-blue-500/20 text-blue-400",
  local: "bg-green-500/20 text-green-400",
  s3: "bg-orange-500/20 text-orange-400",
  mux: "bg-purple-500/20 text-purple-400",
  url: "bg-gray-500/20 text-gray-400",
}

function VideoModal({ 
  video,
  onClose,
  onSave,
  lessonOptions = []
}: { 
  video?: Video | null
  onClose: () => void
  onSave: () => void
  lessonOptions?: { id: string; title: string; course: string }[]
}) {
  const [formData, setFormData] = useState({
    lessonId: video?.lesson?.id || "",
    title: video?.title || "",
    videoUrl: video?.videoUrl || "",
    provider: video?.provider || "url",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { createVideo } = useVideos()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const result = await createVideo({
        lessonId: formData.lessonId,
        title: formData.title,
        videoUrl: formData.videoUrl || undefined,
        provider: formData.provider,
      })

      if (!result.success) {
        setError(result.error || "Failed to save video")
        return
      }

      onSave()
      onClose()
    } catch (err) {
      setError("Failed to save video")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-[#1a1a2e] z-10">
          <CardTitle className="text-white">
            {video ? "Edit Video" : "Add Video"}
          </CardTitle>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm text-white/70 mb-1 block">Video Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Introduction to Python"
                required
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Lesson ID *</label>
              <Input
                value={formData.lessonId}
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter lesson ID"
                required
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Video URL</label>
              <Input
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-white/40 mt-1">
                Or upload a file directly below
              </p>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="url">External URL</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="local">Local Upload</option>
                <option value="s3">AWS S3</option>
                <option value="mux">Mux</option>
              </select>
            </div>

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
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {video ? "Update" : "Add Video"}
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

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("")
  const [lessonId, setLessonId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const { createVideo } = useVideos()

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile)
      } else {
        setError("Please drop a video file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const simulateProgress = () => {
    let prog = 0
    const interval = setInterval(() => {
      prog += Math.random() * 15
      if (prog >= 100) {
        prog = 100
        clearInterval(interval)
      }
      setProgress(prog)
    }, 500)
    return interval
  }

  const handleUpload = async () => {
    if (!title.trim() || !lessonId.trim() || !file) {
      setError("Please fill in all fields and select a file")
      return
    }

    setUploading(true)
    setError("")
    const progressInterval = simulateProgress()

    try {
      const result = await createVideo({
        lessonId,
        title,
        file,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!result.success) {
        setError(result.error || "Upload failed")
        setUploading(false)
        return
      }

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setError("Upload failed")
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-400" />
            Upload Video
          </CardTitle>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-white/70 mb-1 block">Video Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Module 1: Introduction"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-1 block">Lesson ID *</label>
            <Input
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Enter the lesson ID to attach this video"
              disabled={uploading}
            />
          </div>

          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? "border-purple-400 bg-purple-500/10" 
                : "border-white/20 hover:border-white/40"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <Film className="h-8 w-8 text-purple-400" />
                <div className="text-left">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-white/50 text-sm">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-white/40 mx-auto mb-3" />
                <p className="text-white/70">
                  Drag and drop your video here, or{" "}
                  <span className="text-purple-400">browse</span>
                </p>
                <p className="text-white/40 text-sm mt-2">
                  MP4, WebM, MOV up to 500MB
                </p>
              </>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Uploading...</span>
                <span className="text-purple-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !title || !lessonId || !file}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminVideosPage() {
  const { videos, loading, error, pagination, fetchVideos, deleteVideo } = useVideos()
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleRefresh = () => {
    fetchVideos()
  }

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video)
    setShowModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    
    await deleteVideo(deleteConfirm)
    setDeleteConfirm(null)
    fetchVideos()
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.lesson?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Video Management</h1>
          <p className="text-white/60">Manage course video content and uploads</p>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
                placeholder="Search videos..."
              />
            </div>
            <Button variant="outline" onClick={handleRefresh} className="border-white/20 text-white">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="border-red-500/20 text-red-400">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Videos Grid */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>All Videos ({pagination.total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && videos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Film className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">No videos found</p>
              <Button 
                onClick={() => setShowUploadModal(true)} 
                className="mt-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Video
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <div 
                  key={video.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Play className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{video.title}</h3>
                      <p className="text-white/50 text-sm truncate">
                        {video.lesson?.module?.course?.title || "No course"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={providerColors[video.provider || "url"]}>
                      {video.provider || "url"}
                    </Badge>
                    {video.duration && (
                      <span className="flex items-center gap-1 text-white/40 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </div>

                  {video.lesson && (
                    <div className="flex items-center gap-2 text-white/40 text-sm mb-3">
                      <FolderOpen className="h-3 w-3" />
                      <span className="truncate">{video.lesson.title}</span>
                    </div>
                  )}

                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-400 text-sm hover:underline mb-3"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View URL
                    </a>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditVideo(video)}
                      className="flex-1 text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(video.id)}
                      className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchVideos({ page: pagination.page - 1 })}
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
            onClick={() => fetchVideos({ page: pagination.page + 1 })}
            className="border-white/20 text-white"
          >
            Next
          </Button>
        </div>
      )}

      {/* Video Modal */}
      {showModal && (
        <VideoModal
          video={editingVideo}
          onClose={() => {
            setShowModal(false)
            setEditingVideo(null)
          }}
          onSave={() => {
            fetchVideos()
            setShowModal(false)
            setEditingVideo(null)
          }}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchVideos()
            setShowUploadModal(false)
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white">Delete Video?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                Are you sure you want to delete this video? This action cannot be undone.
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
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}