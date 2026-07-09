import Link from "next/link"
import { ShieldX } from "lucide-react"

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Forbidden</h2>
        
        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to access this page. This area is restricted to administrators only.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="block w-full border border-border py-3 px-6 rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Return Home
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground mt-8">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  )
}
