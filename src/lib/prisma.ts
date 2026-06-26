import { PrismaClient, Prisma } from "@prisma/client"

// Log database connection info on initialization
console.log("[Prisma] Initializing Prisma Client...")
console.log("[Prisma] DATABASE_URL present:", !!process.env.DATABASE_URL)
if (process.env.DATABASE_URL) {
  // Mask password in logs
  const maskedUrl = process.env.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')
  console.log("[Prisma] DATABASE_URL format:", maskedUrl)
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

console.log("[Prisma] Prisma Client initialized")
