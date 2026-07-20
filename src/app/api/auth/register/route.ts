import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

// Secure email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      fullName, 
      country, 
      countryCode,
      state,
      stateCode,
      city,
      streetAddress,
      postalCode,
      phone,
      currency,
      currencySymbol,
      timezone,
      preferredGateway,
      language
    } = body

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      )
    }

    // Country is required
    if (!countryCode) {
      return NextResponse.json(
        { error: "Country is required" },
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

    // Create Supabase Auth client (with service role key)
    const supabaseAdmin = createServerClient()

    // Step 1: Create user in Supabase Auth (if configured)
    let supabaseUserId: string | null = null
    
    if (supabaseAdmin) {
      try {
        const { data: supabaseUser, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName.trim(),
          }
        })

        if (supabaseError) {
          console.log("Supabase signup skipped:", supabaseError.message)
        } else {
          supabaseUserId = supabaseUser.user?.id || null
          console.log("Supabase user created:", supabaseUserId)
        }
      } catch (supabaseErr) {
        console.log("Supabase not configured, continuing with Prisma-only signup")
      }
    } else {
      console.log("Supabase not configured, continuing with Prisma-only signup")
    }

    // Step 2: Hash password for Prisma storage
    const passwordHash = await bcrypt.hash(password, 12)

    // Step 3: Create user in Prisma database
    try {
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: "STUDENT",
          status: "ACTIVE",
          emailVerified: new Date(),
          profile: {
            create: {
              fullName: fullName.trim(),
              username: normalizedEmail.split("@")[0].toLowerCase(),
              // Location data
              country: country || null,
              countryCode: countryCode || null,
              state: state || null,
              stateCode: stateCode || null,
              city: city || null,
              streetAddress: streetAddress || null,
              postalCode: postalCode || null,
              phone: phone || null,
              // Localization data
              currency: currency || null,
              currencySymbol: currencySymbol || null,
              language: language || null,
              timezone: timezone || null,
              preferredGateway: preferredGateway || null,
              preferences: timezone ? { timezone } : {},
            },
          },
        },
        include: {
          profile: true,
        },
      })

      console.log("Prisma user created:", user.id)

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
    } catch (prismaError: any) {
      // If Prisma fails, clean up Supabase user if created
      if (supabaseUserId && supabaseAdmin) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(supabaseUserId)
        } catch (cleanupError) {
          console.error("Failed to cleanup Supabase user:", cleanupError)
        }
      }
      
      if (prismaError?.code === 'P2002') {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        )
      }
      
      if (prismaError?.message?.includes('prisma')) {
        return NextResponse.json(
          { error: "Database connection error. Please try again later." },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    
    if (error?.message?.includes('prisma')) {
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
