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
        console.log("[Auth] Login attempt:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials")
          return null
        }

        const normalizedEmail = credentials.email.toLowerCase().trim()

        // PRIMARY: Try Supabase Auth first (if configured)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseKey) {
          try {
            console.log("[Auth] Trying Supabase Auth...")
            
            const { createClient } = await import("@supabase/supabase-js")
            const supabase = createClient(supabaseUrl, supabaseKey)

            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password: credentials.password
            })

            if (!signInError && signInData.user) {
              console.log("[Auth] Supabase auth successful!")
              
              // Get or create Prisma user
              try {
                let prismaUser = await prisma.user.findFirst({
                  where: { email: normalizedEmail },
                  include: { profile: true }
                })

                if (!prismaUser) {
                  // Create Prisma user from Supabase user
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

                return {
                  id: prismaUser.id,
                  email: prismaUser.email,
                  name: prismaUser.profile?.fullName || signInData.user.user_metadata?.full_name || prismaUser.email.split("@")[0],
                  role: prismaUser.role
                }
              } catch (prismaError) {
                console.error("[Auth] Prisma sync error:", prismaError)
                // Return Supabase user data
                const userEmail = signInData.user.email || ''
                return {
                  id: signInData.user.id,
                  email: userEmail,
                  name: signInData.user.user_metadata?.full_name || userEmail.split("@")[0],
                  role: "STUDENT"
                }
              }
            }
            
            console.log("[Auth] Supabase error:", signInError?.message)
          } catch (supabaseError) {
            console.error("[Auth] Supabase error:", supabaseError)
          }
        }

        // FALLBACK: Try Prisma database with bcrypt
        try {
          console.log("[Auth] Trying Prisma database...")
          
          const prismaUser = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            include: { profile: true }
          })

          if (prismaUser) {
            if (prismaUser.passwordHash) {
              const isValid = await bcrypt.compare(credentials.password, prismaUser.passwordHash)
              if (isValid) {
                console.log("[Auth] Prisma auth successful!")
                return {
                  id: prismaUser.id,
                  email: prismaUser.email,
                  name: prismaUser.profile?.fullName || prismaUser.email.split("@")[0],
                  role: prismaUser.role
                }
              }
              console.log("[Auth] Invalid password")
            } else {
              console.log("[Auth] User has no password hash in Prisma")
            }
          } else {
            console.log("[Auth] User not found in Prisma")
          }
        } catch (prismaError) {
          console.error("[Auth] Prisma error:", prismaError)
        }

        console.log("[Auth] Authentication failed")
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