import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET /api/admin/courses/[id]/mini-project - Get mini project for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id

    const miniProject = await prisma.miniProject.findFirst({
      where: {
        courseId,
        isRequired: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        scenario: true,
        workflow: true,
        deliverables: true,
        evaluationRubric: true,
        starterFilesUrl: true,
        solutionFilesUrl: true,
        maxScore: true,
        passingScore: true,
        dueDaysAfterStart: true,
      }
    })

    if (!miniProject) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No mini project found for this course"
      })
    }

    return NextResponse.json({
      success: true,
      data: miniProject
    })
  } catch (error) {
    console.error("Error fetching mini project:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({
      success: false,
      error: `Failed to fetch mini project: ${errorMessage}`
    }, { status: 500 })
  }
}
