import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const whereClause: Record<string, unknown> = { userId }
    
    if (status) {
      whereClause.status = status
    }
    
    if (type === "mini_project") {
      whereClause.miniProjectId = { not: null }
      whereClause.capstoneId = null
    } else if (type === "capstone") {
      whereClause.capstoneId = { not: null }
    }
    
    const projects = await prisma.projectSubmission.findMany({
      where: whereClause,
      include: {
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
        }
      },
      orderBy: { updatedAt: "desc" }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: projects 
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch projects" 
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
      courseId
    } = body
    
    // If ID provided, update existing submission
    if (id) {
      const submission = await prisma.projectSubmission.update({
        where: { id },
        data: {
          title,
          description,
          submissionUrl,
          fileUrls,
          screenshots,
          status,
          ...(status === "submitted" ? { submittedAt: new Date() } : {}),
        },
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
        status: status || "not_started",
        isFromMCCS: true,
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        miniProject: { select: { id: true, title: true } }
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
