import { prisma } from "@/lib/prisma"

export async function createAuditLog(data: {
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

// Get recent audit logs
export async function getAuditLogs(options: {
  module?: string
  userId?: string
  action?: string
  limit?: number
  offset?: number
}) {
  const where: Record<string, unknown> = {}
  
  if (options.module) where.module = options.module
  if (options.userId) where.userId = options.userId
  if (options.action) where.action = options.action

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
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
    prisma.auditLog.count({ where })
  ])

  return { logs, total }
}