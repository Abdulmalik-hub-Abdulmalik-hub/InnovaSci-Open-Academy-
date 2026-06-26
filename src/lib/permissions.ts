// ============================================
// PERMISSIONS CONSTANTS
// ============================================

export const PERMISSIONS = {
  // Users
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_MANAGE: "users:manage",
  
  // Roles & Permissions
  ROLES_VIEW: "roles:view",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",
  ROLES_MANAGE: "roles:manage",
  
  // Courses
  COURSES_VIEW: "courses:view",
  COURSES_CREATE: "courses:create",
  COURSES_UPDATE: "courses:update",
  COURSES_DELETE: "courses:delete",
  COURSES_MANAGE: "courses:manage",
  
  // Content (Videos, Materials)
  CONTENT_VIEW: "content:view",
  CONTENT_CREATE: "content:create",
  CONTENT_UPDATE: "content:update",
  CONTENT_DELETE: "content:delete",
  CONTENT_MANAGE: "content:manage",
  
  // Analytics
  ANALYTICS_VIEW: "analytics:view",
  ANALYTICS_EXPORT: "analytics:export",
  
  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",
  SETTINGS_MANAGE: "settings:manage",
  
  // Database Explorer
  DATABASE_VIEW: "database:view",
  DATABASE_EXECUTE: "database:execute",
  
  // Audit Logs
  AUDIT_VIEW: "audit:view",
  AUDIT_EXPORT: "audit:export",
  
  // Payments
  PAYMENTS_VIEW: "payments:view",
  PAYMENTS_REFUND: "payments:refund",
  PAYMENTS_MANAGE: "payments:manage",
  
  // Subscriptions
  SUBSCRIPTIONS_VIEW: "subscriptions:view",
  SUBSCRIPTIONS_MANAGE: "subscriptions:manage",
  
  // Newsletter
  NEWSLETTER_VIEW: "newsletter:view",
  NEWSLETTER_SEND: "newsletter:send",
  NEWSLETTER_MANAGE: "newsletter:manage",
  
  // Storage
  STORAGE_VIEW: "storage:view",
  STORAGE_UPLOAD: "storage:upload",
  STORAGE_DELETE: "storage:delete",
  STORAGE_MANAGE: "storage:manage",
  
  // Support
  SUPPORT_VIEW: "support:view",
  SUPPORT_RESPOND: "support:respond",
  SUPPORT_MANAGE: "support:manage",
  
  // Certificates
  CERTIFICATES_VIEW: "certificates:view",
  CERTIFICATES_ISSUE: "certificates:issue",
  CERTIFICATES_REVOKE: "certificates:revoke",
  CERTIFICATES_MANAGE: "certificates:manage",
  
  // Plans
  PLANS_VIEW: "plans:view",
  PLANS_CREATE: "plans:create",
  PLANS_UPDATE: "plans:update",
  PLANS_DELETE: "plans:delete",
  PLANS_MANAGE: "plans:manage",
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.COURSES_CREATE,
    PERMISSIONS.COURSES_UPDATE,
    PERMISSIONS.COURSES_DELETE,
    PERMISSIONS.COURSES_MANAGE,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_MANAGE,
    PERMISSIONS.NEWSLETTER_VIEW,
    PERMISSIONS.NEWSLETTER_SEND,
    PERMISSIONS.NEWSLETTER_MANAGE,
    PERMISSIONS.STORAGE_VIEW,
    PERMISSIONS.STORAGE_UPLOAD,
    PERMISSIONS.STORAGE_DELETE,
    PERMISSIONS.STORAGE_MANAGE,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.CERTIFICATES_ISSUE,
    PERMISSIONS.CERTIFICATES_MANAGE,
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_UPDATE,
    PERMISSIONS.PLANS_DELETE,
    PERMISSIONS.PLANS_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
  ],
  CONTENT_MANAGER: [
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.COURSES_CREATE,
    PERMISSIONS.COURSES_UPDATE,
    PERMISSIONS.COURSES_MANAGE,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.STORAGE_VIEW,
    PERMISSIONS.STORAGE_UPLOAD,
    PERMISSIONS.STORAGE_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.NEWSLETTER_VIEW,
    PERMISSIONS.NEWSLETTER_SEND,
  ],
  SUPPORT_STAFF: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.CONTENT_VIEW,
  ],
  STUDENT: [
    // Students have no admin permissions
  ],
}

// Resource-based permission groups
export const PERMISSION_GROUPS = {
  users: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE,
  ],
  roles: [
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,
    PERMISSIONS.ROLES_MANAGE,
  ],
  courses: [
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.COURSES_CREATE,
    PERMISSIONS.COURSES_UPDATE,
    PERMISSIONS.COURSES_DELETE,
    PERMISSIONS.COURSES_MANAGE,
  ],
  content: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_MANAGE,
  ],
  analytics: [
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
  ],
  settings: [
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
  database: [
    PERMISSIONS.DATABASE_VIEW,
    PERMISSIONS.DATABASE_EXECUTE,
  ],
  audit: [
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
  ],
  payments: [
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.PAYMENTS_MANAGE,
  ],
  storage: [
    PERMISSIONS.STORAGE_VIEW,
    PERMISSIONS.STORAGE_UPLOAD,
    PERMISSIONS.STORAGE_DELETE,
    PERMISSIONS.STORAGE_MANAGE,
  ],
  support: [
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_MANAGE,
  ],
  certificates: [
    PERMISSIONS.CERTIFICATES_VIEW,
    PERMISSIONS.CERTIFICATES_ISSUE,
    PERMISSIONS.CERTIFICATES_REVOKE,
    PERMISSIONS.CERTIFICATES_MANAGE,
  ],
  plans: [
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_UPDATE,
    PERMISSIONS.PLANS_DELETE,
    PERMISSIONS.PLANS_MANAGE,
  ],
  newsletter: [
    PERMISSIONS.NEWSLETTER_VIEW,
    PERMISSIONS.NEWSLETTER_SEND,
    PERMISSIONS.NEWSLETTER_MANAGE,
  ],
} as const

// Check if user has permission based on role string
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = DEFAULT_ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}

// Check if user has any of the given permissions
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

// Check if user has all of the given permissions
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}