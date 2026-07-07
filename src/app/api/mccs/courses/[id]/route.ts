import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { basicInfoSchema, brandingMediaSchema, learningInfoSchema, pricingSchema, seoSchema, publishingSchema, prerequisitesSchema } from "@/lib/validations/mccs"

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

// GET /api/mccs/courses/[id] - Get single course with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const endpoint = `/api/mccs/courses/${id}`
  
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
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        difficultyLevel: true,
        seoSettings: true,
        modules: {
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { orderIndex: 'asc' },
              include: {
                practicalExercises: {
                  where: { isPublished: true }
                }
              }
            },
            practicalExercises: {
              where: { isPublished: true }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        miniProjects: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' }
        },
        learningOutcomes: {
          orderBy: { orderIndex: 'asc' }
        },
        objectives: {
          orderBy: { orderIndex: 'asc' }
        },
        prerequisites: {
          include: {
            prerequisiteCourse: {
              select: { id: true, title: true, slug: true }
            }
          }
        },
        software: {
          orderBy: { orderIndex: 'asc' }
        },
        resources: {
          orderBy: { orderIndex: 'asc' }
        },
        datasets: {
          orderBy: { orderIndex: 'asc' }
        },
        careerOutcomes: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        course: {
          ...course,
          price: Number(course.price),
          learningOutcomes: course.learningOutcomes,
          objectives: course.objectives,
          software: course.software,
          resources: course.resources,
          datasets: course.datasets,
          careerOutcomes: course.careerOutcomes,
          stats: {
            enrollments: course._count.enrollments,
            modules: course.modules.length,
            lessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
          }
        }
      }
    })
  } catch (error) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch course"
    }, { status: 500 })
  }
}

// PUT /api/mccs/courses/[id] - Update course with transactional support
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const endpoint = `/api/mccs/courses/${id}`
  
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
    const { section, data } = body

    // Verify course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Handle partial updates based on section
    let updatedCourse;

    switch (section) {
      case 'basic':
        const basicValidation = basicInfoSchema.safeParse(data)
        if (!basicValidation.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: basicValidation.error.flatten().fieldErrors
          }, { status: 400 })
        }

        // Check slug uniqueness if changed
        if (data.slug && data.slug !== existingCourse.slug) {
          const slugExists = await prisma.course.findUnique({
            where: { slug: data.slug }
          })
          if (slugExists) {
            return NextResponse.json(
              { success: false, error: "Slug already in use" },
              { status: 409 }
            )
          }
        }

        updatedCourse = await prisma.course.update({
          where: { id },
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
          }
        })
        break;

      case 'branding':
        const brandingValidation = brandingMediaSchema.safeParse(data)
        if (!brandingValidation.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: brandingValidation.error.flatten().fieldErrors
          }, { status: 400 })
        }

        updatedCourse = await prisma.course.update({
          where: { id },
          data: {
            thumbnailUrl: data.thumbnailUrl,
            introVideoUrl: data.introVideoUrl,
            promoVideoUrl: data.promoVideoUrl,
            trailerVideoUrl: data.trailerVideoUrl,
          }
        })
        break;

      case 'learning':
        const learningValidation = learningInfoSchema.safeParse(data)
        if (!learningValidation.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: learningValidation.error.flatten().fieldErrors
          }, { status: 400 })
        }

        // Use transaction for learning outcomes and objectives
        updatedCourse = await prisma.$transaction(async (tx) => {
          // Delete existing learning outcomes
          await tx.courseLearningOutcome.deleteMany({
            where: { courseId: id }
          })

          // Create new learning outcomes
          if (data.learningOutcomes && data.learningOutcomes.length > 0) {
            await tx.courseLearningOutcome.createMany({
              data: data.learningOutcomes.map((lo: { outcome: string }, index: number) => ({
                courseId: id,
                outcome: lo.outcome,
                orderIndex: index,
              }))
            })
          }

          // Delete existing objectives
          await tx.courseObjective.deleteMany({
            where: { courseId: id }
          })

          // Create new objectives
          if (data.objectives && data.objectives.length > 0) {
            await tx.courseObjective.createMany({
              data: data.objectives.map((obj: { objective: string }, index: number) => ({
                courseId: id,
                objective: obj.objective,
                orderIndex: index,
              }))
            })
          }

          return tx.course.findUnique({ where: { id } })
        })
        break;

      case 'prerequisites':
        const prereqValidation = prerequisitesSchema.safeParse(data)
        if (!prereqValidation.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: prereqValidation.error.flatten().fieldErrors
          }, { status: 400 })
        }

        updatedCourse = await prisma.$transaction(async (tx) => {
          // Delete existing prerequisites
          await tx.prerequisite.deleteMany({
            where: { courseId: id }
          })

          // Create new prerequisites
          if (data.prerequisites && data.prerequisites.length > 0) {
            await tx.prerequisite.createMany({
              data: data.prerequisites.map((pr: { prerequisiteCourseId: string; isRequired: boolean; minimumGrade?: number; description?: string }) => ({
                courseId: id,
                prerequisiteCourseId: pr.prerequisiteCourseId,
                isRequired: pr.isRequired,
                minimumGrade: pr.minimumGrade,
                description: pr.description,
              }))
            })
          }

          return tx.course.findUnique({ where: { id } })
        })
        break;

      case 'pricing':
        const pricingValidation = pricingSchema.safeParse(data)
        if (!pricingValidation.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: pricingValidation.error.flatten().fieldErrors
          }, { status: 400 })
        }

        updatedCourse = await prisma.course.update({
          where: { id },
          data: {
            price: data.isFree ? 0 : (data.price || 0),
            isFree: data.isFree,
            pricing: data.pricing,
          }
        })
        break;

      case 'seo':
        const seoValidation = seoSchema.safeParse(data)
        if (!seoValidation.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: seoValidation.error.flatten().fieldErrors
          }, { status: 400 })
        }

        updatedCourse = await prisma.$transaction(async (tx) => {
          // Update or create SEO settings
          await tx.courseSeoSettings.upsert({
            where: { courseId: id },
            create: {
              courseId: id,
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              keywords: data.keywords || [],
            },
            update: {
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              keywords: data.keywords || [],
            }
          })

          // Also update course-level SEO fields
          return tx.course.update({
            where: { id },
            data: {
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              keywords: data.keywords,
            }
          })
        })
        break;

      case 'publishing':
        const publishingValidation = publishingSchema.safeParse(data)
        if (!publishingValidation.success) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: publishingValidation.error.flatten().fieldErrors
          }, { status: 400 })
        }

        const previousStatus = existingCourse.status
        const isPublishing = data.status === "PUBLISHED" && previousStatus !== "PUBLISHED"

        updatedCourse = await prisma.course.update({
          where: { id },
          data: {
            status: data.status,
            isActive: data.isActive,
            publishedAt: isPublishing ? new Date() : existingCourse.publishedAt,
          }
        })
        break;

      case 'full':
      default:
        // Full course update with transaction
        updatedCourse = await prisma.$transaction(async (tx) => {
          // Update course basic info
          const updated = await tx.course.update({
            where: { id },
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
              status: data.status || existingCourse.status,
              isActive: data.isActive,
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              keywords: data.keywords,
            }
          })

          // Handle related data updates if provided
          if (data.learningOutcomes !== undefined) {
            await tx.courseLearningOutcome.deleteMany({ where: { courseId: id } })
            if (data.learningOutcomes?.length > 0) {
              await tx.courseLearningOutcome.createMany({
                data: data.learningOutcomes.map((lo: { outcome: string }, index: number) => ({
                  courseId: id,
                  outcome: lo.outcome,
                  orderIndex: index,
                }))
              })
            }
          }

          if (data.objectives !== undefined) {
            await tx.courseObjective.deleteMany({ where: { courseId: id } })
            if (data.objectives?.length > 0) {
              await tx.courseObjective.createMany({
                data: data.objectives.map((obj: { objective: string }, index: number) => ({
                  courseId: id,
                  objective: obj.objective,
                  orderIndex: index,
                }))
              })
            }
          }

          if (data.prerequisites !== undefined) {
            await tx.prerequisite.deleteMany({ where: { courseId: id } })
            if (data.prerequisites?.length > 0) {
              await tx.prerequisite.createMany({
                data: data.prerequisites.map((pr: { prerequisiteCourseId: string; isRequired: boolean; minimumGrade?: number; description?: string }) => ({
                  courseId: id,
                  prerequisiteCourseId: pr.prerequisiteCourseId,
                  isRequired: pr.isRequired,
                  minimumGrade: pr.minimumGrade,
                  description: pr.description,
                }))
              })
            }
          }

          return updated
        })
    }

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "MCCS_COURSES",
          userId: auth.userId,
          details: {
            courseId: id,
            section: section,
            title: updatedCourse?.title,
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
          id: updatedCourse?.id,
          title: updatedCourse?.title,
          slug: updatedCourse?.slug,
          status: updatedCourse?.status,
        }
      },
      message: `Course ${section || 'basic'} updated successfully`
    })

  } catch (error) {
    console.error(`[${endpoint}] Error:`, error)
    
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({
        success: false,
        error: "A course with this identifier already exists"
      }, { status: 409 })
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update course" },
      { status: 500 }
    )
  }
}

// DELETE /api/mccs/courses/[id] - Delete course with cascading
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const endpoint = `/api/mccs/courses/${id}`
  
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
    // Verify course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // Warn if course has enrollments
    if (existingCourse._count.enrollments > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete course with ${existingCourse._count.enrollments} active enrollments. Archive the course instead.`
      }, { status: 400 })
    }

    // Use transaction for cascading deletes
    await prisma.$transaction(async (tx) => {
      // Delete related records in order (due to foreign keys)
      await tx.courseLearningOutcome.deleteMany({ where: { courseId: id } })
      await tx.courseObjective.deleteMany({ where: { courseId: id } })
      await tx.prerequisite.deleteMany({ where: { courseId: id } })
      await tx.careerOutcome.deleteMany({ where: { courseId: id } })
      await tx.courseResource.deleteMany({ where: { courseId: id } })
      await tx.courseSoftware.deleteMany({ where: { courseId: id } })
      await tx.courseDataset.deleteMany({ where: { courseId: id } })
      await tx.courseSeoSettings.deleteMany({ where: { courseId: id } })
      
      // Delete mini projects and their submissions
      const miniProjects = await tx.miniProject.findMany({
        where: { courseId: id },
        select: { id: true }
      })
      for (const project of miniProjects) {
        await tx.projectSubmission.deleteMany({ where: { projectId: project.id } })
      }
      await tx.miniProject.deleteMany({ where: { courseId: id } })
      
      // Delete lessons and their practical exercises and submissions
      const lessons = await tx.lesson.findMany({
        where: { courseId: id },
        select: { id: true }
      })
      for (const lesson of lessons) {
        const exercises = await tx.practicalExercise.findMany({
          where: { lessonId: lesson.id },
          select: { id: true }
        })
        for (const exercise of exercises) {
          await tx.exerciseSubmission.deleteMany({ where: { exerciseId: exercise.id } })
        }
        await tx.practicalExercise.deleteMany({ where: { lessonId: lesson.id } })
        await tx.userLectureProgress.deleteMany({ where: { lessonId: lesson.id } })
        await tx.learningProgress.deleteMany({ where: { lessonId: lesson.id } })
        await tx.material.deleteMany({ where: { lessonId: lesson.id } })
        await tx.video.deleteMany({ where: { lessonId: lesson.id } })
      }
      await tx.lesson.deleteMany({ where: { courseId: id } })
      
      // Delete modules (practical exercises at module level)
      const modules = await tx.module.findMany({
        where: { courseId: id },
        select: { id: true }
      })
      for (const module of modules) {
        await tx.practicalExercise.deleteMany({ where: { moduleId: module.id } })
      }
      await tx.module.deleteMany({ where: { courseId: id } })
      
      // Delete course from difficulty level capstones
      await tx.difficultyLevelCapstoneCourse.deleteMany({ where: { courseId: id } })
      
      // Delete wishlists
      await tx.wishlist.deleteMany({ where: { courseId: id } })
      
      // Finally delete the course
      await tx.course.delete({ where: { id } })
    })

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          module: "MCCS_COURSES",
          userId: auth.userId,
          details: {
            courseId: id,
            title: existingCourse.title,
            slug: existingCourse.slug,
          },
        },
      })
    } catch (auditError) {
      console.error("Audit log error:", auditError)
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully"
    })

  } catch (error) {
    console.error(`[${endpoint}] Error:`, error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete course" },
      { status: 500 }
    )
  }
}
