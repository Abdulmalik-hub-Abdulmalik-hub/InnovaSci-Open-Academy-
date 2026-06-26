"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/permissions"

interface AuthUser {
  id: string
  email: string
  role: string
  status: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: AuthUser | null }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser || null)
  const [isLoading, setIsLoading] = useState(false)

  // Check permission based on user's role
  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false
    return hasAnyPermission(user.role, permissions)
  }

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    return hasAllPermissions(user.role, permissions)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook to check if user has access to a specific admin module
export function useModuleAccess() {
  const { hasPermission, hasAnyPermission } = useAuth()
  
  const canAccessModule = (module: string): boolean => {
    switch (module) {
      case "users":
        return hasAnyPermission(["users:view", "users:manage"])
      case "roles":
        return hasAnyPermission(["roles:view", "roles:manage"])
      case "courses":
        return hasAnyPermission(["courses:view", "courses:manage"])
      case "content":
        return hasAnyPermission(["content:view", "content:manage"])
      case "analytics":
        return hasPermission("analytics:view")
      case "settings":
        return hasAnyPermission(["settings:view", "settings:manage"])
      case "database":
        return hasAnyPermission(["database:view", "database:execute"])
      case "audit":
        return hasPermission("audit:view")
      case "payments":
        return hasAnyPermission(["payments:view", "payments:manage"])
      case "subscriptions":
        return hasAnyPermission(["subscriptions:view", "subscriptions:manage"])
      case "newsletter":
        return hasAnyPermission(["newsletter:view", "newsletter:manage"])
      case "storage":
        return hasAnyPermission(["storage:view", "storage:manage"])
      case "support":
        return hasAnyPermission(["support:view", "support:manage"])
      case "certificates":
        return hasAnyPermission(["certificates:view", "certificates:manage"])
      case "plans":
        return hasAnyPermission(["plans:view", "plans:manage"])
      default:
        return false
    }
  }

  return { canAccessModule }
}

// Define which modules are accessible by each role
export const ADMIN_MODULES = [
  { id: "dashboard", name: "Dashboard", icon: "LayoutDashboard", permission: "dashboard:view" },
  { id: "analytics", name: "Analytics", icon: "BarChart3", permission: "analytics:view" },
  { id: "users", name: "Users", icon: "Users", permission: "users:view" },
  { id: "courses", name: "Courses", icon: "GraduationCap", permission: "courses:view" },
  { id: "content", name: "Content", icon: "PlayCircle", permission: "content:view" },
  { id: "payments", name: "Payments", icon: "CreditCard", permission: "payments:view" },
  { id: "subscriptions", name: "Subscriptions", icon: "Repeat", permission: "subscriptions:view" },
  { id: "certificates", name: "Certificates", icon: "Award", permission: "certificates:view" },
  { id: "plans", name: "Plans", icon: "Package", permission: "plans:view" },
  { id: "newsletter", name: "Newsletter", icon: "Mail", permission: "newsletter:view" },
  { id: "support", name: "Support", icon: "Headphones", permission: "support:view" },
  { id: "storage", name: "Storage", icon: "HardDrive", permission: "storage:view" },
  { id: "database", name: "Database", icon: "Database", permission: "database:view" },
  { id: "settings", name: "Settings", icon: "Settings", permission: "settings:view" },
  { id: "audit", name: "Audit Logs", icon: "FileText", permission: "audit:view" },
  { id: "roles", name: "Roles", icon: "Shield", permission: "roles:view" },
] as const