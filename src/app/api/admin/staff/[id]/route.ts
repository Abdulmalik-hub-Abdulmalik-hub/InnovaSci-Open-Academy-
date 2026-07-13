import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"
import { hash } from "bcryptjs"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/staff/[id] - Get single staff member details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params

    const staff = await prisma.staffProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            emailVerified: true,
            lastLogin: true,
            loginAttempts: true,
            lockedUntil: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                phone: true,
                country: true,
                city: true,
                gender: true,
                bio: true,
              }
            },
            userRoles: {
              include: {
                role: true
              }
            }
          }
        },
        assignments: {
          where: { status: "ACTIVE" },
          include: {
            portal: true,
            role: true,
            domain: { select: { id: true, name: true, slug: true, icon: true, color: true } },
            category: { select: { id: true, name: true, slug: true } },
            course: { select: { id: true, title: true, slug: true } },
          },
          orderBy: { assignedAt: "desc" }
        },
        sessions: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" }
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        supervisorAssignments: {
          where: { status: "ACTIVE" },
          include: {
            domain: { select: { id: true, name: true, slug: true } },
            category: { select: { id: true, name: true, slug: true } },
            course: { select: { id: true, title: true, slug: true } },
          }
        },
        _count: {
          select: {
            assignments: { where: { status: "ACTIVE" } },
            sessions: { where: { isActive: true } },
          }
        }
      }
    })

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      )
    }

    // Get performance stats based on role
    let performanceStats = null
    
    if (staff.user.role === "INSTRUCTOR") {
      // Instructor stats
      const [courses, enrollments, reviews] = await Promise.all([
        prisma.course.count({ where: { instructor: { userId: staff.userId } } }),
        prisma.enrollment.count({ where: { userId: staff.userId } }),
        prisma.projectReview.count({ where: { reviewerId: staff.userId } }),
      ])
      
      performanceStats = {
        type: "instructor",
        coursesAssigned: courses,
        studentsEnrolled: enrollments,
        reviewsCompleted: reviews,
      }
    } else if (staff.user.role === "REVIEWER") {
      // Reviewer stats
      const reviews = await prisma.projectReview.findMany({
        where: { reviewerId: staff.userId },
        select: {
          decision: true,
          reviewedAt: true,
        }
      })
      
      const pendingReviews = reviews.filter(r => r.decision === "UNDER_REVIEW").length
      const completedReviews = reviews.filter(r => r.decision !== "UNDER_REVIEW").length
      
      performanceStats = {
        type: "reviewer",
        pendingReviews,
        completedReviews,
        totalReviews: reviews.length,
        approvalRate: completedReviews > 0 
          ? Math.round((reviews.filter(r => r.decision === "APPROVED").length / completedReviews) * 100)
          : 0,
      }
    } else if (staff.user.role === "PROJECT_SUPERVISOR") {
      // Supervisor stats
      const milestones = await prisma.supervisorMilestone.findMany({
        where: {
          supervisor: {
            supervisorId: staff.id
          }
        },
        select: {
          status: true,
        }
      })
      
      performanceStats = {
        type: "supervisor",
        totalStudents: staff.supervisorAssignments.reduce((acc, a) => acc + a.currentStudents, 0),
        milestonesApproved: milestones.filter(m => m.status === "APPROVED").length,
        milestonesPending: milestones.filter(m => m.status === "PENDING" || m.status === "IN_PROGRESS").length,
      }
    }

    // Get permissions
    const permissions = await prisma.permission.findMany({
      where: {
        roles: {
          some: {
            userId: staff.userId
          }
        }
      },
      select: {
        name: true,
        displayName: true,
        resource: true,
        action: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...staff,
        performanceStats,
        permissions,
        isLocked: staff.user.lockedUntil && staff.user.lockedUntil > new Date(),
        loginAttempts: staff.user.loginAttempts || 0,
      }
    })
  } catch (error) {
    console.error("Get staff error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff details" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/staff/[id] - Update staff member
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_EDIT)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const {
      fullName,
      phone,
      staffId,
      title,
      department,
      employeeType,
      avatarUrl,
      address,
      city,
      country,
      gender,
      dateOfBirth,
      nationality,
      idType,
      idNumber,
      emergencyName,
      emergencyPhone,
      emergencyEmail,
      emergencyRelation,
      status,
      role,
    } = body

    // Get current staff
    const currentStaff = await prisma.staffProfile.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!currentStaff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      )
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user profile
      if (fullName || phone || avatarUrl || country || city || gender) {
        await tx.profile.update({
          where: { userId: currentStaff.userId },
          data: {
            ...(fullName && { fullName }),
            ...(phone && { phone }),
            ...(avatarUrl && { avatarUrl }),
            ...(country && { country }),
            ...(city && { city }),
            ...(gender && { gender }),
          }
        })
      }

      // Update user
      if (status || role) {
        await tx.user.update({
          where: { id: currentStaff.userId },
          data: {
            ...(status && { status }),
            ...(role && { role }),
          }
        })
      }

      // Update staff profile
      const updatedStaff = await tx.staffProfile.update({
        where: { id },
        data: {
          ...(staffId && { staffId }),
          ...(title !== undefined && { title }),
          ...(department !== undefined && { department }),
          ...(employeeType !== undefined && { employeeType }),
          ...(phone !== undefined && { phone }),
          ...(avatarUrl !== undefined && { staffAvatarUrl: avatarUrl }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(country !== undefined && { country }),
          ...(gender !== undefined && { gender }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(nationality !== undefined && { nationality }),
          ...(idType !== undefined && { idType }),
          ...(idNumber !== undefined && { idNumber }),
          ...(emergencyName !== undefined && { emergencyName }),
          ...(emergencyPhone !== undefined && { emergencyPhone }),
          ...(emergencyEmail !== undefined && { emergencyEmail }),
          ...(emergencyRelation !== undefined && { emergencyRelation }),
        }
      })

      // Log activity if status changed
      if (status && status !== currentStaff.user.status) {
        await tx.staffActivity.create({
          data: {
            staffProfileId: id,
            action: status === "SUSPENDED" ? "SUSPENDED" : status === "ACTIVE" ? "REACTIVATED" : "STATUS_CHANGED",
            category: "ACCOUNT",
            description: `Account status changed from ${currentStaff.user.status} to ${status}`,
            performedBy: auth.user.id,
            performedByName: auth.user.profile?.fullName || "System",
            metadata: { previousStatus: currentStaff.user.status, newStatus: status }
          }
        })
      }

      // Log activity if role changed
      if (role && role !== currentStaff.user.role) {
        await tx.staffActivity.create({
          data: {
            staffProfileId: id,
            action: "ROLE_CHANGED",
            category: "ROLE",
            description: `Role changed from ${currentStaff.user.role} to ${role}`,
            performedBy: auth.user.id,
            performedByName: auth.user.profile?.fullName || "System",
            metadata: { previousRole: currentStaff.user.role, newRole: role }
          }
        })
      }

      return updatedStaff
    })

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      action: "UPDATE",
      module: "STAFF",
      targetId: id,
      newData: body,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: "Staff updated successfully"
    })
  } catch (error) {
    console.error("Update staff error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update staff" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/staff/[id] - Delete staff member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_DELETE)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get("hard") === "true"

    // Get current staff
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

    // Prevent deleting own account
    if (staff.userId === auth.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    if (hardDelete) {
      // Hard delete - remove all data
      await prisma.$transaction([
        prisma.staffActivity.deleteMany({ where: { staffProfileId: id } }),
        prisma.staffSession.deleteMany({ where: { staffProfileId: id } }),
        prisma.staffAssignment.deleteMany({ where: { staffProfileId: id } }),
        prisma.staffNotification.deleteMany({ where: { staffProfileId: id } }),
        prisma.staffProfile.delete({ where: { id } }),
        prisma.user.delete({ where: { id: staff.userId } }),
      ])
    } else {
      // Soft delete - archive
      await prisma.$transaction([
        prisma.user.update({
          where: { id: staff.userId },
          data: { status: "ARCHIVED" }
        }),
        prisma.staffProfile.update({
          where: { id },
          data: { isActive: false }
        }),
        prisma.staffActivity.create({
          data: {
            staffProfileId: id,
            action: "ACCOUNT_DELETED",
            category: "ACCOUNT",
            description: "Staff account archived",
            performedBy: auth.user.id,
            performedByName: auth.user.profile?.fullName || "System",
          }
        })
      ])
    }

    // Create audit log
    await createAuditLog({
      userId: auth.user.id,
      action: "DELETE",
      module: "STAFF",
      targetId: id,
      newData: { hard: hardDelete },
    })

    return NextResponse.json({
      success: true,
      message: hardDelete ? "Staff permanently deleted" : "Staff archived successfully"
    })
  } catch (error) {
    console.error("Delete staff error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete staff" },
      { status: 500 }
    )
  }
}
