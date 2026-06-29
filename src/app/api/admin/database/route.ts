import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';

// Protected tables that require special handling
const PROTECTED_TABLES = ["User", "AuditLog", "Subscription", "Payment"]
const SENSITIVE_FIELDS = ["passwordHash", "password_hash", "apiKey", "api_key", "secret", "token"]

// Query limits
const MAX_ROWS = 100
const DEFAULT_LIMIT = 50

// Super Admin authentication helper
async function checkSuperAdminAuth(request: NextRequest): Promise<{ 
  authorized: boolean; 
  userId?: string; 
  error?: string 
}> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return { authorized: true } // Demo mode
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        
        if (user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN") && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id }
        }
      }
    }
    
    return { authorized: false, error: "Super Admin access required for Database Explorer" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// Helper to mask sensitive fields
function maskSensitiveData(data: Record<string, unknown>[]): Record<string, unknown>[] {
  return data.map(row => {
    const masked = { ...row }
    for (const field of SENSITIVE_FIELDS) {
      if (field in masked && masked[field] !== null) {
        masked[field] = "***MASKED***"
      }
    }
    return masked
  })
}

// Helper to create audit log entry
async function createAuditLog(data: {
  userId?: string
  action: string
  module: string
  targetTable?: string
  targetId?: string
  query?: string
  affectedRows?: number
  previousData?: unknown
  newData?: unknown
  details?: unknown
  ipAddress?: string
  userAgent?: string
  success?: boolean
  errorMessage?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        module: data.module,
        targetTable: data.targetTable,
        targetId: data.targetId,
        query: data.query,
        affectedRows: data.affectedRows,
        previousData: data.previousData as object | undefined,
        newData: data.newData as object | undefined,
        details: data.details as object | undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success ?? true,
        errorMessage: data.errorMessage,
      }
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

// GET /api/admin/database - Get available tables and metadata
export async function GET(request: NextRequest) {
  const auth = await checkSuperAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "list"
    const table = searchParams.get("table")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT)), MAX_ROWS)
    const skip = (page - 1) * limit

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
    const userAgent = request.headers.get("user-agent") || undefined

    // Action: list - Get available tables
    if (action === "list") {
      const tables = [
        "User", "Profile", "Course", "Module", "Lesson", "Material",
        "Video", "Enrollment", "LearningProgress", "UserLectureProgress",
        "Certificate", "Payment", "Plan", "Subscription",
        "LearningPath", "LearningPathProgress", "Wishlist",
        "Notification", "AuditLog", "SupportTicket", "TicketComment",
        "NewsletterSubscriber", "NewsletterCampaign", "StoredFile", "SystemSetting"
      ]

      const tableInfo = tables.map(t => ({
        name: t,
        isProtected: PROTECTED_TABLES.includes(t)
      }))

      return NextResponse.json({
        success: true,
        data: {
          tables: tableInfo,
          protectedTables: PROTECTED_TABLES
        }
      })
    }

    // Action: columns - Get columns for a specific table
    if (action === "columns" && table) {
      // Map table names to Prisma model fields (simplified)
      const tableColumns: Record<string, { name: string; type: string; isId: boolean; isOptional: boolean }[]> = {
        User: [
          { name: "id", type: "String", isId: true, isOptional: false },
          { name: "email", type: "String", isId: false, isOptional: false },
          { name: "role", type: "String", isId: false, isOptional: false },
          { name: "status", type: "String", isId: false, isOptional: false },
          { name: "emailVerified", type: "DateTime", isId: false, isOptional: true },
          { name: "createdAt", type: "DateTime", isId: false, isOptional: false },
          { name: "updatedAt", type: "DateTime", isId: false, isOptional: false },
        ],
        Profile: [
          { name: "id", type: "String", isId: true, isOptional: false },
          { name: "userId", type: "String", isId: false, isOptional: false },
          { name: "fullName", type: "String", isId: false, isOptional: true },
          { name: "avatarUrl", type: "String", isId: false, isOptional: true },
          { name: "bio", type: "String", isId: false, isOptional: true },
          { name: "createdAt", type: "DateTime", isId: false, isOptional: false },
          { name: "updatedAt", type: "DateTime", isId: false, isOptional: false },
        ],
        Course: [
          { name: "id", type: "String", isId: true, isOptional: false },
          { name: "title", type: "String", isId: false, isOptional: false },
          { name: "slug", type: "String", isId: false, isOptional: false },
          { name: "category", type: "String", isId: false, isOptional: true },
          { name: "status", type: "String", isId: false, isOptional: false },
          { name: "price", type: "Decimal", isId: false, isOptional: false },
          { name: "isFree", type: "Boolean", isId: false, isOptional: false },
          { name: "createdAt", type: "DateTime", isId: false, isOptional: false },
          { name: "updatedAt", type: "DateTime", isId: false, isOptional: false },
        ],
        Enrollment: [
          { name: "id", type: "String", isId: true, isOptional: false },
          { name: "userId", type: "String", isId: false, isOptional: false },
          { name: "courseId", type: "String", isId: false, isOptional: false },
          { name: "completed", type: "Boolean", isId: false, isOptional: false },
          { name: "progressPercent", type: "Int", isId: false, isOptional: false },
          { name: "enrolledAt", type: "DateTime", isId: false, isOptional: false },
          { name: "completedAt", type: "DateTime", isId: false, isOptional: true },
        ],
        Payment: [
          { name: "id", type: "String", isId: true, isOptional: false },
          { name: "userId", type: "String", isId: false, isOptional: false },
          { name: "courseId", type: "String", isId: false, isOptional: true },
          { name: "amount", type: "Decimal", isId: false, isOptional: false },
          { name: "status", type: "String", isId: false, isOptional: false },
          { name: "paymentMethod", type: "String", isId: false, isOptional: true },
          { name: "transactionId", type: "String", isId: false, isOptional: true },
          { name: "createdAt", type: "DateTime", isId: false, isOptional: false },
        ],
        Certificate: [
          { name: "id", type: "String", isId: true, isOptional: false },
          { name: "userId", type: "String", isId: false, isOptional: false },
          { name: "courseId", type: "String", isId: false, isOptional: false },
          { name: "certificateUrl", type: "String", isId: false, isOptional: true },
          { name: "issuedAt", type: "DateTime", isId: false, isOptional: false },
        ],
        StoredFile: [
          { name: "id", type: "String", isId: true, isOptional: false },
          { name: "originalName", type: "String", isId: false, isOptional: false },
          { name: "storedName", type: "String", isId: false, isOptional: false },
          { name: "fileUrl", type: "String", isId: false, isOptional: false },
          { name: "fileSize", type: "Int", isId: false, isOptional: false },
          { name: "mimeType", type: "String", isId: false, isOptional: false },
          { name: "fileType", type: "String", isId: false, isOptional: false },
          { name: "storageType", type: "String", isId: false, isOptional: false },
          { name: "folder", type: "String", isId: false, isOptional: true },
          { name: "createdAt", type: "DateTime", isId: false, isOptional: false },
        ],
        NewsletterCampaign: [
          { name: "id", type: "String", isId: true, isOptional: false },
          { name: "title", type: "String", isId: false, isOptional: false },
          { name: "subject", type: "String", isId: false, isOptional: false },
          { name: "status", type: "String", isId: false, isOptional: false },
          { name: "recipientType", type: "String", isId: false, isOptional: false },
          { name: "createdAt", type: "DateTime", isId: false, isOptional: false },
        ],
      }

      const columns = tableColumns[table] || [
        { name: "id", type: "String", isId: true, isOptional: false },
        { name: "createdAt", type: "DateTime", isId: false, isOptional: false },
        { name: "updatedAt", type: "DateTime", isId: false, isOptional: false },
      ]

      return NextResponse.json({
        success: true,
        data: {
          table,
          columns,
          isProtected: PROTECTED_TABLES.includes(table)
        }
      })
    }

    // Action: rows - Get rows from a specific table
    if (action === "rows" && table) {
      // Validate table name against whitelist
      const validTables = [
        "User", "Profile", "Course", "Module", "Lesson", "Material",
        "Video", "Enrollment", "LearningProgress", "UserLectureProgress",
        "Certificate", "Payment", "Plan", "Subscription",
        "LearningPath", "LearningPathProgress", "Wishlist",
        "Notification", "AuditLog", "SupportTicket", "TicketComment",
        "NewsletterSubscriber", "NewsletterCampaign", "StoredFile", "SystemSetting"
      ]

      if (!validTables.includes(table)) {
        return NextResponse.json({ success: false, error: "Invalid table name" }, { status: 400 })
      }

      // Get the model from Prisma
      const model = (prisma as unknown as Record<string, { findMany: Function; count: Function }>)[table]
      
      if (!model) {
        return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 })
      }

      // Build where clause from query params
      const where: Record<string, unknown> = {}
      const filterField = searchParams.get("filterField")
      const filterValue = searchParams.get("filterValue")
      
      if (filterField && filterValue) {
        // Validate filter field (basic SQL injection prevention)
        const safeField = filterField.replace(/[^a-zA-Z0-9_]/g, "")
        where[safeField] = { contains: filterValue }
      }

      // Fetch rows with pagination
      const [rows, total] = await Promise.all([
        model.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" }
        }),
        model.count({ where })
      ])

      // Mask sensitive data
      const maskedRows = maskSensitiveData(rows as unknown as Record<string, unknown>[])

      // Log the query
      await createAuditLog({
        userId: auth.userId,
        action: "SELECT",
        module: "DB_EXPLORER",
        targetTable: table,
        query: `SELECT * FROM ${table} (${limit} rows)`,
        affectedRows: rows.length,
        ipAddress,
        userAgent,
      })

      return NextResponse.json({
        success: true,
        data: {
          table,
          rows: maskedRows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Database explorer error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to execute query" },
      { status: 500 }
    )
  }
}