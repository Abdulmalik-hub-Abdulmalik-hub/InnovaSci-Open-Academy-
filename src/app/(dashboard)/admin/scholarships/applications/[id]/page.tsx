"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  User,
  BookOpen,
  Briefcase,
  Heart,
  FileText,
  Mail,
  Phone,
  Globe,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  AlertCircle,
  Loader2,
  Save,
  Send,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  DRAFT: { color: "bg-gray-500/20 text-gray-400", icon: FileText, label: "Draft" },
  SUBMITTED: { color: "bg-blue-500/20 text-blue-400", icon: Clock, label: "Submitted" },
  UNDER_REVIEW: { color: "bg-purple-500/20 text-purple-400", icon: Clock, label: "Under Review" },
  INTERVIEW: { color: "bg-amber-500/20 text-amber-400", icon: Star, label: "Interview" },
  APPROVED: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Approved" },
  REJECTED: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Rejected" },
  AWARDED: { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle, label: "Awarded" },
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/admin/applications/${params.id}`)
        if (!response.ok) {
          throw new Error("Application not found")
        }
        const data = await response.json()
        setApplication(data)
      } catch (error) {
        console.error("Error fetching application:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchApplication()
    }
  }, [params.id])

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/applications/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, decisionNotes: reviewNotes }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus.replace("_", " ")}`,
      })

      // Refresh data
      const data = await response.json()
      setApplication(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleMakeDecision = async (decision: "APPROVED" | "REJECTED") => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/applications/${params.id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          notes: reviewNotes,
          createAward: decision === "APPROVED",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to make decision")
      }

      toast({
        title: decision === "APPROVED" ? "Application Approved" : "Application Rejected",
        description: decision === "APPROVED" 
          ? "The applicant has been approved and will receive an award."
          : "The application has been rejected.",
      })

      // Refresh data
      const data = await response.json()
      setApplication(data.application)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process decision",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Application Not Found</h2>
        <Link href="/admin/scholarships/applications">
          <Button variant="outline" className="mt-4 border-white/10 text-white">
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  const config = statusConfig[application.status] || { color: "bg-gray-500/20 text-gray-400", icon: Clock, label: application.status }
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/scholarships/applications">
            <Button variant="ghost" className="text-white">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                Application {application.applicationNumber}
              </h1>
              <Badge className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-white/60 mt-1">
              Tracking: {application.trackingNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {application.status === "UNDER_REVIEW" || application.status === "INTERVIEW" ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleMakeDecision("REJECTED")}
                disabled={saving}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleMakeDecision("APPROVED")}
                disabled={saving}
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          ) : application.status === "SUBMITTED" ? (
            <Button
              onClick={() => handleStatusChange("UNDER_REVIEW")}
              disabled={saving}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Start Review
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/50 text-sm">Full Name</p>
                  <p className="text-white font-medium">{application.firstName} {application.lastName}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Email</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {application.email}
                  </p>
                </div>
                {application.phone && (
                  <div>
                    <p className="text-white/50 text-sm">Phone</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {application.phone}
                    </p>
                  </div>
                )}
                {application.country && (
                  <div>
                    <p className="text-white/50 text-sm">Country</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {application.country}
                    </p>
                  </div>
                )}
                {application.gender && (
                  <div>
                    <p className="text-white/50 text-sm">Gender</p>
                    <p className="text-white font-medium">{application.gender}</p>
                  </div>
                )}
                {application.dateOfBirth && (
                  <div>
                    <p className="text-white/50 text-sm">Date of Birth</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(application.dateOfBirth), "MMMM d, yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Educational Background */}
          {application.highestDegree && (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Educational Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-sm">Highest Degree</p>
                    <p className="text-white font-medium">{application.highestDegree}</p>
                  </div>
                  {application.institution && (
                    <div>
                      <p className="text-white/50 text-sm">Institution</p>
                      <p className="text-white font-medium">{application.institution}</p>
                    </div>
                  )}
                  {application.fieldOfStudy && (
                    <div>
                      <p className="text-white/50 text-sm">Field of Study</p>
                      <p className="text-white font-medium">{application.fieldOfStudy}</p>
                    </div>
                  )}
                  {application.graduationYear && (
                    <div>
                      <p className="text-white/50 text-sm">Graduation Year</p>
                      <p className="text-white font-medium">{application.graduationYear}</p>
                    </div>
                  )}
                  {application.gpa && (
                    <div>
                      <p className="text-white/50 text-sm">GPA / Grade</p>
                      <p className="text-white font-medium">{application.gpa}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Professional */}
          {application.employmentStatus && (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-400" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-sm">Employment Status</p>
                    <p className="text-white font-medium">{application.employmentStatus}</p>
                  </div>
                  {application.currentEmployer && (
                    <div>
                      <p className="text-white/50 text-sm">Current Employer</p>
                      <p className="text-white font-medium">{application.currentEmployer}</p>
                    </div>
                  )}
                  {application.yearsExperience && (
                    <div>
                      <p className="text-white/50 text-sm">Years of Experience</p>
                      <p className="text-white font-medium">{application.yearsExperience}</p>
                    </div>
                  )}
                </div>

                {/* Online Presence */}
                {(application.linkedIn || application.github || application.googleScholar || application.orcid) && (
                  <>
                    <Separator className="bg-white/10" />
                    <div>
                      <p className="text-white/50 text-sm mb-2">Online Presence</p>
                      <div className="flex flex-wrap gap-2">
                        {application.linkedIn && (
                          <a
                            href={application.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-white/5 rounded-full text-white/80 text-sm flex items-center gap-1 hover:text-blue-400"
                          >
                            <Globe className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                        {application.github && (
                          <a
                            href={application.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-white/5 rounded-full text-white/80 text-sm flex items-center gap-1 hover:text-white"
                          >
                            <Globe className="h-3 w-3" />
                            GitHub
                          </a>
                        )}
                        {application.orcid && (
                          <span className="px-3 py-1 bg-white/5 rounded-full text-white/80 text-sm">
                            ORCID: {application.orcid}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Motivation */}
          {(application.statementOfPurpose || application.motivationLetter || application.financialNeedStatement) && (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-400" />
                  Motivation & Purpose
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.statementOfPurpose && (
                  <div>
                    <p className="text-white/50 text-sm mb-2">Statement of Purpose</p>
                    <p className="text-white/80 whitespace-pre-wrap">{application.statementOfPurpose}</p>
                  </div>
                )}
                {application.motivationLetter && (
                  <div>
                    <p className="text-white/50 text-sm mb-2">Motivation Letter</p>
                    <p className="text-white/80 whitespace-pre-wrap">{application.motivationLetter}</p>
                  </div>
                )}
                {application.financialNeedStatement && (
                  <div>
                    <p className="text-white/50 text-sm mb-2">Financial Need Statement</p>
                    <p className="text-white/80 whitespace-pre-wrap">{application.financialNeedStatement}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {(application.cvUrl || application.transcriptUrl || application.documents) && (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-400" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.cvUrl && (
                    <a
                      href={application.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-amber-400" />
                      <span className="text-white">Curriculum Vitae (CV)</span>
                    </a>
                  )}
                  {application.transcriptUrl && (
                    <a
                      href={application.transcriptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-blue-400" />
                      <span className="text-white">Academic Transcript</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Notes */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Decision Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this application..."
                className="bg-white/5 border-white/10 text-white min-h-[120px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Info */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-white/50 text-sm">Scholarship</p>
                <p className="text-white font-medium">{application.scholarship?.name}</p>
              </div>
              <Separator className="bg-white/10" />
              <div>
                <p className="text-white/50 text-sm">Submitted</p>
                <p className="text-white font-medium">
                  {application.submittedAt 
                    ? format(new Date(application.submittedAt), "MMMM d, yyyy")
                    : "Not submitted"
                  }
                </p>
              </div>
              {application.decisionDate && (
                <>
                  <Separator className="bg-white/10" />
                  <div>
                    <p className="text-white/50 text-sm">Decision Date</p>
                    <p className="text-white font-medium">
                      {format(new Date(application.decisionDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </>
              )}
              {application.decisionNotes && (
                <>
                  <Separator className="bg-white/10" />
                  <div>
                    <p className="text-white/50 text-sm">Decision Notes</p>
                    <p className="text-white/80 text-sm">{application.decisionNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.statusHistory?.map((history: any, index: number) => (
                  <div key={history.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      index === 0 ? "bg-purple-500" : "bg-white/20"
                    }`} />
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        {history.newStatus.replace("_", " ")}
                      </p>
                      <p className="text-white/50 text-xs">
                        {format(new Date(history.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                      {history.notes && (
                        <p className="text-white/60 text-xs mt-1">{history.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {application.status !== "APPROVED" && application.status !== "REJECTED" && application.status !== "AWARDED" && (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {application.status === "SUBMITTED" && (
                  <Button
                    onClick={() => handleStatusChange("UNDER_REVIEW")}
                    disabled={saving}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    Mark as Under Review
                  </Button>
                )}
                {application.status === "UNDER_REVIEW" && (
                  <>
                    <Button
                      onClick={() => handleStatusChange("INTERVIEW")}
                      disabled={saving}
                      className="w-full bg-amber-500 hover:bg-amber-600"
                    >
                      Schedule Interview
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("SUBMITTED")}
                      disabled={saving}
                      className="w-full border-white/10 text-white"
                    >
                      Back to Submitted
                    </Button>
                  </>
                )}
                {application.status === "INTERVIEW" && (
                  <Button
                    onClick={() => handleStatusChange("UNDER_REVIEW")}
                    disabled={saving}
                    variant="outline"
                    className="w-full border-white/10 text-white"
                  >
                    Back to Review
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
