/**
 * Admin Projects Management API
 * GET - List all projects with filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Check admin auth
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return { authorized: true } // Demo mode

  try {
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      if (token.startsWith('admin_') || token.startsWith('user_')) {
        const userId = token.substring(token.indexOf('_') + 1)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && user.status === 'ACTIVE') {
          return { authorized: true, userId: user.id }
        }
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
  }
  return { authorized: true } // Demo mode
}

// GET /api/admin/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Filters
    const status = searchParams.get('status')
    const projectType = searchParams.get('projectType')
    const domainId = searchParams.get('domainId')
    const categoryId = searchParams.get('categoryId')
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')
    const reviewerId = searchParams.get('reviewerId')
    const search = searchParams.get('search')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isDeleted: false,
    }

    // Support both uppercase and lowercase status values
    if (status) {
      // Normalize status to uppercase for database query
      const normalizedStatus = status.toUpperCase()
      where.status = normalizedStatus
    }
    
    if (projectType) where.projectType = projectType
    if (courseId) where.courseId = courseId
    if (userId) where.userId = userId

    // Domain/Category filter via course relation
    if (domainId || categoryId) {
      where.course = {}
      if (categoryId) {
        where.course.categoryId = categoryId
      }
      if (domainId) {
        where.course.category = { domainId }
      }
    }

    // Min/Max score filter
    if (minScore || maxScore) {
      where.grade = {}
      if (minScore) where.grade.gte = parseInt(minScore)
      if (maxScore) where.grade.lte = parseInt(maxScore)
    }

    // Search in title or student name
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { profile: { fullName: { contains: search, mode: 'insensitive' } } } },
      ]
    }

    // Reviewer filter
    if (reviewerId) {
      where.reviews = {
        some: { reviewerId }
      }
    }

    // Get total count
    const total = await prisma.projectSubmission.count({ where })

    // Fetch submissions
    const submissions = await prisma.projectSubmission.findMany({
      where,
      include: {
        user: {
          select: { 
            id: true, 
            email: true, 
            profile: { select: { fullName: true, avatarUrl: true } } 
          }
        },
        course: {
          select: { 
            id: true, 
            title: true, 
            slug: true,
            category: {
              select: { 
                id: true, 
                name: true,
                domain: { select: { id: true, name: true } }
              }
            }
          }
        },
        miniProject: {
          select: { id: true, title: true }
        },
        reviews: {
          where: { isLatest: true },
          include: {
            reviewer: {
              select: { id: true, email: true, profile: { select: { fullName: true } } }
            }
          }
        },
        assignments: {
          include: {
            reviewer: {
              select: { id: true, email: true, profile: { select: { fullName: true } } }
            }
          }
        },
        versions: {
          where: { isLatest: true },
          select: { versionNumber: true, submittedAt: true }
        },
        _count: {
          select: { versions: true, reviews: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    })

    // Calculate statistics
    const stats = await prisma.projectSubmission.groupBy({
      by: ['status'],
      where: { isDeleted: false },
      _count: true
    })

    const statsMap = stats.reduce((acc, item) => {
      // Store both uppercase and lowercase versions for compatibility
      acc[item.status] = item._count
      acc[item.status.toLowerCase()] = item._count
      return acc
    }, {} as Record<string, number>)

    const projectTypeStats = await prisma.projectSubmission.groupBy({
      by: ['projectType'],
      where: { isDeleted: false },
      _count: true
    })

    const projectTypeMap = projectTypeStats.reduce((acc, item) => {
      acc[item.projectType] = item._count
      return acc
    }, {} as Record<string, number>)

    // Format submissions - normalize status to uppercase for consistency
    const formatted = submissions.map(sub => ({
      id: sub.id,
      title: sub.title,
      description: sub.description,
      status: sub.status.toUpperCase(), // Normalize to uppercase
      isLocked: sub.isLocked,
      projectType: sub.projectType,
      grade: sub.grade,
      gradeType: sub.gradeType,
      rubricScore: sub.rubricScore ? Number(sub.rubricScore) : null,
      maxScore: sub.maxScore ? Number(sub.maxScore) : 100,
      submittedAt: sub.submittedAt,
      gradedAt: sub.gradedAt,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      user: sub.user,
      course: sub.course,
      miniProject: sub.miniProject,
      capstoneId: sub.capstoneId,
      capstoneType: sub.capstoneType,
      submissionUrl: sub.submissionUrl,
      latestVersion: sub.versions[0] || null,
      latestReview: sub.reviews[0] || null,
      assignments: sub.assignments,
      versionCount: sub._count.versions,
      reviewCount: sub._count.reviews,
    }))

    return NextResponse.json({
      success: true,
      data: {
        submissions: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        statistics: {
          byStatus: statsMap,
          byProjectType: projectTypeMap,
          total: total,
          submittedToday: statsMap['SUBMITTED'] || statsMap['submitted'] || 0,
          pendingReview: (statsMap['SUBMITTED'] || statsMap['submitted'] || 0) + 
                        (statsMap['UNDER_REVIEW'] || statsMap['under_review'] || 0) + 
                        (statsMap['RESUBMITTED'] || statsMap['resubmitted'] || 0),
          approved: statsMap['APPROVED'] || statsMap['approved'] || 0,
          rejected: statsMap['REJECTED'] || statsMap['rejected'] || 0,
          revisionRequired: statsMap['REVISION_REQUIRED'] || statsMap['revision_required'] || 0,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch projects' 
    }, { status: 500 })
  }
}
