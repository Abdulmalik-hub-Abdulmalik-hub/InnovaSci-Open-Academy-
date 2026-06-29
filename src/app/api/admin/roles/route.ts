import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
import { createAuditLog } from "@/lib/audit"
import { authorize, getAuthenticatedUser } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

const DEFAULT_ROLES = [
  {
    name: "SUPER_ADMIN",
    displayName: "Super Administrator",
    description: "Full system access with all permissions",
    isSystem: true,
  },
  {
    name: "ADMIN",
    displayName: "Administrator",
    description: "Administrative access without system settings",
    isSystem: true,
  },
  {
    name: "CONTENT_MANAGER",
    displayName: "Content Manager",
    description: "Manages courses and content",
    isSystem: true,
  },
  {
    name: "SUPPORT_STAFF",
    displayName: "Support Staff",
    description: "Handles user support requests",
    isSystem: true,
  },
  {
    name: "STUDENT",
    displayName: "Student",
    description: "Regular platform user",
    isSystem: true,
  },
]

// GET /api/admin/roles - Get all roles
export async function GET(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.ROLES_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({
      success: true,
      data: roles
    })
  } catch (error) {
    console.error("Get roles error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch roles" },
      { status: 500 }
    )
  }
}

// POST /api/admin/roles - Create or initialize roles
export async function POST(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.ROLES_MANAGE)(request)
  if ("status" in auth) return auth

  try {
    const body = await request.json().catch(() => ({}))
    const { init } = body

    // Initialize default roles if requested
    if (init) {
      const results = []
      
      for (const roleData of DEFAULT_ROLES) {
        const existing = await prisma.role.findUnique({
          where: { name: roleData.name }
        })
        
        if (!existing) {
          const role = await prisma.role.create({
            data: roleData,
            include: { permissions: true }
          })
          results.push(role)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Initialized ${results.length} default roles`,
        data: results
      })
    }

    // Create a new role
    const { name, displayName, description } = body
    
    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: "Name and displayName are required" },
        { status: 400 }
      )
    }

    const existing = await prisma.role.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Role already exists" },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description,
        isSystem: false,
      },
      include: { permissions: true }
    })

    await createAuditLog({
      userId: auth.user.id,
      action: "CREATE",
      module: "ROLES",
      targetId: role.id,
      newData: { name, displayName, description },
    })

    return NextResponse.json({
      success: true,
      data: role
    })
  } catch (error) {
    console.error("Create role error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create role" },
      { status: 500 }
    )
  }
}