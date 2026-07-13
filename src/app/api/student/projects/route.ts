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

// GET /api/student/projects - Get all project submissions for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type") // 'mini_project', 'capstone'
    
    // Build where clause
    const whereClause: Record<string, unknown> = { 
      userId,
      isDeleted: false,
    }
    
    if (status) {
      whereClause.status = normalizeStatus(status)
    }
    
    if (type === "mini_project") {
      whereClause.miniProjectId = { not: null }
      whereClause.capstoneId = null
    } else if (type === "capstone") {
      whereClause.capstoneId = { not: null }
    }
    
    const projects = await prisma.projectSubmission.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        isLocked: true,
        projectType: true,
        grade: true,
        gradeType: true,
        feedback: true,
        submittedAt: true,
        gradedAt: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        miniProjectId: true,
        capstoneId: true,
        submissionUrl: true,
        fileUrls: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          }
        },
        miniProject: {
          select: {
            id: true,
            title: true,
            description: true,
            deliverables: true,
          }
        },
        _count: {
          select: { versions: true, reviews: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    
    // Format projects for client
    const formattedProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      isLocked: p.isLocked,
      projectType: p.projectType,
      grade: p.grade,
      gradeType: p.gradeType,
      feedback: p.feedback,
      submittedAt: p.submittedAt,
      gradedAt: p.gradedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      course: p.course,
      miniProject: p.miniProject,
      capstoneId: p.capstoneId,
      submissionUrl: p.submissionUrl,
      fileUrls: p.fileUrls,
      versionCount: p._count.versions,
      reviewCount: p._count.reviews,
    }))
    
    return NextResponse.json({ 
      success: true, 
      data: formattedProjects 
    })
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const prismaErrorCode = error?.code || error?.meta?.code || ""
    const prismaErrorMsg = error?.meta?.message || error?.message || ""
    
    return NextResponse.json({ 
      success: false, 
      error: `Failed to fetch projects: ${errorMessage}`,
      details: {
        message: prismaErrorMsg || errorMessage,
        code: prismaErrorCode,
        stack: error?.stack?.substring(0, 500)
      }
    }, { status: 500 })
  }
}

// POST /api/student/projects - Create or update a project submission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userId = session.user.id
    const body = await request.json()
    
    const {
      id, // If provided, update existing
      miniProjectId,
      capstoneId,
      capstoneType,
      title,
      description,
      submissionUrl,
      fileUrls,
      screenshots,
      status,
      courseId,
      demoUrl,
      reportUrl,
      videoUrl,
      additionalLinks,
      notes,
      action // 'save_draft' | 'submit'
    } = body
    
    // If ID provided, update existing submission
    if (id) {
      // Check if submission is locked
      const existing = await prisma.projectSubmission.findUnique({
        where: { id }
      })
      
      if (existing?.isLocked && status !== 'REVISION_REQUIRED') {
        return NextResponse.json({ 
          success: false, 
          error: "Submission is locked. Wait for revision request." 
        }, { status: 403 })
      }
      
      const normalizedStatus = normalizeStatus(status)
      
      // If submitting, lock the submission
      const updateData: any = {
        title,
        description,
        submissionUrl,
        fileUrls,
        screenshots,
        status: normalizedStatus,
      }
      
      if (action === 'submit') {
        updateData.submittedAt = new Date()
        updateData.isLocked = true
        
        // Create new version
        const latestVersion = await prisma.submissionVersion.findFirst({
          where: { submissionId: id },
          orderBy: { versionNumber: 'desc' }
        })
        const nextVersion = (latestVersion?.versionNumber || 0) + 1
        
        await prisma.submissionVersion.updateMany({
          where: { submissionId: id },
          data: { isLatest: false }
        })
        
        await prisma.submissionVersion.create({
          data: {
            submissionId: id,
            versionNumber: nextVersion,
            title: title || existing?.title,
            description: description || existing?.description,
            submissionUrl,
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
            previousStatus: existing?.status,
            newStatus: normalizedStatus,
            changedBy: userId,
            reason: `Student submission - Version ${nextVersion}`
          }
        })
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
        message: action === 'submit' ? "Project submitted successfully!" : "Project saved successfully" 
      })
    }
    
    // Create new submission
    const submission = await prisma.projectSubmission.create({
      data: {
        userId,
        miniProjectId,
        capstoneId,
        capstoneType,
        courseId,
        title,
        description,
        submissionUrl,
        fileUrls,
        screenshots,
        status: normalizeStatus(status) || 'DRAFT',
        projectType: miniProjectId ? 'MINI_PROJECT' : capstoneId ? 'DIFFICULTY_CAPSTONE' : 'PRACTICAL_EXERCISE',
        isLocked: false,
        isFromMCCS: true,
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        miniProject: { select: { id: true, title: true } }
      }
    })
    
    // Create status history
    await prisma.projectStatusHistory.create({
      data: {
        submissionId: submission.id,
        previousStatus: null,
        newStatus: submission.status,
        changedBy: userId,
        reason: 'Project created'
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: submission,
      message: "Project created successfully" 
    })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create project" 
    }, { status: 500 })
  }
}
