import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { z } from "zod"

const reviewSchema = z.object({
  scores: z.record(z.number()).optional(),
  totalScore: z.number().optional(),
  evaluation: z.string().optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  recommendation: z.enum(["APPROVE", "REJECT", "REQUEST_INFO", "INTERVIEW"]).optional(),
  confidenceLevel: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
})

// POST /api/admin/applications/[id]/review - Submit review for application
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "applications:review")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const validatedData = reviewSchema.parse(body)
    
    const application = await prisma.scholarshipApplication.findUnique({
      where: { id: params.id }
    })
    
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    
    // Check if user is a reviewer for this scholarship
    const isReviewer = await prisma.scholarshipReviewer.findFirst({
      where: {
        scholarshipId: application.scholarshipId,
        OR: [
          { reviewerId: session.user.id },
          { reviewerEmail: session.user.email }
        ],
        isActive: true
      }
    })
    
    if (!isReviewer && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ 
        error: "You are not assigned as a reviewer for this scholarship" 
      }, { status: 403 })
    }
    
    // Create or update review
    const review = await prisma.applicationReview.upsert({
      where: {
        id: body.reviewId || "temp"
      },
      create: {
        applicationId: params.id,
        reviewerId: session.user.id,
        reviewerEmail: session.user.email!,
        scores: validatedData.scores,
        totalScore: validatedData.totalScore || 0,
        evaluation: validatedData.evaluation,
        strengths: validatedData.strengths,
        weaknesses: validatedData.weaknesses,
        recommendation: validatedData.recommendation,
        confidenceLevel: validatedData.confidenceLevel,
        status: validatedData.status || "IN_PROGRESS",
      },
      update: {
        scores: validatedData.scores,
        totalScore: validatedData.totalScore,
        evaluation: validatedData.evaluation,
        strengths: validatedData.strengths,
        weaknesses: validatedData.weaknesses,
        recommendation: validatedData.recommendation,
        confidenceLevel: validatedData.confidenceLevel,
        status: validatedData.status,
        completedAt: validatedData.status === "COMPLETED" ? new Date() : null,
      },
      create: {
        applicationId: params.id,
        reviewerId: session.user.id,
        reviewerEmail: session.user.email!,
        scores: validatedData.scores || {},
        totalScore: validatedData.totalScore || 0,
        evaluation: validatedData.evaluation,
        strengths: validatedData.strengths,
        weaknesses: validatedData.weaknesses,
        recommendation: validatedData.recommendation,
        confidenceLevel: validatedData.confidenceLevel,
        status: validatedData.status || "IN_PROGRESS",
        completedAt: validatedData.status === "COMPLETED" ? new Date() : null,
      }
    })
    
    // If completed, update the application with average score
    if (validatedData.status === "COMPLETED") {
      const allReviews = await prisma.applicationReview.findMany({
        where: {
          applicationId: params.id,
          status: "COMPLETED"
        }
      })
      
      const avgScore = allReviews.reduce((acc, r) => acc + Number(r.totalScore), 0) / allReviews.length
      
      await prisma.scholarshipApplication.update({
        where: { id: params.id },
        data: { totalScore: avgScore }
      })
    }
    
    return NextResponse.json(review)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/admin/applications/[id]/review - Get reviews for application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!hasPermission(session.user.role as string, "applications:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const reviews = await prisma.applicationReview.findMany({
      where: { applicationId: params.id },
      orderBy: { createdAt: "desc" }
    })
    
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
