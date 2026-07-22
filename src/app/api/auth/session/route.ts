import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[Session API] ============================================")
    console.log("[Session API] SESSION API REQUEST")
    console.log("[Session API] ============================================")
    
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    // Also get the raw token to ensure role is included
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    console.log("[Session API] Session user:", session?.user)
    console.log("[Session API] Session user.role:", session?.user?.role)
    console.log("[Session API] Token:", JSON.stringify(token))
    console.log("[Session API] Token role:", token?.role)
    console.log("[Session API] Token id:", token?.id)
    console.log("[Session API] ============================================")
    
    if (!session?.user) {
      console.log("[Session API] No session - returning null user")
      console.log("[Session API] ============================================")
      return NextResponse.json({ user: null })
    }

    // CRITICAL: Use the token's role as the source of truth (it comes from authorize callback)
    // The JWT token should contain the Prisma role, not Supabase role
    const role = token?.role as string | undefined
    
    console.log("[Session API] >>> role from token: '" + role + "'")
    console.log("[Session API] >>> typeof role: " + typeof role)
    console.log("[Session API] ============================================")
    
    // CRITICAL: Verify we're not returning Supabase 'authenticated' role
    if (role === 'authenticated') {
      console.error("[Session API] CRITICAL ERROR: Role is 'authenticated'!")
      console.error("[Session API] This should NEVER happen - Prisma role must be in JWT!")
    }
    
    // CRITICAL: Check if role is undefined
    if (!role) {
      console.error("[Session API] CRITICAL ERROR: Role is undefined!")
      console.error("[Session API] This means the role was not stored in the JWT!")
    }

    const response = {
      user: {
        id: session.user.id || token?.id,
        email: session.user.email || token?.email,
        name: session.user.name || token?.name,
        role: role
      }
    }
    
    console.log("[Session API] FINAL RESPONSE:", JSON.stringify(response))
    console.log("[Session API] ============================================")

    return NextResponse.json(response)
  } catch (error) {
    console.error("[Session API] Error:", error)
    console.error("[Session API] ============================================")
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
