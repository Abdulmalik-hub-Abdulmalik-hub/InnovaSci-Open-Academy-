import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Force dynamic rendering - API routes that use request properties must be dynamic
export const dynamic = 'force-dynamic';

// GET /api/student/dashboard - Get student dashboard data
export async function GET(request: NextRequest) {
  const endpoint = "/api/student/dashboard"
  const method = "GET"
  
  console.log("===========================================")
  console.log(`[${endpoint}] ${method} request received`)
  console.log(`[${endpoint}] Request URL:`, request.url)
  
  try {
    // Check database connection first
    if (!process.env.DATABASE_URL) {
      console.error(`[${endpoint}] FATAL: DATABASE_URL not configured`)
      return NextResponse.json(
        { 
          success: false, 
          error: "Database configuration missing",
          code: "DATABASE_NOT_READY"
        },
        { status: 503 }
      )
    }

    // Get userId from session
    const session = await getServerSession(authOptions)
    console.log(`[${endpoint}] Session:`, session ? `User: ${session.user?.email}, ID: ${session.user?.id}` : "No session")
    
    if (!session?.user?.id) {
      console.log(`[${endpoint}] ERROR: No valid session found`)
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication required",
          technicalError: "Please log in to access your dashboard"
        },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const userEmail = session.user.email
    console.log(`[${endpoint}] userId:`, userId)

    console.log(`[${endpoint}] Executing: prisma.enrollment.findMany...`)
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
    console.log(`[${endpoint}] Enrollments found:`, enrollments.length)

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
    let awards: any[] = []
    let applications: any[] = []

    try {
      console.log(`[${endpoint}] Executing: prisma.issuedCertificate.findMany...`)
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
      console.log(`[${endpoint}] Certificates found:`, issuedCerts.length)

      certificates = issuedCerts.map(cert => ({
        id: cert.id,
        verificationCode: cert.certificateCode,
        certificateUrl: cert.pdfUrl,
        issuedAt: cert.issuedAt,
        course: cert.course
      }))
    } catch (e: any) {
      console.error(`[${endpoint}] ERROR fetching certificates:`, e?.message, e?.code)
    }

    try {
      console.log(`[${endpoint}] Executing: prisma.course.findMany (recommended)...`)
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
      console.log(`[${endpoint}] Recommended courses found:`, recCourses.length)

      recommendedCourses = recCourses.map(c => ({
        id: c.id,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        shortDescription: c.shortDescription,
        category: c.category,
        durationHours: c.durationHours,
        studentCount: c._count.enrollments
      }))
    } catch (e: any) {
      console.error(`[${endpoint}] ERROR fetching recommended courses:`, e?.message, e?.code)
    }

    try {
      console.log(`[${endpoint}] Executing: prisma.learningProgress.findMany...`)
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
      console.log(`[${endpoint}] Learning progress records found:`, recentProgress.length)

      recentActivity = recentProgress.map(p => ({
        type: "lesson_completed",
        course: p.course.title,
        lesson: p.lesson.title,
        timestamp: p.updatedAt.toISOString()
      }))
    } catch (e: any) {
      console.error(`[${endpoint}] ERROR fetching learning progress:`, e?.message, e?.code)
    }

    // Fetch student's awards
    try {
      console.log(`[${endpoint}] Executing: prisma.scholarshipAward.findMany...`)
      const studentAwards = await prisma.scholarshipAward.findMany({
        where: {
          OR: [
            { userId: userId },
            { recipientEmail: userEmail }
          ]
        },
        include: {
          application: {
            include: {
              scholarship: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  type: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
      console.log(`[${endpoint}] Awards found:`, studentAwards.length)

      awards = studentAwards.map(award => ({
        id: award.id,
        awardNumber: award.awardNumber,
        status: award.status,
        amount: award.amount ? Number(award.amount) : null,
        currency: award.currency,
        benefits: award.benefits,
        startDate: award.startDate,
        endDate: award.endDate,
        acceptanceDeadline: award.acceptanceDeadline,
        scholarship: award.application?.scholarship || { id: award.scholarshipId, name: "Unknown Scholarship", slug: "", type: "" }
      }))
    } catch (e: any) {
      console.error(`[${endpoint}] ERROR fetching awards:`, e?.message, e?.code)
    }

    // Fetch student's scholarship applications
    try {
      console.log(`[${endpoint}] Executing: prisma.scholarshipApplication.findMany...`)
      const studentApplications = await prisma.scholarshipApplication.findMany({
        where: {
          OR: [
            { userId: userId },
            { email: userEmail }
          ]
        },
        include: {
          scholarship: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              thumbnailUrl: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
      console.log(`[${endpoint}] Applications found:`, studentApplications.length)

      applications = studentApplications.map(app => ({
        id: app.id,
        applicationNumber: app.applicationNumber,
        trackingNumber: app.trackingNumber,
        status: app.status,
        scholarship: app.scholarship,
        createdAt: app.createdAt,
        submittedAt: app.submittedAt
      }))
    } catch (e: any) {
      console.error(`[${endpoint}] ERROR fetching applications:`, e?.message, e?.code)
    }

    // Calculate stats
    const totalEnrolled = enrollments.length
    const completedCourses = enrollments.filter(e => e.completed).length
    const totalHoursLearned = enrollments.reduce((acc, e) => {
      return acc + ((e.course.durationHours || 0) * e.progressPercent / 100)
    }, 0)

    // Calculate scholarship stats
    const activeAwards = awards.filter(a => a.status === "ACCEPTED").length
    const pendingApplications = applications.filter(a => ["SUBMITTED", "UNDER_REVIEW", "INTERVIEW"].includes(a.status)).length

    console.log(`[${endpoint}] Returning HTTP 200 with success`)
    console.log("===========================================")

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
        awards,
        applications,
        stats: {
          totalEnrolled,
          completedCourses,
          totalHoursLearned: Math.round(totalHoursLearned),
          certificatesEarned: certificates.length,
          activeAwards,
          pendingApplications
        }
      }
    })
  } catch (error: any) {
    console.error("===========================================")
    console.error(`[${endpoint}] ERROR CAUGHT!`)
    console.error(`[${endpoint}] Request URL:`, request.url)
    console.error(`[${endpoint}] Error name:`, error?.name)
    console.error(`[${endpoint}] Error message:`, error?.message)
    console.error(`[${endpoint}] Prisma Error code:`, error?.code)
    console.error(`[${endpoint}] Full stack trace:`)
    console.error(error?.stack)
    console.error("===========================================")
    
    console.error(`[${endpoint}] Returning HTTP 500`)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch dashboard data",
        code: error?.code || "INTERNAL_ERROR",
        technicalError: error?.message,
        errorDetails: {
          message: error?.message,
          code: error?.code,
          stack: error?.stack
        }
      },
      { status: 500 }
    )
  }
}
