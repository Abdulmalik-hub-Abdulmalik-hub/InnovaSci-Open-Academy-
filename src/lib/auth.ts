import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Debug helper to trace role through the authentication pipeline
function debugRole(label: string, value: string | undefined, context?: string) {
  const ctx = context ? ` [${context}]` : ''
  console.log(`[DEBUG-ROLE] ${label}: "${value}"${ctx}`)
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
        console.log("[Auth] ============================================")
        console.log("[Auth] LOGIN ATTEMPT:", credentials?.email)
        console.log("[Auth] ============================================")
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials - REJECTING")
          return null
        }

        const normalizedEmail = credentials.email.toLowerCase().trim()
        console.log("[Auth] Normalized email:", normalizedEmail)

        // PRIMARY: Try Supabase Auth first (if configured)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        const isSupabaseConfigured = supabaseUrl && supabaseKey && 
          supabaseUrl !== "https://your-project.supabase.co" &&
          supabaseUrl.startsWith("https://")
        
        console.log("[Auth] Supabase configured:", isSupabaseConfigured)
        
        if (isSupabaseConfigured) {
          try {
            console.log("[Auth] >>> Trying Supabase Auth...")
            
            const { createClient } = await import("@supabase/supabase-js")
            const supabase = createClient(supabaseUrl, supabaseKey)

            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password: credentials.password
            })

            if (!signInError && signInData.user) {
              console.log("[Auth] >>> Supabase auth SUCCESS for:", signInData.user.email)
              console.log("[Auth] Supabase user ID:", signInData.user.id)
              console.log("[Auth] Supabase user role (from auth.users):", signInData.user.role)
              console.log("[Auth] WARNING: Supabase auth.users.role should NOT be used for authorization!")
              console.log("[Auth] CRITICAL: We MUST use Prisma public.users.role instead!")
              
              // Get Prisma user - CRITICAL: PRESERVE THEIR EXISTING ROLE
              try {
                console.log("[Auth] >>> Looking up Prisma user by email...")
                let prismaUser = await prisma.user.findFirst({
                  where: { email: normalizedEmail },
                  include: { profile: true }
                })

                if (prismaUser) {
                  // User exists in Prisma - use their existing role
                  console.log("[Auth] ============================================")
                  console.log("[Auth] FOUND Prisma user!")
                  console.log("[Auth] Prisma user ID:", prismaUser.id)
                  console.log("[Auth] Prisma user email:", prismaUser.email)
                  console.log("[Auth] Prisma user role:", prismaUser.role)
                  console.log("[Auth] Prisma user status:", prismaUser.status)
                  console.log("[Auth] ============================================")
                  console.log("[Auth] DEBUG >>> Storing Prisma role in JWT: '" + prismaUser.role + "'")
                  console.log("[Auth] ============================================")
                  
                  // Return user with their EXISTING Prisma role (preserves ADMIN, SUPER_ADMIN, etc.)
                  // NEVER use Supabase role or metadata role - always use Prisma role
                  const result = {
                    id: prismaUser.id,
                    email: prismaUser.email,
                    name: prismaUser.profile?.fullName || prismaUser.email.split("@")[0],
                    role: prismaUser.role as string // CRITICAL: This is the ONLY source of truth for authorization
                  }
                  
                  debugRole("authorize() returning role", result.role, "Supabase path")
                  console.log("[Auth] ============================================")
                  console.log("[Auth] FINAL RESULT from authorize():", JSON.stringify(result))
                  console.log("[Auth] ============================================")
                  
                  return result
                } else {
                  // New user - create with STUDENT role
                  console.log("[Auth] No Prisma user found - creating new user with STUDENT role")
                  prismaUser = await prisma.user.create({
                    data: {
                      email: signInData.user.email!,
                      role: "STUDENT", // New users default to STUDENT
                      status: "ACTIVE",
                    },
                    include: { profile: true }
                  })
                  
                  const result = {
                    id: prismaUser.id,
                    email: prismaUser.email,
                    name: prismaUser.email.split("@")[0],
                    role: prismaUser.role as string
                  }
                  
                  console.log("[Auth] New user created:", JSON.stringify(result))
                  return result
                }
              } catch (prismaError) {
                console.error("[Auth] >>> Prisma sync ERROR:", prismaError)
                // Fallback to Supabase user with temporary role if Prisma fails
                // This is a degraded mode - user will need to re-login once Prisma is restored
                console.error("[Auth] WARNING: Prisma lookup failed - using degraded mode")
                const userEmail = signInData.user.email || normalizedEmail
                return {
                  id: signInData.user.id,
                  email: userEmail,
                  name: userEmail.split("@")[0],
                  role: "STUDENT" // Temporary role - should be updated from Prisma when available
                }
              }
            }
            
            console.log("[Auth] Supabase auth failed:", signInError?.message)
            console.log("[Auth] Error code:", signInError?.code)
          } catch (supabaseError) {
            console.error("[Auth] Supabase error:", supabaseError)
          }
        } else {
          console.log("[Auth] Supabase not configured or using placeholder - using Prisma only")
        }

        // FALLBACK: Try Prisma database with bcrypt
        console.log("[Auth] >>> Trying Prisma database fallback...")
        
        try {
          const prismaUser = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            include: { profile: true }
          })

          if (prismaUser) {
            console.log("[Auth] Found Prisma user:", prismaUser.id)
            console.log("[Auth] Prisma user role:", prismaUser.role)
            
            if (prismaUser.passwordHash) {
              const isValid = await bcrypt.compare(credentials.password, prismaUser.passwordHash)
              if (isValid) {
                console.log("[Auth] >>> Prisma auth SUCCESS!")
                console.log("[Auth] DEBUG >>> Storing Prisma role in JWT: '" + prismaUser.role + "'")
                
                const result = {
                  id: prismaUser.id,
                  email: prismaUser.email,
                  name: prismaUser.profile?.fullName || prismaUser.email.split("@")[0],
                  role: prismaUser.role as string
                }
                
                debugRole("authorize() returning role", result.role, "Prisma path")
                console.log("[Auth] FINAL RESULT from authorize():", JSON.stringify(result))
                
                return result
              }
              console.log("[Auth] Invalid password")
            } else {
              console.log("[Auth] User has no password hash - cannot authenticate via Prisma fallback")
            }
          } else {
            console.log("[Auth] User not found in Prisma")
          }
        } catch (prismaError) {
          console.error("[Auth] Prisma error:", prismaError)
        }

        console.log("[Auth] >>> Authentication FAILED - returning null")
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("[Auth] ============================================")
      console.log("[Auth] JWT CALLBACK INVOKED")
      console.log("[Auth] Token before:", JSON.stringify({ id: token.id, role: token.role }))
      console.log("[Auth] User object:", user ? JSON.stringify({ id: user.id, role: (user as any).role }) : "none")
      
      if (user) {
        const incomingRole = (user as any).role
        console.log("[Auth] DEBUG >>> JWT: User role from authorize(): '" + incomingRole + "'")
        
        token.id = user.id
        token.role = incomingRole // This should be the Prisma role
        
        console.log("[Auth] DEBUG >>> JWT: Setting token.role = '" + token.role + "'")
        console.log("[Auth] JWT token after:", JSON.stringify({ id: token.id, role: token.role }))
        console.log("[Auth] ============================================")
        
        // CRITICAL: Never let Supabase role override Prisma role
        if (incomingRole === 'authenticated' || !incomingRole) {
          console.error("[Auth] CRITICAL ERROR: Role is 'authenticated' or undefined!")
          console.error("[Auth] This means Supabase metadata leaked through!")
        }
      } else {
        console.log("[Auth] No user object in JWT callback - token refresh")
        console.log("[Auth] Keeping existing token role:", token.role)
      }
      
      console.log("[Auth] DEBUG >>> Final JWT token.role = '" + token.role + "'")
      console.log("[Auth] ============================================")
      
      return token
    },
    async session({ session, token }) {
      console.log("[Auth] ============================================")
      console.log("[Auth] SESSION CALLBACK INVOKED")
      console.log("[Auth] Token role:", token.role)
      
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string // CRITICAL: Use Prisma role from JWT
        
        console.log("[Auth] DEBUG >>> SESSION: Setting session.user.role = '" + session.user.role + "'")
        console.log("[Auth] Session user after:", JSON.stringify({ id: session.user.id, role: session.user.role }))
        console.log("[Auth] ============================================")
        
        // CRITICAL: Verify we're not using Supabase 'authenticated' role
        if (session.user.role === 'authenticated') {
          console.error("[Auth] CRITICAL ERROR: Session role is 'authenticated'!")
          console.error("[Auth] This should NEVER happen - Prisma role must be used!")
        }
      }
      
      console.log("[Auth] DEBUG >>> Final session.user.role = '" + session.user?.role + "'")
      console.log("[Auth] ============================================")
      
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