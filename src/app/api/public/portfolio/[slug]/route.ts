import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/public/portfolio/[slug] - Get public portfolio entry by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const entry = await prisma.portfolioEntry.findUnique({
      where: { publicSlug: slug },
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
        error: "Portfolio not found" 
      }, { status: 404 })
    }
    
    // Only show public portfolios
    if (entry.visibility !== "PUBLIC") {
      return NextResponse.json({ 
        success: false, 
        error: "This portfolio is not public" 
      }, { status: 403 })
    }
    
    // Increment view count
    await prisma.portfolioEntry.update({
      where: { id: entry.id },
      data: { viewCount: { increment: 1 } }
    })
    
    // Hide sensitive info for public view
    const publicEntry = {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      liveUrl: entry.liveUrl,
      githubUrl: entry.githubUrl,
      demoVideoUrl: entry.demoVideoUrl,
      techStack: entry.techStack,
      screenshots: entry.screenshots,
      demoVideo: entry.demoVideo,
      rationale: entry.rationale,
      viewCount: entry.viewCount + 1,
      createdAt: entry.createdAt,
      user: {
        name: entry.user.profile?.fullName || entry.user.profile?.username || "Anonymous",
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: publicEntry 
    })
  } catch (error) {
    console.error("Error fetching public portfolio:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch portfolio" 
    }, { status: 500 })
  }
}
