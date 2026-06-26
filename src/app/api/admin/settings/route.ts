import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

// Super Admin authentication helper
async function checkSuperAdminAuth(request: NextRequest): Promise<{ 
  authorized: boolean; 
  userId?: string; 
  error?: string 
}> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return { authorized: true } // Demo mode
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        
        if (user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN") && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id }
        }
      }
    }
    
    return { authorized: false, error: "Super Admin access required for Settings" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// Default settings to initialize
const DEFAULT_SETTINGS = [
  // General
  { key: "site_name", value: "InnovaSci Open Academy", type: "string", category: "general", description: "Platform name", isPublic: true },
  { key: "site_tagline", value: "Learn. Grow. Succeed.", type: "string", category: "general", description: "Platform tagline", isPublic: true },
  { key: "site_description", value: "Your gateway to world-class education", type: "string", category: "general", description: "Platform description", isPublic: true },
  { key: "contact_email", value: "support@innovasci.com", type: "string", category: "general", description: "Contact email", isPublic: true },
  { key: "support_phone", value: "+1 (555) 123-4567", type: "string", category: "general", description: "Support phone number", isPublic: true },
  { key: "maintenance_mode", value: "false", type: "boolean", category: "general", description: "Enable maintenance mode" },
  
  // Appearance
  { key: "primary_color", value: "#7C3AED", type: "string", category: "appearance", description: "Primary brand color" },
  { key: "secondary_color", value: "#2563EB", type: "string", category: "appearance", description: "Secondary brand color" },
  { key: "logo_url", value: "/logo.svg", type: "string", category: "appearance", description: "Platform logo URL", isPublic: true },
  { key: "favicon_url", value: "/favicon.ico", type: "string", category: "appearance", description: "Favicon URL", isPublic: true },
  
  // Social
  { key: "facebook_url", value: "", type: "string", category: "general", description: "Facebook page URL", isPublic: true },
  { key: "twitter_url", value: "", type: "string", category: "general", description: "Twitter URL", isPublic: true },
  { key: "instagram_url", value: "", type: "string", category: "general", description: "Instagram URL", isPublic: true },
  { key: "linkedin_url", value: "", type: "string", category: "general", description: "LinkedIn URL", isPublic: true },
  { key: "youtube_url", value: "", type: "string", category: "general", description: "YouTube URL", isPublic: true },
  
  // Email
  { key: "email_provider", value: "resend", type: "string", category: "email", description: "Email provider (resend, sendgrid, smtp)" },
  { key: "resend_api_key", value: "", type: "string", category: "email", description: "Resend API Key", isEncrypted: true },
  { key: "email_from_address", value: "noreply@innovasci.com", type: "string", category: "email", description: "Default from email address" },
  { key: "email_from_name", value: "InnovaSci Academy", type: "string", category: "email", description: "Default from name" },
  
  // Payments
  { key: "payment_provider", value: "paystack", type: "string", category: "payments", description: "Payment provider (paystack, stripe)" },
  { key: "paystack_secret_key", value: "", type: "string", category: "payments", description: "Paystack Secret Key", isEncrypted: true },
  { key: "paystack_public_key", value: "", type: "string", category: "payments", description: "Paystack Public Key" },
  { key: "paystack_webhook_secret", value: "", type: "string", category: "payments", description: "Paystack Webhook Secret", isEncrypted: true },
  { key: "currency", value: "USD", type: "string", category: "payments", description: "Default currency" },
  { key: "currency_symbol", value: "$", type: "string", category: "payments", description: "Currency symbol" },
  
  // Storage
  { key: "storage_provider", value: "local", type: "string", category: "storage", description: "Storage provider (local, s3, r2)" },
  { key: "aws_access_key_id", value: "", type: "string", category: "storage", description: "AWS Access Key ID", isEncrypted: true },
  { key: "aws_secret_access_key", value: "", type: "string", category: "storage", description: "AWS Secret Access Key", isEncrypted: true },
  { key: "aws_s3_bucket", value: "", type: "string", category: "storage", description: "S3 Bucket Name" },
  { key: "aws_region", value: "us-east-1", type: "string", category: "storage", description: "AWS Region" },
  
  // Security
  { key: "jwt_secret", value: "", type: "string", category: "security", description: "JWT Secret Key", isEncrypted: true },
  { key: "session_timeout", value: "3600", type: "number", category: "security", description: "Session timeout in seconds" },
  { key: "max_login_attempts", value: "5", type: "number", category: "security", description: "Max login attempts before lockout" },
  { key: "require_email_verification", value: "true", type: "boolean", category: "security", description: "Require email verification" },
]

// Initialize default settings if not exist
async function initializeSettings() {
  for (const setting of DEFAULT_SETTINGS) {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: setting.key }
    })
    
    if (!existing) {
      await prisma.systemSetting.create({
        data: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          category: setting.category,
          description: setting.description,
          isPublic: setting.isPublic || false,
          isEncrypted: setting.isEncrypted || false,
        }
      })
    }
  }
}

// GET /api/admin/settings - Get all settings or by category
export async function GET(request: NextRequest) {
  const auth = await checkSuperAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const key = searchParams.get("key")
    const init = searchParams.get("init")

    // Initialize default settings if requested
    if (init === "true") {
      await initializeSettings()
      return NextResponse.json({
        success: true,
        message: "Settings initialized"
      })
    }

    // Get single setting by key
    if (key) {
      const setting = await prisma.systemSetting.findUnique({
        where: { key }
      })
      
      if (!setting) {
        return NextResponse.json({ success: false, error: "Setting not found" }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        data: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          category: setting.category,
          description: setting.description,
        }
      })
    }

    // Get settings by category or all
    const where = category ? { category } : {}
    
    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: { category: "asc" }
    })

    // Group by category
    const groupedSettings = settings.reduce((acc, setting) => {
      const cat = setting.category
      if (!acc[cat]) acc[cat] = []
      // Don't expose encrypted values in list view
      acc[cat].push({
        key: setting.key,
        value: setting.isEncrypted ? (setting.value ? "••••••••" : "") : setting.value,
        type: setting.type,
        description: setting.description,
        isEncrypted: setting.isEncrypted,
        isPublic: setting.isPublic,
      })
      return acc
    }, {} as Record<string, unknown[]>)

    return NextResponse.json({
      success: true,
      data: {
        settings: groupedSettings,
        categories: Object.keys(groupedSettings),
      }
    })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/settings - Update settings
export async function PATCH(request: NextRequest) {
  const auth = await checkSuperAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: "Key and value are required" },
        { status: 400 }
      )
    }

    // Find the setting
    const existing = await prisma.systemSetting.findUnique({
      where: { key }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Setting not found" },
        { status: 404 }
      )
    }

    // Validate value based on type
    let parsedValue = value
    if (existing.type === "boolean") {
      parsedValue = value === true || value === "true" ? "true" : "false"
    } else if (existing.type === "number") {
      const num = Number(value)
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: "Value must be a number" },
          { status: 400 }
        )
      }
      parsedValue = String(num)
    }

    // Update the setting
    const updated = await prisma.systemSetting.update({
      where: { key },
      data: { value: parsedValue }
    })

    // Audit log
    await createAuditLog({
      userId: auth.userId,
      action: "UPDATE",
      module: "SETTINGS",
      targetTable: "SystemSetting",
      targetId: key,
      newData: { key, value: existing.isEncrypted ? "[ENCRYPTED]" : parsedValue },
      details: { category: existing.category },
    })

    return NextResponse.json({
      success: true,
      data: {
        key: updated.key,
        value: updated.isEncrypted ? "••••••••" : updated.value,
        type: updated.type,
        category: updated.category,
      },
      message: "Setting updated successfully"
    })
  } catch (error) {
    console.error("Update setting error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update setting" },
      { status: 500 }
    )
  }
}

// POST /api/admin/settings - Bulk update settings
export async function POST(request: NextRequest) {
  const auth = await checkSuperAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: "Settings array is required" },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const item of settings) {
      const { key, value } = item
      
      try {
        const existing = await prisma.systemSetting.findUnique({
          where: { key }
        })

        if (!existing) {
          errors.push({ key, error: "Setting not found" })
          continue
        }

        let parsedValue = value
        if (existing.type === "boolean") {
          parsedValue = value === true || value === "true" ? "true" : "false"
        } else if (existing.type === "number") {
          parsedValue = String(Number(value))
        }

        await prisma.systemSetting.update({
          where: { key },
          data: { value: parsedValue }
        })

        results.push({
          key,
          value: existing.isEncrypted ? "••••••••" : parsedValue,
        })
      } catch (err) {
        errors.push({ key, error: "Failed to update" })
      }
    }

    // Audit log
    await createAuditLog({
      userId: auth.userId,
      action: "BULK_UPDATE",
      module: "SETTINGS",
      targetTable: "SystemSetting",
      affectedRows: results.length,
      details: { updated: results.map(r => r.key) },
    })

    return NextResponse.json({
      success: true,
      data: { results, errors },
      message: `Updated ${results.length} settings${errors.length > 0 ? `, ${errors.length} failed` : ""}`
    })
  } catch (error) {
    console.error("Bulk update settings error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    )
  }
}