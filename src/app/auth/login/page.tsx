"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, User } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Sign in to InnovaSci Open Academy</p>
        </div>

        {/* Demo Credentials Card */}
        <div className="mb-6 p-4 rounded-xl border bg-gradient-to-r from-brand-purple/5 to-brand-blue/5 border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Demo Credentials</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Click to auto-fill credentials for testing:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(DEMO_CREDENTIALS).map(([key, creds]) => {
              const Icon = creds.icon
              return (
                <button
                  key={key}
                  onClick={() => handleDemoLogin(key as "admin" | "student")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:scale-[1.02]",
                    activeDemo === key
                      ? `${creds.bgColor} ${creds.borderColor} ${creds.color}`
                      : "bg-background/50 border-border hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className={cn("h-5 w-5", activeDemo === key ? creds.color : "text-muted-foreground")} />
                  <div className="text-center">
                    <p className={cn("text-xs font-medium", activeDemo === key ? creds.color : "")}>
                      {creds.label}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
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
                  className="pl-10 pr-10"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-muted-foreground" />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-brand-purple hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-purple hover:bg-brand-purple/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-brand-purple hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
