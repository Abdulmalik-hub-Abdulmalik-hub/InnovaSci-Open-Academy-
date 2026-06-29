import { PrismaClient, Prisma } from "@prisma/client"

// =============================================================================
// Prisma Client Initialization
// =============================================================================
// This module initializes the Prisma client as a singleton to prevent
// multiple connections during development and serverless function invocations.
// =============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with error handling
function createPrismaClient(): PrismaClient {
  // Validate DATABASE_URL before creating client
  if (!process.env.DATABASE_URL) {
    console.error("[Prisma] FATAL: DATABASE_URL environment variable is not set!")
    console.error("[Prisma] Please configure DATABASE_URL in your environment")
    console.error("[Prisma] Example: postgresql://user:password@host:5432/database")
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error", "warn"],
    // Add connection timeout for serverless environments
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Export singleton Prisma client
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Store in global for development hot reloading
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Health check function for testing database connectivity
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
