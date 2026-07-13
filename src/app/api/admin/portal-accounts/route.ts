import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"
import { hash } from "bcryptjs"

// GET /api/admin/portal-accounts - Get all portal accounts
export async function GET(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    
    const portal = searchParams.get("portal")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: any = {
      user: {
        role: { not: "STUDENT" }
      }
    }

    if (portal) {
      where.assignments = {
        some: {
          portal: { name: portal },
          status: "ACTIVE"
        }
      }
    }

    if (status) {
      where.user = { ...where.user, status }
    }

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { profile: { fullName: { contains: search, mode: "insensitive" } } } },
        { staffId: { contains: search, mode: "insensitive" } },
      ]
    }

    const accounts = await prisma.staffProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            profile: {
              select: { fullName: true, avatarUrl: true, phone: true }
            }
          }
        },
        assignments: {
          where: { status: "ACTIVE" },
          include: {
            portal: true,
          }
        },
        sessions: {
          where: { isActive: true },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Transform data
    const transformedAccounts = accounts.map(a => ({
      id: a.id,
      staffId: a.staffId,
      fullName: a.user.profile?.fullName || "Unknown",
      email: a.user.email,
      phone: a.user.profile?.phone || a.phone,
      avatarUrl: a.user.profile?.avatarUrl || a.staffAvatarUrl,
      role: a.user.role,
      department: a.department,
      title: a.title,
      status: a.user.status,
      createdAt: a.user.createdAt,
      portals: a.assignments.map(ass => ({
        id: ass.portal.id,
        name: ass.portal.name,
        displayName: ass.portal.displayName,
        color: ass.portal.color,
      })),
      hasActiveSession: a.sessions.length > 0,
    }))

    return NextResponse.json({
      success: true,
      data: transformedAccounts
    })
  } catch (error) {
    console.error("Get portal accounts error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch portal accounts" },
      { status: 500 }
    )
  }
}

// POST /api/admin/portal-accounts - Create new portal account
export async function POST(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.USERS_CREATE)(request)
  if ("status" in auth) return auth

  try {
    const body = await request.json()
    const {
      // Step 1 - Personal Information
      fullName,
      email,
      phone,
      gender,
      avatarUrl,
      
      // Step 2 - Portal Assignment
      portal,
      
      // Step 3 - Academic Assignment
      domainIds,
      categoryIds,
      difficultyLevels,
      courseIds,
      
      // Step 4 - Role
      role,
      
      // Step 5 - Credentials
      password,
      generatePassword = true,
      
      // Additional
      staffId,
      title,
      department,
      employeeType,
    } = body

    // Validation
    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, error: "Email and full name are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Generate or use provided password
    const temporaryPassword = generatePassword && !password 
      ? generateRandomPassword() 
      : password || generateRandomPassword()
    const passwordHash = await hash(temporaryPassword, 12)

    // Determine role
    const userRole = role || mapPortalToRole(portal)

    // Create account in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: userRole,
          status: "ACTIVE",
          emailVerified: new Date(),
          profile: {
            create: {
              fullName,
              phone,
              gender,
              avatarUrl,
            }
          }
        },
        include: {
          profile: true
        }
      })

      // 2. Create staff profile
      const staffProfile = await tx.staffProfile.create({
        data: {
          userId: user.id,
          staffId: staffId || `STAFF-${Date.now()}`,
          title,
          department,
          employeeType,
          phone,
          staffAvatarUrl: avatarUrl,
          isActive: true,
        }
      })

      // 3. Create portal assignment
      let portalRecord = await tx.portal.findUnique({
        where: { name: portal || "SUPPORT_STAFF" }
      })

      if (!portalRecord) {
        portalRecord = await tx.portal.create({
          data: {
            name: portal || "SUPPORT_STAFF",
            displayName: portal?.replace(/_/g, " ") || "Support Staff",
            description: `Portal for ${portal?.replace(/_/g, " ") || "Support Staff"}`,
            isActive: true,
          }
        })
      }

      await tx.staffAssignment.create({
        data: {
          staffProfileId: staffProfile.id,
          portalId: portalRecord.id,
          roleId: portalRecord.defaultRoleId || undefined,
          assignedBy: auth.user.id,
          isPrimary: true,
          status: "ACTIVE",
        }
      })

      // 4. Create domain/category/course assignments
      for (const domainId of domainIds || []) {
        await tx.staffAssignment.create({
          data: {
            staffProfileId: staffProfile.id,
            portalId: portalRecord.id,
            domainId,
            assignedBy: auth.user.id,
            status: "ACTIVE",
          }
        })
      }

      for (const categoryId of categoryIds || []) {
        await tx.staffAssignment.create({
          data: {
            staffProfileId: staffProfile.id,
            portalId: portalRecord.id,
            categoryId,
            assignedBy: auth.user.id,
            status: "ACTIVE",
          }
        })
      }

      for (const difficultyLevel of difficultyLevels || []) {
        await tx.staffAssignment.create({
          data: {
            staffProfileId: staffProfile.id,
            portalId: portalRecord.id,
            difficultyLevel,
            assignedBy: auth.user.id,
            status: "ACTIVE",
          }
        })
      }

      for (const courseId of courseIds || []) {
        await tx.staffAssignment.create({
          data: {
            staffProfileId: staffProfile.id,
            portalId: portalRecord.id,
            courseId,
            assignedBy: auth.user.id,
            status: "ACTIVE",
          }
        })
      }

      // 5. Create activity log
      await tx.staffActivity.create({
        data: {
          staffProfileId: staffProfile.id,
          action: "ACCOUNT_CREATED",
          category: "ACCOUNT",
          description: `Portal account created: ${portal || "Support Staff"}`,
          performedBy: auth.user.id,
          performedByName: auth.user.profile?.fullName || "System",
          metadata: { portal, role: userRole }
        }
      })

      // 6. Create notification
      await tx.staffNotification.create({
        data: {
          staffProfileId: staffProfile.id,
          title: "Welcome to InnovaSci Open Academy",
          message: "Your account has been created. Please check your email for login credentials.",
          type: "ACCOUNT",
          priority: "HIGH",
        }
      })

      return { user, staffProfile, portal: portalRecord }
    })

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      action: "CREATE",
      module: "PORTAL_ACCOUNT",
      targetId: result.staffProfile.id,
      newData: { email, fullName, portal, role: userRole },
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        staffId: result.staffProfile.id,
        portalId: result.portal.id,
        email,
        fullName,
        role: userRole,
        portal: portal,
        temporaryPassword: temporaryPassword,
      },
      message: "Portal account created successfully. Login credentials have been generated."
    }, { status: 201 })
  } catch (error) {
    console.error("Create portal account error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create portal account" },
      { status: 500 }
    )
  }
}

// Helper function to map portal to role
function mapPortalToRole(portal: string | undefined): string {
  const mapping: Record<string, string> = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    ACADEMIC_DIRECTOR: "ACADEMIC_DIRECTOR",
    INSTRUCTOR: "INSTRUCTOR",
    REVIEWER: "REVIEWER",
    PROJECT_SUPERVISOR: "PROJECT_SUPERVISOR",
    FINANCE_OFFICER: "FINANCE_OFFICER",
    ADMISSION_OFFICER: "ADMISSION_OFFICER",
    STUDENT_AFFAIRS: "STUDENT_AFFAIRS",
    QUALITY_ASSURANCE: "QUALITY_ASSURANCE",
    RESEARCH_COORDINATOR: "RESEARCH_COORDINATOR",
    SUPPORT_STAFF: "SUPPORT_STAFF",
  }
  return mapping[portal || ""] || "STUDENT"
}

// Helper function to generate random password
function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
