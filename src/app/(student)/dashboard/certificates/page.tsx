"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Award, ExternalLink, Calendar,
  CheckCircle2, ChevronRight, Linkedin,
  Loader2, Lock, BadgeCheck, Globe,
  BookOpen, Target, Star, Shield
} from "lucide-react"

interface CertificateProgress {
  id: string
  name: string
  description: string | null
  category?: {
    id: string
    name: string
    slug: string
    domain?: { id: string; name: string; icon: string | null; color: string | null }
  }
  domain?: { id: string; name: string; slug: string; icon: string | null; color: string | null }
  progress: {
    overall: number
    coursesCompleted: number
    totalCourses: number
    lessonsCompleted: number
    totalLessons: number
    exercisesCompleted: number
    miniProjectsCompleted: number
    totalMiniProjects: number
    capstonesCompleted: number
    totalCapstones: number
    earnedCategoryCertificates?: number
  }
  isEligible: boolean
  isIssued: boolean
  issuedCertificate: { id: string; certificateCode: string; verificationUrl: string; issuedAt: string } | null
}

export default function CertificatesPage() {
  const [categoryCerts, setCategoryCerts] = useState<CertificateProgress[]>([])
  const [domainCerts, setDomainCerts] = useState<CertificateProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "category" | "domain">("all")
  const [stats, setStats] = useState({ totalCertificates: 0, earnedCertificates: 0, eligibleCertificates: 0, inProgress: 0 })

  const fetchCertificates = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/student/certificates")
      const result = await response.json()
      if (result.success) {
        setCategoryCerts(result.data.categoryCertificates || [])
        setDomainCerts(result.data.domainCertificates || [])
        setStats(result.data.stats || { totalCertificates: 0, earnedCertificates: 0, eligibleCertificates: 0, inProgress: 0 })
      } else {
        setError(result.error || "Failed to load certificates")
      }
    } catch {
      setError("Failed to load certificates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCertificates() }, [])

  const shareToLinkedIn = (verificationCode: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl + "/verify/" + verificationCode)}`, "_blank")
  }

  const filteredCerts = activeTab === "all" ? [...categoryCerts, ...domainCerts] : activeTab === "category" ? categoryCerts : domainCerts
  const earnedCerts = filteredCerts.filter(c => c.isIssued)
  const eligibleCerts = filteredCerts.filter(c => c.isEligible && !c.isIssued)
  const inProgressCerts = filteredCerts.filter(c => !c.isEligible && !c.isIssued)

  if (loading && categoryCerts.length === 0 && domainCerts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
          <p className="text-muted-foreground">Loading your certifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Certifications</h1>
          <p className="text-muted-foreground mt-1">Track your progress toward Category & Domain Professional Certificates</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.earnedCertificates}</p>
            <p className="text-xs text-purple-600/80 dark:text-purple-400/80">Earned</p>
          </div>
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.eligibleCertificates}</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Ready to Claim</p>
          </div>
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80">In Progress</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab("all")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "all" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>All Certificates</button>
        <button onClick={() => setActiveTab("category")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "category" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}><BadgeCheck className="h-4 w-4" />Category Certificates</button>
        <button onClick={() => setActiveTab("domain")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "domain" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}><Globe className="h-4 w-4" />Domain Certificates</button>
      </div>

      {earnedCerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" />Earned Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedCerts.map((cert) => (
              <Card key={cert.id} className="overflow-hidden border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Earned</Badge>
                      <h3 className="font-bold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.category?.name || cert.domain?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Issued: {new Date(cert.issuedCertificate?.issuedAt || "").toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cert.issuedCertificate?.verificationUrl && <a href={cert.issuedCertificate.verificationUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-2" />View</Button></a>}
                    <Button variant="outline" size="sm" onClick={() => shareToLinkedIn(cert.issuedCertificate?.certificateCode || "")} className="border-[#0077B5] text-[#0077B5]"><Linkedin className="h-4 w-4 mr-2" />Share</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {eligibleCerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" />Ready to Claim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibleCerts.map((cert) => (
              <Card key={cert.id} className="overflow-hidden border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      {cert.category ? <BadgeCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" /> : <Globe className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.category?.name || cert.domain?.name}</p>
                      <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"><Star className="h-3 w-3 mr-1" />Ready to Claim</Badge>
                    </div>
                  </div>
                  <div className="mt-4"><Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600"><Award className="h-4 w-4 mr-2" />Claim Certificate</Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {inProgressCerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-blue-500" />In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCerts.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cert.category?.domain?.color || cert.domain?.color || "#6366f1"}20` }}>
                        {cert.category ? <BadgeCheck className="h-5 w-5" style={{ color: cert.category.domain?.color || "#6366f1" }} /> : <Globe className="h-5 w-5" style={{ color: cert.domain?.color || "#3b82f6" }} />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.category?.name || cert.domain?.name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />Locked</Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span className="font-medium">{cert.progress.overall}%</span></div>
                    <Progress value={cert.progress.overall} className="h-2" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3"><BookOpen className="h-3 w-3" /><span>{cert.progress.coursesCompleted}/{cert.progress.totalCourses} courses</span></div>
                  <Button variant="outline" size="sm" className="w-full">Continue Learning<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredCerts.length === 0 && (
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="py-12 text-center">
            <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No certificates found</h3>
            <p className="text-muted-foreground mb-6">Start learning to earn your first professional certificate</p>
            <Button asChild><a href="/dashboard/courses">Browse Courses<ChevronRight className="h-4 w-4 ml-1" /></a></Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0"><Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">About Professional Certificates</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Complete all required courses, lessons, exercises, and projects within a category to earn a <strong>Category Professional Certificate</strong>. Complete all categories within a domain to earn a <strong>Domain Master Certificate</strong>. All certificates are verified and can be shared on LinkedIn.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
