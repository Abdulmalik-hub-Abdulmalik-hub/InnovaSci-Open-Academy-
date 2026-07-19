import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/admin/users/check?email=user@example.com
// Check user details for debugging authentication issues
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({
      success: false,
      error: "Please provide email as query parameter: ?email=user@example.com"
    }, { status: 400 })
  }

  try {
    // Try case-insensitive search
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { email: email.trim() }
        ]
      },
      include: { profile: true }
    })

    if (!user) {
      // Get sample users to help debug
      const sampleUsers = await prisma.user.findMany({
        take: 5,
        select: { email: true, role: true, status: true, createdAt: true }
      })

      return NextResponse.json({
        success: false,
        error: "User not found",
        searchedEmail: email,
        totalUsers: await prisma.user.count(),
        sampleUsers
      }, { status: 404 })
    }

    // Analyze the user
    const analysis = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      hasPasswordHash: !!user.passwordHash,
      passwordHash: user.passwordHash ? {
        exists: true,
        length: user.passwordHash.length,
        prefix: user.passwordHash.substring(0, 15),
        isBcrypt: user.passwordHash.startsWith("$2"),
        format: user.passwordHash.startsWith("$2") ? "bcrypt" : 
               user.passwordHash.startsWith("$2a") ? "bcrypt (old)" :
               user.passwordHash.startsWith("$2b") ? "bcrypt (new)" :
               "unknown"
      } : null,
      profile: user.profile ? {
        hasProfile: true,
        fullName: user.profile.fullName
      } : { hasProfile: false }
    }

    // Check for issues
    const issues: string[] = []
    const warnings: string[] = []

    if (user.status !== "ACTIVE") {
      issues.push(`User status is '${user.status}' but must be 'ACTIVE' for login`)
    }

    if (!user.passwordHash) {
      issues.push("User has no password hash - cannot login with credentials (may be SSO/SAML only)")
    } else if (!user.passwordHash.startsWith("$2")) {
      issues.push("Password hash is not in bcrypt format")
    }

    if (!user.profile) {
      warnings.push("User has no profile - name will default to email prefix")
    }

    return NextResponse.json({
      success: true,
      user: analysis,
      issues: issues.length > 0 ? issues : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      canLoginWithCredentials: issues.length === 0
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
