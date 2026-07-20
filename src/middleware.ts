import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Simple in-memory cache for maintenance mode status
let maintenanceCache: { isMaintenance: boolean; message: string; timestamp: number } | null = null
const CACHE_TTL = 60 * 1000 // 1 minute cache

// Routes that should be exempted from maintenance mode
const EXEMPT_PATHS = [
  "/maintenance",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]

// Admin routes that require ADMIN role
const ADMIN_ROUTES = ["/admin", "/api/admin"]

// Student-facing routes that should be redirected during maintenance
const STUDENT_ROUTES = [
  "/dashboard",
  "/learn",
  "/portfolio",
  "/courses",
  "/learning-paths",
  "/forum",
  "/pricing",
  "/membership",
  "/contact",
  "/api/student",
  "/api/public",
  "/verify",
  "/scholarships",
]

async function getMaintenanceStatus(): Promise<{ isMaintenance: boolean; message: string }> {
  const now = Date.now()
  
  // Check cache first
  if (maintenanceCache && (now - maintenanceCache.timestamp) < CACHE_TTL) {
    return { isMaintenance: maintenanceCache.isMaintenance, message: maintenanceCache.message }
  }
  
  try {
    // Dynamic import to avoid issues during build
    const { prisma } = await import("@/lib/prisma")
    
    // Get maintenance mode from SystemSetting model
    const maintenanceModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_mode" },
      select: { value: true },
    })
    
    const maintenanceMessageSetting = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_message" },
      select: { value: true },
    })
    
    const isMaintenance = maintenanceModeSetting?.value === "true"
    const message = maintenanceMessageSetting?.value || "We are performing scheduled maintenance. Please check back soon."
    
    // Update cache
    maintenanceCache = {
      isMaintenance,
      message,
      timestamp: now,
    }
    
    return { isMaintenance, message }
  } catch (error) {
    console.error("Error checking maintenance status:", error)
    // On error, default to not in maintenance mode to avoid blocking the entire site
    return { isMaintenance: false, message: "We are performing scheduled maintenance. Please check back soon." }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log("[Middleware] ============================================")
  console.log("[Middleware] Request path:", pathname)
  
  // Check if path is exempt
  const isExempt = EXEMPT_PATHS.some((path) => pathname.startsWith(path))
  
  if (isExempt) {
    console.log("[Middleware] Path is exempt, allowing through")
    console.log("[Middleware] ============================================")
    return NextResponse.next()
  }
  
  // Check if this is an admin route - require ADMIN role
  const isAdminRoute = ADMIN_ROUTES.some((path) => pathname.startsWith(path))
  
  if (isAdminRoute) {
    console.log("[Middleware] Admin route detected!")
    console.log("[Middleware] ============================================")
    
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    console.log("[Middleware] ============================================")
    console.log("[Middleware] MIDDLEWARE: Getting JWT token...")
    console.log("[Middleware] Token exists:", !!token)
    
    if (token) {
      console.log("[Middleware] Token ID:", token.id)
      console.log("[Middleware] Token email:", token.email)
      console.log("[Middleware] Token role (from JWT):", token.role)
      console.log("[Middleware] ============================================")
      
      // CRITICAL: Verify the role is NOT from Supabase
      if (token.role === 'authenticated') {
        console.error("[Middleware] CRITICAL ERROR: Token role is 'authenticated'!")
        console.error("[Middleware] This should NEVER happen - Prisma role must be in JWT!")
        console.error("[Middleware] ============================================")
        const loginUrl = new URL("/auth/login", request.url)
        loginUrl.searchParams.set("error", "role_error")
        return NextResponse.redirect(loginUrl)
      }
    } else {
      console.log("[Middleware] No token found - user not authenticated")
      console.log("[Middleware] ============================================")
    }
    
    // No token = not logged in, redirect to login
    if (!token) {
      console.log("[Middleware] No token, redirecting to login")
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      console.log("[Middleware] Redirect destination: /auth/login")
      console.log("[Middleware] ============================================")
      return NextResponse.redirect(loginUrl)
    }
    
    // Check for ADMIN or SUPER_ADMIN role
    const userRole = token.role as string
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
    
    console.log("[Middleware] User role from JWT:", userRole)
    console.log("[Middleware] Is admin?", isAdmin)
    console.log("[Middleware] ============================================")
    
    if (!isAdmin) {
      // Redirect non-admins to 403 page
      console.log("[Middleware] NOT ADMIN - Role is:", userRole)
      console.log("[Middleware] Expected: ADMIN or SUPER_ADMIN")
      console.log("[Middleware] Redirecting to /forbidden")
      console.log("[Middleware] ============================================")
      return NextResponse.redirect(new URL("/forbidden", request.url))
    }
    
    console.log("[Middleware] ADMIN ACCESS GRANTED!")
    console.log("[Middleware] Redirect: /admin (no redirect needed - already going to /admin)")
    console.log("[Middleware] ============================================")
    return NextResponse.next()
  }
  
  // Check if this is a student-facing route
  const isStudentRoute = STUDENT_ROUTES.some((path) => pathname.startsWith(path))
  
  if (!isStudentRoute) {
    // Not a protected route, allow through
    console.log("[Middleware] Not a protected route, allowing through")
    console.log("[Middleware] ============================================")
    return NextResponse.next()
  }
  
  // Get maintenance status
  const { isMaintenance } = await getMaintenanceStatus()
  
  if (isMaintenance) {
    // Redirect to maintenance page
    const maintenanceUrl = new URL("/maintenance", request.url)
    
    // Preserve the original path as a query parameter for after maintenance
    maintenanceUrl.searchParams.set("redirect", pathname)
    
    return NextResponse.redirect(maintenanceUrl)
  }
  
  console.log("[Middleware] Student route, no maintenance - allowing through")
  console.log("[Middleware] ============================================")
  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
