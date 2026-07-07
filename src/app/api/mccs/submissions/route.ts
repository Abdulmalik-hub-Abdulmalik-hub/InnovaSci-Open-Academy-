import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// User authentication helper
async function getUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return null
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("user_")) {
        return token.substring(5)
      }
    }
    
    return null
  } catch (error) {
    console.error("Auth check error:", error)
    return null
  }
}

// Schema for exercise submission
const exerciseSubmissionSchema = z.object({
  exerciseId: z.string().uuid(),
  submissionUrl: z.string().url().optional().nullable(),
  submissionNotes: z.string().max(5000).optional(),
  submittedFiles: z.array(z.string()).optional(),
})

// Schema for project submission
const projectSubmissionSchema = z.object({
  projectId: z.string().uuid(),
  projectTitle: z.string().max(200).optional(),
  submissionUrl: z.string().url().optional().nullable(),
  liveDemoUrl: z.string().url().optional().nullable(),
  documentationUrl: z.string().url().optional().nullable(),
  submissionNotes: z.string().max(5000).optional(),
  screenshots: z.array(z.string().url()).optional(),
  teamMembers: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
  })).optional(),
  isTeamSubmission: z.boolean().default(false),
})

// GET /api/mccs/submissions - Get user's submissions
export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'exercise', 'project', 'capstone', 'professional'
    const status = searchParams.get("status")

    // Get exercise submissions
    const exerciseSubmissions = await prisma.exerciseSubmission.findMany({
      where: { userId },
      include: {
        exercise: {
          include: {
            lesson: { select: { id: true, title: true } },
            course: { select: { id: true, title: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get project submissions
    const projectSubmissions = await prisma.projectSubmission.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            course: { select: { id: true, title: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get capstone submissions
    const capstoneSubmissions = await prisma.capstoneSubmission.findMany({
      where: { userId },
      include: {
        capstone: {
          include: {
            difficultyLevel: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get professional capstone submissions
    const professionalCapstoneSubmissions = await prisma.professionalCapstoneSubmission.findMany({
      where: { userId },
      include: {
        capstone: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Apply filters
    let result = { exerciseSubmissions, projectSubmissions, capstoneSubmissions, professionalCapstoneSubmissions }

    if (type) {
      switch (type) {
        case 'exercise':
          result = { exerciseSubmissions, projectSubmissions: [], capstoneSubmissions: [], professionalCapstoneSubmissions: [] }
          break
        case 'project':
          result = { exerciseSubmissions: [], projectSubmissions, capstoneSubmissions: [], professionalCapstoneSubmissions: [] }
          break
        case 'capstone':
          result = { exerciseSubmissions: [], projectSubmissions: [], capstoneSubmissions, professionalCapstoneSubmissions: [] }
          break
        case 'professional':
          result = { exerciseSubmissions: [], projectSubmissions: [], capstoneSubmissions: [], professionalCapstoneSubmissions }
          break
      }
    }

    if (status) {
      result.exerciseSubmissions = result.exerciseSubmissions.filter(s => s.status === status)
      result.projectSubmissions = result.projectSubmissions.filter(s => s.status === status)
      result.capstoneSubmissions = result.capstoneSubmissions.filter(s => s.status === status)
      result.professionalCapstoneSubmissions = result.professionalCapstoneSubmissions.filter(s => s.status === status)
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch submissions"
    }, { status: 500 })
  }
}

// POST /api/mccs/submissions - Create a new submission
export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { submissionType } = body

    switch (submissionType) {
      case 'exercise': {
        const validationResult = exerciseSubmissionSchema.safeParse(body)
        if (!validationResult.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: validationResult.error.flatten().fieldErrors
          }, { status: 400 })
        }

        const submission = await prisma.exerciseSubmission.create({
          data: {
            exerciseId: validationResult.data.exerciseId,
            userId,
            submissionUrl: validationResult.data.submissionUrl,
            submissionNotes: validationResult.data.submissionNotes,
            submittedFiles: validationResult.data.submittedFiles,
            status: "SUBMITTED",
          }
        })

        return NextResponse.json({
          success: true,
          data: { submission },
          message: "Exercise submitted successfully"
        }, { status: 201 })
      }

      case 'project': {
        const validationResult = projectSubmissionSchema.safeParse(body)
        if (!validationResult.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: validationResult.error.flatten().fieldErrors
          }, { status: 400 })
        }

        const submission = await prisma.projectSubmission.create({
          data: {
            projectId: validationResult.data.projectId,
            userId,
            projectTitle: validationResult.data.projectTitle,
            submissionUrl: validationResult.data.submissionUrl,
            liveDemoUrl: validationResult.data.liveDemoUrl,
            documentationUrl: validationResult.data.documentationUrl,
            submissionNotes: validationResult.data.submissionNotes,
            screenshots: validationResult.data.screenshots,
            teamMembers: validationResult.data.teamMembers,
            isTeamSubmission: validationResult.data.isTeamSubmission,
            status: "SUBMITTED",
          }
        })

        return NextResponse.json({
          success: true,
          data: { submission },
          message: "Project submitted successfully"
        }, { status: 201 })
      }

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid submission type"
        }, { status: 400 })
    }

  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create submission" },
      { status: 500 }
    )
  }
}
