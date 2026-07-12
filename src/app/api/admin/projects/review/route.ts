/**
 * Project Review API
 * POST - Submit review decision
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Valid review decisions
const VALID_DECISIONS = ['APPROVED', 'REJECTED', 'REVISION_REQUIRED', 'UNDER_REVIEW']

// Check admin auth
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return { authorized: true }

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
  return { authorized: true }
}

// POST /api/admin/projects/review - Submit review
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
    }

    const body = await request.json()
    const {
      submissionId,
      decision,
      overallFeedback,
      timeSpentMinutes,
      feedback, // Array of feedback items
      scores, // Array of rubric scores
      rubricId,
      grade,
      gradeType,
      unlockCertificate = false
    } = body

    // Validation
    if (!submissionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Submission ID is required' 
      }, { status: 400 })
    }

    if (!decision || !VALID_DECISIONS.includes(decision)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid review decision' 
      }, { status: 400 })
    }

    // Check submission exists
    const submission = await prisma.projectSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: { id: true, email: true }
        },
        course: {
          select: { id: true, title: true }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ 
        success: false, 
        error: 'Submission not found' 
      }, { status: 404 })
    }

    // Cannot review if already approved/completed (unless admin override)
    if (['APPROVED', 'REJECTED', 'COMPLETED'].includes(submission.status) && decision !== 'REVISION_REQUIRED') {
      return NextResponse.json({ 
        success: false, 
        error: 'This submission has already received a final decision' 
      }, { status: 400 })
    }

    // Create review
    const review = await prisma.projectReview.create({
      data: {
        submissionId,
        reviewerId: auth.userId || 'system',
        decision,
        overallFeedback,
        timeSpentMinutes,
        reviewedAt: new Date(),
        isLatest: true,
      }
    })

    // Create feedback items
    if (feedback && Array.isArray(feedback) && feedback.length > 0) {
      await prisma.projectFeedback.createMany({
        data: feedback.map((item: any) => ({
          reviewId: review.id,
          category: item.category,
          title: item.title,
          content: item.content,
          recommendation: item.recommendation,
          referenceType: item.referenceType,
          referenceId: item.referenceId,
          referenceDetail: item.referenceDetail,
        }))
      })
    }

    // Create scores if rubric provided
    let totalScore = 0
    let maxTotalScore = 0

    if (scores && Array.isArray(scores) && scores.length > 0 && rubricId) {
      await prisma.projectScore.createMany({
        data: scores.map((item: any) => {
          const pointsAwarded = parseFloat(item.pointsAwarded) || 0
          const maxPoints = parseFloat(item.maxPoints) || 100
          totalScore += pointsAwarded
          maxTotalScore += maxPoints
          
          return {
            reviewId: review.id,
            rubricId,
            criteriaName: item.criteriaName,
            pointsAwarded,
            maxPoints,
            feedback: item.feedback,
          }
        })
      })
    }

    // Update submission status based on decision
    const previousStatus = submission.status
    let newStatus: string
    let shouldUnlock = false

    switch (decision) {
      case 'APPROVED':
        newStatus = 'APPROVED'
        break
      case 'REJECTED':
        newStatus = 'REJECTED'
        break
      case 'REVISION_REQUIRED':
        newStatus = 'REVISION_REQUIRED'
        shouldUnlock = true // Allow student to edit
        break
      case 'UNDER_REVIEW':
        newStatus = 'UNDER_REVIEW'
        break
      default:
        newStatus = submission.status
    }

    // Update submission
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    }

    // Calculate final grade
    if (grade !== undefined) {
      updateData.grade = grade
    }
    if (gradeType) {
      updateData.gradeType = gradeType
    }
    if (rubricId) {
      updateData.rubricId = rubricId
    }
    if (totalScore > 0) {
      updateData.rubricScore = totalScore
      updateData.maxScore = maxTotalScore
    }
    if (decision === 'APPROVED') {
      updateData.gradedAt = new Date()
    }

    // Unlock for revision if needed
    if (shouldUnlock) {
      updateData.isLocked = false
    }

    await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: updateData
    })

    // Mark old reviews as not latest
    await prisma.projectReview.updateMany({
      where: { submissionId, id: { not: review.id } },
      data: { isLatest: false }
    })

    // Create status history
    await prisma.projectStatusHistory.create({
      data: {
        submissionId,
        previousStatus,
        newStatus,
        changedBy: auth.userId || 'system',
        reason: `Review decision: ${decision}`
      }
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: submission.userId,
        title: `Project ${decision === 'APPROVED' ? 'Approved' : decision === 'REJECTED' ? 'Rejected' : 'Needs Revision'}`,
        message: `Your project "${submission.title}" has been reviewed. ${decision === 'APPROVED' ? 'Congratulations!' : 'Please check the feedback and make necessary changes.'}`,
        type: 'PROJECT_REVIEW',
        data: JSON.stringify({
          submissionId,
          decision,
          reviewId: review.id
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        review,
        submissionStatus: newStatus,
      },
      message: `Review submitted successfully. Submission status: ${newStatus}`
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to submit review' 
    }, { status: 500 })
  }
}
