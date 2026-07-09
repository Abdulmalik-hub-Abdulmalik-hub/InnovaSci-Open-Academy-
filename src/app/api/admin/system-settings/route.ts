import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/system-settings - Get system settings (maintenance mode)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get maintenance mode and message from SystemSetting model
    const maintenanceModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_mode" },
    })
    
    const maintenanceMessageSetting = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_message" },
    })
    
    return NextResponse.json({ 
      success: true, 
      data: {
        maintenanceMode: maintenanceModeSetting?.value === "true",
        message: maintenanceMessageSetting?.value || "We are performing scheduled maintenance. Please check back soon.",
      }
    })
  } catch (error) {
    console.error("Error fetching system settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch system settings" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/system-settings - Update system settings (maintenance mode)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { maintenanceMode, message } = body
    
    // Update maintenance mode
    if (maintenanceMode !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "maintenance_mode" },
        update: { value: maintenanceMode ? "true" : "false" },
        create: {
          key: "maintenance_mode",
          value: maintenanceMode ? "true" : "false",
          type: "boolean",
          category: "general",
          description: "Enable maintenance mode to block student access",
          isPublic: true,
        },
      })
    }
    
    // Update maintenance message
    if (message !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "maintenance_message" },
        update: { value: message },
        create: {
          key: "maintenance_message",
          value: message,
          type: "string",
          category: "general",
          description: "Message to display during maintenance mode",
          isPublic: true,
        },
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "System settings updated successfully" 
    })
  } catch (error) {
    console.error("Error updating system settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update system settings" },
      { status: 500 }
    )
  }
}
