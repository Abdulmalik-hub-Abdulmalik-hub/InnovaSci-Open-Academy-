import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Permission, hasPermission, hasAnyPermission } from "@/lib/permissions"

export interface AuthUser {
  id: string
  email: string
  role: string
  status: string
  profile?: {
    fullName?: string | null
  } | null
}

// Check if user is authenticated
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return null
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { 
            id: true, 
            email: true, 
            role: true, 
            status: true,
            profile: {
              select: { fullName: true }
            }
          }
        })
        
        if (user && user.status === "ACTIVE") {
          return user
        }
      }
    }
    
    return null
  } catch (error) {
    console.error("Auth check error:", error)
    return null
  }
}

// Authorize middleware - check if user has required permission
export function authorize(permission: Permission) {
  return async (request: NextRequest): Promise<NextResponse | { authorized: true; user: AuthUser }> => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // SUPER_ADMIN bypasses all permission checks
    if (user.role === "SUPER_ADMIN") {
      return { authorized: true, user }
    }
    
    if (!hasPermission(user.role, permission)) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to perform this action" },
        { status: 403 }
      )
    }
    
    return { authorized: true, user }
  }
}

// Authorize middleware - check if user has any of the required permissions
export function authorizeAny(permissions: Permission[]) {
  return async (request: NextRequest): Promise<NextResponse | { authorized: true; user: AuthUser }> => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // SUPER_ADMIN bypasses all permission checks
    if (user.role === "SUPER_ADMIN") {
      return { authorized: true, user }
    }
    
    if (!hasAnyPermission(user.role, permissions)) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to perform this action" },
        { status: 403 }
      )
    }
    
    return { authorized: true, user }
  }
}

// Simple role-based authorization (for backwards compatibility)
export function authorizeRole(...roles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | { authorized: true; user: AuthUser }> => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // SUPER_ADMIN bypasses all role checks
    if (user.role === "SUPER_ADMIN") {
      return { authorized: true, user }
    }
    
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient privileges" },
        { status: 403 }
      )
    }
    
    return { authorized: true, user }
  }
}

// Create a handler wrapper that checks for a specific permission
export function withPermission(
  permission: Permission,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authHeader = request.headers.get("Authorization")
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }
    
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // SUPER_ADMIN bypasses all permission checks
    if (user.role !== "SUPER_ADMIN" && !hasPermission(user.role, permission)) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to perform this action" },
        { status: 403 }
      )
    }
    
    return handler(request, user)
  }
}