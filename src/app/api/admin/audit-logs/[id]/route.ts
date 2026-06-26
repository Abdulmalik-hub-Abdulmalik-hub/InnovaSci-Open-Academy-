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

// GET /api/admin/audit-logs/[id] - Get single audit log detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const { id } = await params

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        }
      }
    })

    if (!log) {
      return NextResponse.json({ success: false, error: "Audit log not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: log.id,
        userId: log.userId,
        userEmail: log.user?.email || "System",
        userName: log.user?.profile?.fullName || "System",
        userRole: log.user?.role,
        userAvatar: log.user?.profile?.avatarUrl,
        action: log.action,
        module: log.module,
        targetTable: log.targetTable,
        targetId: log.targetId,
        query: log.query,
        affectedRows: log.affectedRows,
        previousData: log.previousData,
        newData: log.newData,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        success: log.success,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
      }
    })
  } catch (error) {
    console.error("Get audit log error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit log" },
      { status: 500 }
    )
  }
}