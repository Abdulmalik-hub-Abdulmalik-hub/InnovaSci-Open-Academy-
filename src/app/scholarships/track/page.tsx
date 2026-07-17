"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  FileText,
  Mail,
  Calendar,
  User,
  Loader2,
  ExternalLink,
  GraduationCap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Application {
  id: string
  applicationNumber: string
  trackingCode: string
  scholarship: {
    id: string
    name: string
    slug: string
    scholarshipType: { name: string; color: string } | null
  }
  applicantName: string
  email: string
  status: string
  subStatus: string | null
  decision: string | null
  reviewScore: number | null
  interviewScheduledAt: string | null
  interviewScore: number | null
  awardAmount: number | null
  awardLetterUrl: string | null
  awardAcceptedAt: string | null
  enrollmentStatus: string | null
  submittedAt: string | null
  createdAt: string
  documents: { id: string; type: string; label: string; status: string; fileName: string }[]
  review: {
    id: string
    status: string
    totalScore: number
    recommendation: string
    submittedAt: string
  } | null
  timeline: {
    step: string
    label: string
    description: string
    completed: boolean
    date: string | null
  }[]
}

export default function TrackApplicationPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [error, setError] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [searchBy, setSearchBy] = useState<"trackingCode" | "applicationNumber" | "email">("trackingCode")

  useEffect(() => {
    // Check if coming from success page
    const applicationNumber = searchParams.get("applicationNumber")
    const trackingCode = searchParams.get("trackingCode")
    
    if (applicationNumber && trackingCode) {
      trackApplication(trackingCode)
    }
  }, [searchParams])

  const trackApplication = async (code?: string) => {
    const searchCode = code || searchInput
    if (!searchCode && !emailInput) {
      setError("Please enter a tracking code, application number, or email address")
      return
    }

    setLoading(true)
    setError("")
    setApplication(null)

    try {
      const params = new URLSearchParams()
      if (searchBy === "email") {
        params.set("email", emailInput || searchCode)
      } else if (searchBy === "applicationNumber") {
        params.set("applicationNumber", searchCode)
      } else {
        params.set("trackingCode", searchCode)
      }

      const res = await fetch(`/api/public/scholarships/track?${params}`)
      const data = await res.json()

      if (data.success) {
        setApplication(data.data.application)
      } else {
        setError(data.error || "Application not found")
      }
    } catch (err) {
      setError("Failed to track application. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "purple"; label: string; icon: any }> = {
      SUBMITTED: { variant: "secondary", label: "Submitted", icon: FileText },
      UNDER_REVIEW: { variant: "purple", label: "Under Review", icon: Clock },
      INTERVIEW: { variant: "purple", label: "Interview Scheduled", icon: Calendar },
      APPROVED: { variant: "default", label: "Approved", icon: CheckCircle },
      REJECTED: { variant: "destructive", label: "Not Selected", icon: XCircle },
      WAITLISTED: { variant: "purple", label: "Waitlisted", icon: Clock },
      AWARDED: { variant: "default", label: "Awarded", icon: CheckCircle },
      ENROLLED: { variant: "default", label: "Enrolled", icon: GraduationCap },
    }
    const config = statusMap[status] || { variant: "secondary" as const, label: status, icon: AlertCircle }
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Pending"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/scholarships" className="flex items-center gap-2 text-white/70 hover:text-white">
            ← Back to Scholarships
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Search Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">Track Your Application</h1>
            <p className="text-white/70 mb-8">
              Enter your tracking code, application number, or email to check your application status
            </p>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex gap-2">
                    <Button
                      variant={searchBy === "trackingCode" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSearchBy("trackingCode")}
                      className={searchBy === "trackingCode" ? "bg-purple-600" : "border-white/20 text-white"}
                    >
                      Tracking Code
                    </Button>
                    <Button
                      variant={searchBy === "applicationNumber" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSearchBy("applicationNumber")}
                      className={searchBy === "applicationNumber" ? "bg-purple-600" : "border-white/20 text-white"}
                    >
                      Application #
                    </Button>
                    <Button
                      variant={searchBy === "email" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSearchBy("email")}
                      className={searchBy === "email" ? "bg-purple-600" : "border-white/20 text-white"}
                    >
                      Email
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      value={searchBy === "email" ? emailInput : searchInput}
                      onChange={(e) => {
                        if (searchBy === "email") {
                          setEmailInput(e.target.value)
                        } else {
                          setSearchInput(e.target.value)
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && trackApplication()}
                      placeholder={
                        searchBy === "trackingCode" 
                          ? "Enter your tracking code (e.g., ABC12345)"
                          : searchBy === "applicationNumber"
                          ? "Enter your application number (e.g., SCH-2024-000001)"
                          : "Enter your email address"
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-lg h-12"
                    />
                  </div>
                  <Button 
                    onClick={() => trackApplication()}
                    disabled={loading}
                    className="h-12 px-8 bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Details */}
          {application && (
            <div className="space-y-6">
              {/* Status Header */}
              <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/20">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <Badge variant="secondary" className="mb-2 bg-white/10 text-white">
                        {application.applicationNumber}
                      </Badge>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {application.applicantName}
                      </h2>
                      <p className="text-white/60">{application.email}</p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-white/60 mb-1">Scholarship</p>
                      <p className="text-white font-medium">{application.scholarship.name}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-white/60 mb-1">Tracking Code</p>
                      <p className="text-white font-mono text-lg">{application.trackingCode}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-white/60 mb-1">Submitted</p>
                      <p className="text-white">{formatDate(application.submittedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Application Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {application.timeline.map((item, index) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.completed 
                                ? "bg-green-500 text-white" 
                                : "bg-white/10 text-white/40"
                            }`}
                          >
                            {item.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </div>
                          {index < application.timeline.length - 1 && (
                            <div className={`w-0.5 h-12 ${item.completed ? "bg-green-500" : "bg-white/10"}`} />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className={`font-medium ${item.completed ? "text-white" : "text-white/40"}`}>
                            {item.label}
                          </p>
                          <p className="text-sm text-white/60">{item.description}</p>
                          {item.date && (
                            <p className="text-xs text-white/40 mt-1">{formatDate(item.date)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Review Score */}
              {application.review && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Review Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-xs text-white/60 mb-1">Review Score</p>
                        <p className="text-3xl font-bold text-green-400">
                          {application.review.totalScore}%
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-xs text-white/60 mb-1">Recommendation</p>
                        <p className="text-lg font-semibold text-white capitalize">
                          {application.review.recommendation.replace(/_/g, " ").toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interview */}
              {application.interviewScheduledAt && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Interview Scheduled</h3>
                        <p className="text-white/60">
                          Your interview has been scheduled for {formatDate(application.interviewScheduledAt)}
                        </p>
                        {application.interviewScore && (
                          <p className="text-sm text-white/60 mt-2">
                            Interview Score: <span className="text-green-400">{application.interviewScore}%</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Award */}
              {application.awardAmount && application.status === "AWARDED" && (
                <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">Congratulations!</h3>
                        <p className="text-white/60 mb-4">
                          Your scholarship application has been approved!
                        </p>
                        <div className="p-4 rounded-lg bg-white/10 mb-4">
                          <p className="text-sm text-white/60">Award Amount</p>
                          <p className="text-2xl font-bold text-green-400">
                            ${application.awardAmount.toLocaleString()}
                          </p>
                        </div>
                        {application.awardLetterUrl && (
                          <Button className="bg-green-600 hover:bg-green-700">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Download Award Letter
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              {application.documents.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Uploaded Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {application.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-white/40" />
                            <div>
                              <p className="text-white">{doc.label || doc.type}</p>
                              <p className="text-xs text-white/40">{doc.fileName}</p>
                            </div>
                          </div>
                          <Badge variant={doc.status === "VERIFIED" ? "default" : "secondary"}>
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Help Section */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-white/40" />
                    <div>
                      <h3 className="font-semibold text-white">Need Help?</h3>
                      <p className="text-white/60 text-sm mt-1">
                        If you have any questions about your application, please contact our support team.
                      </p>
                      <Button variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* No Results */}
          {!application && !loading && !error && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-xl font-semibold text-white mb-2">Enter your details above</h3>
              <p className="text-white/60">
                Use your tracking code, application number, or email to check your status
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
