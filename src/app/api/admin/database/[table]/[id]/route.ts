import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Protected tables that require special handling
const PROTECTED_TABLES = ["User", "AuditLog", "Subscription", "Payment"]

// Sensitive fields that should be masked
const SENSITIVE_FIELDS = ["passwordHash", "password_hash", "apiKey", "api_key", "secret", "token"]

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
function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...data }
  for (const field of SENSITIVE_FIELDS) {
    if (field in masked && masked[field] !== null) {
      masked[field] = "***MASKED***"
    }
  }
  return masked
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

// GET /api/admin/database/[table]/[id] - Get single row
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const auth = await checkSuperAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const { table, id } = await params
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
    const userAgent = request.headers.get("user-agent") || undefined

    // Validate table name
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

    const model = (prisma as unknown as Record<string, { findUnique: Function }>)[table]
    
    if (!model) {
      return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 })
    }

    const row = await model.findUnique({ where: { id } })

    if (!row) {
      return NextResponse.json({ success: false, error: "Row not found" }, { status: 404 })
    }

    // Mask sensitive data
    const maskedRow = maskSensitiveData(row as unknown as Record<string, unknown>)

    // Log the query
    await createAuditLog({
      userId: auth.userId,
      action: "SELECT",
      module: "DB_EXPLORER",
      targetTable: table,
      targetId: id,
      query: `SELECT * FROM ${table} WHERE id = '${id}'`,
      affectedRows: 1,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      data: { table, row: maskedRow }
    })
  } catch (error) {
    console.error("Database explorer error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch row" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/database/[table]/[id] - Update row
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const auth = await checkSuperAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const { table, id } = await params
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
    const userAgent = request.headers.get("user-agent") || undefined
    const body = await request.json()
    const { data, safeMode } = body

    // Safe mode check - prevent modifications in safe mode
    if (safeMode) {
      return NextResponse.json({ 
        success: false, 
        error: "Safe Mode is enabled. Disable Safe Mode to make changes." 
      }, { status: 403 })
    }

    // Validate table name
    if (PROTECTED_TABLES.includes(table)) {
      return NextResponse.json({ 
        success: false, 
        error: `${table} is a protected table. Direct modifications are not allowed.` 
      }, { status: 403 })
    }

    const validTables = [
      "Profile", "Course", "Module", "Lesson", "Material",
      "Video", "Enrollment", "LearningProgress", "UserLectureProgress",
      "Certificate", "Plan",
      "LearningPath", "LearningPathProgress", "Wishlist",
      "Notification", "SupportTicket", "TicketComment",
      "NewsletterSubscriber", "NewsletterCampaign", "StoredFile", "SystemSetting"
    ]

    if (!validTables.includes(table)) {
      return NextResponse.json({ success: false, error: "Cannot modify this table" }, { status: 400 })
    }

    const model = (prisma as unknown as Record<string, { 
      findUnique: Function; 
      update: Function 
    }>)[table]
    
    if (!model) {
      return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 })
    }

    // Get current data for audit log
    const currentRow = await model.findUnique({ where: { id } })
    if (!currentRow) {
      return NextResponse.json({ success: false, error: "Row not found" }, { status: 404 })
    }

    // Update the row
    const updatedRow = await model.update({
      where: { id },
      data
    })

    // Log the update
    await createAuditLog({
      userId: auth.userId,
      action: "UPDATE",
      module: "DB_EXPLORER",
      targetTable: table,
      targetId: id,
      query: `UPDATE ${table} SET ... WHERE id = '${id}'`,
      affectedRows: 1,
      previousData: maskSensitiveData(currentRow as unknown as Record<string, unknown>),
      newData: maskSensitiveData(updatedRow as unknown as Record<string, unknown>),
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      data: { table, row: maskSensitiveData(updatedRow as unknown as Record<string, unknown>) },
      message: "Row updated successfully"
    })
  } catch (error) {
    console.error("Database explorer error:", error)
    await createAuditLog({
      userId: auth.userId,
      action: "UPDATE",
      module: "DB_EXPLORER",
      targetTable: (await params).table,
      targetId: (await params).id,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      success: false,
    })
    return NextResponse.json(
      { success: false, error: "Failed to update row" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/database/[table]/[id] - Delete row
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const auth = await checkSuperAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const { table, id } = await params
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
    const userAgent = request.headers.get("user-agent") || undefined

    // Protected tables cannot be deleted
    if (PROTECTED_TABLES.includes(table)) {
      return NextResponse.json({ 
        success: false, 
        error: `${table} is a protected table. Deletion is not allowed.` 
      }, { status: 403 })
    }

    const validTables = [
      "Profile", "Course", "Module", "Lesson", "Material",
      "Video", "Enrollment", "LearningProgress", "UserLectureProgress",
      "Certificate", "Plan",
      "LearningPath", "LearningPathProgress", "Wishlist",
      "Notification", "SupportTicket", "TicketComment",
      "NewsletterSubscriber", "NewsletterCampaign", "StoredFile", "SystemSetting"
    ]

    if (!validTables.includes(table)) {
      return NextResponse.json({ success: false, error: "Cannot delete from this table" }, { status: 400 })
    }

    const model = (prisma as unknown as Record<string, { 
      findUnique: Function; 
      delete: Function 
    }>)[table]
    
    if (!model) {
      return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 })
    }

    // Get current data for audit log
    const currentRow = await model.findUnique({ where: { id } })
    if (!currentRow) {
      return NextResponse.json({ success: false, error: "Row not found" }, { status: 404 })
    }

    // Delete the row
    await model.delete({ where: { id } })

    // Log the deletion
    await createAuditLog({
      userId: auth.userId,
      action: "DELETE",
      module: "DB_EXPLORER",
      targetTable: table,
      targetId: id,
      query: `DELETE FROM ${table} WHERE id = '${id}'`,
      affectedRows: 1,
      previousData: maskSensitiveData(currentRow as unknown as Record<string, unknown>),
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: "Row deleted successfully"
    })
  } catch (error) {
    console.error("Database explorer error:", error)
    await createAuditLog({
      userId: auth.userId,
      action: "DELETE",
      module: "DB_EXPLORER",
      targetTable: (await params).table,
      targetId: (await params).id,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      success: false,
    })
    return NextResponse.json(
      { success: false, error: "Failed to delete row" },
      { status: 500 }
    )
  }
}