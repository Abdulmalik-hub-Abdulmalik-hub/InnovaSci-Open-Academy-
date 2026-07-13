import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

// Default portal types
const DEFAULT_PORTALS = [
  {
    name: "SUPER_ADMIN",
    displayName: "Super Administrator",
    description: "Full platform access with all permissions",
    icon: "Shield",
    color: "#7C3AED",
    isSystem: true,
    dashboardRoute: "/admin",
  },
  {
    name: "ADMIN",
    displayName: "Administrator",
    description: "Operational management access",
    icon: "Settings",
    color: "#2563EB",
    isSystem: true,
    dashboardRoute: "/admin",
  },
  {
    name: "ACADEMIC_DIRECTOR",
    displayName: "Academic Director",
    description: "Academic quality assurance and curriculum management",
    icon: "GraduationCap",
    color: "#059669",
    dashboardRoute: "/academic-director",
  },
  {
    name: "INSTRUCTOR",
    displayName: "Instructor",
    description: "Course delivery and student instruction",
    icon: "BookOpen",
    color: "#0891B2",
    dashboardRoute: "/instructor",
  },
  {
    name: "REVIEWER",
    displayName: "Reviewer",
    description: "Student project and assignment review",
    icon: "ClipboardCheck",
    color: "#D97706",
    dashboardRoute: "/reviewer",
  },
  {
    name: "PROJECT_SUPERVISOR",
    displayName: "Project Supervisor",
    description: "Student project mentorship and guidance",
    icon: "Users",
    color: "#6366F1",
    dashboardRoute: "/supervisor",
  },
  {
    name: "FINANCE_OFFICER",
    displayName: "Finance Officer",
    description: "Financial operations and reporting",
    icon: "DollarSign",
    color: "#10B981",
    dashboardRoute: "/finance",
  },
  {
    name: "ADMISSION_OFFICER",
    displayName: "Admission Officer",
    description: "Student admissions and enrollment management",
    icon: "UserPlus",
    color: "#EC4899",
    dashboardRoute: "/admission",
  },
  {
    name: "STUDENT_AFFAIRS",
    displayName: "Student Affairs Officer",
    description: "Student welfare and support services",
    icon: "Heart",
    color: "#F43F5E",
    dashboardRoute: "/student-affairs",
  },
  {
    name: "QUALITY_ASSURANCE",
    displayName: "Quality Assurance Officer",
    description: "Platform quality standards and compliance",
    icon: "BadgeCheck",
    color: "#8B5CF6",
    dashboardRoute: "/quality",
  },
  {
    name: "RESEARCH_COORDINATOR",
    displayName: "Research Coordinator",
    description: "Research initiatives and academic partnerships",
    icon: "Microscope",
    color: "#0EA5E9",
    dashboardRoute: "/research",
  },
  {
    name: "SUPPORT_STAFF",
    displayName: "Support Staff",
    description: "General platform support and assistance",
    icon: "Headphones",
    color: "#64748B",
    dashboardRoute: "/support",
  },
]

// GET /api/admin/portals - Get all portals
export async function GET(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const portals = await prisma.portal.findMany({
      include: {
        defaultRole: true,
        _count: {
          select: {
            staffAssignments: { where: { status: "ACTIVE" } }
          }
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({
      success: true,
      data: portals
    })
  } catch (error) {
    console.error("Get portals error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch portals" },
      { status: 500 }
    )
  }
}

// POST /api/admin/portals - Create portal or initialize defaults
export async function POST(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.ROLES_MANAGE)(request)
  if ("status" in auth) return auth

  try {
    const body = await request.json()
    const { init } = body

    // Initialize default portals if requested
    if (init) {
      const results = []
      
      for (const portalData of DEFAULT_PORTALS) {
        const existing = await prisma.portal.findUnique({
          where: { name: portalData.name }
        })
        
        if (!existing) {
          const portal = await prisma.portal.create({
            data: portalData
          })
          results.push(portal)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Initialized ${results.length} default portals`,
        data: results
      })
    }

    // Create a new portal
    const { name, displayName, description, icon, color, dashboardRoute, allowedPermissions } = body
    
    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: "Name and displayName are required" },
        { status: 400 }
      )
    }

    const existing = await prisma.portal.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Portal already exists" },
        { status: 400 }
      )
    }

    const portal = await prisma.portal.create({
      data: {
        name,
        displayName,
        description,
        icon,
        color,
        dashboardRoute,
        allowedPermissions: allowedPermissions || null,
        isActive: true,
        isSystem: false,
      }
    })

    await createAuditLog({
      userId: auth.user.id,
      action: "CREATE",
      module: "PORTAL",
      targetId: portal.id,
      newData: { name, displayName },
    })

    return NextResponse.json({
      success: true,
      data: portal
    }, { status: 201 })
  } catch (error) {
    console.error("Create portal error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create portal" },
      { status: 500 }
    )
  }
}
