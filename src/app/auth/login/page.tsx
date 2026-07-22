"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { AcademyLogo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Role to portal mapping
const ROLE_PORTAL_MAP: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  ADMIN: "/admin",
  CONTENT_MANAGER: "/admin",
  SUPPORT_STAFF: "/admin",
  STUDENT: "/dashboard",
  INSTRUCTOR: "/dashboard",
  REVIEWER: "/dashboard",
  ACADEMIC_DIRECTOR: "/dashboard",
  FINANCE: "/admin",
  ADMISSIONS: "/dashboard",
}

// Error messages mapping
const AUTH_ERROR_MESSAGES: Record<string, { user: string; tech?: string }> = {
  "CredentialsSignin": {
    user: "Invalid email or password. Please check your credentials and try again.",
  },
  "User not found in database": {
    user: "No account found with this email address.",
  },
  "User account is NOT active": {
    user: "Your account is not active. Please contact support.",
  },
  "User has no password hash": {
    user: "This account appears to use a different login method. Please use the original sign-in provider.",
  },
  "User Not Found": {
    user: "No account found with this email address.",
  },
  "Invalid Password": {
    user: "The password you entered is incorrect.",
  },
  "Account Inactive": {
    user: "Your account is inactive. Please contact support.",
  },
  "Account Suspended": {
    user: "Your account has been suspended. Please contact support.",
  },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || ""
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [errorType, setErrorType] = useState<"error" | "warning" | "info">("error")
  const [isLoading, setIsLoading] = useState(false)

  // Get redirect URL based on role
  const getRedirectUrl = (role: string | undefined): string => {
    console.log("[Login] ============================================")
    console.log("[Login] getRedirectUrl() called")
    console.log("[Login] >>> INPUT role: '" + role + "' <<<")
    console.log("[Login] >>> typeof role: " + typeof role)
    console.log("[Login] ============================================")
    
    // Check if callbackUrl is provided and is a valid internal URL
    if (callbackUrl && callbackUrl.startsWith("/")) {
      console.log("[Login] Using callbackUrl:", callbackUrl)
      console.log("[Login] ============================================")
      return callbackUrl
    }
    
    // CRITICAL: This MUST use the Prisma role from JWT/Session, NOT Supabase role
    console.log("[Login] Checking role: '" + role + "'")
    
    if (role === "ADMIN") {
      console.log("[Login] >>> ROLE MATCHES ADMIN! Redirecting to /admin")
      console.log("[Login] ============================================")
      return "/admin"
    }
    if (role === "SUPER_ADMIN") {
      console.log("[Login] >>> ROLE MATCHES SUPER_ADMIN! Redirecting to /admin")
      console.log("[Login] ============================================")
      return "/admin"
    }
    if (role === "CONTENT_MANAGER") {
      console.log("[Login] >>> ROLE MATCHES CONTENT_MANAGER! Redirecting to /admin")
      console.log("[Login] ============================================")
      return "/admin"
    }
    if (role === "FINANCE") {
      console.log("[Login] >>> ROLE MATCHES FINANCE! Redirecting to /admin")
      console.log("[Login] ============================================")
      return "/admin"
    }
    if (role === "SUPPORT_STAFF") {
      console.log("[Login] >>> ROLE MATCHES SUPPORT_STAFF! Redirecting to /admin")
      console.log("[Login] ============================================")
      return "/admin"
    }
    if (role === "STUDENT") {
      console.log("[Login] >>> ROLE MATCHES STUDENT! Redirecting to /dashboard")
      console.log("[Login] ============================================")
      return "/dashboard"
    }
    if (role === "INSTRUCTOR") {
      console.log("[Login] >>> ROLE MATCHES INSTRUCTOR! Redirecting to /dashboard")
      console.log("[Login] ============================================")
      return "/dashboard"
    }
    if (role === "REVIEWER") {
      console.log("[Login] >>> ROLE MATCHES REVIEWER! Redirecting to /dashboard")
      console.log("[Login] ============================================")
      return "/dashboard"
    }
    if (role === "ACADEMIC_DIRECTOR") {
      console.log("[Login] >>> ROLE MATCHES ACADEMIC_DIRECTOR! Redirecting to /dashboard")
      console.log("[Login] ============================================")
      return "/dashboard"
    }
    if (role === "ADMISSIONS") {
      console.log("[Login] >>> ROLE MATCHES ADMISSIONS! Redirecting to /dashboard")
      console.log("[Login] ============================================")
      return "/dashboard"
    }
    
    // Default fallback - CRITICAL: This should never happen if role is correctly set
    console.log("[Login] >>> WARNING: Role '" + role + "' did NOT match any admin role!")
    console.log("[Login] >>> Defaulting to /dashboard (this is likely a BUG if user is ADMIN!)")
    console.log("[Login] ============================================")
    return "/dashboard"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrorType("error")
    setIsLoading(true)

    console.log("[Login] ============================================")
    console.log("[Login] Form submitted for:", email)
    console.log("[Login] ============================================")

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        console.log("[Login] signIn ERROR:", result.error)
        console.log("[Login] ============================================")
        
        // Get user-friendly error message
        const errorInfo = AUTH_ERROR_MESSAGES[result.error] || {
          user: "Invalid email or password. Please try again.",
        }
        setError(errorInfo.user)
        
        // Set error type based on the error
        if (result.error.includes("not active") || result.error.includes("suspended")) {
          setErrorType("warning")
        }
        
        setIsLoading(false)
        return
      }

      console.log("[Login] signIn SUCCESS - fetching session...")
      console.log("[Login] ============================================")

      // Fetch user role from session API - this reads directly from JWT token
      const res = await fetch("/api/auth/session")
      const data = await res.json()
      
      console.log("[Login] ============================================")
      console.log("[Login] Session API response:", JSON.stringify(data))
      console.log("[Login] >>> data?.user:", data?.user)
      console.log("[Login] >>> data?.user?.role:", data?.user?.role)
      console.log("[Login] >>> typeof data?.user?.role:", typeof data?.user?.role)
      console.log("[Login] ============================================")
      
      if (data?.user?.role) {
        console.log("[Login] Role from session:", data.user.role)
        
        // CRITICAL: Check if role is the Supabase 'authenticated' role (should never happen)
        if (data.user.role === 'authenticated') {
          console.error("[Login] CRITICAL ERROR: Role is 'authenticated'!")
          console.error("[Login] This should NEVER happen - Prisma role must be in session!")
          setError("Authentication error: role mismatch. Please contact support.")
          setIsLoading(false)
          return
        }
        
        const redirectUrl = getRedirectUrl(data.user.role)
        console.log("[Login] ============================================")
        console.log("[Login] FINAL REDIRECT URL:", redirectUrl)
        console.log("[Login] Expected for ADMIN: /admin")
        console.log("[Login] ============================================")
        router.push(redirectUrl)
        router.refresh()
      } else {
        // Fallback: redirect based on result if session fetch fails
        console.log("[Login] >>> WARNING: data?.user?.role is falsy (undefined/null)!")
        console.log("[Login] >>> This means the role was NOT returned from the session API!")
        console.log("[Login] >>> Defaulting to /dashboard")
        console.log("[Login] ============================================")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      console.error("[Login] Exception:", err)
      console.log("[Login] ============================================")
      setError("An error occurred. Please try again later.")
      setErrorType("error")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Centralized Auth Card */}
        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] px-6 py-8 text-center">
            <Link href="/" className="inline-flex items-center mb-4">
              <AcademyLogo className="h-14 w-auto" />
            </Link>
            <p className="text-white/80 mt-2 text-sm">Your gateway to world-class scientific education</p>
          </div>

          {/* Login Form */}
          <div className="px-6 pb-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  errorType === "warning" 
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : errorType === "info"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-sm text-brand-purple hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/auth/signup" className="text-brand-purple hover:underline font-semibold">
                Sign up
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="px-6 pb-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
