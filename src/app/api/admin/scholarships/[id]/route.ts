import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

// GET /api/admin/scholarships/[id] - Get single scholarship
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "scholarships:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: params.id },
      include: {
        sponsor: true,
        domains: { include: { domain: true } },
        categories: { include: { category: true } },
        difficulties: true,
        certificates: { include: { certificate: true } },
        plans: { include: { plan: true } },
        reviewers: true,
        customQuestions: { orderBy: { order: "asc" } },
        applications: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: { id: true, status: true, createdAt: true }
        },
        _count: {
          select: { applications: true }
        }
      }
    })
    
    if (!scholarship) {
      return NextResponse.json({ error: "Scholarship not found" }, { status: 404 })
    }
    
    return NextResponse.json(scholarship)
  } catch (error) {
    console.error("Error fetching scholarship:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/scholarships/[id] - Update scholarship
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "scholarships:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const { 
      domainIds, 
      categoryIds, 
      difficultyLevels, 
      certificateIds, 
      planIds,
      customQuestions,
      ...scholarshipData 
    } = body
    
    // Handle relation updates
    const updateOperations: any = {
      ...scholarshipData,
      openingDate: scholarshipData.openingDate ? new Date(scholarshipData.openingDate) : undefined,
      closingDate: scholarshipData.closingDate ? new Date(scholarshipData.closingDate) : undefined,
      applicationDeadline: scholarshipData.applicationDeadline ? new Date(scholarshipData.applicationDeadline) : undefined,
    }
    
    // Update domains if provided
    if (domainIds !== undefined) {
      await prisma.scholarshipDomain.deleteMany({
        where: { scholarshipId: params.id }
      })
      if (domainIds.length > 0) {
        await prisma.scholarshipDomain.createMany({
          data: domainIds.map((id: string) => ({
            scholarshipId: params.id,
            domainId: id
          }))
        })
      }
    }
    
    // Update categories if provided
    if (categoryIds !== undefined) {
      await prisma.scholarshipCategory.deleteMany({
        where: { scholarshipId: params.id }
      })
      if (categoryIds.length > 0) {
        await prisma.scholarshipCategory.createMany({
          data: categoryIds.map((id: string) => ({
            scholarshipId: params.id,
            categoryId: id
          }))
        })
      }
    }
    
    // Update difficulty levels if provided
    if (difficultyLevels !== undefined) {
      await prisma.scholarshipDifficulty.deleteMany({
        where: { scholarshipId: params.id }
      })
      if (difficultyLevels.length > 0) {
        await prisma.scholarshipDifficulty.createMany({
          data: difficultyLevels.map((level: string) => ({
            scholarshipId: params.id,
            difficultyLevel: level
          }))
        })
      }
    }
    
    // Update certificates if provided
    if (certificateIds !== undefined) {
      await prisma.scholarshipCertificate.deleteMany({
        where: { scholarshipId: params.id }
      })
      if (certificateIds.length > 0) {
        await prisma.scholarshipCertificate.createMany({
          data: certificateIds.map((id: string) => ({
            scholarshipId: params.id,
            certificateId: id
          }))
        })
      }
    }
    
    // Update plans if provided
    if (planIds !== undefined) {
      await prisma.scholarshipPlan.deleteMany({
        where: { scholarshipId: params.id }
      })
      if (planIds.length > 0) {
        await prisma.scholarshipPlan.createMany({
          data: planIds.map((id: string) => ({
            scholarshipId: params.id,
            planId: id
          }))
        })
      }
    }
    
    // Update custom questions if provided
    if (customQuestions !== undefined) {
      await prisma.scholarshipCustomQuestion.deleteMany({
        where: { scholarshipId: params.id }
      })
      if (customQuestions.length > 0) {
        await prisma.scholarshipCustomQuestion.createMany({
          data: customQuestions.map((q: any, index: number) => ({
            scholarshipId: params.id,
            question: q.question,
            questionType: q.questionType || "TEXT",
            options: q.options || null,
            isRequired: q.isRequired ?? true,
            order: q.order ?? index,
            validation: q.validation || null,
            helpText: q.helpText || null,
            placeholder: q.placeholder || null,
          }))
        })
      }
    }
    
    const scholarship = await prisma.scholarship.update({
      where: { id: params.id },
      data: updateOperations,
      include: {
        sponsor: true,
        domains: { include: { domain: true } },
        categories: { include: { category: true } },
        difficulties: true,
        certificates: { include: { certificate: true } },
        plans: { include: { plan: true } },
        customQuestions: { orderBy: { order: "asc" } },
      }
    })
    
    return NextResponse.json(scholarship)
  } catch (error) {
    console.error("Error updating scholarship:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/scholarships/[id] - Delete scholarship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "scholarships:delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Check if scholarship has applications
    const applicationCount = await prisma.scholarshipApplication.count({
      where: { scholarshipId: params.id }
    })
    
    if (applicationCount > 0) {
      // Archive instead of delete
      await prisma.scholarship.update({
        where: { id: params.id },
        data: { status: "ARCHIVED" }
      })
      return NextResponse.json({ 
        message: "Scholarship has applications and has been archived instead of deleted",
        archived: true 
      })
    }
    
    await prisma.scholarship.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting scholarship:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
