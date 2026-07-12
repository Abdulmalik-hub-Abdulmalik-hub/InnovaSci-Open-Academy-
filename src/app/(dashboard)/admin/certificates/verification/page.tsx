"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Shield, CheckCircle, XCircle, Award, 
  RefreshCw, ExternalLink, QrCode
} from "lucide-react"
import Link from "next/link"

interface VerificationResult {
  valid: boolean
  certificateCode: string
  certificateType: "CATEGORY" | "DOMAIN"
  certificateName: string
  studentName: string
  issuedAt: string
  status: string
}

export default function CertificateVerificationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/public/certificates/verify?code=${encodeURIComponent(searchQuery.trim())}`)
      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || "Certificate not found")
      }
    } catch (err) {
      setError("Failed to verify certificate")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Link href="/admin/certificates" className="text-white/60 hover:text-white">
            Certificates
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-white">Verification</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-2">Certificate Verification</h1>
        <p className="text-white/60 mt-1">Verify the authenticity of Category and Domain certificates</p>
      </div>

      {/* Search */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Verify Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-white/5 border-white/10 text-white"
                placeholder="Enter certificate code (e.g., CAT-CERT-2026-XXXX)"
              />
            </div>
            <Button 
              onClick={handleVerify} 
              disabled={loading || !searchQuery.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify
                </>
              )}
            </Button>
          </div>
          <p className="text-white/40 text-sm">
            Enter the certificate code or verification URL to check authenticity
          </p>
        </CardContent>
      </Card>

      {/* Result */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Certificate Not Found</h3>
            <p className="text-white/60">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={result.valid 
          ? "bg-green-500/10 border-green-500/30"
          : "bg-red-500/10 border-red-500/30"
        }>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {result.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Certificate Verified
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  Certificate Invalid
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/40 text-sm">Certificate Code</p>
                <p className="text-white font-mono">{result.certificateCode}</p>
              </div>
              <div>
                <p className="text-white/40 text-sm">Certificate Type</p>
                <Badge className={result.certificateType === "CATEGORY" 
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                }>
                  {result.certificateType}
                </Badge>
              </div>
              <div>
                <p className="text-white/40 text-sm">Certificate Name</p>
                <p className="text-white font-semibold">{result.certificateName}</p>
              </div>
              <div>
                <p className="text-white/40 text-sm">Status</p>
                <Badge className={result.status === "ACTIVE"
                  ? "bg-green-500/20 text-green-400 border-green-500/50"
                  : "bg-red-500/20 text-red-400 border-red-500/50"
                }>
                  {result.status}
                </Badge>
              </div>
              <div>
                <p className="text-white/40 text-sm">Recipient</p>
                <p className="text-white">{result.studentName}</p>
              </div>
              <div>
                <p className="text-white/40 text-sm">Issued Date</p>
                <p className="text-white">{new Date(result.issuedAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {result.valid && (
              <div className="pt-4 border-t border-white/10">
                <Button 
                  variant="outline" 
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  onClick={() => window.open(`/verify/${result.certificateCode}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Verification Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <QrCode className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">How Verification Works</h3>
              <p className="text-white/60 text-sm">
                Each certificate has a unique verification code that can be entered here or scanned via QR code. 
                The verification system checks the certificate against our database to confirm authenticity, 
                issue date, and current status (Active or Revoked).
              </p>
              <p className="text-white/60 text-sm mt-2">
                Certificates can be verified publicly at: <code className="text-purple-400">/verify/[code]</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
