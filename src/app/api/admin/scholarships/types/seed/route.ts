import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse, ErrorCodes, handlePrismaError } from "@/lib/api-response"

// Default scholarship types
const DEFAULT_SCHOLARSHIP_TYPES = [
  {
    name: "Excellence Scholarship",
    slug: "excellence",
    description: "For students with outstanding academic achievement and exceptional performance.",
    icon: "GraduationCap",
    color: "#8B5CF6",
    orderIndex: 1,
  },
  {
    name: "Research & Innovation Scholarship",
    slug: "research-innovation",
    description: "For students involved in scientific research, AI, computational sciences, drug discovery, innovation, and technology.",
    icon: "FlaskConical",
    color: "#3B82F6",
    orderIndex: 2,
  },
  {
    name: "Opportunity Scholarship",
    slug: "opportunity",
    description: "For talented students who require financial assistance or special educational support.",
    icon: "Heart",
    color: "#EC4899",
    orderIndex: 3,
  },
  {
    name: "Global Partnership Scholarship",
    slug: "global-partnership",
    description: "For scholarships funded by governments, universities, NGOs, companies, foundations, donors, or strategic partners.",
    icon: "Globe",
    color: "#10B981",
    orderIndex: 4,
  },
  {
    name: "Leadership & Impact Scholarship",
    slug: "leadership-impact",
    description: "For students demonstrating leadership, community service, entrepreneurship, innovation, or outstanding societal impact.",
    icon: "Star",
    color: "#F59E0B",
    orderIndex: 5,
  },
  {
    name: "Custom Scholarship",
    slug: "custom",
    description: "A flexible scholarship type that allows administrators to create any additional scholarship program.",
    icon: "Sparkles",
    color: "#6366F1",
    orderIndex: 6,
  },
]

// POST /api/admin/scholarships/types/seed - Seed default scholarship types
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return errorResponse("Only Super Admin can seed scholarship types", ErrorCodes.FORBIDDEN, 403)
    }

    let created = 0
    let updated = 0
    let skipped = 0

    for (const type of DEFAULT_SCHOLARSHIP_TYPES) {
      const existing = await prisma.scholarshipType.findFirst({
        where: {
          OR: [{ slug: type.slug }, { name: type.name }],
        },
      })

      if (existing) {
        // Update if description or other fields changed
        const needsUpdate =
          existing.description !== type.description ||
          existing.icon !== type.icon ||
          existing.color !== type.color ||
          existing.orderIndex !== type.orderIndex

        if (needsUpdate) {
          await prisma.scholarshipType.update({
            where: { id: existing.id },
            data: {
              description: type.description,
              icon: type.icon,
              color: type.color,
              orderIndex: type.orderIndex,
              isActive: true, // Restore if archived
            },
          })
          updated++
        } else {
          skipped++
        }
      } else {
        await prisma.scholarshipType.create({
          data: {
            ...type,
            isActive: true,
          },
        })
        created++
      }
    }

    // Get all types after seeding
    const allTypes = await prisma.scholarshipType.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { scholarships: true },
        },
      },
    })

    return successResponse({
      message: "Scholarship types seeded successfully",
      summary: {
        created,
        updated,
        skipped,
        total: allTypes.length,
      },
      types: allTypes.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        scholarshipCount: t._count.scholarships,
        isActive: t.isActive,
      })),
    })
  } catch (error) {
    console.error("Error seeding scholarship types:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}

// GET /api/admin/scholarships/types/seed - Check seeding status
export async function GET() {
  try {
    const allTypes = await prisma.scholarshipType.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { scholarships: true },
        },
      },
    })

    const missingTypes = DEFAULT_SCHOLARSHIP_TYPES.filter(
      (defaultType) => !allTypes.some((t) => t.slug === defaultType.slug)
    )

    return successResponse({
      hasAllTypes: missingTypes.length === 0,
      totalTypes: allTypes.length,
      missingTypes: missingTypes.map((t) => t.name),
      types: allTypes.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        scholarshipCount: t._count.scholarships,
        isActive: t.isActive,
      })),
    })
  } catch (error) {
    console.error("Error checking scholarship types:", error)
    const { status, code, message } = handlePrismaError(error)
    return errorResponse(message, code, status)
  }
}
