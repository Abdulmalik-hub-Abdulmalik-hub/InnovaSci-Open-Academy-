"use client"

import { useState } from "react"
import { useStudentCertificates } from "@/hooks/useStudentCertificates"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Award, Download, ExternalLink, Search, Calendar,
  CheckCircle2, ChevronRight, Copy, Check, Linkedin
} from "lucide-react"

export default function CertificatesPage() {
  const { certificates, loading, error, pagination, fetchCertificates } = useStudentCertificates()
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredCertificates = certificates.filter(cert => 
    cert.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.verificationCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Share certificate to LinkedIn
  const shareToLinkedIn = (verificationCode: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const verifyUrl = `${baseUrl}/verify/${verificationCode}`
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`
    window.open(linkedInUrl, '_blank', 'width=600,height=600')
  }

  if (loading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
          <p className="text-muted-foreground mt-1">
            View and download your earned certificates
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {certificates.length}
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
              Total Earned
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search certificates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        />
      </div>

      {/* Certificates List */}
      {filteredCertificates.length > 0 ? (
        <div className="space-y-4">
          {filteredCertificates.map((cert) => (
            <Card 
              key={cert.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Certificate Preview */}
                <div className="w-full md:w-64 h-48 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-amber-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full translate-x-1/2 translate-y-1/2" />
                  
                  {/* Certificate Icon */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg mb-3">
                      <Award className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                      Certificate
                    </p>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        <h3 className="text-xl font-bold mb-1">
                          {cert.course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Certificate of Completion
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Issued: {new Date(cert.issuedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Verification Code:</span>
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                          {cert.verificationCode}
                        </code>
                        <button
                          onClick={() => handleCopyCode(cert.verificationCode, cert.id)}
                          className="text-muted-foreground hover:text-brand-purple transition-colors"
                        >
                          {copiedId === cert.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {cert.certificateUrl && (
                      <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Certificate
                        </Button>
                      </a>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => shareToLinkedIn(cert.verificationCode)}
                      className="border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5] hover:text-white"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No certificates yet</h3>
          <p className="text-muted-foreground mb-6">
            Complete courses to earn certificates
          </p>
          <Button asChild>
            <a href="/dashboard/courses">
              Browse Courses
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      )}

      {/* Verification Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Verified Certificates
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                All certificates issued by InnovaSci Open Academy are verified and can be shared 
                or verified using the unique verification code. Employers and institutions can verify 
                your certificate by visiting our verification portal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
