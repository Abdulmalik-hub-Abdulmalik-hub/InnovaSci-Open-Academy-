import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET /api/admin/lessons/[id]/exercise - Get exercise for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params

    const exercise = await prisma.practicalExercise.findUnique({
      where: { lessonId }
    })

    return NextResponse.json({
      success: true,
      data: exercise
    })
  } catch (error) {
    console.error("Error fetching exercise:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch exercise"
    }, { status: 500 })
  }
}

// POST /api/admin/lessons/[id]/exercise - Create or update exercise
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params
    const body = await request.json()
    const {
      instructions,
      starterCode,
      solutionCode,
      hints,
      rubric,
      maxScore,
      passingScore,
      timeLimit,
      isRequired,
      allowRetry
    } = body

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return NextResponse.json({
        success: false,
        error: "Lesson not found"
      }, { status: 404 })
    }

    // Upsert exercise
    const exercise = await prisma.practicalExercise.upsert({
      where: { lessonId },
      update: {
        instructions: instructions || null,
        starterCode: starterCode || null,
        solutionCode: solutionCode || null,
        hints: hints || null,
        rubric: rubric || null,
        maxScore: maxScore || 100,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || null,
        isRequired: isRequired ?? false,
        allowRetry: allowRetry ?? true,
      },
      create: {
        lessonId,
        instructions: instructions || null,
        starterCode: starterCode || null,
        solutionCode: solutionCode || null,
        hints: hints || null,
        rubric: rubric || null,
        maxScore: maxScore || 100,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || null,
        isRequired: isRequired ?? false,
        allowRetry: allowRetry ?? true,
      }
    })

    return NextResponse.json({
      success: true,
      data: exercise,
      message: "Exercise saved successfully"
    })
  } catch (error) {
    console.error("Error saving exercise:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to save exercise"
    }, { status: 500 })
  }
}

// DELETE /api/admin/lessons/[id]/exercise - Delete exercise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params

    await prisma.practicalExercise.delete({
      where: { lessonId }
    })

    return NextResponse.json({
      success: true,
      message: "Exercise deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting exercise:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete exercise"
    }, { status: 500 })
  }
}
