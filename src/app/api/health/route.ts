import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/health - Health check endpoint for monitoring
export async function GET() {
  const dbConfigured = !!process.env.DATABASE_URL
  let dbConnected = false
  let dbError: string | null = null

  if (dbConfigured) {
    const result = await checkDatabaseConnection()
    dbConnected = result.connected
    dbError = result.error || null
  } else {
    dbError = "DATABASE_URL environment variable is not set"
  }

  const isHealthy = dbConfigured && dbConnected

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      database: {
        configured: dbConfigured,
        connected: dbConnected,
        error: dbError,
      },
    },
    { status: isHealthy ? 200 : 503 }
  )
}
