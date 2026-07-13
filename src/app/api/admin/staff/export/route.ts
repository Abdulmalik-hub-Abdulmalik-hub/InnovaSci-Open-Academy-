import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authorize } from "@/lib/authorize"
import { PERMISSIONS } from "@/lib/permissions"

// GET /api/admin/staff/export - Export staff data
export async function GET(request: NextRequest) {
  const auth = await authorize(PERMISSIONS.USERS_VIEW)(request)
  if ("status" in auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    
    const format = searchParams.get("format") || "json" // json, csv, excel
    const staffIds = searchParams.get("ids")?.split(",") // specific IDs to export
    const includeInactive = searchParams.get("includeInactive") === "true"
    
    // Build where clause
    const where: any = {
      user: {
        role: { not: "STUDENT" }
      }
    }
    
    if (!includeInactive) {
      where.user = {
        ...where.user,
        status: "ACTIVE"
      }
    }
    
    if (staffIds?.length) {
      where.id = { in: staffIds }
    }

    // Get staff data
    const staff = await prisma.staffProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            profile: {
              select: {
                fullName: true,
                phone: true,
                country: true,
                city: true,
                gender: true,
              }
            }
          }
        },
        assignments: {
          where: { status: "ACTIVE" },
          include: {
            portal: { select: { displayName: true } },
            domain: { select: { name: true } },
            category: { select: { name: true } },
            course: { select: { title: true } },
          }
        },
        sessions: {
          where: { isActive: true },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Transform data for export
    const exportData = staff.map(s => ({
      staffId: s.staffId || s.id,
      fullName: s.user.profile?.fullName || "",
      email: s.user.email,
      phone: s.user.profile?.phone || s.phone || "",
      role: s.user.role,
      department: s.department || "",
      title: s.title || "",
      status: s.user.status,
      portals: s.assignments.map(a => a.portal.displayName).join(", "),
      domains: s.assignments.filter(a => a.domain).map(a => a.domain!.name).join(", "),
      categories: s.assignments.filter(a => a.category).map(a => a.category!.name).join(", "),
      courses: s.assignments.filter(a => a.course).map(a => a.course!.title).join(", "),
      country: s.user.profile?.country || s.country || "",
      city: s.user.profile?.city || s.city || "",
      gender: s.user.profile?.gender || s.gender || "",
      hasActiveSession: s.sessions.length > 0 ? "Yes" : "No",
      createdAt: new Date(s.user.createdAt).toISOString(),
    }))

    // Format response based on requested format
    switch (format) {
      case "csv":
        return exportCSV(exportData)
      case "excel":
        return exportExcel(exportData)
      default:
        return NextResponse.json({
          success: true,
          data: exportData,
          count: exportData.length
        })
    }
  } catch (error) {
    console.error("Export staff error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to export staff data" },
      { status: 500 }
    )
  }
}

function exportCSV(data: any[]): NextResponse {
  if (data.length === 0) {
    return new NextResponse("No data to export", { status: 400 })
  }

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || ""
        // Escape commas and quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(",")
    )
  ]

  const csvContent = csvRows.join("\n")

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="staff-export-${Date.now()}.csv"`
    }
  })
}

function exportExcel(data: any[]): NextResponse {
  // For Excel, we return JSON that can be processed by client-side Excel library
  // In a real implementation, you might use a library like exceljs or xlsx
  return NextResponse.json({
    success: true,
    data,
    format: "excel",
    message: "Excel export requires client-side processing. JSON data provided.",
    headers: Object.keys(data[0] || {}),
  })
}
