import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ user: null })
    }

    console.log("[Session API] Returning session:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    })

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      }
    })
  } catch (error) {
    console.error("[Session API] Error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
