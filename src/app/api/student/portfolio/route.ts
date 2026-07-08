import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { nanoid } from "nanoid"

// GET /api/student/portfolio - Get portfolio entries for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const visibility = searchParams.get("visibility")
    
    const whereClause: Record<string, unknown> = { userId }
    
    if (visibility) {
      whereClause.visibility = visibility
    }
    
    const entries = await prisma.portfolioEntry.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: entries 
    })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch portfolio" 
    }, { status: 500 })
  }
}

// POST /api/student/portfolio - Create a new portfolio entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userId = session.user.id
    const body = await request.json()
    
    const {
      id, // For updates
      title,
      description,
      liveUrl,
      githubUrl,
      demoVideoUrl,
      techStack,
      screenshots,
      demoVideo,
      rationale,
      visibility,
      linkedCourseId,
      linkedMiniProjectId,
      linkedCapstoneId,
      isPublished
    } = body
    
    // If ID provided, update existing entry
    if (id) {
      const existing = await prisma.portfolioEntry.findUnique({ where: { id } })
      
      if (!existing) {
        return NextResponse.json({ 
          success: false, 
          error: "Entry not found" 
        }, { status: 404 })
      }
      
      if (existing.userId !== userId) {
        return NextResponse.json({ 
          success: false, 
          error: "Access denied" 
        }, { status: 403 })
      }
      
      // Generate new public slug if visibility changed to public
      let publicSlug = existing.publicSlug
      if (visibility === "PUBLIC" && !publicSlug) {
        publicSlug = `${session.user.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-${nanoid(8)}`
      }
      
      const entry = await prisma.portfolioEntry.update({
        where: { id },
        data: {
          title,
          description,
          liveUrl,
          githubUrl,
          demoVideoUrl,
          techStack,
          screenshots,
          demoVideo,
          rationale,
          visibility,
          publicSlug,
          linkedCourseId,
          linkedMiniProjectId,
          linkedCapstoneId,
          isPublished: visibility === "PUBLIC" ? true : isPublished,
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        data: entry,
        message: "Portfolio entry updated successfully" 
      })
    }
    
    // Generate public slug if visibility is PUBLIC
    let publicSlug: string | undefined
    if (visibility === "PUBLIC") {
      publicSlug = `${session.user.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-${nanoid(8)}`
    }
    
    // Create new entry
    const entry = await prisma.portfolioEntry.create({
      data: {
        userId,
        title,
        description,
        liveUrl,
        githubUrl,
        demoVideoUrl,
        techStack: techStack || [],
        screenshots,
        demoVideo,
        rationale,
        visibility: visibility || "PRIVATE",
        publicSlug,
        linkedCourseId,
        linkedMiniProjectId,
        linkedCapstoneId,
        isPublished: visibility === "PUBLIC" ? true : (isPublished || false),
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: entry,
      message: "Portfolio entry created successfully" 
    })
  } catch (error) {
    console.error("Error creating portfolio entry:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create portfolio entry" 
    }, { status: 500 })
  }
}
