"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCertificates, Certificate } from "@/hooks/useCertificates"
import { 
  Search, Award, CheckCircle, XCircle, RefreshCw, 
  ExternalLink, Trash2, Download, Loader2
} from "lucide-react"

const statusColors: Record<string, string> = {
  issued: "bg-green-500/20 text-green-400 border-green-500/50",
  revoked: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
}

function GenerateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [userId, setUserId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { generateCertificate } = useCertificates()

  const handleGenerate = async () => {
    if (!userId.trim() || !courseId.trim()) {
      setError("Both User ID and Course ID are required")
      return
    }

    setLoading(true)
    setError("")

    const result = await generateCertificate(userId.trim(), courseId.trim())

    setLoading(false)

    if (result.success) {
      onSuccess()
      onClose()
    } else {
      setError(result.error || "Failed to generate certificate")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Generate Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-white/70 mb-1 block">User ID *</label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Enter user ID"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-1 block">Course ID *</label>
            <Input
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Enter course ID"
              disabled={loading}
            />
          </div>

          <p className="text-white/40 text-sm">
            A certificate will only be generated if the user is enrolled in and has completed the course.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminCertificatesPage() {
  const { 
    certificates, 
    loading, 
    error, 
    pagination, 
    fetchCertificates, 
    revokeCertificate, 
    deleteCertificate 
  } = useCertificates()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificates({ status: statusFilter !== "all" ? statusFilter : undefined })
  }, [fetchCertificates, statusFilter])

  const handleSearch = () => {
    fetchCertificates({ 
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchQuery || undefined 
    })
  }

  const handleRefresh = () => {
    fetchCertificates({ status: statusFilter !== "all" ? statusFilter : undefined })
  }

  const handleRevoke = async (id: string) => {
    await revokeCertificate(id)
    fetchCertificates({ status: statusFilter !== "all" ? statusFilter : undefined })
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    await deleteCertificate(deleteConfirm)
    setDeleteConfirm(null)
    fetchCertificates({ status: statusFilter !== "all" ? statusFilter : undefined })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificate Management</h1>
          <p className="text-white/60">Issue, verify, and manage student certificates</p>
        </div>
        <Button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500"
        >
          <Award className="h-4 w-4 mr-2" />
          Generate Certificate
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-white/5 border-white/10 text-white"
                placeholder="Search by name, email, or verification code..."
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="revoked">Revoked</option>
            </select>

            <Button variant="outline" onClick={handleSearch} className="border-white/20 text-white">
              Search
            </Button>
            
            <Button variant="outline" onClick={handleRefresh} className="border-white/20 text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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

      {/* Certificates Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>All Certificates ({pagination.total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && certificates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">No certificates found</p>
              <Button 
                onClick={() => setShowGenerateModal(true)} 
                className="mt-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
              >
                <Award className="h-4 w-4 mr-2" />
                Generate First Certificate
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-sm text-white/60">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Verification Code</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Issued Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="text-sm hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white font-medium">
                            {cert.user?.name || "Unknown"}
                          </div>
                          <div className="text-white/50 text-xs">
                            {cert.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        <div className="max-w-[200px] truncate">
                          {cert.course?.title || "Unknown Course"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-xs">
                          {cert.verificationCode}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[cert.status] || "bg-gray-500/20 text-gray-400"}>
                          {cert.status === "issued" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {cert.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {formatDate(cert.issuedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {cert.certificateUrl && (
                            <a
                              href={cert.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                              title="View Certificate"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <a
                            href={`/verify/${cert.verificationCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-purple-400"
                            title="Verification Link"
                          >
                            <Award className="h-4 w-4" />
                          </a>
                          {cert.status === "issued" && (
                            <button
                              onClick={() => handleRevoke(cert.id)}
                              className="p-2 rounded-lg hover:bg-yellow-500/10 text-yellow-400"
                              title="Revoke Certificate"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(cert.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                            title="Delete Certificate"
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
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchCertificates({ 
              page: pagination.page - 1,
              status: statusFilter !== "all" ? statusFilter : undefined 
            })}
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
            onClick={() => fetchCertificates({ 
              page: pagination.page + 1,
              status: statusFilter !== "all" ? statusFilter : undefined 
            })}
            className="border-white/20 text-white"
          >
            Next
          </Button>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => fetchCertificates({ 
            status: statusFilter !== "all" ? statusFilter : undefined 
          })}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white">Delete Certificate?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                Are you sure you want to delete this certificate? This action cannot be undone.
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
                  onClick={handleDelete}
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