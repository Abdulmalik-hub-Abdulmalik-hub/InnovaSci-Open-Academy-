"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, AlertCircle, Shield, User, Apple } from "lucide-react"
import { AcademyLogo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Demo credentials for easy testing
const DEMO_CREDENTIALS = {
  admin: {
    email: "admin@innovasci.com",
    password: "admin123",
    label: "Admin Portal",
    description: "Full system administration access",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    redirect: "/admin"
  },
  student: {
    email: "student@innovasci.com",
    password: "student123",
    label: "Student Portal",
    description: "Standard learner account",
    icon: User,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    redirect: "/dashboard"
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState<"admin" | "student" | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const handleDemoLogin = (type: "admin" | "student") => {
    const credentials = DEMO_CREDENTIALS[type]
    setEmail(credentials.email)
    setPassword(credentials.password)
    setActiveDemo(type)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check against demo credentials
    const isAdminLogin = email === DEMO_CREDENTIALS.admin.email && password === DEMO_CREDENTIALS.admin.password
    const isStudentLogin = email === DEMO_CREDENTIALS.student.email && password === DEMO_CREDENTIALS.student.password

    if (isAdminLogin) {
      router.push(DEMO_CREDENTIALS.admin.redirect)
    } else if (isStudentLogin) {
      router.push(DEMO_CREDENTIALS.student.redirect)
    } else {
      setError("Invalid email or password. Use demo credentials below.")
    }

    setIsLoading(false)
  }

  const handleSSOLogin = (provider: string) => {
    // Simulate SSO login
    setError("")
    setIsLoading(true)
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Centralized Auth Card - Mosh Style */}
        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] px-6 py-8 text-center">
            <Link href="/" className="inline-flex items-center mb-4">
              <AcademyLogo className="h-14 w-auto" />
            </Link>
            <p className="text-white/80 mt-2 text-sm">Your gateway to world-class scientific education</p>
          </div>

          {/* Demo Credentials Section */}
          <div className="px-6 pt-6">
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Demo Credentials</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                Click to auto-fill for testing:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(DEMO_CREDENTIALS).map(([key, creds]) => {
                  const Icon = creds.icon
                  return (
                    <button
                      key={key}
                      onClick={() => handleDemoLogin(key as "admin" | "student")}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all hover:scale-[1.02] text-left",
                        activeDemo === key
                          ? `${creds.bgColor} ${creds.borderColor}`
                          : "bg-white dark:bg-background border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", activeDemo === key ? creds.color : "text-gray-500 dark:text-gray-400")} />
                      <div className="text-center w-full">
                        <p className={cn("text-xs font-semibold", activeDemo === key ? creds.color : "text-gray-700 dark:text-gray-300")}>
                          {creds.label}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                          {creds.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="px-6 pb-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
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

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-brand-purple focus:ring-brand-purple" 
                  />
                  <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-brand-purple hover:underline font-medium">
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
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">or continue with</span>
              </div>
            </div>

            {/* SSO Options */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSSOLogin("apple")}
                className="h-11"
              >
                <Apple className="h-4 w-4 mr-2" />
                Apple
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSSOLogin("google")}
                className="h-11"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
            </div>

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
