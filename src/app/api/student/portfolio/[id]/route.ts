import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { nanoid } from "nanoid"

// GET /api/student/portfolio/[id] - Get single portfolio entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    const entry = await prisma.portfolioEntry.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })
    
    if (!entry) {
      return NextResponse.json({ 
        success: false, 
        error: "Entry not found" 
      }, { status: 404 })
    }
    
    // Check access permissions
    const isOwner = session?.user?.id === entry.userId
    
    if (!isOwner) {
      // For non-owners, check visibility
      if (entry.visibility === "PRIVATE") {
        return NextResponse.json({ 
          success: false, 
          error: "Access denied" 
        }, { status: 403 })
      }
      
      // Increment view count for public/academy_only entries
      await prisma.portfolioEntry.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: entry 
    })
  } catch (error) {
    console.error("Error fetching portfolio entry:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch entry" 
    }, { status: 500 })
  }
}

// PATCH /api/student/portfolio/[id] - Update portfolio entry
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
    
    const existing = await prisma.portfolioEntry.findUnique({ where: { id } })
    
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: "Entry not found" 
      }, { status: 404 })
    }
    
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied" 
      }, { status: 403 })
    }
    
    const {
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
      isPublished
    } = body
    
    // Generate new public slug if visibility changed to public
    let publicSlug = existing.publicSlug
    if (visibility === "PUBLIC" && !publicSlug) {
      publicSlug = `${session.user.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-${nanoid(8)}`
    }
    
    const entry = await prisma.portfolioEntry.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(demoVideoUrl !== undefined && { demoVideoUrl }),
        ...(techStack !== undefined && { techStack }),
        ...(screenshots !== undefined && { screenshots }),
        ...(demoVideo !== undefined && { demoVideo }),
        ...(rationale !== undefined && { rationale }),
        ...(visibility !== undefined && { visibility }),
        ...(publicSlug !== undefined && { publicSlug }),
        ...(isPublished !== undefined && { isPublished }),
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: entry,
      message: "Portfolio entry updated successfully" 
    })
  } catch (error) {
    console.error("Error updating portfolio entry:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update entry" 
    }, { status: 500 })
  }
}

// DELETE /api/student/portfolio/[id] - Delete portfolio entry
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
    
    const existing = await prisma.portfolioEntry.findUnique({ where: { id } })
    
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: "Entry not found" 
      }, { status: 404 })
    }
    
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied" 
      }, { status: 403 })
    }
    
    await prisma.portfolioEntry.delete({
      where: { id }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: "Portfolio entry deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting portfolio entry:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete entry" 
    }, { status: 500 })
  }
}
