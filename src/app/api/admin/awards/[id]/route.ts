import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { z } from "zod"

const updateAwardSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "REVOKED", "EXPIRED"]).optional(),
  amount: z.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  acceptanceDeadline: z.string().datetime().optional(),
  awardLetterUrl: z.string().optional(),
  certificateUrl: z.string().optional(),
})

// GET /api/admin/awards/[id] - Get single award
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "awards:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const award = await prisma.scholarshipAward.findUnique({
      where: { id: params.id },
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            scholarshipId: true,
            scholarship: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                sponsorId: true,
              }
            }
          }
        },
        enrollmentRecords: {
          include: {
            // Include related entities based on type
          }
        }
      }
    })
    
    if (!award) {
      return NextResponse.json({ error: "Award not found" }, { status: 404 })
    }
    
    return NextResponse.json(award)
  } catch (error) {
    console.error("Error fetching award:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/awards/[id] - Update award
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "awards:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = updateAwardSchema.parse(body)
    
    const currentAward = await prisma.scholarshipAward.findUnique({
      where: { id: params.id }
    })
    
    if (!currentAward) {
      return NextResponse.json({ error: "Award not found" }, { status: 404 })
    }
    
    // Handle status-specific updates
    const updateData: any = { ...validatedData }
    
    if (validatedData.status === "ACCEPTED" && currentAward.status !== "ACCEPTED") {
      updateData.acceptedAt = new Date()
      updateData.issuedAt = new Date()
      
      // Activate enrollment records
      await prisma.scholarshipEnrollment.updateMany({
        where: { awardId: params.id, status: "PENDING" },
        data: {
          status: "ACTIVE",
          activatedAt: new Date(),
        }
      })
    }
    
    if (validatedData.status === "DECLINED" && currentAward.status !== "DECLINED") {
      updateData.declinedAt = new Date()
    }
    
    const award = await prisma.scholarshipAward.update({
      where: { id: params.id },
      data: updateData
    })
    
    return NextResponse.json(award)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error updating award:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
