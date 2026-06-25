import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/lessons/[id]/materials - Get all materials for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params

    const materials = await prisma.material.findMany({
      where: { lessonId },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json({
      success: true,
      data: materials
    })
  } catch (error) {
    console.error("Get materials error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch materials" },
      { status: 500 }
    )
  }
}

// POST /api/admin/lessons/[id]/materials - Upload/add material
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params
    const body = await request.json()
    const { title, type, fileUrl, visibility, downloadAllowed } = body

    if (!title || !fileUrl) {
      return NextResponse.json(
        { success: false, error: "Title and file URL are required" },
        { status: 400 }
      )
    }

    const material = await prisma.material.create({
      data: {
        lessonId,
        title,
        type: type || null,
        fileUrl,
        visibility: visibility || "public",
        downloadAllowed: downloadAllowed ?? true,
      }
    })

    return NextResponse.json({
      success: true,
      data: { material },
      message: "Material added successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Create material error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add material" },
      { status: 500 }
    )
  }
}
