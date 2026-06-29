import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';

// GET /api/student/dashboard - Get student dashboard data
export async function GET(request: NextRequest) {
  const endpoint = "/api/student/dashboard"
  const method = "GET"
  
  try {
    // Check database connection first
    if (!process.env.DATABASE_URL) {
      console.error(`[${endpoint}] DATABASE_URL not configured`)
      return NextResponse.json(
        { 
          success: false, 
          error: "Database configuration missing",
          code: "DATABASE_NOT_READY"
        },
        { status: 503 }
      )
    }

    // For demo purposes, we'll use a mock user ID
    // In production, this would come from the authenticated session
    const userId = request.headers.get("x-user-id") || "demo-user-id"

    // Fetch enrolled courses with progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            category: true,
            durationHours: true,
            modules: {
              include: {
                lessons: {
                  select: { id: true }
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: "desc" }
    })

    // Calculate total lessons for each course
    const coursesWithProgress = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.modules.reduce(
        (acc, mod) => acc + mod.lessons.length,
        0
      )
      return {
        ...enrollment,
        course: {
          ...enrollment.course,
          totalLessons
        }
      }
    })

    // Find the current course (most recently accessed, not completed)
    const currentEnrollment = coursesWithProgress.find(e => !e.completed)
    
    // Fetch recent certificates
    let certificates: any[] = []
    let recommendedCourses: any[] = []
    let recentActivity: any[] = []

    try {
      const issuedCerts = await prisma.issuedCertificate.findMany({
        where: { studentId: userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true
            }
          }
        },
        orderBy: { issuedAt: "desc" },
        take: 5
      })

      certificates = issuedCerts.map(cert => ({
        id: cert.id,
        verificationCode: cert.certificateCode,
        certificateUrl: cert.pdfUrl,
        issuedAt: cert.issuedAt,
        course: cert.course
      }))
    } catch (e) {
      console.error(`[${endpoint}] Failed to fetch certificates:`, e)
    }

    try {
      // Fetch recommended courses (courses not enrolled in)
      const enrolledCourseIds = enrollments.map(e => e.courseId)
      const recCourses = await prisma.course.findMany({
        where: {
          status: "published",
          id: { notIn: enrolledCourseIds }
        },
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          shortDescription: true,
          category: true,
          durationHours: true,
          _count: {
            select: { enrollments: true }
          }
        },
        orderBy: { enrollments: { _count: "desc" } },
        take: 4
      })

      recommendedCourses = recCourses.map(c => ({
        id: c.id,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        shortDescription: c.shortDescription,
        category: c.category,
        durationHours: c.durationHours,
        studentCount: c._count.enrollments
      }))
    } catch (e) {
      console.error(`[${endpoint}] Failed to fetch recommended courses:`, e)
    }

    try {
      // Fetch recent activity
      const recentProgress = await prisma.learningProgress.findMany({
        where: { userId },
        include: {
          course: { select: { title: true } },
          lesson: { select: { title: true } }
        },
        orderBy: { updatedAt: "desc" },
        take: 10
      })

      recentActivity = recentProgress.map(p => ({
        type: "lesson_completed",
        course: p.course.title,
        lesson: p.lesson.title,
        timestamp: p.updatedAt.toISOString()
      }))
    } catch (e) {
      console.error(`[${endpoint}] Failed to fetch recent activity:`, e)
    }

    // Calculate stats
    const totalEnrolled = enrollments.length
    const completedCourses = enrollments.filter(e => e.completed).length
    const totalHoursLearned = enrollments.reduce((acc, e) => {
      return acc + ((e.course.durationHours || 0) * e.progressPercent / 100)
    }, 0)

    return NextResponse.json({
      success: true,
      data: {
        currentEnrollment: currentEnrollment ? {
          id: currentEnrollment.id,
          courseId: currentEnrollment.courseId,
          course: currentEnrollment.course,
          progressPercent: currentEnrollment.progressPercent,
          enrolledAt: currentEnrollment.enrolledAt
        } : null,
        enrollments: coursesWithProgress.map(e => ({
          id: e.id,
          courseId: e.courseId,
          course: e.course,
          progressPercent: e.progressPercent,
          completed: e.completed,
          enrolledAt: e.enrolledAt
        })),
        certificates,
        recommendedCourses,
        recentActivity,
        stats: {
          totalEnrolled,
          completedCourses,
          totalHoursLearned: Math.round(totalHoursLearned),
          certificatesEarned: certificates.length
        }
      }
    })
  } catch (error) {
    console.error(`[${endpoint}] [${method}] Unexpected error:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch dashboard data",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}
