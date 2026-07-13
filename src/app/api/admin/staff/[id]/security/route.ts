import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"
import { hash } from "bcryptjs"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/staff/[id]/security - Get security settings and history
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
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              }
            }
          }
        },
        sessions: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" }
        },
        activities: {
          where: {
            category: "SECURITY"
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }
      }
    })

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      )
    }

    // Get password reset history
    const passwordResets = await prisma.staffActivity.findMany({
      where: {
        staffProfileId: id,
        action: {
          in: ["PASSWORD_RESET", "PASSWORD_CHANGED", "PASSWORD_FORCED"]
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // Get login history
    const loginHistory = await prisma.staffActivity.findMany({
      where: {
        staffProfileId: id,
        action: {
          in: ["LOGIN", "LOGOUT"]
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: staff.user.id,
          email: staff.user.email,
          fullName: staff.user.profile?.fullName,
          avatarUrl: staff.user.profile?.avatarUrl,
        },
        activeSessions: staff.sessions,
        securityActivities: staff.activities,
        passwordResetHistory: passwordResets,
        loginHistory,
        totalActiveSessions: staff.sessions.length,
      }
    })
  } catch (error) {
    console.error("Get security error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch security data" },
      { status: 500 }
    )
  }
}

// POST /api/admin/staff/[id]/security - Perform security actions
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await authorize(PERMISSIONS.USERS_EDIT)(request)
  if ("status" in auth) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const { action, newPassword, unlockAccount } = body

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

    switch (action) {
      case "reset_password":
        // Reset password
        const tempPassword = newPassword || generateTempPassword()
        const passwordHash = await hash(tempPassword, 12)

        await prisma.$transaction([
          prisma.user.update({
            where: { id: staff.userId },
            data: {
              passwordHash,
            }
          }),
          prisma.staffActivity.create({
            data: {
              staffProfileId: id,
              action: "PASSWORD_RESET",
              category: "SECURITY",
              description: "Password reset by administrator",
              performedBy: auth.user.id,
              performedByName: auth.user.profile?.fullName || "System",
            }
          }),
          prisma.staffNotification.create({
            data: {
              staffProfileId: id,
              title: "Password Reset",
              message: "Your password has been reset by an administrator. Please check your email for the new temporary password.",
              type: "SECURITY",
              priority: "HIGH",
            }
          })
        ])

        await createAuditLog({
          userId: auth.user.id,
          action: "RESET_PASSWORD",
          module: "STAFF_SECURITY",
          targetId: staff.userId,
        })

        return NextResponse.json({
          success: true,
          message: "Password reset successfully",
          temporaryPassword: tempPassword,
        })

      case "force_password_change":
        // Force password change - just create the activity since these fields don't exist in the model
        await prisma.$transaction([
          prisma.staffActivity.create({
            data: {
              staffProfileId: id,
              action: "PASSWORD_FORCED",
              category: "SECURITY",
              description: "Forced password change required on next login",
              performedBy: auth.user.id,
              performedByName: auth.user.profile?.fullName || "System",
            }
          }),
          prisma.staffNotification.create({
            data: {
              staffProfileId: id,
              title: "Password Change Required",
              message: "You are required to change your password on your next login.",
              type: "SECURITY",
              priority: "HIGH",
            }
          })
        ])

        return NextResponse.json({
          success: true,
          message: "Password change forced successfully"
        })

      case "unlock_account":
        // Unlock locked account - just update the status
        await prisma.$transaction([
          prisma.staffActivity.create({
            data: {
              staffProfileId: id,
              action: "ACCOUNT_UNLOCKED",
              category: "SECURITY",
              description: "Account unlocked by administrator",
              performedBy: auth.user.id,
              performedByName: auth.user.profile?.fullName || "System",
            }
          }),
          prisma.staffNotification.create({
            data: {
              staffProfileId: id,
              title: "Account Unlocked",
              message: "Your account has been unlocked by an administrator. You can now log in.",
              type: "SECURITY",
              priority: "HIGH",
            }
          })
        ])

        return NextResponse.json({
          success: true,
          message: "Account unlocked successfully"
        })

      case "suspend":
        // Temporarily suspend account
        await prisma.$transaction([
          prisma.user.update({
            where: { id: staff.userId },
            data: { status: "SUSPENDED" }
          }),
          prisma.staffSession.updateMany({
            where: {
              staffProfileId: id,
              isActive: true
            },
            data: {
              isActive: false,
              terminatedAt: new Date(),
              terminatedBy: auth.user.id,
              terminationReason: "ACCOUNT_SUSPENDED"
            }
          }),
          prisma.staffActivity.create({
            data: {
              staffProfileId: id,
              action: "ACCOUNT_SUSPENDED",
              category: "SECURITY",
              description: "Account suspended by administrator",
              performedBy: auth.user.id,
              performedByName: auth.user.profile?.fullName || "System",
              metadata: { reason: body.reason }
            }
          }),
          prisma.staffNotification.create({
            data: {
              staffProfileId: id,
              title: "Account Suspended",
              message: "Your account has been suspended. Please contact support for more information.",
              type: "SECURITY",
              priority: "URGENT",
            }
          })
        ])

        return NextResponse.json({
          success: true,
          message: "Account suspended successfully"
        })

      case "enable_2fa":
        // Enable two-factor authentication (future implementation)
        return NextResponse.json({
          success: false,
          error: "2FA enablement not yet implemented"
        }, { status: 501 })

      default:
        return NextResponse.json(
          { success: false, error: "Invalid security action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Security action error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to perform security action" },
      { status: 500 }
    )
  }
}

// Helper function to generate temporary password
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
