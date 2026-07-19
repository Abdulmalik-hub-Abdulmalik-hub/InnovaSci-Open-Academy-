/**
 * Student Access Control API
 * 
 * GET /api/student/access
 * 
 * Returns the user's purchased categories, domains, and accessible courses
 * Used to determine course access permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please log in." },
        { status: 401 }
      )
    }
    
    const userId = session.user.id

    // Get all active purchases
    const [academyPurchases, domainPurchases, categoryPurchases, accessLicenses] = await Promise.all([
      prisma.academyPurchase.findMany({
        where: { userId, status: 'active' },
        orderBy: { purchasedAt: 'desc' },
      }),
      prisma.domainPurchase.findMany({
        where: { userId, status: 'active' },
        include: { domain: true },
        orderBy: { purchasedAt: 'desc' },
      }),
      prisma.categoryPurchase.findMany({
        where: { userId, status: 'active' },
        include: { category: { include: { domain: true } } },
        orderBy: { purchasedAt: 'desc' },
      }),
      prisma.accessLicense.findMany({
        where: { userId, status: 'active' },
      }),
    ])

    // Determine accessible scope
    const hasAcademyAccess = academyPurchases.length > 0
    const purchasedDomainIds = domainPurchases.map(p => p.domainId)
    const purchasedCategoryIds = categoryPurchases.map(p => p.categoryId)
    const accessibleDomainIds = hasAcademyAccess ? ['all'] : purchasedDomainIds
    const accessibleCategoryIds = hasAcademyAccess ? ['all'] : purchasedCategoryIds

    // Get all courses the user has access to
    let accessibleCourses: string[] = []

    if (hasAcademyAccess) {
      // User has full academy access
      const allCourses = await prisma.course.findMany({
        where: { status: 'published', isActive: true },
        select: { id: true, categoryId: true }
      })
      accessibleCourses = allCourses.map(c => c.id)
    } else {
      // User has access to specific domains/categories
      const domainCategories = await prisma.category.findMany({
        where: { 
          domainId: { in: purchasedDomainIds },
          isActive: true,
        },
        select: { id: true }
      })
      const allCategoryIds = [
        ...purchasedCategoryIds,
        ...domainCategories.map(c => c.id)
      ]

      const courses = await prisma.course.findMany({
        where: { 
          categoryId: { in: allCategoryIds },
          status: 'published',
          isActive: true,
        },
        select: { id: true }
      })
      accessibleCourses = courses.map(c => c.id)
    }

    // Get enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            categoryId: true,
            category: {
              select: { id: true, name: true, domainId: true }
            }
          }
        }
      }
    })

    // Build response
    return NextResponse.json({
      success: true,
      data: {
        hasAcademyAccess,
        purchasedDomains: domainPurchases.map(p => ({
          id: p.domainId,
          name: p.domain?.name || 'Unknown',
          purchasedAt: p.purchasedAt,
          expiresAt: p.expiresAt,
        })),
        purchasedCategories: categoryPurchases.map(p => ({
          id: p.categoryId,
          name: p.category?.name || 'Unknown',
          domainId: p.domainId,
          domainName: p.domainName,
          purchasedAt: p.purchasedAt,
          expiresAt: p.expiresAt,
        })),
        accessibleDomainIds,
        accessibleCategoryIds,
        accessibleCourseCount: accessibleCourses.length,
        enrolledCourses: enrollments.map(e => ({
          enrollmentId: e.id,
          courseId: e.courseId,
          title: e.course.title,
          slug: e.course.slug,
          thumbnailUrl: e.course.thumbnailUrl,
          progressPercent: e.progressPercent,
          completed: e.completed,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
        })),
        certificates: {
          eligible: await getCertificateEligibility(userId, hasAcademyAccess, purchasedDomainIds, purchasedCategoryIds)
        }
      }
    })
  } catch (error) {
    console.error('Access check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check access' },
      { status: 500 }
    )
  }
}

async function getCertificateEligibility(
  userId: string,
  hasAcademyAccess: boolean,
  purchasedDomainIds: string[],
  purchasedCategoryIds: string[]
) {
  try {
    const eligible: any[] = []

    // Check Category Certificate eligibility
    const categoryCerts = await prisma.categoryCertificate.findMany({
      where: hasAcademyAccess 
        ? {} 
        : { categoryId: { in: purchasedCategoryIds } },
      include: { category: true }
    })

    for (const cert of categoryCerts) {
      // Check if user has completed all required courses
      const requirements = cert.requirements as any || {}
      const requiredCourses = requirements.courses || []
      
      if (requiredCourses.length === 0) continue

      const completedCount = await prisma.learningProgress.count({
        where: {
          userId,
          courseId: { in: requiredCourses },
          completed: true,
        }
      })

      eligible.push({
        type: 'category',
        id: cert.id,
        name: cert.certificateName,
        categoryId: cert.categoryId,
        categoryName: cert.category?.name,
        progress: Math.round((completedCount / requiredCourses.length) * 100),
        completed: completedCount >= requiredCourses.length,
      })
    }

    // Check Domain Certificate eligibility
    const domainCerts = await prisma.domainCertificate.findMany({
      where: hasAcademyAccess 
        ? {} 
        : { domainId: { in: purchasedDomainIds } },
      include: { domain: true }
    })

    for (const cert of domainCerts) {
      const requirements = cert.requirements as any || {}
      const requiredCategories = requirements.categories || []
      
      if (requiredCategories.length === 0) continue

      const categoryCertIds = await prisma.categoryCertificate.findMany({
        where: { categoryId: { in: requiredCategories } },
        select: { id: true }
      })

      const completedCount = await prisma.categoryIssuedCert.count({
        where: {
          userId,
          categoryCertificateId: { in: categoryCertIds.map(c => c.id) }
        }
      })

      eligible.push({
        type: 'domain',
        id: cert.id,
        name: cert.certificateName,
        domainId: cert.domainId,
        domainName: cert.domain?.name,
        progress: Math.round((completedCount / requiredCategories.length) * 100),
        completed: completedCount >= requiredCategories.length,
      })
    }

    return eligible
  } catch (error) {
    console.error('Certificate eligibility error:', error)
    return []
  }
}
