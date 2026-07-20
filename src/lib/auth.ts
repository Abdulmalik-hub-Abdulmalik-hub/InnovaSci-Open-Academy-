import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/supabase"
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
        console.log("[Auth] Email:", credentials?.email)
        console.log("[Auth] =======================================")
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] ERROR: Missing credentials")
          return null
        }

        try {
          const normalizedEmail = credentials.email.toLowerCase().trim()
          
          // Step 1: List users from Supabase Auth (using admin API)
          console.log("[Auth] Checking Supabase Auth...")
          const supabaseAdmin = createServerClient()
          
          let supabaseAuthUser = null
          
          if (supabaseAdmin) {
            const { data: supabaseUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
            
            if (listError) {
              console.log("[Auth] Supabase list error:", listError.message)
            } else {
              supabaseAuthUser = supabaseUsers?.users.find(
                u => u.email?.toLowerCase() === normalizedEmail
              )
            }
          } else {
            console.log("[Auth] Supabase not configured, using Prisma-only auth")
          }
          
          // Step 2: Check Prisma for the user
          const prismaUser = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            include: { profile: true }
          })

          // If user is in Supabase but NOT in Prisma, create them
          if (supabaseAuthUser && !prismaUser) {
            console.log("[Auth] Creating Prisma user from Supabase user...")
            const newUser = await prisma.user.create({
              data: {
                email: supabaseAuthUser.email!,
                role: "STUDENT",
                status: "ACTIVE",
                emailVerified: supabaseAuthUser.email_confirmed_at ? new Date(supabaseAuthUser.email_confirmed_at) : null,
              },
              include: { profile: true }
            })
            console.log("[Auth] Prisma user created:", newUser.id)
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.profile?.fullName || newUser.email.split("@")[0],
              role: newUser.role
            }
          }

          // If user is in Prisma, verify password using bcrypt (Prisma-stored hash)
          if (prismaUser) {
            console.log("[Auth] User found in Prisma:", prismaUser.id)
            
            if (prismaUser.status !== "ACTIVE") {
              console.log("[Auth] User account is not active")
              return null
            }
            
            // If Prisma user has password hash, verify it
            if (prismaUser.passwordHash) {
              const isValid = await bcrypt.compare(credentials.password, prismaUser.passwordHash)
              if (!isValid) {
                console.log("[Auth] Password verification failed")
                return null
              }
              console.log("[Auth] Password verified successfully")
              return {
                id: prismaUser.id,
                email: prismaUser.email,
                name: prismaUser.profile?.fullName || prismaUser.email.split("@")[0],
                role: prismaUser.role
              }
            }
            
            // If Prisma user has no password hash, check Supabase
            if (supabaseAuthUser) {
              // Use Supabase signInWithPassword via client
              const { createClient } = await import("@supabase/supabase-js")
              const supabaseClient = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              )
              
              const { error: signInError } = await supabaseClient.auth.signInWithPassword({
                email: normalizedEmail,
                password: credentials.password
              })
              
              if (signInError) {
                console.log("[Auth] Supabase signIn error:", signInError.message)
                return null
              }
              
              console.log("[Auth] Supabase authentication successful")
              return {
                id: prismaUser.id,
                email: prismaUser.email,
                name: prismaUser.profile?.fullName || prismaUser.email.split("@")[0],
                role: prismaUser.role
              }
            }
            
            console.log("[Auth] ERROR: No password hash found")
            return null
          }

          // User not found anywhere
          console.log("[Auth] User not found in Supabase or Prisma")
          return null
          
        } catch (error: any) {
          console.error("[Auth] ERROR:", error?.message || error)
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