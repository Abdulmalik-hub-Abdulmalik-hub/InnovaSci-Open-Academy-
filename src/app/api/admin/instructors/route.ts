import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET /api/admin/instructors - Get all instructors
export async function GET(request: NextRequest) {
  try {
    const instructors = await prisma.instructor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
        avatarUrl: true,
        expertise: true,
        socialLinks: true,
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: instructors
    })
  } catch (error) {
    console.error("Error fetching instructors:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch instructors"
    }, { status: 500 })
  }
}

// POST /api/admin/instructors - Create a new instructor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, title, bio, avatarUrl, expertise, socialLinks } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: "Name is required and must be at least 2 characters"
      }, { status: 400 })
    }

    const instructor = await prisma.instructor.create({
      data: {
        name: name.trim(),
        title: title?.trim() || null,
        bio: bio?.trim() || null,
        avatarUrl: avatarUrl || null,
        expertise: expertise || [],
        socialLinks: socialLinks || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: instructor.id,
        name: instructor.name,
        title: instructor.title,
      },
      message: "Instructor created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating instructor:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create instructor"
    }, { status: 500 })
  }
}
