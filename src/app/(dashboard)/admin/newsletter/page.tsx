"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useNewsletter, NewsletterCampaign } from "@/hooks/useNewsletter"
import {
  Mail, Plus, Send, Edit, Trash2, Eye, Loader2,
  Clock, CheckCircle, AlertCircle, XCircle, FileText
} from "lucide-react"

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  draft: { color: "bg-gray-500/20 text-gray-400", icon: <FileText className="h-3 w-3" />, label: "Draft" },
  scheduled: { color: "bg-blue-500/20 text-blue-400", icon: <Clock className="h-3 w-3" />, label: "Scheduled" },
  sending: { color: "bg-yellow-500/20 text-yellow-400", icon: <Loader2 className="h-3 w-3 animate-spin" />, label: "Sending" },
  sent: { color: "bg-green-500/20 text-green-400", icon: <CheckCircle className="h-3 w-3" />, label: "Sent" },
  failed: { color: "bg-red-500/20 text-red-400", icon: <AlertCircle className="h-3 w-3" />, label: "Failed" },
}

const recipientTypes: Record<string, string> = {
  all: "All Users",
  subscribers: "Newsletter Subscribers",
  enrolled: "Active Subscribers",
  course_specific: "Course Specific",
}

function CampaignModal({
  campaign,
  onClose,
  onSave,
}: {
  campaign?: NewsletterCampaign | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    title: campaign?.title || "",
    subject: campaign?.subject || "",
    content: campaign?.content || "",
    recipientType: campaign?.recipientType || "all",
    scheduledAt: campaign?.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { createCampaign, updateCampaign } = useNewsletter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const data: Partial<NewsletterCampaign> = {
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
    }

    let result
    if (campaign) {
      result = await updateCampaign(campaign.id, data)
    } else {
      result = await createCampaign(data)
    }

    setSaving(false)

    if (result.success) {
      onSave()
      onClose()
    } else {
      setError(result.error || "Failed to save campaign")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-white">
            {campaign ? "Edit Campaign" : "Create New Campaign"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Campaign Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Monthly Learning Roundup"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm text-white/70 mb-1 block">Email Subject *</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Your Learning Journey Continues"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Content (HTML supported)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none"
                rows={10}
                placeholder="<h2>Hello Learner!</h2>&#10;<p>We've added exciting new courses this month...</p>"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Recipients</label>
                <select
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="all">All Users</option>
                  <option value="subscribers">Newsletter Subscribers</option>
                  <option value="enrolled">Active Subscribers</option>
                  <option value="course_specific">Course Specific</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-white/70 mb-1 block">Schedule (optional)</label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
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
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {campaign ? "Update Campaign" : "Create Campaign"}
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

function PreviewModal({
  campaign,
  onClose,
}: {
  campaign: NewsletterCampaign
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900">Email Preview</CardTitle>
          <Button variant="ghost" onClick={onClose} className="text-gray-600">
            <XCircle className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-gray-500">Subject: <span className="font-medium text-gray-900">{campaign.subject}</span></p>
            <p className="text-sm text-gray-500">Recipient Type: <span className="font-medium text-gray-900">{recipientTypes[campaign.recipientType]}</span></p>
          </div>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: campaign.content || "" }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminNewsletterPage() {
  const { campaigns, loading, error, fetchCampaigns, deleteCampaign, sendCampaign } = useNewsletter()
  const [showModal, setShowModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<NewsletterCampaign | null>(null)
  const [previewCampaign, setPreviewCampaign] = useState<NewsletterCampaign | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => {
    fetchCampaigns({ status: statusFilter || undefined })
  }, [fetchCampaigns, statusFilter])

  const handleEditCampaign = (campaign: NewsletterCampaign) => {
    setEditingCampaign(campaign)
    setShowModal(true)
  }

  const handleSendCampaign = async (campaign: NewsletterCampaign) => {
    if (campaign.status === "sent" || campaign.status === "sending") return
    
    if (!confirm(`Send this campaign to all recipients? This action cannot be undone.`)) return
    
    setSendingCampaign(campaign.id)
    const result = await sendCampaign(campaign.id)
    setSendingCampaign(null)
    
    if (result.success) {
      alert(`Campaign sent successfully! ${result.result?.successfulSends || 0} emails delivered.`)
      fetchCampaigns()
    } else {
      alert(`Failed to send campaign: ${result.error}`)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    
    await deleteCampaign(deleteConfirm)
    setDeleteConfirm(null)
    fetchCampaigns()
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not scheduled"
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Newsletter Campaigns</h1>
          <p className="text-white/60">Create and manage email campaigns</p>
        </div>
        <Button 
          onClick={() => {
            setEditingCampaign(null)
            setShowModal(true)
          }}
          className="bg-gradient-to-r from-purple-500 to-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchCampaigns()} className="border-red-500/20 text-red-400">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaigns Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-0">
          {loading && campaigns.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">No campaigns yet</p>
              <Button 
                onClick={() => setShowModal(true)} 
                className="mt-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {campaigns.map((campaign) => {
                    const status = statusConfig[campaign.status] || statusConfig.draft
                    return (
                      <tr key={campaign.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{campaign.title}</span>
                            <span className="text-white/50 text-sm">{campaign.subject}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-white/70">
                          {recipientTypes[campaign.recipientType] || campaign.recipientType}
                        </td>
                        <td className="px-6 py-4 text-white/70 text-sm">
                          {formatDate(campaign.scheduledAt)}
                        </td>
                        <td className="px-6 py-4">
                          {campaign.status === "sent" ? (
                            <div className="flex flex-col text-sm">
                              <span className="text-green-400">{campaign.successfulSends} sent</span>
                              {campaign.failedSends > 0 && (
                                <span className="text-red-400">{campaign.failedSends} failed</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-white/40">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {campaign.content && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewCampaign(campaign)}
                                className="text-white/60 hover:text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {campaign.status === "draft" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCampaign(campaign)}
                                  className="text-white/60 hover:text-white"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendCampaign(campaign)}
                                  disabled={sendingCampaign === campaign.id}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  {sendingCampaign === campaign.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                            {campaign.status !== "sending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(campaign.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Modal */}
      {showModal && (
        <CampaignModal
          campaign={editingCampaign}
          onClose={() => {
            setShowModal(false)
            setEditingCampaign(null)
          }}
          onSave={() => {
            fetchCampaigns()
            setShowModal(false)
            setEditingCampaign(null)
          }}
        />
      )}

      {/* Preview Modal */}
      {previewCampaign && (
        <PreviewModal
          campaign={previewCampaign}
          onClose={() => setPreviewCampaign(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white">Delete Campaign?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                Are you sure you want to delete this campaign? This action cannot be undone.
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