"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useStorage, StoredFile } from "@/hooks/useStorage"
import {
  FolderOpen, Upload, Trash2, Image, FileText, Video, Music,
  Archive, File, Loader2, Grid, List, Search, AlertTriangle,
  Check, X, Link, HardDrive, RefreshCw
} from "lucide-react"

const fileTypeIcons: Record<string, React.ReactNode> = {
  IMAGE: <Image className="h-5 w-5 text-green-400" />,
  VIDEO: <Video className="h-5 w-5 text-purple-400" />,
  AUDIO: <Music className="h-5 w-5 text-yellow-400" />,
  DOCUMENT: <FileText className="h-5 w-5 text-blue-400" />,
  ARCHIVE: <Archive className="h-5 w-5 text-orange-400" />,
  OTHER: <File className="h-5 w-5 text-gray-400" />,
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function FileCard({ file, onDelete, onCopy }: { file: StoredFile; onDelete: (id: string) => void; onCopy: (url: string) => void }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 p-4 hover:border-white/20 transition-colors group">
      {/* Preview */}
      <div className="aspect-video bg-white/5 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {file.fileType === "IMAGE" && !imageError ? (
          <img
            src={file.fileUrl}
            alt={file.originalName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          fileTypeIcons[file.fileType] || fileTypeIcons.OTHER
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h4 className="text-white font-medium text-sm truncate" title={file.originalName}>
          {file.originalName}
        </h4>
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{formatFileSize(file.fileSize)}</span>
          <Badge className="bg-white/10 text-white/60 text-xs">{file.fileType}</Badge>
        </div>
        {file.folder && (
          <div className="text-xs text-purple-400 flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            {file.folder}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(file.fileUrl)}
          className="flex-1 text-white/60 hover:text-white"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(file.id)}
          className="flex-1 text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function FileRow({ file, onDelete, onCopy }: { file: StoredFile; onDelete: (id: string) => void; onCopy: (url: string) => void }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {fileTypeIcons[file.fileType] || fileTypeIcons.OTHER}
          <div>
            <p className="text-white font-medium text-sm truncate max-w-xs">{file.originalName}</p>
            {file.folder && (
              <p className="text-white/40 text-xs">{file.folder}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-white/60 text-sm">{file.fileType}</td>
      <td className="px-4 py-3 text-white/60 text-sm">{formatFileSize(file.fileSize)}</td>
      <td className="px-4 py-3 text-white/60 text-sm">
        {new Date(file.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(file.fileUrl)}
            className="text-white/60 hover:text-white"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(file.id)}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function UploadZone({ onUpload }: { onUpload: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setUploading(true)
      setProgress(0)
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90))
      }, 100)
      
      await onUpload(files)
      
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => setUploading(false), 500)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploading(true)
      setProgress(0)
      
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90))
      }, 100)
      
      await onUpload(files)
      
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => setUploading(false), 500)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragging 
          ? "border-purple-500 bg-purple-500/10" 
          : "border-white/20 hover:border-white/30"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        className="hidden"
        id="file-upload"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-10 w-10 text-purple-400 animate-spin mx-auto" />
            <p className="text-white/60">Uploading...</p>
            <div className="w-48 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 mb-1">Drag and drop files here, or click to browse</p>
            <p className="text-white/40 text-sm">Images, Videos, Documents, Archives up to 50MB</p>
          </>
        )}
      </label>
    </div>
  )
}

export default function AdminStoragePage() {
  const { files, storageInfo, loading, uploading, error, fetchFiles, uploadFiles, deleteFile, findOrphans, deleteOrphans } = useStorage()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [typeFilter, setTypeFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showOrphans, setShowOrphans] = useState(false)
  const [orphans, setOrphans] = useState<StoredFile[]>([])
  const [selectedOrphans, setSelectedOrphans] = useState<string[]>([])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleUpload = async (files: File[]) => {
    await uploadFiles(files)
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await deleteFile(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const handleFindOrphans = async () => {
    const result = await findOrphans()
    if (result) {
      setOrphans(result.orphans)
      setSelectedOrphans([])
      setShowOrphans(true)
    }
  }

  const handleDeleteOrphans = async () => {
    if (selectedOrphans.length === 0) return
    
    if (!confirm(`Delete ${selectedOrphans.length} orphaned files?`)) return
    
    const result = await deleteOrphans(selectedOrphans)
    if (result.success) {
      alert(`Freed ${result.freedSpace}`)
      setShowOrphans(false)
    }
  }

  const filteredFiles = files.filter(file => {
    if (typeFilter && file.fileType !== typeFilter) return false
    if (searchQuery && !file.originalName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Storage Manager</h1>
          <p className="text-white/60">Manage files and assets</p>
        </div>
        <Button 
          variant="outline"
          onClick={handleFindOrphans}
          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Find Orphans
        </Button>
      </div>

      {/* Storage Stats */}
      {storageInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <HardDrive className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-white/60 text-sm">Total Files</p>
                  <p className="text-white text-xl font-bold">{storageInfo.totalDbRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-white/60 text-sm">Local Files</p>
                  <p className="text-white text-xl font-bold">{storageInfo.localFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <HardDrive className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-white/60 text-sm">Local Size</p>
                  <p className="text-white text-xl font-bold">{storageInfo.localSizeFormatted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex items-center justify-center">
              <Button onClick={() => fetchFiles()} variant="ghost" className="text-white/60">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Zone */}
      <UploadZone onUpload={handleUpload} />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          <option value="">All Types</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Videos</option>
          <option value="AUDIO">Audio</option>
          <option value="DOCUMENT">Documents</option>
          <option value="ARCHIVE">Archives</option>
        </select>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40"}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/40"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchFiles()} className="border-red-500/20 text-red-400">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Files Grid/List */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">No files found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onDelete={handleDelete}
                  onCopy={handleCopyUrl}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">File</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Uploaded</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      onDelete={handleDelete}
                      onCopy={handleCopyUrl}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Delete File?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                Are you sure you want to delete this file? This action cannot be undone.
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orphans Modal */}
      {showOrphans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Orphaned Files ({orphans.length})
              </CardTitle>
              <Button variant="ghost" onClick={() => setShowOrphans(false)} className="text-white/60">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                These files are not linked to any course or resource. You can safely delete them to free up storage space.
              </p>
              {orphans.length === 0 ? (
                <p className="text-green-400 text-center py-8">No orphaned files found!</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 text-white/60">
                      <input
                        type="checkbox"
                        checked={selectedOrphans.length === orphans.length}
                        onChange={(e) => setSelectedOrphans(e.target.checked ? orphans.map(o => o.id) : [])}
                        className="rounded"
                      />
                      Select All ({selectedOrphans.length} selected)
                    </label>
                    <Button
                      onClick={handleDeleteOrphans}
                      disabled={selectedOrphans.length === 0}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Selected
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orphans.map((orphan) => (
                      <div 
                        key={orphan.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOrphans.includes(orphan.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrphans([...selectedOrphans, orphan.id])
                            } else {
                              setSelectedOrphans(selectedOrphans.filter(id => id !== orphan.id))
                            }
                          }}
                          className="rounded"
                        />
                        {fileTypeIcons[orphan.fileType] || fileTypeIcons.OTHER}
                        <div className="flex-1">
                          <p className="text-white text-sm">{orphan.originalName}</p>
                          <p className="text-white/40 text-xs">{formatFileSize(orphan.fileSize)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}