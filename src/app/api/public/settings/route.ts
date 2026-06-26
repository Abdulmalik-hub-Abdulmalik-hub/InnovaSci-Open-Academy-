import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/settings - Get public settings (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    // Get single public setting
    if (key) {
      const setting = await prisma.systemSetting.findFirst({
        where: { key, isPublic: true }
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
        }
      })
    }

    // Get all public settings
    const settings = await prisma.systemSetting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        type: true,
      }
    })

    // Convert to key-value object
    const publicSettings = settings.reduce((acc, setting) => {
      let value: string | boolean | number = setting.value
      
      if (setting.type === "boolean") {
        value = setting.value === "true"
      } else if (setting.type === "number") {
        value = Number(setting.value)
      }
      
      acc[setting.key] = value
      return acc
    }, {} as Record<string, string | boolean | number>)

    return NextResponse.json({
      success: true,
      data: publicSettings,
    })
  } catch (error) {
    console.error("Get public settings error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}