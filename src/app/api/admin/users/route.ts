import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/users - Get all users with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || "all"
    const status = searchParams.get("status") || "all"

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
        { profile: { username: { contains: search, mode: "insensitive" } } },
      ]
    }
    
    if (role !== "all") {
      where.role = role
    }
    
    if (status !== "all") {
      where.status = status.toUpperCase()
    }

    // Fetch users and count in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          profile: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatarUrl: true,
              country: true,
              bio: true,
            }
          },
          _count: {
            select: {
              enrollments: true,
              certificates: true,
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Transform data
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      profile: user.profile ? {
        ...user.profile,
        createdAt: user.profile ? user.createdAt?.toISOString() : null,
        updatedAt: user.profile ? user.createdAt?.toISOString() : null,
      } : null,
      enrollments: user._count.enrollments,
      certificates: user._count.certificates,
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
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
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role, fullName, username } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Create user with profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: password, // In production, hash this!
          role: role || "STUDENT",
          status: "ACTIVE",
        }
      })

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          fullName: fullName || null,
          username: username || null,
        }
      })

      return { user, profile }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
          createdAt: result.user.createdAt.toISOString(),
        }
      },
      message: "User created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    )
  }
}
