import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { completeCourseSchema } from "@/lib/validations/mccs"
import { v4 as uuidv4 } from "crypto"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// Admin authentication helper
async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader) {
    return { authorized: true } // Demo mode
  }
  
  try {
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      if (token.startsWith("admin_")) {
        const userId = token.substring(6)
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true }
        })
        
        if (user && user.role === "ADMIN" && user.status === "ACTIVE") {
          return { authorized: true, userId: user.id }
        }
      }
    }
    
    return { authorized: false, error: "Invalid or expired authentication token" }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authorized: false, error: "Authentication check failed" }
  }
}

// GET /api/mccs/courses - List courses with filtering
export async function GET(request: NextRequest) {
  const endpoint = "/api/mccs/courses"
  
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ 
      success: false, 
      error: "Too many requests. Please try again later." 
    }, { status: 429 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const categoryId = searchParams.get("categoryId") || ""
    const difficultyLevelId = searchParams.get("difficultyLevelId") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }
    if (status && status !== "all") {
      where.status = status
    }
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (difficultyLevelId) {
      where.difficultyLevelId = difficultyLevelId
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: true,
          difficultyLevel: true,
          modules: {
            include: {
              lessons: {
                where: { isActive: true }
              },
              practicalExercises: {
                where: { isPublished: true }
              }
            },
            orderBy: { orderIndex: 'asc' }
          },
          miniProjects: {
            where: { isPublished: true }
          },
          _count: {
            select: {
              enrollments: true
            }
          },
          learningOutcomes: {
            orderBy: { orderIndex: 'asc' }
          },
          objectives: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.course.count({ where })
    ])

    // Get categories and difficulty levels for filters
    const [categories, difficultyLevels] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { orderIndex: 'asc' }
      }),
      prisma.difficultyLevel.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, categoryId: true },
        orderBy: { orderIndex: 'asc' }
      })
    ])

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      status: course.status,
      difficultyLevel: course.difficultyLevel?.name || null,
      difficultyLevelId: course.difficultyLevelId,
      category: course.category?.name || null,
      categoryId: course.categoryId,
      price: Number(course.price),
      isFree: course.isFree,
      isActive: course.isActive,
      thumbnailUrl: course.thumbnailUrl,
      introVideoUrl: course.introVideoUrl,
      learningOutcomes: course.learningOutcomes.map(lo => lo.outcome),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      stats: {
        enrollments: course._count.enrollments,
        modules: course.modules.length,
        lessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
        exercises: course.modules.reduce((acc, m) => acc + m.practicalExercises.length, 0),
        miniProjects: course.miniProjects.length,
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters: {
          categories,
          difficultyLevels
        }
      }
    })
  } catch (error) {
    console.error(`[${endpoint}] Courses API error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch courses",
      code: "QUERY_FAILED"
    }, { status: 500 })
  }
}

// POST /api/mccs/courses - Create new course with full content
export async function POST(request: NextRequest) {
  const endpoint = "/api/mccs/courses"
  
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "Database configuration missing",
      code: "DATABASE_NOT_READY"
    }, { status: 503 })
  }

  const auth = await checkAdminAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Validate the request body
    const validationResult = completeCourseSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const data = validationResult.data

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug: data.slug }
    })

    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: "A course with this slug already exists" },
        { status: 409 }
      )
    }

    // Use Prisma Transaction for atomic operations
    const course = await prisma.$transaction(async (tx) => {
      // Create the course
      const newCourse = await tx.course.create({
        data: {
          title: data.title,
          slug: data.slug,
          categoryId: data.categoryId,
          difficultyLevelId: data.difficultyLevelId,
          shortDescription: data.shortDescription,
          fullDescription: data.fullDescription,
          targetAudience: data.targetAudience,
          language: data.language,
          durationHours: data.durationHours,
          thumbnailUrl: data.thumbnailUrl,
          introVideoUrl: data.introVideoUrl,
          promoVideoUrl: data.promoVideoUrl,
          trailerVideoUrl: data.trailerVideoUrl,
          price: data.isFree ? 0 : (data.price || 0),
          isFree: data.isFree,
          pricing: data.pricing,
          status: data.status || "DRAFT",
          isActive: data.isActive !== false,
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          keywords: data.keywords,
        },
        include: {
          category: true,
          difficultyLevel: true,
        }
      })

      // Create SEO settings if provided
      if (data.metaTitle || data.metaDescription || data.keywords) {
        await tx.courseSeoSettings.create({
          data: {
            courseId: newCourse.id,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            keywords: data.keywords || [],
          }
        })
      }

      // Create learning outcomes
      if (data.learningOutcomes && data.learningOutcomes.length > 0) {
        await tx.courseLearningOutcome.createMany({
          data: data.learningOutcomes.map((lo, index) => ({
            courseId: newCourse.id,
            outcome: lo.outcome,
            orderIndex: index,
          }))
        })
      }

      // Create objectives
      if (data.objectives && data.objectives.length > 0) {
        await tx.courseObjective.createMany({
          data: data.objectives.map((obj, index) => ({
            courseId: newCourse.id,
            objective: obj.objective,
            orderIndex: index,
          }))
        })
      }

      // Create modules with lessons
      if (data.modules && data.modules.length > 0) {
        for (let moduleIndex = 0; moduleIndex < data.modules.length; moduleIndex++) {
          const moduleData = data.modules[moduleIndex]
          
          const newModule = await tx.module.create({
            data: {
              courseId: newCourse.id,
              title: moduleData.title,
              description: moduleData.description,
              orderIndex: moduleIndex,
              isPreview: moduleData.isPreview,
            }
          })

          // Create lessons within the module
          if (moduleData.lessons && moduleData.lessons.length > 0) {
            for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
              const lessonData = moduleData.lessons[lessonIndex]
              
              await tx.lesson.create({
                data: {
                  courseId: newCourse.id,
                  moduleId: newModule.id,
                  title: lessonData.title,
                  description: lessonData.description,
                  orderIndex: lessonIndex,
                  lessonType: lessonData.lessonType,
                  videoUrl: lessonData.videoUrl,
                  videoDuration: lessonData.videoDuration,
                  isPreview: lessonData.isPreview,
                  isFree: lessonData.isFree,
                  isActive: lessonData.isActive,
                  content: lessonData.content,
                }
              })
            }
          }
        }
      }

      // Create software requirements
      if (data.software && data.software.length > 0) {
        await tx.courseSoftware.createMany({
          data: data.software.map((sw, index) => ({
            courseId: newCourse.id,
            name: sw.name,
            version: sw.version,
            websiteUrl: sw.websiteUrl,
            installInstructions: sw.installInstructions,
            isRequired: sw.isRequired,
            orderIndex: index,
          }))
        })
      }

      // Create resources
      if (data.resources && data.resources.length > 0) {
        await tx.courseResource.createMany({
          data: data.resources.map((res, index) => ({
            courseId: newCourse.id,
            title: res.title,
            type: res.type,
            url: res.url,
            description: res.description,
            isDownloadable: res.isDownloadable,
            orderIndex: index,
          }))
        })
      }

      // Create datasets
      if (data.datasets && data.datasets.length > 0) {
        await tx.courseDataset.createMany({
          data: data.datasets.map((ds, index) => ({
            courseId: newCourse.id,
            name: ds.name,
            description: ds.description,
            sourceUrl: ds.sourceUrl,
            downloadUrl: ds.downloadUrl,
            fileSize: ds.fileSize,
            format: ds.format,
            license: ds.license,
            isRequired: ds.isRequired,
            orderIndex: index,
          }))
        })
      }

      // Create career outcomes
      if (data.careerOutcomes && data.careerOutcomes.length > 0) {
        await tx.careerOutcome.createMany({
          data: data.careerOutcomes.map((co, index) => ({
            courseId: newCourse.id,
            title: co.title,
            description: co.description,
            probability: co.probability,
            salaryRange: co.salaryRange,
            orderIndex: index,
          }))
        })
      }

      // Create prerequisites
      if (data.prerequisites && data.prerequisites.length > 0) {
        await tx.prerequisite.createMany({
          data: data.prerequisites.map(pr => ({
            courseId: newCourse.id,
            prerequisiteCourseId: pr.prerequisiteCourseId,
            isRequired: pr.isRequired,
            minimumGrade: pr.minimumGrade,
            description: pr.description,
          }))
        })
      }

      return newCourse
    }, {
      timeout: 30000, // 30 second timeout
      maxWait: 5000,  // 5 second max wait
    })

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          module: "MCCS_COURSES",
          userId: auth.userId,
          details: {
            courseId: course.id,
            title: course.title,
            slug: course.slug,
            status: course.status,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          status: course.status,
        }
      },
      message: "Course created successfully with all content"
    }, { status: 201 })

  } catch (error) {
    console.error("Create course error:", error)
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({
        success: false,
        error: "A course with this identifier already exists"
      }, { status: 409 })
    }
    
    if (error instanceof Error && error.message.includes("Foreign key constraint")) {
      return NextResponse.json({
        success: false,
        error: "Referenced resource does not exist"
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create course" },
      { status: 500 }
    )
  }
}
