import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/student/certificates - Get current user's certificate progress
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
    const type = searchParams.get("type") // "category", "domain", or "all"

    // Get all category certificates with progress
    const categoryCertsQuery = type !== "domain"
      ? prisma.categoryCertificate.findMany({
          where: { isActive: true },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                domain: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    icon: true,
                    color: true,
                  },
                },
              },
            },
          },
          orderBy: { orderIndex: "asc" },
        })
      : Promise.resolve([])

    // Get all domain certificates with progress
    const domainCertsQuery = type !== "category"
      ? prisma.domainCertificate.findMany({
          where: { isActive: true },
          include: {
            domain: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
              },
            },
          },
          orderBy: { orderIndex: "asc" },
        })
      : Promise.resolve([])

    // Get user's progress records
    const [categoryCerts, domainCerts, categoryProgress, domainProgress, issuedCategoryCerts, issuedDomainCerts] =
      await Promise.all([
        categoryCertsQuery,
        domainCertsQuery,
        prisma.certificateProgress.findMany({
          where: { userId, categoryCertificateId: { not: null } },
        }),
        prisma.certificateProgress.findMany({
          where: { userId, domainCertificateId: { not: null } },
        }),
        prisma.categoryIssuedCert.findMany({
          where: { userId, status: "ACTIVE" },
          orderBy: { issuedAt: "desc" },
        }),
        prisma.domainIssuedCert.findMany({
          where: { userId, status: "ACTIVE" },
          orderBy: { issuedAt: "desc" },
        }),
      ])

    const issuedCatCertIds = new Set(issuedCategoryCerts.map(ic => ic.categoryCertificateId))
    const issuedDomCertIds = new Set(issuedDomainCerts.map(ic => ic.domainCertificateId))

    // Format category certificates with progress
    const categoryCertificates = categoryCerts.map(cert => {
      const progress = categoryProgress.find(
        p => p.categoryCertificateId === cert.id
      )
      const issued = issuedCategoryCerts.find(
        ic => ic.categoryCertificateId === cert.id
      )

      return {
        id: cert.id,
        name: cert.certificateName,
        description: cert.description,
        category: cert.category,
        progress: {
          overall: progress?.overallProgress || 0,
          coursesCompleted: progress?.coursesCompleted || 0,
          totalCourses: progress?.totalCourses || 0,
          lessonsCompleted: progress?.lessonsCompleted || 0,
          totalLessons: progress?.totalLessons || 0,
          exercisesCompleted: progress?.exercisesCompleted || 0,
          miniProjectsCompleted: progress?.miniProjectsCompleted || 0,
          totalMiniProjects: progress?.totalMiniProjects || 0,
          capstonesCompleted: progress?.capstonesCompleted || 0,
          totalCapstones: progress?.totalCapstones || 0,
        },
        isEligible: (progress?.overallProgress || 0) >= 100,
        isIssued: issuedCatCertIds.has(cert.id),
        issuedCertificate: issued
          ? {
              id: issued.id,
              certificateCode: issued.certificateCode,
              verificationUrl: issued.verificationUrl,
              issuedAt: issued.issuedAt.toISOString(),
            }
          : null,
      }
    })

    // Format domain certificates with progress
    const domainCertificates = domainCerts.map(cert => {
      const progress = domainProgress.find(
        p => p.domainCertificateId === cert.id
      )
      const issued = issuedDomainCerts.find(
        ic => ic.domainCertificateId === cert.id
      )

      return {
        id: cert.id,
        name: cert.certificateName,
        description: cert.description,
        domain: cert.domain,
        progress: {
          overall: progress?.overallProgress || 0,
          coursesCompleted: progress?.coursesCompleted || 0,
          totalCourses: progress?.totalCourses || 0,
          earnedCategoryCertificates: progress?.earnedCategoryCertIds?.length || 0,
        },
        isEligible: (progress?.overallProgress || 0) >= 100,
        isIssued: issuedDomCertIds.has(cert.id),
        issuedCertificate: issued
          ? {
              id: issued.id,
              certificateCode: issued.certificateCode,
              verificationUrl: issued.verificationUrl,
              issuedAt: issued.issuedAt.toISOString(),
            }
          : null,
      }
    })

    // Calculate totals
    const totalCertificates =
      categoryCertificates.length + domainCertificates.length
    const earnedCertificates =
      categoryCertificates.filter(c => c.isIssued).length +
      domainCertificates.filter(d => d.isIssued).length
    const eligibleCertificates =
      categoryCertificates.filter(c => c.isEligible && !c.isIssued).length +
      domainCertificates.filter(d => d.isEligible && !d.isIssued).length

    return NextResponse.json({
      success: true,
      data: {
        categoryCertificates,
        domainCertificates,
        stats: {
          totalCertificates,
          earnedCertificates,
          eligibleCertificates,
          inProgress: totalCertificates - earnedCertificates - eligibleCertificates,
        },
      },
    })
  } catch (error) {
    console.error("Get student certificates error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch certificate progress",
      },
      { status: 500 }
    )
  }
}
