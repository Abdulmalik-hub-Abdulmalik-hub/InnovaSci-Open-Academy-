import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { z } from "zod"

const createSponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["COMPANY", "NGO", "FOUNDATION", "GOVERNMENT", "INDIVIDUAL", "ISLAMIC_ORG"]),
  logo: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
  budget: z.number().optional(),
  currency: z.string().default("USD"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

const updateSponsorSchema = createSponsorSchema.partial()

// GET /api/admin/sponsors - List all sponsors
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "sponsors:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortName: { contains: search, mode: "insensitive" } },
      ]
    }
    
    const [sponsors, total] = await Promise.all([
      prisma.sponsor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { scholarships: true, sponsoredStudents: true }
          }
        }
      }),
      prisma.sponsor.count({ where })
    ])
    
    return NextResponse.json({
      sponsors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/sponsors - Create a new sponsor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "sponsors:create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = createSponsorSchema.parse(body)
    
    // Check if slug already exists
    const existingSlug = await prisma.sponsor.findUnique({
      where: { slug: validatedData.slug }
    })
    
    if (existingSlug) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }
    
    const sponsor = await prisma.sponsor.create({
      data: validatedData
    })
    
    return NextResponse.json(sponsor, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating sponsor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
