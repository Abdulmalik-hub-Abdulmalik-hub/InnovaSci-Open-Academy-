"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  CheckCircle, 
  Download,
  Mail,
  Clock,
  ExternalLink,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams()
  const applicationNumber = searchParams.get("applicationNumber")
  const trackingCode = searchParams.get("trackingCode")

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Application Submitted!</h1>
          <p className="text-white/70 mb-6">
            Thank you for applying. Your application has been received and is being reviewed.
          </p>

          {/* Reference Numbers */}
          <div className="p-4 rounded-lg bg-white/5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/60 mb-1">Application Number</p>
                <p className="text-lg font-mono font-semibold text-white">
                  {applicationNumber || "SCH-2024-000001"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Tracking Code</p>
                <p className="text-lg font-mono font-semibold text-purple-400">
                  {trackingCode || "ABCD1234"}
                </p>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="space-y-3 text-left mb-8">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium">Check Your Email</p>
                <p className="text-sm text-white/60">
                  We&apos;ve sent a confirmation email with your tracking details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-purple-300 font-medium">What Happens Next?</p>
                <p className="text-sm text-white/60">
                  Our review committee will evaluate your application. You can track your status using your tracking code.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href={`/scholarships/track?trackingCode=${trackingCode}`}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Track Your Application
              </Button>
            </Link>
            <Link href="/scholarships">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse More Scholarships
              </Button>
            </Link>
          </div>

          {/* Need Help */}
          <p className="text-sm text-white/40 mt-6">
            Need help? Contact our support team at support@innovasci.com
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
