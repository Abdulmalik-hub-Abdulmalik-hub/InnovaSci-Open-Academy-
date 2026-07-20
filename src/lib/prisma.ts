import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn("[Prisma] WARNING: DATABASE_URL not set - database operations will fail")
  }
  
  const clientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error", "warn"],
  }

  if (process.env.DATABASE_URL) {
    clientOptions.datasources = {
      db: {
        url: process.env.DATABASE_URL,
      },
    }
  }

  return new PrismaClient(clientOptions)
}

// Export singleton Prisma client
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Health check function
export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  error?: string
}> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[Prisma] Database connection check failed:", message)
    return { connected: false, error: message }
  }
}
