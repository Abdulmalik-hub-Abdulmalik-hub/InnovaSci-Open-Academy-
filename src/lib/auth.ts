import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Helper to check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[Auth] Login attempt for:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const normalizedEmail = credentials.email.toLowerCase().trim()

        // PRIMARY: Authenticate via Prisma database (bcrypt password hash)
        try {
          console.log("[Auth] Checking Prisma database...")
          
          const prismaUser = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            include: { profile: true }
          })

          if (prismaUser) {
            console.log("[Auth] User found in Prisma:", prismaUser.id)
            
            // Check if user has a password hash
            if (prismaUser.passwordHash) {
              const isValid = await bcrypt.compare(credentials.password, prismaUser.passwordHash)
              if (isValid) {
                console.log("[Auth] Prisma password verified!")
                
                // Update last login
                await prisma.user.update({
                  where: { id: prismaUser.id },
                  data: { updatedAt: new Date() }
                }).catch(() => {}) // Ignore update errors
                
                return {
                  id: prismaUser.id,
                  email: prismaUser.email,
                  name: prismaUser.profile?.fullName || prismaUser.email.split("@")[0],
                  role: prismaUser.role
                }
              } else {
                console.log("[Auth] Password incorrect")
                return null
              }
            }
            
            // User exists but has no password hash
            console.log("[Auth] User has no password hash, checking Supabase...")
          } else {
            console.log("[Auth] User not in Prisma, checking Supabase...")
          }
        } catch (prismaError) {
          console.error("[Auth] Prisma error:", prismaError)
        }

        // FALLBACK: If Supabase is configured, try Supabase Auth
        if (isSupabaseConfigured()) {
          try {
            console.log("[Auth] Trying Supabase Auth...")
            
            const { createClient } = await import("@supabase/supabase-js")
            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password: credentials.password
            })

            if (signInError) {
              console.log("[Auth] Supabase error:", signInError.message)
              return null
            }

            console.log("[Auth] Supabase auth successful!")

            // Check if user exists in Prisma
            try {
              let prismaUser = await prisma.user.findFirst({
                where: { email: normalizedEmail },
                include: { profile: true }
              })

              // If not in Prisma, create them
              if (!prismaUser && signInData.user) {
                console.log("[Auth] Creating Prisma user from Supabase...")
                prismaUser = await prisma.user.create({
                  data: {
                    email: signInData.user.email!,
                    role: "STUDENT",
                    status: "ACTIVE",
                  },
                  include: { profile: true }
                })
              }

              if (prismaUser) {
                return {
                  id: prismaUser.id,
                  email: prismaUser.email,
                  name: prismaUser.profile?.fullName || prismaUser.email.split("@")[0],
                  role: prismaUser.role
                }
              }
            } catch (prismaError) {
              console.error("[Auth] Could not sync to Prisma:", prismaError)
              // Still return user from Supabase
              return {
                id: signInData.user?.id || "supabase-user",
                email: signInData.user?.email || normalizedEmail,
                name: signInData.user?.user_metadata?.full_name || normalizedEmail.split("@")[0],
                role: "STUDENT"
              }
            }
          } catch (supabaseError) {
            console.error("[Auth] Supabase error:", supabaseError)
          }
        }

        console.log("[Auth] Authentication failed - user not found or invalid password")
        return null
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