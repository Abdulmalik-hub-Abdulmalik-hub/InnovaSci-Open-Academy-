import { prisma } from "@/lib/prisma"

// Types for certificate eligibility
export interface EligibilityRequirements {
  courses: {
    required: number
    completed: number
    courseIds: string[]
  }
  lessons: {
    required: number
    completed: number
    lessonIds: string[]
  }
  exercises: {
    required: number
    completed: number
    exerciseIds: string[]
  }
  miniProjects: {
    required: number
    completed: number
    projectIds: string[]
  }
  capstones: {
    required: number
    completed: number
    capstoneIds: string[]
  }
  categoryCertificates?: {
    required: number
    completed: number
    certificateIds: string[]
  }
}

export interface EligibilityResult {
  isEligible: boolean
  requirements: EligibilityRequirements
  missingRequirements: string[]
  completedRequirements: string[]
  overallProgress: number
}

// Generate unique certificate code
export function generateCertificateCode(type: "CAT" | "DOM" | "CRS"): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${type}-CERT-${year}-${random}`
}

// Check category certificate eligibility
export async function checkCategoryCertificateEligibility(
  userId: string,
  categoryCertificateId: string
): Promise<EligibilityResult> {
  const result: EligibilityResult = {
    isEligible: false,
    requirements: {
      courses: { required: 0, completed: 0, courseIds: [] },
      lessons: { required: 0, completed: 0, lessonIds: [] },
      exercises: { required: 0, completed: 0, exerciseIds: [] },
      miniProjects: { required: 0, completed: 0, projectIds: [] },
      capstones: { required: 0, completed: 0, capstoneIds: [] },
    },
    missingRequirements: [],
    completedRequirements: [],
    overallProgress: 0,
  }

  try {
    // Get category certificate with requirements
    const catCert = await prisma.categoryCertificate.findUnique({
      where: { id: categoryCertificateId },
      include: {
        category: {
          include: {
            courses: {
              where: { isActive: true, status: "published" },
              include: {
                lessons: { where: { isActive: true } },
                modules: {
                  include: {
                    lessons: { where: { isActive: true } },
                  },
                },
                miniProjects: { where: { isRequired: true } },
              },
            },
          },
        },
      },
    })

    if (!catCert || !catCert.category) {
      return result
    }

    const courses = catCert.category.courses
    const courseIds = courses.map(c => c.id)

    // Get user's enrolled and completed courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        courseId: { in: courseIds },
      },
    })

    const completedEnrollments = enrollments.filter(e => e.completed)
    result.requirements.courses.required = courseIds.length
    result.requirements.courses.completed = completedEnrollments.length
    result.requirements.courses.courseIds = completedEnrollments.map(e => e.courseId)

    // Get user's lesson progress
    const lessonProgress = await prisma.userLectureProgress.findMany({
      where: {
        userId,
        courseId: { in: courseIds },
        completed: true,
      },
    })

    // Count total lessons
    const totalLessons = courses.reduce((sum, course) => {
      const directLessons = course.lessons?.length || 0
      const moduleLessons = course.modules?.reduce(
        (mSum, mod) => mSum + (mod.lessons?.length || 0),
        0
      ) || 0
      return sum + directLessons + moduleLessons
    }, 0)

    const uniqueCompletedLessons = new Set(lessonProgress.map(lp => lp.lessonId))
    result.requirements.lessons.required = totalLessons
    result.requirements.lessons.completed = uniqueCompletedLessons.size
    result.requirements.lessons.lessonIds = Array.from(uniqueCompletedLessons)

    // Note: Exercise progress tracking would require additional models
    // For now, we track exercises as part of lessons completed
    result.requirements.exercises.required = 0 // Placeholder
    result.requirements.exercises.completed = 0
    result.requirements.exercises.exerciseIds = []

    // Get mini project progress
    const miniProjects = courses.flatMap(c => c.miniProjects || [])
    const miniProjectIds = miniProjects.map(mp => mp.id)

    const miniProjectSubmissions = await prisma.projectSubmission.findMany({
      where: {
        userId,
        miniProjectId: { in: miniProjectIds },
        status: "graded",
        grade: { gte: 70 },
      },
    })

    result.requirements.miniProjects.required = miniProjectIds.length
    result.requirements.miniProjects.completed = miniProjectSubmissions.length
    result.requirements.miniProjects.projectIds = miniProjectSubmissions.map(mp => mp.miniProjectId).filter((id): id is string => id !== null)

    // Get difficulty capstone progress - simplified query
    // Note: Full JSON-based filtering for capstones would require raw queries
    // For now, we count all published capstones in the category
    const difficultyCapstones = await prisma.difficultyLevelCapstone.findMany({
      where: {
        isPublished: true,
      },
    })

    const capstoneEnrollments = await prisma.capstoneEnrollment.findMany({
      where: {
        userId,
        difficultyCapstoneId: { in: difficultyCapstones.map(dc => dc.id) },
        status: "graded",
        grade: { gte: 70 },
      },
    })

    result.requirements.capstones.required = difficultyCapstones.length
    result.requirements.capstones.completed = capstoneEnrollments.length
    result.requirements.capstones.capstoneIds = capstoneEnrollments.map(ce => ce.difficultyCapstoneId).filter((id): id is string => id !== null)

    // Check professional capstone
    const professionalCapstone = await prisma.professionalCapstone.findFirst({
      where: {
        categoryId: catCert.categoryId,
        isPublished: true,
      },
    })

    let hasProfessionalCapstone = false
    if (professionalCapstone) {
      hasProfessionalCapstone = true
      const profCapEnrollment = await prisma.capstoneEnrollment.findFirst({
        where: {
          userId,
          professionalCapstoneId: professionalCapstone.id,
          status: "graded",
          grade: { gte: 70 },
        },
      })

      if (!profCapEnrollment) {
        result.missingRequirements.push("Professional Capstone Project")
      } else {
        result.requirements.capstones.completed += 1
        result.requirements.capstones.capstoneIds.push(profCapEnrollment.professionalCapstoneId!)
      }
    }

    // Calculate overall progress
    const totalItems =
      result.requirements.courses.required +
      result.requirements.miniProjects.required +
      result.requirements.capstones.required +
      (hasProfessionalCapstone ? 1 : 0)
    const completedItems =
      result.requirements.courses.completed +
      result.requirements.miniProjects.completed +
      result.requirements.capstones.completed

    result.overallProgress =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    // Determine eligibility
    result.isEligible =
      result.requirements.courses.completed === result.requirements.courses.required &&
      result.requirements.miniProjects.completed === result.requirements.miniProjects.required

    // Populate completed/missing requirements
    if (result.requirements.courses.completed === result.requirements.courses.required) {
      result.completedRequirements.push("All Courses Completed")
    } else {
      result.missingRequirements.push(
        `${result.requirements.courses.required - result.requirements.courses.completed} more courses required`
      )
    }

    if (result.requirements.miniProjects.completed === result.requirements.miniProjects.required) {
      result.completedRequirements.push("All Mini Projects Completed")
    } else if (result.requirements.miniProjects.required > 0) {
      result.missingRequirements.push(
        `${result.requirements.miniProjects.required - result.requirements.miniProjects.completed} more mini projects required`
      )
    }

    return result
  } catch (error) {
    console.error("Error checking category certificate eligibility:", error)
    return result
  }
}

// Check domain certificate eligibility
export async function checkDomainCertificateEligibility(
  userId: string,
  domainCertificateId: string
): Promise<EligibilityResult> {
  const result: EligibilityResult = {
    isEligible: false,
    requirements: {
      courses: { required: 0, completed: 0, courseIds: [] },
      lessons: { required: 0, completed: 0, lessonIds: [] },
      exercises: { required: 0, completed: 0, exerciseIds: [] },
      miniProjects: { required: 0, completed: 0, projectIds: [] },
      capstones: { required: 0, completed: 0, capstoneIds: [] },
      categoryCertificates: { required: 0, completed: 0, certificateIds: [] },
    },
    missingRequirements: [],
    completedRequirements: [],
    overallProgress: 0,
  }

  try {
    // Get domain certificate
    const domainCert = await prisma.domainCertificate.findUnique({
      where: { id: domainCertificateId },
      include: {
        domain: {
          include: {
            categories: {
              where: { isActive: true },
              include: {
                courses: { where: { isActive: true, status: "published" } },
                categoryCertificate: true,
              },
            },
          },
        },
      },
    })

    if (!domainCert || !domainCert.domain) {
      return result
    }

    const categories = domainCert.domain.categories
    const categoryCerts = categories
      .filter(c => c.categoryCertificate)
      .map(c => c.categoryCertificate!)
    const categoryCertIds = categoryCerts.map(cc => cc.id)

    // Check if user has earned all category certificates
    const earnedCatCerts = await prisma.categoryIssuedCert.findMany({
      where: {
        userId,
        categoryCertificateId: { in: categoryCertIds },
        status: "ACTIVE",
      },
    })

    result.requirements.categoryCertificates = {
      required: categoryCertIds.length,
      completed: earnedCatCerts.length,
      certificateIds: earnedCatCerts.map(ec => ec.id),
    }

    // For courses/lessons progress (for display purposes)
    const allCourseIds = categories.flatMap(c => c.courses.map(cr => cr.id))

    if (allCourseIds.length > 0) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: allCourseIds },
        },
      })

      const completedEnrollments = enrollments.filter(e => e.completed)
      result.requirements.courses.required = allCourseIds.length
      result.requirements.courses.completed = completedEnrollments.length
      result.requirements.courses.courseIds = completedEnrollments.map(e => e.courseId)
    }

    // Calculate overall progress
    const totalItems = categoryCertIds.length
    const completedItems = earnedCatCerts.length

    result.overallProgress =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    // Determine eligibility
    result.isEligible =
      result.requirements.categoryCertificates.completed ===
      result.requirements.categoryCertificates.required

    // Populate requirements list
    if (result.requirements.categoryCertificates.completed === result.requirements.categoryCertificates.required) {
      result.completedRequirements.push("All Category Certificates Earned")
    } else {
      const earnedCatIds = earnedCatCerts.map(ec => ec.categoryCertificateId)
      const missingCats = categories.filter(
        c => c.categoryCertificate && !earnedCatIds.includes(c.categoryCertificate!.id)
      )
      result.missingRequirements.push(
        `${missingCats.length} more category certificates required: ${missingCats.map(c => c.name).join(", ")}`
      )
    }

    return result
  } catch (error) {
    console.error("Error checking domain certificate eligibility:", error)
    return result
  }
}

// Update certificate progress
export async function updateCertificateProgress(
  userId: string,
  type: "CATEGORY" | "DOMAIN",
  certificateId: string
): Promise<void> {
  try {
    const eligibility =
      type === "CATEGORY"
        ? await checkCategoryCertificateEligibility(userId, certificateId)
        : await checkDomainCertificateEligibility(userId, certificateId)

    // Update or create progress record
    const progressData: any = {
      overallProgress: eligibility.overallProgress,
      lastActivityAt: new Date(),
    }

    if (type === "CATEGORY") {
      progressData.categoryCertificateId = certificateId
      progressData.completedCourseIds = eligibility.requirements.courses.courseIds
      progressData.coursesCompleted = eligibility.requirements.courses.completed
      progressData.totalCourses = eligibility.requirements.courses.required
      progressData.completedLessonIds = eligibility.requirements.lessons.lessonIds
      progressData.lessonsCompleted = eligibility.requirements.lessons.completed
      progressData.totalLessons = eligibility.requirements.lessons.required
      progressData.completedExerciseIds = eligibility.requirements.exercises.exerciseIds
      progressData.exercisesCompleted = eligibility.requirements.exercises.completed
      progressData.completedMiniProjectIds = eligibility.requirements.miniProjects.projectIds
      progressData.miniProjectsCompleted = eligibility.requirements.miniProjects.completed
      progressData.totalMiniProjects = eligibility.requirements.miniProjects.required
      progressData.completedCapstoneIds = eligibility.requirements.capstones.capstoneIds
      progressData.capstonesCompleted = eligibility.requirements.capstones.completed
      progressData.totalCapstones = eligibility.requirements.capstones.required
    } else {
      progressData.domainCertificateId = certificateId
      progressData.completedCourseIds = eligibility.requirements.courses.courseIds
      progressData.coursesCompleted = eligibility.requirements.courses.completed
      progressData.totalCourses = eligibility.requirements.courses.required
      progressData.earnedCategoryCertIds = eligibility.requirements.categoryCertificates?.certificateIds || []
    }

    await prisma.certificateProgress.upsert({
      where: {
        userId_categoryCertificateId: {
          userId,
          categoryCertificateId: type === "CATEGORY" ? certificateId : "",
        },
      },
      create: {
        userId,
        ...progressData,
      },
      update: progressData,
    })

    // Update eligibility record
    await prisma.certificateEligibility.upsert({
      where: {
        userId_certificateType_certificateId: {
          userId,
          certificateType: type,
          certificateId,
        },
      },
      create: {
        userId,
        certificateType: type,
        certificateId,
        isEligible: eligibility.isEligible,
        requirements: eligibility.requirements as any,
        eligibleAt: eligibility.isEligible ? new Date() : null,
      },
      update: {
        isEligible: eligibility.isEligible,
        requirements: eligibility.requirements as any,
        eligibilityCheckedAt: new Date(),
        lastCheckedAt: new Date(),
        eligibleAt: eligibility.isEligible ? new Date() : null,
      },
    })
  } catch (error) {
    console.error("Error updating certificate progress:", error)
    throw error
  }
}

// Issue certificate automatically
export async function issueCertificateAutomatically(
  userId: string,
  type: "CATEGORY" | "DOMAIN",
  certificateId: string
): Promise<{ success: boolean; certificateCode?: string; error?: string }> {
  try {
    // Double-check eligibility
    const eligibility =
      type === "CATEGORY"
        ? await checkCategoryCertificateEligibility(userId, certificateId)
        : await checkDomainCertificateEligibility(userId, certificateId)

    if (!eligibility.isEligible) {
      return {
        success: false,
        error: "Certificate eligibility requirements not met",
      }
    }

    // Check if certificate already issued
    if (type === "CATEGORY") {
      const existing = await prisma.categoryIssuedCert.findUnique({
        where: {
          categoryCertificateId_userId: {
            categoryCertificateId: certificateId,
            userId,
          },
        },
      })

      if (existing) {
        return {
          success: false,
          error: "Certificate already issued",
          certificateCode: existing.certificateCode,
        }
      }
    } else {
      const existing = await prisma.domainIssuedCert.findUnique({
        where: {
          domainCertificateId_userId: {
            domainCertificateId: certificateId,
            userId,
          },
        },
      })

      if (existing) {
        return {
          success: false,
          error: "Certificate already issued",
          certificateCode: existing.certificateCode,
        }
      }
    }

    // Generate certificate code
    const certificateCode = generateCertificateCode(type === "CATEGORY" ? "CAT" : "DOM")
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://innovasci.com"}/verify/${certificateCode}`

    // Issue certificate
    if (type === "CATEGORY") {
      await prisma.categoryIssuedCert.create({
        data: {
          categoryCertificateId: certificateId,
          userId,
          certificateCode,
          verificationUrl,
          status: "ACTIVE",
        },
      })
    } else {
      await prisma.domainIssuedCert.create({
        data: {
          domainCertificateId: certificateId,
          userId,
          certificateCode,
          verificationUrl,
          status: "ACTIVE",
        },
      })
    }

    return { success: true, certificateCode }
  } catch (error) {
    console.error("Error issuing certificate:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to issue certificate",
    }
  }
}

// Trigger eligibility check after any learning activity
export async function triggerEligibilityCheck(userId: string): Promise<void> {
  try {
    // Get all category certificates
    const categoryCerts = await prisma.categoryCertificate.findMany({
      where: { isActive: true },
      select: { id: true, categoryId: true },
    })

    // Get all domain certificates
    const domainCerts = await prisma.domainCertificate.findMany({
      where: { isActive: true },
      select: { id: true },
    })

    // Check eligibility for each certificate
    for (const cert of categoryCerts) {
      await updateCertificateProgress(userId, "CATEGORY", cert.id)

      // Auto-issue if eligible
      const eligibility = await checkCategoryCertificateEligibility(userId, cert.id)
      if (eligibility.isEligible) {
        await issueCertificateAutomatically(userId, "CATEGORY", cert.id)
      }
    }

    for (const cert of domainCerts) {
      await updateCertificateProgress(userId, "DOMAIN", cert.id)

      // Auto-issue if eligible
      const eligibility = await checkDomainCertificateEligibility(userId, cert.id)
      if (eligibility.isEligible) {
        await issueCertificateAutomatically(userId, "DOMAIN", cert.id)
      }
    }
  } catch (error) {
    console.error("Error triggering eligibility check:", error)
  }
}

// Get user's certificate progress for all certificates
export async function getUserCertificateProgress(userId: string) {
  try {
    const [categoryProgress, domainProgress, categoryCerts, domainCerts] =
      await Promise.all([
        prisma.certificateProgress.findMany({
          where: { userId, categoryCertificateId: { not: null } },
        }),
        prisma.certificateProgress.findMany({
          where: { userId, domainCertificateId: { not: null } },
        }),
        prisma.categoryCertificate.findMany({
          where: { isActive: true },
          include: {
            category: true,
          },
        }),
        prisma.domainCertificate.findMany({
          where: { isActive: true },
          include: {
            domain: true,
          },
        }),
      ])

    // Get issued certificates
    const [issuedCategoryCerts, issuedDomainCerts] = await Promise.all([
      prisma.categoryIssuedCert.findMany({
        where: { userId, status: "ACTIVE" },
      }),
      prisma.domainIssuedCert.findMany({
        where: { userId, status: "ACTIVE" },
      }),
    ])

    const issuedCategoryCertIds = issuedCategoryCerts.map(ic => ic.categoryCertificateId)
    const issuedDomainCertIds = issuedDomainCerts.map(ic => ic.domainCertificateId)

    return {
      categoryCertificates: categoryCerts.map(cert => {
        const progress = categoryProgress.find(
          p => p.categoryCertificateId === cert.id
        )
        const issued = issuedCategoryCerts.find(
          ic => ic.categoryCertificateId === cert.id
        )

        return {
          id: cert.id,
          name: cert.certificateName,
          categoryName: cert.category.name,
          progress: progress?.overallProgress || 0,
          isEligible: progress?.overallProgress === 100,
          isIssued: issuedCategoryCertIds.includes(cert.id),
          issuedCertificate: issued,
        }
      }),
      domainCertificates: domainCerts.map(cert => {
        const progress = domainProgress.find(
          p => p.domainCertificateId === cert.id
        )
        const issued = issuedDomainCerts.find(
          ic => ic.domainCertificateId === cert.id
        )

        return {
          id: cert.id,
          name: cert.certificateName,
          domainName: cert.domain.name,
          progress: progress?.overallProgress || 0,
          isEligible: progress?.overallProgress === 100,
          isIssued: issuedDomainCertIds.includes(cert.id),
          issuedCertificate: issued,
        }
      }),
    }
  } catch (error) {
    console.error("Error getting user certificate progress:", error)
    return { categoryCertificates: [], domainCertificates: [] }
  }
}
