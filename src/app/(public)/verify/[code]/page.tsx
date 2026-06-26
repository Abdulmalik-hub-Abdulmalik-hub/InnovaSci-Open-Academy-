"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, XCircle, Award, Search, Loader2, 
  GraduationCap, Calendar, User, BookOpen
} from "lucide-react"

interface VerificationResult {
  valid: boolean
  status: string
  verificationCode: string
  issuedAt: string
  student: string
  courseName: string
  revoked?: boolean
  message?: string
}

export default function VerifyCertificatePage({ 
  params 
}: { 
  params: Promise<{ code: string }> 
}) {
  const [code, setCode] = useState("")
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    // Auto-search if code is in URL
    const checkCode = async () => {
      const resolvedParams = await params
      if (resolvedParams.code) {
        setCode(resolvedParams.code)
        handleVerify(resolvedParams.code)
      }
    }
    checkCode()
  }, [params])

  const handleVerify = async (verifyCode?: string) => {
    const codeToVerify = verifyCode || code
    if (!codeToVerify.trim()) {
      setError("Please enter a verification code")
      return
    }

    setLoading(true)
    setError("")
    setSearched(true)

    try {
      const response = await fetch(`/api/public/certificates/verify?code=${encodeURIComponent(codeToVerify)}`)
      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || "Failed to verify certificate")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Certificate Verification</h1>
          </div>
          <p className="text-white/70 text-lg">
            Verify the authenticity of any InnovaSci Open Academy certificate
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg font-mono"
                  placeholder="Enter verification code (e.g., ABC123DEF456)"
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>
              <Button
                onClick={() => handleVerify()}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-3">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {searched && result && (
          <Card className={`bg-white/10 backdrop-blur-lg border-2 ${
            result.valid ? "border-green-500/50" : result.revoked ? "border-yellow-500/50" : "border-red-500/50"
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-3">
                  {result.valid ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <span className="text-green-400">Valid Certificate</span>
                    </>
                  ) : result.revoked ? (
                    <>
                      <XCircle className="h-8 w-8 text-yellow-400" />
                      <span className="text-yellow-400">Certificate Revoked</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-400" />
                      <span className="text-red-400">Certificate Not Found</span>
                    </>
                  )}
                </CardTitle>
                <Badge className={
                  result.valid 
                    ? "bg-green-500/20 text-green-400 border-green-500/50" 
                    : result.revoked
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                    : "bg-red-500/20 text-red-400 border-red-500/50"
                }>
                  {result.status?.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            {result.valid && (
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <User className="h-6 w-6 text-purple-400" />
                    <div>
                      <p className="text-white/50 text-sm">Graduate</p>
                      <p className="text-white text-lg font-medium">{result.student}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-400" />
                    <div>
                      <p className="text-white/50 text-sm">Course Completed</p>
                      <p className="text-white text-lg font-medium">{result.courseName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-400" />
                    <div>
                      <p className="text-white/50 text-sm">Issue Date</p>
                      <p className="text-white text-lg font-medium">{formatDate(result.issuedAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-purple-400" />
                    <div>
                      <p className="text-white/50 text-sm">Verification Code</p>
                      <p className="text-white text-lg font-mono font-bold">{result.verificationCode}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center">
                    ✓ This certificate is verified as authentic and issued by InnovaSci Open Academy
                  </p>
                </div>
              </CardContent>
            )}
            
            {result.revoked && (
              <CardContent>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-center">
                    ⚠️ This certificate was previously revoked and is no longer valid
                  </p>
                </div>
              </CardContent>
            )}
            
            {result.message && !result.valid && !result.revoked && (
              <CardContent>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-center">
                    {result.message}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-white font-medium mb-2">How to verify a certificate</h3>
          <ol className="text-white/60 text-sm space-y-1 list-decimal list-inside">
            <li>Locate the verification code on the certificate (bottom right corner)</li>
            <li>Enter the code in the search box above</li>
            <li>Click "Verify" to confirm the certificate's authenticity</li>
          </ol>
        </div>
      </div>
    </div>
  )
}