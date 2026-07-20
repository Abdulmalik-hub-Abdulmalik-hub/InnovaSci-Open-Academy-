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
  
  // Check if path is exempt
  const isExempt = EXEMPT_PATHS.some((path) => pathname.startsWith(path))
  
  if (isExempt) {
    return NextResponse.next()
  }
  
  // Check if this is an admin route - require ADMIN role
  const isAdminRoute = ADMIN_ROUTES.some((path) => pathname.startsWith(path))
  
  if (isAdminRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    console.log("[Middleware] Admin route check for:", pathname)
    console.log("[Middleware] Token exists:", !!token)
    if (token) {
      console.log("[Middleware] Token role:", token.role)
      console.log("[Middleware] Token id:", token.id)
    }
    
    // No token = not logged in, redirect to login
    if (!token) {
      console.log("[Middleware] No token, redirecting to login")
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Check for ADMIN or SUPER_ADMIN role
    const userRole = token.role as string
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
    
    console.log("[Middleware] User role:", userRole, "isAdmin:", isAdmin)
    
    if (!isAdmin) {
      // Redirect non-admins to 403 page
      console.log("[Middleware] Not admin, redirecting to forbidden")
      return NextResponse.redirect(new URL("/forbidden", request.url))
    }
    
    console.log("[Middleware] Admin access granted")
    return NextResponse.next()
  }
  
  // Check if this is a student-facing route
  const isStudentRoute = STUDENT_ROUTES.some((path) => pathname.startsWith(path))
  
  if (!isStudentRoute) {
    // Not a protected route, allow through
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
