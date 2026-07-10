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
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { profile: true }
          })

          console.log("[Auth] User lookup result:", user ? `Found (ID: ${user.id}, Role: ${user.role})` : "Not found")
          console.log("[Auth] Password hash exists:", !!user?.passwordHash)

          if (!user) {
            console.log("[Auth] User not found in database")
            return null
          }

          if (!user.passwordHash) {
            console.log("[Auth] User has no password hash - may be using SSO/SAML login")
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          console.log("[Auth] Password validation:", isValid ? "Success" : "Failed")

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.profile?.fullName || user.email.split("@")[0],
            image: user.profile?.avatarUrl,
            role: user.role
          }
        } catch (error) {
          console.error("[Auth] Database error during authorization:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
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