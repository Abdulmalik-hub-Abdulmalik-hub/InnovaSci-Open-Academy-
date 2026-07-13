import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

const DEFAULT_PERMISSIONS = [
  // Users
  { name: PERMISSIONS.USERS_VIEW, displayName: "View Users", description: "View user list and details", resource: "users", action: "view" },
  { name: PERMISSIONS.USERS_CREATE, displayName: "Create Users", description: "Create new users", resource: "users", action: "create" },
  { name: PERMISSIONS.USERS_UPDATE, displayName: "Update Users", description: "Update user information", resource: "users", action: "update" },
  { name: PERMISSIONS.USERS_DELETE, displayName: "Delete Users", description: "Delete users", resource: "users", action: "delete" },
  { name: PERMISSIONS.USERS_MANAGE, displayName: "Manage Users", description: "Full user management", resource: "users", action: "manage" },
  
  // Roles
  { name: PERMISSIONS.ROLES_VIEW, displayName: "View Roles", description: "View roles and permissions", resource: "roles", action: "view" },
  { name: PERMISSIONS.ROLES_CREATE, displayName: "Create Roles", description: "Create new roles", resource: "roles", action: "create" },
  { name: PERMISSIONS.ROLES_UPDATE, displayName: "Update Roles", description: "Update role permissions", resource: "roles", action: "update" },
  { name: PERMISSIONS.ROLES_DELETE, displayName: "Delete Roles", description: "Delete roles", resource: "roles", action: "delete" },
  { name: PERMISSIONS.ROLES_MANAGE, displayName: "Manage Roles", description: "Full role management", resource: "roles", action: "manage" },
  
  // Courses
  { name: PERMISSIONS.COURSES_VIEW, displayName: "View Courses", description: "View courses", resource: "courses", action: "view" },
  { name: PERMISSIONS.COURSES_CREATE, displayName: "Create Courses", description: "Create new courses", resource: "courses", action: "create" },
  { name: PERMISSIONS.COURSES_UPDATE, displayName: "Update Courses", description: "Update courses", resource: "courses", action: "update" },
  { name: PERMISSIONS.COURSES_DELETE, displayName: "Delete Courses", description: "Delete courses", resource: "courses", action: "delete" },
  { name: PERMISSIONS.COURSES_MANAGE, displayName: "Manage Courses", description: "Full course management", resource: "courses", action: "manage" },
  
  // Content
  { name: PERMISSIONS.CONTENT_VIEW, displayName: "View Content", description: "View videos and materials", resource: "content", action: "view" },
  { name: PERMISSIONS.CONTENT_CREATE, displayName: "Create Content", description: "Create content", resource: "content", action: "create" },
  { name: PERMISSIONS.CONTENT_UPDATE, displayName: "Update Content", description: "Update content", resource: "content", action: "update" },
  { name: PERMISSIONS.CONTENT_DELETE, displayName: "Delete Content", description: "Delete content", resource: "content", action: "delete" },
  { name: PERMISSIONS.CONTENT_MANAGE, displayName: "Manage Content", description: "Full content management", resource: "content", action: "manage" },
  
  // Analytics
  { name: PERMISSIONS.ANALYTICS_VIEW, displayName: "View Analytics", description: "View analytics dashboard", resource: "analytics", action: "view" },
  { name: PERMISSIONS.ANALYTICS_EXPORT, displayName: "Export Analytics", description: "Export analytics data", resource: "analytics", action: "export" },
  
  // Settings
  { name: PERMISSIONS.SETTINGS_VIEW, displayName: "View Settings", description: "View platform settings", resource: "settings", action: "view" },
  { name: PERMISSIONS.SETTINGS_UPDATE, displayName: "Update Settings", description: "Update platform settings", resource: "settings", action: "update" },
  { name: PERMISSIONS.SETTINGS_MANAGE, displayName: "Manage Settings", description: "Full settings management", resource: "settings", action: "manage" },
  
  // Database
  { name: PERMISSIONS.DATABASE_VIEW, displayName: "View Database", description: "View database explorer", resource: "database", action: "view" },
  { name: PERMISSIONS.DATABASE_EXECUTE, displayName: "Execute Database", description: "Execute database operations", resource: "database", action: "execute" },
  
  // Audit
  { name: PERMISSIONS.AUDIT_VIEW, displayName: "View Audit Logs", description: "View audit logs", resource: "audit", action: "view" },
  { name: PERMISSIONS.AUDIT_EXPORT, displayName: "Export Audit Logs", description: "Export audit logs", resource: "audit", action: "export" },
  
  // Payments
  { name: PERMISSIONS.PAYMENTS_VIEW, displayName: "View Payments", description: "View payment records", resource: "payments", action: "view" },
  { name: PERMISSIONS.PAYMENTS_REFUND, displayName: "Refund Payments", description: "Process refunds", resource: "payments", action: "refund" },
  { name: PERMISSIONS.PAYMENTS_MANAGE, displayName: "Manage Payments", description: "Full payment management", resource: "payments", action: "manage" },
  
  // Storage
  { name: PERMISSIONS.STORAGE_VIEW, displayName: "View Storage", description: "View stored files", resource: "storage", action: "view" },
  { name: PERMISSIONS.STORAGE_UPLOAD, displayName: "Upload Files", description: "Upload files to storage", resource: "storage", action: "upload" },
  { name: PERMISSIONS.STORAGE_DELETE, displayName: "Delete Storage", description: "Delete stored files", resource: "storage", action: "delete" },
  { name: PERMISSIONS.STORAGE_MANAGE, displayName: "Manage Storage", description: "Full storage management", resource: "storage", action: "manage" },
  
  // Support
  { name: PERMISSIONS.SUPPORT_VIEW, displayName: "View Support", description: "View support tickets", resource: "support", action: "view" },
  { name: PERMISSIONS.SUPPORT_RESPOND, displayName: "Respond to Tickets", description: "Respond to support tickets", resource: "support", action: "respond" },
  { name: PERMISSIONS.SUPPORT_MANAGE, displayName: "Manage Support", description: "Full support management", resource: "support", action: "manage" },
  
  // Certificates
  { name: PERMISSIONS.CERTIFICATES_VIEW, displayName: "View Certificates", description: "View certificates", resource: "certificates", action: "view" },
  { name: PERMISSIONS.CERTIFICATES_ISSUE, displayName: "Issue Certificates", description: "Issue certificates", resource: "certificates", action: "issue" },
  { name: PERMISSIONS.CERTIFICATES_REVOKE, displayName: "Revoke Certificates", description: "Revoke certificates", resource: "certificates", action: "revoke" },
  { name: PERMISSIONS.CERTIFICATES_MANAGE, displayName: "Manage Certificates", description: "Full certificate management", resource: "certificates", action: "manage" },
  
  // Plans
  { name: PERMISSIONS.PLANS_VIEW, displayName: "View Plans", description: "View subscription plans", resource: "plans", action: "view" },
  { name: PERMISSIONS.PLANS_CREATE, displayName: "Create Plans", description: "Create subscription plans", resource: "plans", action: "create" },
  { name: PERMISSIONS.PLANS_UPDATE, displayName: "Update Plans", description: "Update subscription plans", resource: "plans", action: "update" },
  { name: PERMISSIONS.PLANS_DELETE, displayName: "Delete Plans", description: "Delete subscription plans", resource: "plans", action: "delete" },
  { name: PERMISSIONS.PLANS_MANAGE, displayName: "Manage Plans", description: "Full plan management", resource: "plans", action: "manage" },
  
  // Newsletter
  { name: PERMISSIONS.NEWSLETTER_VIEW, displayName: "View Newsletter", description: "View newsletter campaigns", resource: "newsletter", action: "view" },
  { name: PERMISSIONS.NEWSLETTER_SEND, displayName: "Send Newsletter", description: "Send newsletter campaigns", resource: "newsletter", action: "send" },
  { name: PERMISSIONS.NEWSLETTER_MANAGE, displayName: "Manage Newsletter", description: "Full newsletter management", resource: "newsletter", action: "manage" },
]

// GET /api/admin/roles/permissions - Get all permissions
export async function GET(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.ROLES_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }]
    })

    // Group by resource
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.resource]) acc[perm.resource] = []
      acc[perm.resource].push(perm)
      return acc
    }, {} as Record<string, typeof permissions>)

    return NextResponse.json({
      success: true,
      data: {
        permissions,
        grouped,
        resources: Object.keys(grouped)
      }
    })
  } catch (error) {
    console.error("Get permissions error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { success: false, error: `Failed to fetch permissions: ${errorMessage}`, details: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/admin/roles/permissions - Initialize default permissions
export async function POST(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.ROLES_MANAGE)(request)
  if ("status" in auth) return auth

  try {
    const body = await request.json().catch(() => ({}))
    const { init } = body

    if (!init) {
      return NextResponse.json(
        { success: false, error: "init parameter required" },
        { status: 400 }
      )
    }

    const results = []
    
    for (const permData of DEFAULT_PERMISSIONS) {
      const existing = await prisma.permission.findUnique({
        where: { name: permData.name }
      })
      
      if (!existing) {
        const perm = await prisma.permission.create({ data: permData })
        results.push(perm)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Initialized ${results.length} default permissions`,
      data: results
    })
  } catch (error) {
    console.error("Initialize permissions error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { success: false, error: `Failed to initialize permissions: ${errorMessage}`, details: String(error) },
      { status: 500 }
    )
  }
}