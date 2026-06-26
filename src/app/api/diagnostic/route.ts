import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: [] as Array<{ name: string; status: string; details?: string; error?: string; stack?: string }>
  }

  // Check 1: DATABASE_URL presence
  diagnostics.checks.push({
    name: "DATABASE_URL_PRESENT",
    status: !!process.env.DATABASE_URL ? "PASS" : "FAIL",
    details: !!process.env.DATABASE_URL ? "Environment variable is set" : "Environment variable is NOT set"
  })

  // Check 2: DATABASE_URL format
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      diagnostics.checks.push({
        name: "DATABASE_URL_FORMAT",
        status: "PASS",
        details: `Protocol: ${url.protocol}, Host: ${url.hostname}, Port: ${url.port || "default"}, Database: ${url.pathname}`
      })
    } catch (e) {
      diagnostics.checks.push({
        name: "DATABASE_URL_FORMAT",
        status: "FAIL",
        error: `Invalid URL format: ${e instanceof Error ? e.message : String(e)}`
      })
    }
  }

  // Check 3: Prisma Client initialization
  try {
    diagnostics.checks.push({
      name: "PRISMA_CLIENT_INIT",
      status: !!prisma ? "PASS" : "FAIL",
      details: "PrismaClient instance exists"
    })
  } catch (e) {
    diagnostics.checks.push({
      name: "PRISMA_CLIENT_INIT",
      status: "FAIL",
      error: e instanceof Error ? e.message : String(e)
    })
  }

  // Check 4: Database connectivity (simple query)
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    diagnostics.checks.push({
      name: "DATABASE_CONNECTIVITY",
      status: "PASS",
      details: `Query executed in ${latency}ms`
    })
  } catch (e) {
    diagnostics.checks.push({
      name: "DATABASE_CONNECTIVITY",
      status: "FAIL",
      error: e instanceof Error ? e.message : String(e),
      details: e instanceof Error && e.cause ? `Cause: ${JSON.stringify(e.cause)}` : undefined
    })
  }

  // Check 5: Check if users table exists
  try {
    const userCount = await prisma.user.count()
    diagnostics.checks.push({
      name: "USERS_TABLE_EXISTS",
      status: "PASS",
      details: `User count: ${userCount}`
    })
  } catch (e) {
    diagnostics.checks.push({
      name: "USERS_TABLE_EXISTS",
      status: "FAIL",
      error: e instanceof Error ? e.message : String(e)
    })
  }

  // Check 6: Check if profiles table exists
  try {
    const profileCount = await prisma.profile.count()
    diagnostics.checks.push({
      name: "PROFILES_TABLE_EXISTS",
      status: "PASS",
      details: `Profile count: ${profileCount}`
    })
  } catch (e) {
    diagnostics.checks.push({
      name: "PROFILES_TABLE_EXISTS",
      status: "FAIL",
      error: e instanceof Error ? e.message : String(e)
    })
  }

  // Check 7: Try to create a test user
  const testEmail = `test_${Date.now()}@diagnostic.local`
  try {
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: "diagnostic_test",
        role: "STUDENT",
        status: "ACTIVE"
      }
    })

    // Clean up - delete the test user
    await prisma.user.delete({ where: { id: user.id } })

    diagnostics.checks.push({
      name: "CREATE_USER_TEST",
      status: "PASS",
      details: `Successfully created and deleted test user with ID: ${user.id}`
    })
  } catch (e) {
    diagnostics.checks.push({
      name: "CREATE_USER_TEST",
      status: "FAIL",
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined
    })
  }

  // Overall status
  const failedChecks = diagnostics.checks.filter(c => c.status === "FAIL")
  const overallStatus = failedChecks.length === 0 ? "ALL_PASS" : "HAS_FAILURES"

  return NextResponse.json({
    ...diagnostics,
    overallStatus,
    failedCheckCount: failedChecks.length,
    passedCheckCount: diagnostics.checks.length - failedChecks.length
  }, { status: overallStatus === "ALL_PASS" ? 200 : 500 })
}
