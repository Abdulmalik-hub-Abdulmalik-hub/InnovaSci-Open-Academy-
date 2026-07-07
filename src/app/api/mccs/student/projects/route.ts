import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

// GET /api/mccs/student/projects - Get available projects for student
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
    // Get user's enrolled courses and their progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  where: { isActive: true }
                }
              }
            },
            miniProjects: {
              where: { isPublished: true }
            }
          }
        }
      }
    })

    // Get user's completed courses
    const completedCourses = await prisma.enrollment.findMany({
      where: {
        userId,
        status: "completed"
      },
      select: {
        courseId: true
      }
    })
    const completedCourseIds = completedCourses.map(c => c.courseId)

    // Get user's exercise submissions
    const exerciseSubmissions = await prisma.exerciseSubmission.findMany({
      where: { userId },
      select: {
        exerciseId: true,
        status: true,
        score: true
      }
    })
    const submittedExerciseIds = exerciseSubmissions.map(s => s.exerciseId)

    // Get user's project submissions
    const projectSubmissions = await prisma.projectSubmission.findMany({
      where: { userId },
      select: {
        projectId: true,
        status: true,
        score: true
      }
    })
    const submittedProjectIds = projectSubmissions.map(s => s.projectId)

    // Build available projects list
    const projects: Array<{
      id: string
      title: string
      description?: string
      type: "exercise" | "mini-project" | "difficulty-capstone" | "professional-capstone"
      courseId?: string
      courseTitle?: string
      difficultyLevel?: string
      category?: string
      status: "locked" | "available" | "in-progress" | "submitted" | "completed"
      progress?: number
      deadline?: string
      isTeamProject?: boolean
    }> = []

    // Add mini-projects from enrolled courses
    for (const enrollment of enrollments) {
      const course = enrollment.course
      const progress = enrollment.progressPercent

      for (const project of course.miniProjects) {
        const hasSubmission = submittedProjectIds.includes(project.id)
        const isCompleted = hasSubmission && 
          projectSubmissions.find(s => s.projectId === project.id)?.status === "ACCEPTED"

        projects.push({
          id: project.id,
          title: project.title,
          description: project.description || undefined,
          type: "mini-project",
          courseId: course.id,
          courseTitle: course.title,
          difficultyLevel: course.difficultyLevel || undefined,
          status: isCompleted
            ? "completed"
            : hasSubmission
            ? "submitted"
            : progress >= 80
            ? "available"
            : "in-progress",
          progress: progress,
          deadline: project.deadline?.toISOString(),
        })
      }

      // Add practical exercises from course modules
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          // Get exercises for this lesson
          const exercises = await prisma.practicalExercise.findMany({
            where: {
              lessonId: lesson.id,
              isPublished: true
            }
          })

          for (const exercise of exercises) {
            const hasSubmission = submittedExerciseIds.includes(exercise.id)
            const isCompleted = hasSubmission &&
              exerciseSubmissions.find(s => s.exerciseId === exercise.id)?.status === "GRADED"

            projects.push({
              id: exercise.id,
              title: exercise.title,
              description: exercise.description || undefined,
              type: "exercise",
              courseId: course.id,
              courseTitle: course.title,
              status: isCompleted
                ? "completed"
                : hasSubmission
                ? "submitted"
                : progress >= 50
                ? "available"
                : "locked",
              progress: progress,
            })
          }
        }
      }
    }

    // Get difficulty level capstones
    const completedDifficultyLevels = new Set<string>()
    for (const courseId of completedCourseIds) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { difficultyLevelId: true }
      })
      if (course?.difficultyLevelId) {
        completedDifficultyLevels.add(course.difficultyLevelId)
      }
    }

    const difficultyCapstones = await prisma.difficultyLevelCapstone.findMany({
      where: { isActive: true },
      include: {
        difficultyLevel: {
          include: {
            category: true
          }
        },
        courses: {
          include: {
            course: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      }
    })

    for (const capstone of difficultyCapstones) {
      const submissions = await prisma.capstoneSubmission.findMany({
        where: {
          capstoneId: capstone.id,
          userId
        }
      })

      const isCompleted = submissions.some(s => s.status === "CERTIFIED")
      const hasSubmission = submissions.length > 0

      // Check if all required courses are completed
      const requiredCourses = capstone.courses.filter(c => c.isRequired)
      const completedRequiredCourses = requiredCourses.filter(c =>
        completedCourseIds.includes(c.courseId)
      )

      const allRequiredCompleted = completedRequiredCourses.length >= capstone.requiredCourses

      projects.push({
        id: capstone.id,
        title: capstone.title,
        description: capstone.description || undefined,
        type: "difficulty-capstone",
        difficultyLevel: capstone.difficultyLevel?.name,
        category: capstone.difficultyLevel?.category?.name,
        status: isCompleted
          ? "completed"
          : hasSubmission
          ? "submitted"
          : allRequiredCompleted
          ? "available"
          : "locked",
        deadline: undefined,
      })
    }

    // Get professional capstones
    const completedCategories = new Set<string>()
    for (const courseId of completedCourseIds) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { categoryId: true }
      })
      if (course?.categoryId) {
        completedCategories.add(course.categoryId)
      }
    }

    const professionalCapstones = await prisma.professionalCapstone.findMany({
      where: { isActive: true },
      include: {
        category: true,
        _count: {
          select: { submissions: true }
        }
      }
    })

    for (const capstone of professionalCapstones) {
      const submissions = await prisma.professionalCapstoneSubmission.findMany({
        where: {
          capstoneId: capstone.id,
          userId
        }
      })

      const isCompleted = submissions.some(s => s.status === "CERTIFIED")
      const hasSubmission = submissions.length > 0
      const categoryCompleted = completedCategories.has(capstone.categoryId)

      projects.push({
        id: capstone.id,
        title: capstone.title,
        description: capstone.description || undefined,
        type: "professional-capstone",
        category: capstone.category?.name,
        status: isCompleted
          ? "completed"
          : hasSubmission
          ? "submitted"
          : categoryCompleted
          ? "available"
          : "locked",
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        projects,
        enrolledCourses: enrollments.map(e => ({
          id: e.course.id,
          title: e.course.title,
          progress: e.progressPercent,
          totalLessons: e.course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
        })),
        completedCourses: completedCourseIds,
      }
    })

  } catch (error) {
    console.error("Error fetching student projects:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch projects"
    }, { status: 500 })
  }
}
