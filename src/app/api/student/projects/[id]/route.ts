import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Map lowercase status to uppercase for consistency
function normalizeStatus(status: string | undefined): string {
  if (!status) return "DRAFT"
  const statusMap: Record<string, string> = {
    'not_started': 'DRAFT',
    'in_progress': 'IN_PROGRESS',
    'submitted': 'SUBMITTED',
    'graded': 'GRADED',
    'draft': 'DRAFT',
  }
  return statusMap[status.toLowerCase()] || status.toUpperCase()
}

// GET /api/student/projects/[id] - Get single project submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await params
    
    const submission = await prisma.projectSubmission.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          }
        },
        miniProject: true,
        user: {
          include: {
            profile: true
          }
        },
        reviews: {
          where: { isLatest: true },
          include: {
            reviewer: {
              select: { id: true, email: true, profile: { select: { fullName: true } } }
            }
          }
        },
        versions: {
          where: { isLatest: true },
          orderBy: { versionNumber: 'desc' }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { versions: true, reviews: true }
        }
      }
    })
    
    if (!submission) {
      return NextResponse.json({ 
        success: false, 
        error: "Project not found" 
      }, { status: 404 })
    }
    
    // Check ownership
    if (submission.userId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied" 
      }, { status: 403 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: submission 
    })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch project" 
    }, { status: 500 })
  }
}

// PATCH /api/student/projects/[id] - Update project submission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    
    // Verify ownership
    const existing = await prisma.projectSubmission.findUnique({
      where: { id }
    })
    
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: "Project not found" 
      }, { status: 404 })
    }
    
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied" 
      }, { status: 403 })
    }
    
    // Check if locked
    if (existing.isLocked && body.status !== 'REVISION_REQUIRED') {
      return NextResponse.json({ 
        success: false, 
        error: "Project is locked. Wait for revision request." 
      }, { status: 403 })
    }
    
    const {
      title,
      description,
      submissionUrl,
      fileUrls,
      screenshots,
      status,
      demoUrl,
      reportUrl,
      videoUrl,
      additionalLinks,
      notes,
      action
    } = body
    
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (submissionUrl !== undefined) updateData.submissionUrl = submissionUrl
    if (fileUrls !== undefined) updateData.fileUrls = fileUrls
    if (screenshots !== undefined) updateData.screenshots = screenshots
    
    // Handle status with normalization
    if (status !== undefined) {
      const normalizedStatus = normalizeStatus(status)
      updateData.status = normalizedStatus
      
      // If submitting, create a new version
      if ((status === "submitted" || normalizedStatus === "SUBMITTED") && 
          !["SUBMITTED", "submitted"].includes(existing.status)) {
        updateData.submittedAt = new Date()
        updateData.isLocked = true
        
        // Get latest version
        const latestVersion = await prisma.submissionVersion.findFirst({
          where: { submissionId: id },
          orderBy: { versionNumber: 'desc' }
        })
        const nextVersion = (latestVersion?.versionNumber || 0) + 1
        
        // Mark all versions as not latest
        await prisma.submissionVersion.updateMany({
          where: { submissionId: id },
          data: { isLatest: false }
        })
        
        // Create new version
        await prisma.submissionVersion.create({
          data: {
            submissionId: id,
            versionNumber: nextVersion,
            title: title || existing.title,
            description: description || existing.description,
            submissionUrl: submissionUrl || existing.submissionUrl,
            demoUrl,
            reportUrl,
            videoUrl,
            fileUrls: fileUrls || existing.fileUrls,
            screenshots: screenshots || existing.screenshots,
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
            previousStatus: existing.status,
            newStatus: normalizedStatus,
            changedBy: session.user.id,
            reason: `Student submission - Version ${nextVersion}`
          }
        })
      }
    }
    
    const submission = await prisma.projectSubmission.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, title: true, slug: true } },
        miniProject: { select: { id: true, title: true } }
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: submission,
      message: "Project updated successfully" 
    })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update project" 
    }, { status: 500 })
  }
}

// DELETE /api/student/projects/[id] - Delete project submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await params
    
    // Verify ownership
    const existing = await prisma.projectSubmission.findUnique({
      where: { id }
    })
    
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: "Project not found" 
      }, { status: 404 })
    }
    
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied" 
      }, { status: 403 })
    }
    
    // Soft delete
    await prisma.projectSubmission.update({
      where: { id },
      data: { isDeleted: true }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: "Project deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete project" 
    }, { status: 500 })
  }
}
