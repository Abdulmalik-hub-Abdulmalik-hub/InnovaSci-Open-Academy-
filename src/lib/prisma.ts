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

// Create Prisma client with connection options
function createPrismaClient(): PrismaClient {
  const clientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error", "warn"],
  }

  // Only set datasource URL if DATABASE_URL is configured
  // This allows the app to start even without a database (for build/static analysis)
  if (process.env.DATABASE_URL) {
    clientOptions.datasources = {
      db: {
        url: process.env.DATABASE_URL,
      },
    }
  } else {
    console.warn("[Prisma] WARNING: DATABASE_URL environment variable is not set!")
    console.warn("[Prisma] Database operations will fail until configured.")
    console.warn("[Prisma] Copy .env.example to .env and configure your database URL.")
  }

  return new PrismaClient(clientOptions)
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
