import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/courses - List published courses for public view
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "published" },
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }).catch(() => [])

    return NextResponse.json({
      success: true,
      data: courses.map(c => ({
        ...c,
        enrollments: c._count.enrollments
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch courses",
      data: []
    })
  }
}
