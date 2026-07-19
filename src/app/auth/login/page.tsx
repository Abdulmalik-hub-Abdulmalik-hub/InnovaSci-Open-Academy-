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
  const getRedirectUrl = (role: string): string => {
    // Check if callbackUrl is provided and is a valid internal URL
    if (callbackUrl && callbackUrl.startsWith("/")) {
      return callbackUrl
    }
    // Use role-based portal mapping
    return ROLE_PORTAL_MAP[role] || "/dashboard"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrorType("error")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
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

      // Fetch user role to determine redirect
      const res = await fetch("/api/auth/session")
      const session = await res.json()
      
      if (session?.user) {
        const redirectUrl = getRedirectUrl(session.user.role)
        router.push(redirectUrl)
      } else {
        router.push("/dashboard")
      }
      
      router.refresh()
    } catch (err) {
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
