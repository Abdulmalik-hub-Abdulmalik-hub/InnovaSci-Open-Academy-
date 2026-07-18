import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const actionSchema = z.object({
  action: z.enum(["publish", "close", "reopen", "archive", "duplicate", "feature", "unfeature", "enable", "disable"])
})

// POST /api/admin/scholarships/[id]/actions - Perform actions on scholarship
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "scholarships:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const { action } = actionSchema.parse(body)
    
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: params.id }
    })
    
    if (!scholarship) {
      return NextResponse.json({ error: "Scholarship not found" }, { status: 404 })
    }
    
    let updatedScholarship: any
    
    switch (action) {
      case "publish":
        if (!hasPermission(session.user.role as string, "scholarships:publish")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        updatedScholarship = await prisma.scholarship.update({
          where: { id: params.id },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date()
          }
        })
        break
        
      case "close":
        updatedScholarship = await prisma.scholarship.update({
          where: { id: params.id },
          data: {
            status: "CLOSED",
            closedAt: new Date()
          }
        })
        break
        
      case "reopen":
        updatedScholarship = await prisma.scholarship.update({
          where: { id: params.id },
          data: {
            status: "PUBLISHED",
            closedAt: null
          }
        })
        break
        
      case "archive":
        updatedScholarship = await prisma.scholarship.update({
          where: { id: params.id },
          data: { status: "ARCHIVED" }
        })
        break
        
      case "duplicate":
        if (!hasPermission(session.user.role as string, "scholarships:create")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        // Get original with all relations
        const original = await prisma.scholarship.findUnique({
          where: { id: params.id },
          include: {
            domains: true,
            categories: true,
            difficulties: true,
            certificates: true,
            plans: true,
            customQuestions: true,
          }
        })
        
        if (!original) {
          return NextResponse.json({ error: "Original scholarship not found" }, { status: 404 })
        }
        
        // Generate unique slug
        const baseSlug = `${original.slug}-copy`
        let newSlug = baseSlug
        let counter = 1
        while (await prisma.scholarship.findUnique({ where: { slug: newSlug } })) {
          newSlug = `${baseSlug}-${counter}`
          counter++
        }
        
        // Create duplicate
        updatedScholarship = await prisma.scholarship.create({
          data: {
            name: `${original.name} (Copy)`,
            shortName: original.shortName ? `${original.shortName} (Copy)` : null,
            slug: newSlug,
            type: original.type,
            description: original.description,
            objectives: original.objectives,
            eligibility: original.eligibility,
            benefits: original.benefits,
            coverage: original.coverage,
            awardAmount: original.awardAmount,
            currency: original.currency,
            availableSlots: original.availableSlots,
            openingDate: original.openingDate,
            closingDate: original.closingDate,
            applicationDeadline: original.applicationDeadline,
            selectionMethod: original.selectionMethod,
            status: "DRAFT",
            visibility: original.visibility,
            isFeatured: false,
            bannerUrl: original.bannerUrl,
            thumbnailUrl: original.thumbnailUrl,
            color: original.color,
            icon: original.icon,
            seoTitle: original.seoTitle,
            seoDescription: original.seoDescription,
            seoKeywords: original.seoKeywords,
            sponsorId: original.sponsorId,
            autoEnroll: original.autoEnroll,
            createAccount: original.createAccount,
            assignMembership: original.assignMembership,
            assignDomain: original.assignDomain,
            assignCategory: original.assignCategory,
            assignCourse: original.assignCourse,
            waiverFees: original.waiverFees,
            requireInterview: original.requireInterview,
            scoringRubricId: original.scoringRubricId,
            benefitsConfig: original.benefitsConfig ?? Prisma.JsonNull,
            domains: original.domains.length > 0 ? {
              create: original.domains.map(d => ({ domainId: d.domainId }))
            } : undefined,
            categories: original.categories.length > 0 ? {
              create: original.categories.map(c => ({ categoryId: c.categoryId }))
            } : undefined,
            difficulties: original.difficulties.length > 0 ? {
              create: original.difficulties.map(d => ({ difficultyLevel: d.difficultyLevel }))
            } : undefined,
            certificates: original.certificates.length > 0 ? {
              create: original.certificates.map(c => ({ certificateId: c.certificateId }))
            } : undefined,
            plans: original.plans.length > 0 ? {
              create: original.plans.map(p => ({ planId: p.planId }))
            } : undefined,
            customQuestions: original.customQuestions.length > 0 ? {
              create: original.customQuestions.map((q, idx) => ({
                question: q.question,
                questionType: q.questionType,
                options: q.options ?? Prisma.JsonNull,
                isRequired: q.isRequired,
                order: q.order,
                validation: q.validation ?? Prisma.JsonNull,
                helpText: q.helpText,
                placeholder: q.placeholder,
              }))
            } : undefined,
          }
        })
        break
        
      case "feature":
        updatedScholarship = await prisma.scholarship.update({
          where: { id: params.id },
          data: { isFeatured: true }
        })
        break
        
      case "unfeature":
        updatedScholarship = await prisma.scholarship.update({
          where: { id: params.id },
          data: { isFeatured: false }
        })
        break
        
      case "enable":
        updatedScholarship = await prisma.scholarship.update({
          where: { id: params.id },
          data: { status: "DRAFT" }
        })
        break
        
      case "disable":
        updatedScholarship = await prisma.scholarship.update({
          where: { id: params.id },
          data: { status: "DISABLED" }
        })
        break
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      scholarship: updatedScholarship,
      action
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error performing scholarship action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
