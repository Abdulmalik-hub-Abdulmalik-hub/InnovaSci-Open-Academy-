/**
 * Project Submissions API
 * Handles student project submissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Valid submission statuses
const VALID_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'RESUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'ARCHIVED']

// Project types
const PROJECT_TYPES = ['PRACTICAL_EXERCISE', 'MINI_PROJECT', 'DIFFICULTY_CAPSTONE', 'PROFESSIONAL_CAPSTONE']

// Helper to check if user is authenticated
async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string; role: string } | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null

  try {
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      if (token.startsWith('user_')) {
        const userId = token.substring(5)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true }
        })
        return user
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
  }
  return null
}

// Helper to check if submission is editable
function canEditSubmission(submission: any): boolean {
  if (submission.status === 'DRAFT' || submission.status === 'REVISION_REQUIRED') {
    return true
  }
  return false
}

// GET /api/projects/submissions - List submissions
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectType = searchParams.get('projectType')
    const courseId = searchParams.get('courseId')
    const miniProjectId = searchParams.get('miniProjectId')
    const includeVersions = searchParams.get('includeVersions') === 'true'
    const includeReviews = searchParams.get('includeReviews') === 'true'

    const where: any = {
      isDeleted: false,
    }

    if (user.role === 'STUDENT') {
      where.userId = user.id
    }

    if (status) where.status = status
    if (projectType) where.projectType = projectType
    if (courseId) where.courseId = courseId
    if (miniProjectId) where.miniProjectId = miniProjectId

    const submissions = await prisma.projectSubmission.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, profile: { select: { fullName: true } } }
        },
        course: {
          select: { id: true, title: true, slug: true }
        },
        miniProject: {
          select: { id: true, title: true }
        },
        versions: includeVersions ? {
          orderBy: { versionNumber: 'desc' },
          take: 5
        } : false,
        reviews: includeReviews ? {
          where: { isLatest: true },
          include: {
            reviewer: {
              select: { id: true, email: true, profile: { select: { fullName: true } } }
            }
          }
        } : false,
        _count: {
          select: { versions: true, reviews: true, comments: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    const formatted = submissions.map(sub => ({
      id: sub.id,
      title: sub.title,
      description: sub.description,
      status: sub.status,
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
      latestVersion: sub.versions && sub.versions.length > 0 ? sub.versions[0] : null,
      latestReview: sub.reviews && sub.reviews.length > 0 ? sub.reviews[0] : null,
      versionCount: sub._count.versions,
      reviewCount: sub._count.reviews,
      commentCount: sub._count.comments,
      canEdit: canEditSubmission(sub),
    }))

    return NextResponse.json({
      success: true,
      data: { submissions: formatted }
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

// POST /api/projects/submissions - Create new submission
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      courseId,
      miniProjectId,
      capstoneId,
      capstoneType,
      projectType = 'MINI_PROJECT',
      submissionUrl,
      demoUrl,
      reportUrl,
      videoUrl,
      fileUrls,
      screenshots,
      additionalLinks,
      notes,
      isDraft = false
    } = body

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title must be at least 3 characters' 
      }, { status: 400 })
    }

    if (!PROJECT_TYPES.includes(projectType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid project type' 
      }, { status: 400 })
    }

    if (miniProjectId) {
      const miniProject = await prisma.miniProject.findUnique({
        where: { id: miniProjectId }
      })
      if (!miniProject) {
        return NextResponse.json({ 
          success: false, 
          error: 'Mini project not found' 
        }, { status: 404 })
      }
    }

    const submission = await prisma.projectSubmission.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        courseId: courseId || null,
        miniProjectId: miniProjectId || null,
        capstoneId: capstoneId || null,
        capstoneType: capstoneType || null,
        projectType,
        submissionUrl: submissionUrl || null,
        fileUrls: fileUrls || null,
        screenshots: screenshots || null,
        status: isDraft ? 'DRAFT' : 'DRAFT',
        isLocked: false,
      }
    })

    if (!isDraft) {
      await prisma.submissionVersion.create({
        data: {
          submissionId: submission.id,
          versionNumber: 1,
          title: submission.title,
          description: submission.description,
          submissionUrl: submissionUrl || null,
          demoUrl: demoUrl || null,
          reportUrl: reportUrl || null,
          videoUrl: videoUrl || null,
          fileUrls: fileUrls || null,
          screenshots: screenshots || null,
          additionalLinks: additionalLinks || null,
          notes: notes || null,
          isLatest: true,
          submittedAt: new Date(),
        }
      })
    }

    await prisma.projectStatusHistory.create({
      data: {
        submissionId: submission.id,
        previousStatus: null,
        newStatus: 'DRAFT',
        changedBy: user.id,
        reason: isDraft ? 'Draft created' : 'Submission created'
      }
    })

    return NextResponse.json({
      success: true,
      data: { submission },
      message: isDraft ? 'Draft created successfully' : 'Submission created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create submission' 
    }, { status: 500 })
  }
}
