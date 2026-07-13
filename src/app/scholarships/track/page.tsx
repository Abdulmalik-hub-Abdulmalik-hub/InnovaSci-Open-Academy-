"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Search, ArrowLeft, Check, Clock, XCircle, Users, AlertCircle,
  FileText, CheckCircle, Loader2, Calendar, ArrowRight, Award
} from "lucide-react"
import toast from "react-hot-toast"

interface ApplicationStatus {
  status: string
  notes: string | null
  changedAt: string
}

interface TrackedApplication {
  applicationNumber: string
  trackingNumber: string
  status: string
  submittedAt: string
  lastStatusChange: string
  scholarship: {
    name: string
    slug: string
    type: { name: string; icon: string | null; color: string | null }
    awardAmount: number | null
    currency: string
    coverageType: string
  }
  statusHistory: ApplicationStatus[]
  nextSteps: string
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; description: string }> = {
  SUBMITTED: {
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    icon: FileText,
    description: "Your application has been received and is awaiting review."
  },
  UNDER_REVIEW: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    icon: Clock,
    description: "Your application is currently being reviewed by our committee."
  },
  INTERVIEW: {
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    icon: Users,
    description: "Congratulations! You've been selected for an interview."
  },
  ADDITIONAL_INFO: {
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    icon: AlertCircle,
    description: "We need additional information from you. Please check your email."
  },
  APPROVED: {
    color: "text-green-400",
    bg: "bg-green-500/20",
    icon: CheckCircle,
    description: "Congratulations! Your application has been approved."
  },
  REJECTED: {
    color: "text-red-400",
    bg: "bg-red-500/20",
    icon: XCircle,
    description: "Thank you for your interest. Unfortunately, your application was not selected."
  },
  WITHDRAWN: {
    color: "text-gray-400",
    bg: "bg-gray-500/20",
    icon: XCircle,
    description: "Your application has been withdrawn."
  },
}

export default function TrackApplicationPage() {
  const [loading, setLoading] = useState(false)
  const [application, setApplication] = useState<TrackedApplication | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    trackingNumber: "",
    email: "",
  })

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setApplication(null)

    try {
      const response = await fetch("/api/scholarships/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: formData.trackingNumber || undefined,
          applicationNumber: formData.trackingNumber || undefined,
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setApplication(data.data.application)
      } else {
        setError(data.error || "Failed to find application")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return "Not specified"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const currentStatus = application ? statusConfig[application.status] || statusConfig.SUBMITTED : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/scholarships" className="flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Scholarships
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-purple-500/50 text-purple-300">
            <Search className="h-4 w-4 mr-1" />
            Track Your Application
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Check Your Application Status
          </h1>
          <p className="text-white/60 max-w-lg mx-auto">
            Enter your tracking number or application number and email to see your application status.
          </p>
        </motion.div>

        {/* Search Form */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trackingNumber" className="text-white/70">
                    Tracking / Application Number
                  </Label>
                  <Input
                    id="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, trackingNumber: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    placeholder="e.g., TRK-ABC123..."
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white/70">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading || !formData.email}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Application
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/20 mb-8">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Application Details */}
        {application && currentStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Application Status</CardTitle>
                  <Badge className={`${currentStatus.bg} ${currentStatus.color} border-0`}>
                    <currentStatus.icon className="h-4 w-4 mr-1" />
                    {application.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scholarship Info */}
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: application.scholarship.type.color ? `${application.scholarship.type.color}20` : "rgba(139, 92, 246, 0.2)" }}
                  >
                    <Award className="h-6 w-6" style={{ color: application.scholarship.type.color || "#8B5CF6" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{application.scholarship.name}</h3>
                    <p className="text-sm text-white/60">
                      {application.scholarship.type.name} • {formatCurrency(application.scholarship.awardAmount, application.scholarship.currency)}
                    </p>
                  </div>
                </div>

                {/* Application Numbers */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Application Number</p>
                    <p className="text-white font-mono">{application.applicationNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Tracking Number</p>
                    <p className="text-white font-mono">{application.trackingNumber}</p>
                  </div>
                </div>

                {/* Current Status Description */}
                <div className={`p-4 rounded-lg ${currentStatus.bg}`}>
                  <p className={`${currentStatus.color} font-medium mb-1`}>Current Status</p>
                  <p className="text-white/80 text-sm">{currentStatus.description}</p>
                </div>

                {/* Next Steps */}
                {application.nextSteps && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-purple-300 font-medium mb-1">Next Steps</p>
                    <p className="text-white/80 text-sm">{application.nextSteps}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar className="h-4 w-4" />
                    Submitted: {formatDate(application.submittedAt)}
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="h-4 w-4" />
                    Last Updated: {formatDateTime(application.lastStatusChange)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.statusHistory.map((item, index) => {
                    const config = statusConfig[item.status] || statusConfig.SUBMITTED
                    const Icon = config.icon

                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          {index < application.statusHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-white/10 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className={`font-medium ${config.color}`}>
                              {item.status.replace("_", " ")}
                            </p>
                            <p className="text-xs text-white/50">
                              {formatDateTime(item.changedAt)}
                            </p>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-white/60 mt-1">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Link href="/scholarships" className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Browse More Scholarships
                </Button>
              </Link>
              <Link href="/contact" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                  Contact Support
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        {!application && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/70">
              <p>
                If you can&apos;t find your application, try the following:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Check your email for your application confirmation</li>
                <li>Make sure you&apos;re using the same email you used to apply</li>
                <li>Check your spam folder</li>
                <li>Verify your tracking number is entered correctly</li>
              </ul>
              <p>
                Still need help?{" "}
                <Link href="/contact" className="text-purple-400 hover:underline">
                  Contact our support team
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
