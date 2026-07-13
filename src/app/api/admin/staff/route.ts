import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"
import { hash } from "bcryptjs"

// GET /api/admin/staff - Get all staff members
export async function GET(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    
    // Filters
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role")
    const portal = searchParams.get("portal")
    const department = searchParams.get("department")
    const status = searchParams.get("status")
    const domainId = searchParams.get("domainId")
    const categoryId = searchParams.get("categoryId")
    const difficultyLevel = searchParams.get("difficultyLevel")
    const courseId = searchParams.get("courseId")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    
    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc"

    // Build where clause
    const where: any = {}
    
    // Search
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { profile: { fullName: { contains: search, mode: "insensitive" } } } },
        { user: { profile: { phone: { contains: search, mode: "insensitive" } } } },
        { staffId: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ]
    }
    
    // Role filter
    if (role) {
      where.user = { ...where.user, role }
    }
    
    // Status filter
    if (status) {
      where.user = { ...where.user, status }
    }
    
    // Department filter
    if (department) {
      where.department = { contains: department, mode: "insensitive" }
    }
    
    // Portal filter
    if (portal) {
      where.assignments = {
        some: {
          portal: { name: portal },
          status: "ACTIVE"
        }
      }
    }
    
    // Domain filter
    if (domainId) {
      where.assignments = {
        ...where.assignments,
        some: {
          domainId,
          status: "ACTIVE"
        }
      }
    }
    
    // Category filter
    if (categoryId) {
      where.assignments = {
        ...where.assignments,
        some: {
          categoryId,
          status: "ACTIVE"
        }
      }
    }
    
    // Difficulty level filter
    if (difficultyLevel) {
      where.assignments = {
        ...where.assignments,
        some: {
          difficultyLevel,
          status: "ACTIVE"
        }
      }
    }
    
    // Course filter
    if (courseId) {
      where.assignments = {
        ...where.assignments,
        some: {
          courseId,
          status: "ACTIVE"
        }
      }
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      where.user = {
        ...where.user,
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        }
      }
    }

    // Get staff with pagination
    const [staff, total] = await Promise.all([
      prisma.staffProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              lastLogin: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  phone: true,
                }
              }
            }
          },
          assignments: {
            where: { status: "ACTIVE" },
            include: {
              portal: true,
              role: true,
              domain: { select: { id: true, name: true, slug: true } },
              category: { select: { id: true, name: true, slug: true } },
              course: { select: { id: true, title: true, slug: true } },
            }
          },
          sessions: {
            where: { isActive: true },
            select: { id: true, createdAt: true, ipAddress: true, browser: true, deviceType: true }
          },
          _count: {
            select: {
              assignments: { where: { status: "ACTIVE" } },
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.staffProfile.count({ where })
    ])

    // Transform data for response
    const transformedStaff = staff.map(s => ({
      id: s.id,
      staffId: s.staffId,
      fullName: s.user.profile?.fullName || "Unknown",
      email: s.user.email,
      phone: s.user.profile?.phone || s.phone,
      avatarUrl: s.user.profile?.avatarUrl || s.staffAvatarUrl,
      role: s.user.role,
      department: s.department,
      title: s.title,
      status: s.user.status,
      lastLogin: s.user.lastLogin,
      createdAt: s.user.createdAt,
      updatedAt: s.user.updatedAt,
      isActive: s.isActive,
      hasActiveSession: s.sessions.length > 0,
      currentSession: s.sessions[0] || null,
      assignments: s.assignments,
      assignmentCount: s._count.assignments,
      portals: [...new Set(s.assignments.map(a => a.portal.name))],
      domains: [...new Set(s.assignments.filter(a => a.domain).map(a => a.domain!.id))],
      categories: [...new Set(s.assignments.filter(a => a.category).map(a => a.category!.id))],
      courses: [...new Set(s.assignments.filter(a => a.course).map(a => a.course!.id))],
    }))

    return NextResponse.json({
      success: true,
      data: {
        staff: transformedStaff,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      }
    })
  } catch (error) {
    console.error("Get staff error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff" },
      { status: 500 }
    )
  }
}

// POST /api/admin/staff - Create a new staff member
export async function POST(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.USERS_CREATE)(request)
  if ("status" in auth) return auth

  try {
    const body = await request.json()
    const {
      email,
      fullName,
      password,
      phone,
      role,
      staffId,
      title,
      department,
      employeeType,
      portal,
      domainIds,
      categoryIds,
      difficultyLevels,
      courseIds,
      generatePassword = true,
    } = body

    // Validate required fields
    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, error: "Email and full name are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { staffProfile: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Generate or use provided password
    const passwordHash = password 
      ? await hash(password, 12)
      : await hash(generateRandomPassword(), 12)

    // Create user and staff profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: role || "STUDENT",
          status: "ACTIVE",
          emailVerified: new Date(),
          profile: {
            create: {
              fullName,
              phone,
              avatarUrl: body.avatarUrl || null,
            }
          }
        },
        include: {
          profile: true,
          staffProfile: true,
        }
      })

      // Create staff profile
      const staffProfile = await tx.staffProfile.create({
        data: {
          userId: user.id,
          staffId: staffId || `STAFF-${Date.now()}`,
          title,
          department,
          employeeType,
          phone,
          staffAvatarUrl: body.avatarUrl || null,
          isActive: true,
        }
      })

      // Create portal assignment if portal specified
      if (portal) {
        const portalRecord = await tx.portal.findUnique({
          where: { name: portal }
        })

        if (portalRecord) {
          await tx.staffAssignment.create({
            data: {
              staffProfileId: staffProfile.id,
              portalId: portalRecord.id,
              roleId: portalRecord.defaultRoleId || undefined,
              assignedBy: auth.user.id,
              status: "ACTIVE",
            }
          })
        }
      }

      // Create domain/category/course assignments
      if (domainIds?.length || categoryIds?.length || difficultyLevels?.length || courseIds?.length) {
        const portalRecord = await tx.portal.findUnique({
          where: { name: portal || "SUPPORT_STAFF" }
        })

        for (const domainId of domainIds || []) {
          await tx.staffAssignment.create({
            data: {
              staffProfileId: staffProfile.id,
              portalId: portalRecord?.id || "",
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
              portalId: portalRecord?.id || "",
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
              portalId: portalRecord?.id || "",
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
              portalId: portalRecord?.id || "",
              courseId,
              assignedBy: auth.user.id,
              status: "ACTIVE",
            }
          })
        }
      }

      // Create activity log
      await tx.staffActivity.create({
        data: {
          staffProfileId: staffProfile.id,
          action: "ACCOUNT_CREATED",
          category: "ACCOUNT",
          description: `Staff account created for ${fullName} (${email})`,
          performedBy: auth.user.id,
          performedByName: auth.user.profile?.fullName || "System",
          metadata: { role, portal }
        }
      })

      return { user, staffProfile }
    })

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      action: "CREATE",
      module: "STAFF",
      targetId: result.staffProfile.id,
      newData: { email, fullName, role, staffId },
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        staffId: result.staffProfile.id,
        email,
        fullName,
        role: role || "STUDENT",
        portal,
        temporaryPassword: !password && generatePassword ? "Generated" : null,
      },
      message: "Staff account created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Create staff error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create staff" },
      { status: 500 }
    )
  }
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
