import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    // Also get the raw token to ensure role is included
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    console.log("[Session API] Session:", session?.user)
    console.log("[Session API] Token role:", token?.role)
    
    if (!session?.user) {
      return NextResponse.json({ user: null })
    }

    // Use the token's role as the source of truth (it comes from authorize callback)
    const role = token?.role || session.user.role

    return NextResponse.json({
      user: {
        id: session.user.id || token?.id,
        email: session.user.email || token?.email,
        name: session.user.name || token?.name,
        role: role
      }
    })
  } catch (error) {
    console.error("[Session API] Error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
