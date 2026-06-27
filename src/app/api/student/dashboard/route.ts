import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/student/dashboard - Get student dashboard data
export async function GET(request: NextRequest) {
  try {
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

    // Map certificates to the expected format
    const certificates = issuedCerts.map(cert => ({
      id: cert.id,
      verificationCode: cert.certificateCode,
      certificateUrl: cert.pdfUrl,
      issuedAt: cert.issuedAt,
      course: cert.course
    }))

    // Calculate stats
    const totalEnrolled = enrollments.length
    const completedCourses = enrollments.filter(e => e.completed).length
    const totalHoursLearned = enrollments.reduce((acc, e) => {
      return acc + ((e.course.durationHours || 0) * e.progressPercent / 100)
    }, 0)

    // Fetch recommended courses (courses not enrolled in)
    const enrolledCourseIds = enrollments.map(e => e.courseId)
    const recommendedCourses = await prisma.course.findMany({
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

    const recentActivity = recentProgress.map(p => ({
      type: "lesson_completed",
      course: p.course.title,
      lesson: p.lesson.title,
      timestamp: p.updatedAt.toISOString()
    }))

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
        recommendedCourses: recommendedCourses.map(c => ({
          id: c.id,
          title: c.title,
          thumbnailUrl: c.thumbnailUrl,
          shortDescription: c.shortDescription,
          category: c.category,
          durationHours: c.durationHours,
          studentCount: c._count.enrollments
        })),
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
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
