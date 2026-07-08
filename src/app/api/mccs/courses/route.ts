import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/mccs/courses - Get all courses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const categoryId = searchParams.get("categoryId") || ""
  const status = searchParams.get("status") || ""

  try {
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (status && status !== "all") {
      where.status = status
    }

    const [courses, total, categories] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: true,
          modules: {
            include: {
              lessons: {
                where: { isActive: true }
              }
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.course.count({ where }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { orderIndex: 'asc' }
      })
    ])

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      status: course.status,
      category: course.category?.name || null,
      categoryId: course.categoryId,
      price: Number(course.price),
      isFree: course.isFree,
      isActive: course.isActive,
      thumbnailUrl: course.thumbnailUrl,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      stats: {
        enrollments: course._count.enrollments,
        modules: course.modules.length,
        lessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
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
          categories
        }
      }
    })
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch courses"
    }, { status: 500 })
  }
}

// POST /api/mccs/courses - Create a new course with MCCS data (transactional)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title, slug, categoryId, difficultyLevel, language,
      shortDescription, fullDescription, targetAudience,
      thumbnailUrl, promoVideoUrl, introVideoUrl,
      isFree, price, status,
      durationHours, instructorId,
      whatYouWillLearn, objectives, requirements,
      software, datasets, careerOutcomes, resources,
      metaTitle, metaDescription, keywords
    } = body

    // Validation
    if (!title || !slug || !categoryId) {
      return NextResponse.json({
        success: false,
        error: "Title, slug, and category are required"
      }, { status: 400 })
    }

    // Check slug uniqueness
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return NextResponse.json({
        success: false,
        error: "A course with this slug already exists"
      }, { status: 409 })
    }

    // Use Prisma Transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Create main course
      const course = await tx.course.create({
        data: {
          title,
          slug,
          categoryId,
          difficultyLevel: difficultyLevel || null,
          language: language || "English",
          shortDescription: shortDescription || "",
          fullDescription: fullDescription || null,
          targetAudience: targetAudience || null,
          thumbnailUrl: thumbnailUrl || null,
          promoVideoUrl: promoVideoUrl || null,
          introVideoUrl: introVideoUrl || null,
          price: isFree ? 0 : (price || 0),
          isFree: isFree ?? true,
          status: status || "DRAFT",
          isActive: true,
          durationHours: durationHours || null,
          instructorId: instructorId || null,
          whatYouWillLearn: whatYouWillLearn || null,
          requirements: requirements || null,
        },
        include: {
          category: true
        }
      })

      // Create learning outcomes
      if (whatYouWillLearn && whatYouWillLearn.length > 0) {
        await tx.courseLearningOutcome.createMany({
          data: whatYouWillLearn.map((outcome: string, index: number) => ({
            courseId: course.id,
            outcome,
            orderIndex: index,
          }))
        })
      }

      // Create objectives
      if (objectives && objectives.length > 0) {
        await tx.courseObjective.createMany({
          data: objectives.map((objective: string, index: number) => ({
            courseId: course.id,
            objective,
            orderIndex: index,
          }))
        })
      }

      // Create prerequisites
      if (requirements && requirements.length > 0) {
        await tx.prerequisite.createMany({
          data: requirements.map((req: string, index: number) => ({
            courseId: course.id,
            title: req,
            type: "skill",
            orderIndex: index,
          }))
        })
      }

      // Create software
      if (software && software.length > 0) {
        await tx.courseSoftware.createMany({
          data: software.map((sw: any, index: number) => ({
            courseId: course.id,
            name: sw.name,
            version: sw.version || null,
            url: sw.url || null,
            description: sw.description || null,
            isRequired: sw.isRequired ?? true,
            orderIndex: index,
          }))
        })
      }

      // Create datasets
      if (datasets && datasets.length > 0) {
        await tx.courseDataset.createMany({
          data: datasets.map((ds: any, index: number) => ({
            courseId: course.id,
            name: ds.name,
            description: ds.description || null,
            sourceUrl: ds.sourceUrl || null,
            fileUrl: ds.fileUrl || null,
            isDownloadable: ds.isDownloadable ?? false,
            orderIndex: index,
          }))
        })
      }

      // Create career outcomes
      if (careerOutcomes && careerOutcomes.length > 0) {
        await tx.careerOutcome.createMany({
          data: careerOutcomes.map((co: any, index: number) => ({
            courseId: course.id,
            title: co.title,
            description: co.description || null,
            icon: co.icon || null,
            orderIndex: index,
          }))
        })
      }

      // Create resources
      if (resources && resources.length > 0) {
        await tx.courseResource.createMany({
          data: resources.map((res: any, index: number) => ({
            courseId: course.id,
            title: res.title,
            description: res.description || null,
            type: res.type || "link",
            url: res.url,
            isDownloadable: res.isDownloadable ?? true,
            orderIndex: index,
          }))
        })
      }

      // Create SEO
      if (metaTitle || metaDescription || keywords) {
        await tx.courseSEO.create({
          data: {
            courseId: course.id,
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            keywords: keywords || [],
          }
        })
      }

      // Create initial version
      await tx.courseVersion.create({
        data: {
          courseId: course.id,
          version: 1,
          changes: "Initial course creation",
        }
      })

      return course
    })

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: result.id,
          title: result.title,
          slug: result.slug,
          status: result.status,
          category: result.category?.name || null,
        }
      },
      message: "Course created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create course"
    }, { status: 500 })
  }
}
