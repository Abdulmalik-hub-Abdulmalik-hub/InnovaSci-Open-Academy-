import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/staff/[id]/assignments - Get staff assignments
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params

    const assignments = await prisma.staffAssignment.findMany({
      where: { staffProfileId: id },
      include: {
        portal: true,
        role: true,
        domain: {
          select: { id: true, name: true, slug: true, icon: true, color: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        course: {
          select: { id: true, title: true, slug: true }
        },
      },
      orderBy: { assignedAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      data: assignments
    })
  } catch (error) {
    console.error("Get assignments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

// POST /api/admin/staff/[id]/assignments - Add new assignment
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_EDIT)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const {
      portalName,
      roleId,
      domainId,
      categoryId,
      difficultyLevel,
      courseId,
      isPrimary = false,
      expiresAt,
    } = body

    // Verify staff exists
    const staff = await prisma.staffProfile.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      )
    }

    // Get portal
    let portal
    if (portalName) {
      portal = await prisma.portal.findUnique({
        where: { name: portalName }
      })
    }

    if (!portal) {
      // Create default portal if not exists
      portal = await prisma.portal.upsert({
        where: { name: portalName || "SUPPORT_STAFF" },
        update: {},
        create: {
          name: portalName || "SUPPORT_STAFF",
          displayName: portalName?.replace(/_/g, " ") || "Support Staff",
          description: `Portal for ${portalName?.replace(/_/g, " ") || "Support Staff"} role`,
          isActive: true,
          isSystem: false,
        }
      })
    }

    // Build target info for logging
    const targetInfo: string[] = []
    if (domainId) {
      const domain = await prisma.domain.findUnique({ where: { id: domainId } })
      if (domain) targetInfo.push(`Domain: ${domain.name}`)
    }
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } })
      if (category) targetInfo.push(`Category: ${category.name}`)
    }
    if (difficultyLevel) targetInfo.push(`Difficulty: ${difficultyLevel}`)
    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } })
      if (course) targetInfo.push(`Course: ${course.title}`)
    }

    // Create assignment
    const assignment = await prisma.staffAssignment.create({
      data: {
        staffProfileId: id,
        portalId: portal.id,
        roleId: roleId || portal.defaultRoleId || undefined,
        domainId: domainId || undefined,
        categoryId: categoryId || undefined,
        difficultyLevel: difficultyLevel || undefined,
        courseId: courseId || undefined,
        isPrimary,
        assignedBy: auth.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        status: "ACTIVE",
      },
      include: {
        portal: true,
        role: true,
        domain: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        course: { select: { id: true, title: true, slug: true } },
      }
    })

    // Create activity log
    await prisma.staffActivity.create({
      data: {
        staffProfileId: id,
        action: "ASSIGNMENT_ADDED",
        category: "ASSIGNMENT",
        description: `Assigned to ${targetInfo.join(", ") || portal.displayName}`,
        targetType: domainId ? "DOMAIN" : categoryId ? "CATEGORY" : courseId ? "COURSE" : "PORTAL",
        targetId: domainId || categoryId || courseId || portal.id,
        targetName: targetInfo.join(", ") || portal.displayName,
        performedBy: auth.user.id,
        performedByName: auth.user.profile?.fullName || "System",
        metadata: { portalName, domainId, categoryId, difficultyLevel, courseId }
      }
    })

    // Create notification
    await prisma.staffNotification.create({
      data: {
        staffProfileId: id,
        title: "New Assignment",
        message: `You have been assigned to ${targetInfo.join(", ") || portal.displayName}`,
        type: "ASSIGNMENT",
        priority: "NORMAL",
      }
    })

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      action: "CREATE",
      module: "STAFF_ASSIGNMENT",
      targetId: assignment.id,
      newData: body,
    })

    return NextResponse.json({
      success: true,
      data: assignment,
      message: "Assignment added successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Create assignment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/staff/[id]/assignments - Remove assignment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_EDIT)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get("assignmentId")

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: "Assignment ID is required" },
        { status: 400 }
      )
    }

    // Get assignment
    const assignment = await prisma.staffAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        portal: true,
        domain: true,
        category: true,
        course: true,
      }
    })

    if (!assignment || assignment.staffProfileId !== id) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Build target info for logging
    const targetInfo: string[] = []
    if (assignment.domain) targetInfo.push(`Domain: ${assignment.domain.name}`)
    if (assignment.category) targetInfo.push(`Category: ${assignment.category.name}`)
    if (assignment.difficultyLevel) targetInfo.push(`Difficulty: ${assignment.difficultyLevel}`)
    if (assignment.course) targetInfo.push(`Course: ${assignment.course.title}`)
    if (!targetInfo.length) targetInfo.push(assignment.portal.displayName)

    // Delete assignment
    await prisma.staffAssignment.delete({
      where: { id: assignmentId }
    })

    // Create activity log
    await prisma.staffActivity.create({
      data: {
        staffProfileId: id,
        action: "ASSIGNMENT_REMOVED",
        category: "ASSIGNMENT",
        description: `Removed from ${targetInfo.join(", ")}`,
        targetType: assignment.domainId ? "DOMAIN" : assignment.categoryId ? "CATEGORY" : assignment.courseId ? "COURSE" : "PORTAL",
        targetId: assignment.domainId || assignment.categoryId || assignment.courseId || assignment.portalId,
        targetName: targetInfo.join(", "),
        performedBy: auth.user.id,
        performedByName: auth.user.profile?.fullName || "System",
      }
    })

    // Create notification
    await prisma.staffNotification.create({
      data: {
        staffProfileId: id,
        title: "Assignment Removed",
        message: `You have been removed from ${targetInfo.join(", ")}`,
        type: "ASSIGNMENT",
        priority: "NORMAL",
      }
    })

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      action: "DELETE",
      module: "STAFF_ASSIGNMENT",
      targetId: assignmentId,
    })

    return NextResponse.json({
      success: true,
      message: "Assignment removed successfully"
    })
  } catch (error) {
    console.error("Delete assignment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to remove assignment" },
      { status: 500 }
    )
  }
}
