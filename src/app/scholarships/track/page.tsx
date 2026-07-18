"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Calendar,
  ChevronRight,
  Loader2,
  Users,
  Star,
  FileText,
  RefreshCw,
  Award,
} from "lucide-react"
import { format } from "date-fns"

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  DRAFT: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: FileText, label: "Draft" },
  SUBMITTED: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock, label: "Submitted" },
  UNDER_REVIEW: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Users, label: "Under Review" },
  INTERVIEW: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Star, label: "Interview" },
  APPROVED: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle, label: "Approved" },
  REJECTED: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, label: "Rejected" },
  AWARDED: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Award, label: "Awarded" },
  EXPIRED: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: Clock, label: "Expired" },
  WITHDRAWN: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: XCircle, label: "Withdrawn" },
}

function TrackContent() {
  const searchParams = useSearchParams()
  const initialTracking = searchParams.get("tracking") || ""
  
  const [trackingNumber, setTrackingNumber] = useState(initialTracking)
  const [email, setEmail] = useState("")
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const response = await fetch("/api/public/scholarships/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch application")
      }

      const data = await response.json()
      setApplication(data)
    } catch (err: any) {
      setError(err.message)
      setApplication(null)
    } finally {
      setLoading(false)
    }
  }

  const status = application?.application?.status
  const config = status ? statusConfig[status] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <GraduationCap className="h-5 w-5 text-purple-400" />
              <span className="text-white/80 text-sm font-medium">Track Your Application</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Application Status</span>
            </h1>
            
            <p className="text-xl text-white/70 mb-10">
              Enter your tracking number and email to see the status of your scholarship application.
            </p>
            
            {/* Search Form */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="trackingNumber" className="text-white/80">Tracking Number</Label>
                    <Input
                      id="trackingNumber"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="TRK-XXXXXX"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email" className="text-white/80">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <Button 
                  type="submit"
                  disabled={loading || !trackingNumber || !email}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Track Application
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Error Message */}
          {error && searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-6 flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-red-400 font-medium mb-1">Application Not Found</h3>
                    <p className="text-white/60 text-sm">{error}</p>
                    <p className="text-white/40 text-sm mt-2">
                      Please verify your tracking number and email address.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Application Details */}
          {application && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-purple-400" />
                      </div>
                      Application Details
                    </CardTitle>
                    {config && (
                      <Badge className={config.color}>
                        <config.icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Application Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Application Number</p>
                      <p className="text-white font-medium">{application.application.applicationNumber}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Tracking Number</p>
                      <p className="text-white font-medium font-mono">{application.application.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Applicant Name</p>
                      <p className="text-white font-medium">
                        {application.application.firstName} {application.application.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Submitted</p>
                      <p className="text-white font-medium">
                        {application.application.submittedAt 
                          ? format(new Date(application.application.submittedAt), "MMM d, yyyy")
                          : "Not submitted"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Scholarship Info */}
                  {application.application.scholarship && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-white/60 text-sm mb-2">Scholarship</p>
                      <div className="flex items-center gap-4">
                        {application.application.scholarship.thumbnailUrl && (
                          <img 
                            src={application.application.scholarship.thumbnailUrl}
                            alt={application.application.scholarship.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">{application.application.scholarship.name}</p>
                          <Link 
                            href={`/scholarships/${application.application.scholarship.slug}`}
                            className="text-purple-400 text-sm hover:underline"
                          >
                            View Scholarship →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Application Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.recentUpdates?.map((update: any, index: number) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${
                          index === 0 ? "bg-purple-500" : "bg-white/20"
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium">
                              Status changed to {update.status.replace("_", " ")}
                            </p>
                            <span className="text-white/60 text-sm">
                              {format(new Date(update.date), "MMM d, yyyy")}
                            </span>
                          </div>
                          {update.notes && (
                            <p className="text-white/60 text-sm mt-1">{update.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ChevronRight className="h-5 w-5 text-purple-400" />
                    What&apos;s Next?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {application.nextSteps?.map((step: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-purple-400 text-sm font-medium">{index + 1}</span>
                        </div>
                        <p className="text-white/80">{step}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Notifications */}
              {application.notifications && application.notifications.length > 0 && (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mail className="h-5 w-5 text-purple-400" />
                      Recent Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {application.notifications.map((notification: any) => (
                        <div key={notification.id} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium text-sm">{notification.title}</p>
                            <span className="text-white/40 text-xs">
                              {format(new Date(notification.createdAt), "MMM d")}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Support */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">Need More Help?</h3>
                      <p className="text-white/60 text-sm">
                        Contact our support team if you have any questions.
                      </p>
                    </div>
                    <Link href="/contact">
                      <Button variant="outline" className="border-white/20 text-white">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Browse More */}
              <div className="text-center">
                <Link href="/scholarships">
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                    Browse More Scholarships
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Initial State */}
          {!searched && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">
                Enter your tracking number and email above to check your application status.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  )
}
