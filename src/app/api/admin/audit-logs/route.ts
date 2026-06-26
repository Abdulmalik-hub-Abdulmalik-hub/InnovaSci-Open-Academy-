import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Super Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ 
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
    
    return { authorized: false, error: "Admin access required for Audit Logs" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// GET /api/admin/audit-logs - Get audit logs
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const skip = (page - 1) * limit
    
    // Filters
    const module = searchParams.get("module")
    const action = searchParams.get("action")
    const userId = searchParams.get("userId")
    const targetTable = searchParams.get("targetTable")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const success = searchParams.get("success")
    const search = searchParams.get("search")
    
    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (module) where.module = module
    if (action) where.action = action
    if (userId) where.userId = userId
    if (targetTable) where.targetTable = targetTable
    
    if (success !== null && success !== undefined) {
      where.success = success === "true"
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate)
    }
    
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { module: { contains: search, mode: "insensitive" } },
        { targetTable: { contains: search, mode: "insensitive" } },
        { targetId: { contains: search, mode: "insensitive" } },
      ]
    }

    // Fetch logs with pagination
    const [logs, total, modules, actions] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true }
              }
            }
          }
        }
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ["module"],
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ["action"],
        _count: true,
      }),
    ])

    // Get unique users who have logs
    const usersWithLogs = await prisma.auditLog.findMany({
      where: { userId: { not: null } },
      select: { userId: true, user: { select: { id: true, email: true, profile: { select: { fullName: true } } } } },
      distinct: ["userId"],
      take: 100,
    })

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          userId: log.userId,
          userEmail: log.user?.email || "System",
          userName: log.user?.profile?.fullName || "System",
          action: log.action,
          module: log.module,
          targetTable: log.targetTable,
          targetId: log.targetId,
          affectedRows: log.affectedRows,
          previousData: log.previousData,
          newData: log.newData,
          details: log.details,
          ipAddress: log.ipAddress,
          success: log.success,
          errorMessage: log.errorMessage,
          createdAt: log.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters: {
          modules: modules.map(m => ({ value: m.module, count: m._count })),
          actions: actions.map(a => ({ value: a.action, count: a._count })),
          users: usersWithLogs.map(u => ({
            id: u.userId,
            email: u.user?.email,
            name: u.user?.profile?.fullName
          })),
        }
      }
    })
  } catch (error) {
    console.error("Get audit logs error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}

// GET /api/admin/audit-logs/export - Export audit logs to CSV
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { 
      startDate, 
      endDate, 
      module, 
      action, 
      userId,
      format = "csv" 
    } = body
    
    // Build where clause (same as GET)
    const where: Record<string, unknown> = {}
    
    if (module) where.module = module
    if (action) where.action = action
    if (userId) where.userId = userId
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate)
    }

    // Fetch logs for export (limit to 10000)
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000,
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { fullName: true } }
          }
        }
      }
    })

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "ID",
        "Timestamp",
        "User Email",
        "User Name",
        "Action",
        "Module",
        "Target Table",
        "Target ID",
        "Affected Rows",
        "IP Address",
        "Success",
        "Error Message",
        "Details",
      ]

      const rows = logs.map(log => [
        log.id,
        log.createdAt.toISOString(),
        log.user?.email || "System",
        log.user?.profile?.fullName || "System",
        log.action,
        log.module,
        log.targetTable || "",
        log.targetId || "",
        log.affectedRows?.toString() || "",
        log.ipAddress || "",
        log.success ? "Yes" : "No",
        log.errorMessage || "",
        log.details ? JSON.stringify(log.details) : "",
      ])

      const csv = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    })
  } catch (error) {
    console.error("Export audit logs error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to export audit logs" },
      { status: 500 }
    )
  }
}