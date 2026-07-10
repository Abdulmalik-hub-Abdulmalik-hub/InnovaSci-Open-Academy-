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
        console.log("[Auth] Email received:", credentials?.email)
        console.log("[Auth] Password length:", credentials?.password?.length || 0)
        console.log("[Auth] =======================================")
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] ERROR: Missing credentials")
          return null
        }

        try {
          const normalizedEmail = credentials.email.toLowerCase().trim()
          console.log("[Auth] Searching for user with email:", normalizedEmail)
          
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { profile: true }
          })

          if (!user) {
            console.log("[Auth] ERROR: User not found in database")
            return null
          }

          console.log("[Auth] SUCCESS: User found!")
          console.log("[Auth] - User ID:", user.id)
          console.log("[Auth] - User Email:", user.email)
          console.log("[Auth] - User Role:", user.role)
          console.log("[Auth] - Password hash exists:", !!user.passwordHash)
          console.log("[Auth] - Password hash prefix:", user.passwordHash?.substring(0, 15) || "NULL")
          
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
            return null
          }

          console.log("[Auth] SUCCESS: Password validation PASSED!")
          console.log("[Auth] =======================================")

          return {
            id: user.id,
            email: user.email,
            name: user.profile?.fullName || user.email.split("@")[0],
            image: user.profile?.avatarUrl,
            role: user.role
          }
        } catch (error) {
          console.error("[Auth] ERROR: Database error during authorization:", error)
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