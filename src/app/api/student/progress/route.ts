import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { triggerEligibilityCheck } from "@/lib/certificate-eligibility"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/student/progress - Get user's learning progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please log in." },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    const where: any = { userId }
    if (courseId) {
      where.courseId = courseId
    }

    const progress = await prisma.learningProgress.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true
          }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
            orderIndex: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    // Group progress by course
    const progressByCourse = progress.reduce((acc, p) => {
      const cid = p.courseId
      if (!acc[cid]) {
        acc[cid] = {
          course: p.course,
          completedLessons: 0,
          totalWatchTime: 0,
          lessons: []
        }
      }
      acc[cid].lessons.push(p)
      if (p.completed) acc[cid].completedLessons++
      acc[cid].totalWatchTime += p.watchTime || 0
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      data: {
        progress,
        progressByCourse: Object.values(progressByCourse)
      }
    })
  } catch (error) {
    console.error("Progress API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
      { status: 500 }
    )
  }
}

// POST /api/student/progress - Update lesson progress and trigger eligibility check
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please log in." },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const body = await request.json()
    const { lessonId, courseId, watchTime, completed, lastPosition } = body

    if (!lessonId || !courseId) {
      return NextResponse.json(
        { success: false, error: "lessonId and courseId are required" },
        { status: 400 }
      )
    }

    // Upsert learning progress
    const progress = await prisma.learningProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: {
        watchTime: watchTime !== undefined ? watchTime : undefined,
        completed: completed !== undefined ? completed : undefined,
        completedAt: completed ? new Date() : undefined
      },
      create: {
        userId,
        lessonId,
        courseId,
        watchTime: watchTime || 0,
        completed: completed || false
      }
    })

    // Also update user lecture progress for video position
    if (lastPosition !== undefined) {
      await prisma.userLectureProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId }
        },
        update: {
          lastPosition,
          lessonId
        },
        create: {
          userId,
          lessonId,
          courseId,
          lastPosition
        }
      })
    }

    // Update enrollment progress
    const totalLessons = await prisma.lesson.count({
      where: { courseId }
    })

    const completedLessons = await prisma.learningProgress.count({
      where: {
        userId,
        courseId,
        completed: true
      }
    })

    const progressPercent = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    const enrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: { userId, courseId }
      },
      data: {
        progressPercent,
        completed: progressPercent === 100,
        completedAt: progressPercent === 100 ? new Date() : null
      }
    })

    // Trigger certificate eligibility check after progress update
    // This runs asynchronously to avoid blocking the response
    if (completed) {
      triggerEligibilityCheck(userId).catch(err => {
        console.error("Background eligibility check failed:", err)
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        progress,
        enrollment: {
          progressPercent,
          completed: enrollment.completed
        }
      }
    })
  } catch (error) {
    console.error("Progress update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
