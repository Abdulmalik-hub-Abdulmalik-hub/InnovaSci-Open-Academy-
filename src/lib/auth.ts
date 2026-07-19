import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[Auth] =======================================")
        console.log("[Auth] AUTHORIZE FUNCTION CALLED")
        console.log("[Auth] Timestamp:", new Date().toISOString())
        console.log("[Auth] Email received:", credentials?.email)
        console.log("[Auth] Password length:", credentials?.password?.length || 0)
        console.log("[Auth] =======================================")
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] ERROR: Missing credentials")
          return null
        }

        try {
          // Try exact match first
          const normalizedEmail = credentials.email.toLowerCase().trim()
          console.log("[Auth] Searching for user with email:", normalizedEmail)
          
          // Also try case-insensitive search
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: normalizedEmail },
                { email: credentials.email.trim() }
              ]
            },
            include: { profile: true }
          })

          console.log("[Auth] Database query executed")
          
          if (!user) {
            console.log("[Auth] ERROR: User not found in database")
            console.log("[Auth] Tried searching for:", normalizedEmail)
            
            // Debug: Check if any users exist
            const userCount = await prisma.user.count()
            console.log("[Auth] Total users in database:", userCount)
            
            // List first few users for debugging
            if (userCount > 0) {
              const sampleUsers = await prisma.user.findMany({ take: 3, select: { email: true } })
              console.log("[Auth] Sample users in DB:", sampleUsers.map(u => u.email).join(", "))
            }
            
            return null
          }

          console.log("[Auth] SUCCESS: User found!")
          console.log("[Auth] - User ID:", user.id)
          console.log("[Auth] - User Email:", user.email)
          console.log("[Auth] - User Role:", user.role)
          console.log("[Auth] - User Status:", user.status)
          console.log("[Auth] - Password hash exists:", !!user.passwordHash)
          console.log("[Auth] - Password hash prefix:", user.passwordHash?.substring(0, 20) || "NULL")
          console.log("[Auth] - Profile fullName:", user.profile?.fullName || "NOT SET")
          
          // Check user status
          if (user.status !== "ACTIVE") {
            console.log("[Auth] ERROR: User account is NOT active. Status:", user.status)
            return null
          }
          console.log("[Auth] User status check PASSED (ACTIVE)")
          
          if (!user.passwordHash) {
            console.log("[Auth] ERROR: User has no password hash (may be SSO/SAML user)")
            return null
          }

          console.log("[Auth] Comparing password...")
          console.log("[Auth] - Input password:", credentials.password)
          console.log("[Auth] - Stored hash:", user.passwordHash)
          
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          console.log("[Auth] bcrypt.compare() result:", isValid)
          
          if (!isValid) {
            console.log("[Auth] ERROR: Password validation FAILED")
            console.log("[Auth] This could mean:")
            console.log("[Auth] 1. Wrong password entered")
            console.log("[Auth] 2. Password was never set properly")
            console.log("[Auth] 3. Password was changed after account creation")
            return null
          }

          console.log("[Auth] SUCCESS: Password validation PASSED!")
          console.log("[Auth] Creating return object...")
          
          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.profile?.fullName || user.email.split("@")[0],
            image: user.profile?.avatarUrl,
            role: user.role
          }
          console.log("[Auth] Return user:", JSON.stringify(returnUser))
          console.log("[Auth] =======================================")

          return returnUser
        } catch (error: any) {
          console.error("[Auth] ERROR: Database error during authorization:", error?.message || error)
          console.error("[Auth] Error stack:", error?.stack)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("[Auth] JWT callback - user:", user ? `ID: ${user.id}` : "No user")
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      console.log("[Auth] Session callback - token role:", token.role)
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
}