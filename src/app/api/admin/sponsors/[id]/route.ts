import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

// GET /api/admin/sponsors/[id] - Get single sponsor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "sponsors:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: params.id },
      include: {
        scholarships: {
          select: {
            id: true,
            name: true,
            status: true,
            type: true,
            applicationCount: true,
          }
        },
        sponsoredStudents: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            scholarship: {
              select: { name: true }
            }
          }
        },
        reports: {
          take: 10,
          orderBy: { sentAt: "desc" }
        }
      }
    })
    
    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 })
    }
    
    return NextResponse.json(sponsor)
  } catch (error) {
    console.error("Error fetching sponsor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/sponsors/[id] - Update sponsor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "sponsors:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    
    const sponsor = await prisma.sponsor.update({
      where: { id: params.id },
      data: body
    })
    
    return NextResponse.json(sponsor)
  } catch (error) {
    console.error("Error updating sponsor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/sponsors/[id] - Delete sponsor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "sponsors:delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Check if sponsor has scholarships
    const scholarshipCount = await prisma.scholarship.count({
      where: { sponsorId: params.id }
    })
    
    if (scholarshipCount > 0) {
      return NextResponse.json({ 
        error: "Cannot delete sponsor with active scholarships. Remove scholarships first." 
      }, { status: 400 })
    }
    
    await prisma.sponsor.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sponsor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
