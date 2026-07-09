import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Secure email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const normalizedEmail = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user with STUDENT role
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "STUDENT", // Always create as STUDENT
        status: "ACTIVE",
        profile: {
          create: {
            fullName: fullName.trim(),
            username: normalizedEmail.split("@")[0].toLowerCase(),
          },
        },
      },
      include: {
        profile: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Provide more specific error messages based on error type
    if (error?.code === 'P2002') {
      // Prisma error for unique constraint violation
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }
    
    if (error?.code === 'P2025') {
      // Record not found - likely role ID issue
      return NextResponse.json(
        { error: "Registration configuration error. Please contact support." },
        { status: 500 }
      )
    }
    
    if (error?.message?.includes('prisma')) {
      // Database connection issues
      return NextResponse.json(
        { error: "Database connection error. Please try again later." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}
