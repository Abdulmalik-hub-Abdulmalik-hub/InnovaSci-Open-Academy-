/**
 * Individual Project Submission API
 * GET, PUT, DELETE single submission
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

// GET /api/projects/submissions/[id] - Get single submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.projectSubmission.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, profile: { select: { fullName: true, avatarUrl: true } } }
        },
        course: {
          select: { id: true, title: true, slug: true }
        },
        miniProject: {
          select: { id: true, title: true, description: true }
        },
        versions: {
          orderBy: { versionNumber: 'desc' }
        },
        reviews: {
          where: { isLatest: true },
          include: {
            reviewer: {
              select: { id: true, email: true, profile: { select: { fullName: true } } }
            },
            feedback: true,
            scores: {
              include: { rubric: true }
            }
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        comments: {
          where: { isInternal: false },
          include: {
            author: {
              select: { id: true, email: true, profile: { select: { fullName: true, avatarUrl: true } } }
            },
            replies: {
              include: {
                author: {
                  select: { id: true, email: true, profile: { select: { fullName: true, avatarUrl: true } } }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        assignments: {
          include: {
            reviewer: {
              select: { id: true, email: true, profile: { select: { fullName: true } } }
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 })
    }

    // Students can only view their own submissions
    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: {
        submission: {
          ...submission,
          rubricScore: submission.rubricScore ? Number(submission.rubricScore) : null,
          maxScore: submission.maxScore ? Number(submission.maxScore) : 100,
          canEdit: canEditSubmission(submission),
        }
      }
    })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch submission' }, { status: 500 })
  }
}

// PUT /api/projects/submissions/[id] - Update submission
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.projectSubmission.findUnique({
      where: { id }
    })

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 })
    }

    // Students can only edit their own submissions
    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Check if submission can be edited
    if (!canEditSubmission(submission)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Submission is locked and cannot be edited' 
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      submissionUrl,
      demoUrl,
      reportUrl,
      videoUrl,
      fileUrls,
      screenshots,
      additionalLinks,
      notes,
      action // 'save_draft' | 'submit' | 'resubmit'
    } = body

    // Update basic info
    const updateData: any = {
      updatedAt: new Date()
    }

    if (title) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (submissionUrl !== undefined) updateData.submissionUrl = submissionUrl
    if (fileUrls !== undefined) updateData.fileUrls = fileUrls
    if (screenshots !== undefined) updateData.screenshots = screenshots

    // Handle submit action
    if (action === 'submit' || action === 'resubmit') {
      const previousStatus = submission.status
      
      // Lock the submission
      updateData.isLocked = true
      updateData.submittedAt = new Date()
      updateData.status = action === 'submit' ? 'SUBMITTED' : 'RESUBMITTED'

      // Get next version number
      const latestVersion = await prisma.submissionVersion.findFirst({
        where: { submissionId: id },
        orderBy: { versionNumber: 'desc' }
      })
      const nextVersion = (latestVersion?.versionNumber || 0) + 1

      // Mark all previous versions as not latest
      await prisma.submissionVersion.updateMany({
        where: { submissionId: id },
        data: { isLatest: false }
      })

      // Create new version
      await prisma.submissionVersion.create({
        data: {
          submissionId: id,
          versionNumber: nextVersion,
          title: title || submission.title,
          description: description || submission.description,
          submissionUrl: submissionUrl || submission.submissionUrl,
          demoUrl,
          reportUrl,
          videoUrl,
          fileUrls,
          screenshots,
          additionalLinks,
          notes,
          isLatest: true,
          submittedAt: new Date(),
        }
      })

      // Create status history
      await prisma.projectStatusHistory.create({
        data: {
          submissionId: id,
          previousStatus,
          newStatus: updateData.status,
          changedBy: user.id,
          reason: action === 'submit' ? 'Initial submission' : `Resubmission - Version ${nextVersion}`
        }
      })
    } else {
      // Just save draft - update latest version if exists
      const latestVersion = await prisma.submissionVersion.findFirst({
        where: { submissionId: id, isLatest: true }
      })

      if (latestVersion) {
        await prisma.submissionVersion.update({
          where: { id: latestVersion.id },
          data: {
            title: title || latestVersion.title,
            description: description || latestVersion.description,
            submissionUrl: submissionUrl !== undefined ? submissionUrl : latestVersion.submissionUrl,
            demoUrl: demoUrl !== undefined ? demoUrl : latestVersion.demoUrl,
            reportUrl: reportUrl !== undefined ? reportUrl : latestVersion.reportUrl,
            videoUrl: videoUrl !== undefined ? videoUrl : latestVersion.videoUrl,
            fileUrls: fileUrls !== undefined ? fileUrls : latestVersion.fileUrls,
            screenshots: screenshots !== undefined ? screenshots : latestVersion.screenshots,
            additionalLinks: additionalLinks !== undefined ? additionalLinks : latestVersion.additionalLinks,
            notes: notes !== undefined ? notes : latestVersion.notes,
          }
        })
      }
    }

    const updated = await prisma.projectSubmission.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: { submission: updated },
      message: action === 'submit' || action === 'resubmit' 
        ? 'Submission successful!' 
        : 'Draft saved successfully'
    })
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update submission' 
    }, { status: 500 })
  }
}

// DELETE /api/projects/submissions/[id] - Soft delete submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.projectSubmission.findUnique({
      where: { id }
    })

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 })
    }

    // Students can only delete their own drafts
    if (user.role === 'STUDENT') {
      if (submission.userId !== user.id) {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
      }
      if (submission.status !== 'DRAFT') {
        return NextResponse.json({ 
          success: false, 
          error: 'Only draft submissions can be deleted' 
        }, { status: 403 })
      }
    }

    // Soft delete
    await prisma.projectSubmission.update({
      where: { id },
      data: { isDeleted: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete submission' 
    }, { status: 500 })
  }
}
