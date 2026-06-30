import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// System Admin IDs that cannot be deleted or demoted
// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';
const SYSTEM_ADMIN_IDS = [
  "d2b7ac6d-0e84-4be7-89bd-4f93b15a2b51",
  // Add more system admin IDs as needed
]

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
      ]
    }
    if (role && role !== "all") {
      where.role = role
    }
    if (status && status !== "all") {
      where.status = status
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          _count: {
            select: {
              enrollments: true,
              certificates: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.profile?.fullName || "N/A",
      username: user.profile?.username || null,
      avatarUrl: user.profile?.avatarUrl || null,
      createdAt: user.createdAt.toISOString(),
      enrollments: user._count.enrollments,
      certificates: user._count.certificates,
      isSystemAdmin: SYSTEM_ADMIN_IDS.includes(user.id)
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error("Users API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : "UNKNOWN"
    return NextResponse.json({
      success: false,
      error: `Failed to fetch users: ${errorMessage}`,
      code: errorCode,
      data: { users: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    })
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  // Check DATABASE_URL before any database operation
  console.log("[POST /api/admin/users] DATABASE_URL exists:", !!process.env.DATABASE_URL)
  if (!process.env.DATABASE_URL) {
    console.error("[POST /api/admin/users] FATAL: DATABASE_URL is not set!")
    return NextResponse.json(
      { success: false, error: "Database configuration missing", details: "DATABASE_URL environment variable is not set" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { email, password, role = "STUDENT", fullName, username } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Validate role
    if (!["ADMIN", "STUDENT"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be ADMIN or STUDENT" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: password,
        role,
        status: "ACTIVE"
      }
    })

    // Create profile for the user
    let profile = null
    try {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          fullName: fullName || null,
          username: username || null
        }
      })
    } catch (profileError) {
      console.error("Profile creation warning:", profileError)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt.toISOString()
        },
        profile: profile
      },
      message: "User created successfully"
    }, { status: 201 })

  } catch (error) {
    // Log full error details
    console.error("========== CREATE USER ERROR ==========")
    console.error("Error name:", error?.constructor?.name)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("Full error object:", JSON.stringify(error, null, 2))
    console.error("=======================================")
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: `Failed to create user: ${errorMessage}`, details: error?.constructor?.name },
      { status: 500 }
    )
  }
}
