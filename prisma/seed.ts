import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Admin configuration from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@innovasci.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// System Admin UUID - MUST use this exact ID
const SYSTEM_ADMIN_ID = "d2b7ac6d-0e84-4be7-89bd-4f93b15a2b51"

async function main() {
  console.log("Starting database seed...")
  
  if (!ADMIN_PASSWORD) {
    console.error("\n❌ ERROR: ADMIN_PASSWORD environment variable is not set!")
    console.error("Please set the ADMIN_PASSWORD in your .env file.")
    console.error("Example: ADMIN_PASSWORD=your_secure_password")
    throw new Error("ADMIN_PASSWORD environment variable is required")
  }

  try {
    // Create Categories first
    const categories = [
      { name: "Data Science", slug: "data-science" },
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
    ]
    
    const createdCategories: Record<string, any> = {}
    for (const cat of categories) {
      // Find or create category using compound unique constraint (domainId + slug)
      let existingCategory = await prisma.category.findFirst({
        where: { slug: cat.slug, domainId: null }
      })
      if (!existingCategory) {
        existingCategory = await prisma.category.create({
          data: { name: cat.name, slug: cat.slug, domainId: null }
        })
      }
      createdCategories[cat.slug] = existingCategory
      console.log("✓ Category:", cat.name)
    }
    
    // Hash the admin password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    
    // Create Admin User with specific UUID
    const admin = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {},
      create: {
        id: SYSTEM_ADMIN_ID,
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        profile: {
          create: {
            fullName: "System Administrator",
            username: "admin",
          }
        }
      },
      include: { profile: true }
    })
    console.log("✓ Admin user created:", admin.email)

    // Initialize System Settings (using existing key-value model)
    await prisma.systemSetting.upsert({
      where: { key: "maintenance_mode" },
      update: {},
      create: {
        key: "maintenance_mode",
        value: "false",
        type: "boolean",
        category: "general",
        description: "Enable maintenance mode to block student access",
        isPublic: true,
      },
    })
    await prisma.systemSetting.upsert({
      where: { key: "maintenance_message" },
      update: {},
      create: {
        key: "maintenance_message",
        value: "We are performing scheduled maintenance. Please check back soon.",
        type: "string",
        category: "general",
        description: "Message to display during maintenance mode",
        isPublic: true,
      },
    })
    console.log("✓ System settings initialized")

    // Create Learning Paths
    const learningPath1 = await prisma.learningPath.upsert({
      where: { slug: "full-stack-web-development" },
      update: {},
      create: {
        title: "Full-Stack Web Development",
        slug: "full-stack-web-development",
        subtitle: "Master modern web development from front-end to back-end",
        description: "This comprehensive learning path takes you from HTML basics to deploying full-stack applications. You'll learn React, Node.js, databases, and deployment strategies.",
        difficultyLevel: "intermediate",
        estimatedHours: 120,
        isPublished: true,
        isActive: true,
      },
    })
    console.log("✓ Learning Path:", learningPath1.title)

    const learningPath2 = await prisma.learningPath.upsert({
      where: { slug: "data-science-fundamentals" },
      update: {},
      create: {
        title: "Data Science Fundamentals",
        slug: "data-science-fundamentals",
        subtitle: "Learn data analysis, visualization, and machine learning",
        description: "Start your data science journey with this structured path covering Python, statistics, data visualization, and machine learning basics.",
        difficultyLevel: "beginner",
        estimatedHours: 80,
        isPublished: true,
        isActive: true,
      },
    })
    console.log("✓ Learning Path:", learningPath2.title)

    const learningPath3 = await prisma.learningPath.upsert({
      where: { slug: "mobile-app-development" },
      update: {},
      create: {
        title: "Mobile App Development",
        slug: "mobile-app-development",
        subtitle: "Build cross-platform mobile applications",
        description: "Learn to build iOS and Android apps using React Native. This path covers mobile UI design, navigation, state management, and app store deployment.",
        difficultyLevel: "intermediate",
        estimatedHours: 60,
        isPublished: true,
        isActive: true,
      },
    })
    console.log("✓ Learning Path:", learningPath3.title)

    // Create Sample Courses
    const course1 = await prisma.course.upsert({
      where: { slug: "introduction-to-data-science" },
      update: {},
      create: {
        title: "Introduction to Data Science",
        slug: "introduction-to-data-science",
        categoryId: createdCategories["data-science"].id,
        shortDescription: "Learn the fundamentals of data science with Python and R",
        fullDescription: "This comprehensive course covers data analysis, visualization, machine learning, and statistical modeling.",
        difficultyLevel: "beginner",
        language: "English",
        durationHours: 40,
        price: 99.99,
        isFree: false,
        status: "published",
        introVideoUrl: "https://example.com/intro-data-science",
      },
    })
    console.log("✓ Course:", course1.title)

    const course2 = await prisma.course.upsert({
      where: { slug: "web-development-masterclass" },
      update: {},
      create: {
        title: "Web Development Masterclass",
        slug: "web-development-masterclass",
        categoryId: createdCategories["web-development"].id,
        shortDescription: "Full-stack web development with React, Node.js, and modern tools",
        fullDescription: "Learn to build modern web applications from scratch using cutting-edge technologies.",
        difficultyLevel: "intermediate",
        language: "English",
        durationHours: 60,
        price: 149.99,
        isFree: false,
        status: "published",
        introVideoUrl: "https://example.com/intro-web-dev",
      },
    })
    console.log("✓ Course:", course2.title)

    const course3 = await prisma.course.upsert({
      where: { slug: "mobile-app-development" },
      update: {},
      create: {
        title: "Mobile App Development",
        slug: "mobile-app-development",
        categoryId: createdCategories["mobile-development"].id,
        shortDescription: "Build iOS and Android apps with React Native",
        difficultyLevel: "intermediate",
        language: "English",
        durationHours: 45,
        price: 0,
        isFree: true,
        status: "published",
        introVideoUrl: "https://example.com/intro-mobile",
      },
    })
    console.log("✓ Course:", course3.title)

    // Create Module for Course 1
    const module1 = await prisma.module.upsert({
      where: { courseId_orderIndex: { courseId: course1.id, orderIndex: 0 } },
      update: {},
      create: {
        courseId: course1.id,
        title: "Getting Started",
        description: "Introduction and setup",
        orderIndex: 0,
      },
    })
    
    // Create Lessons for Module 1
    await prisma.lesson.upsert({
      where: { id: "lesson-1" },
      update: {},
      create: {
        id: "lesson-1",
        courseId: course1.id,
        moduleId: module1.id,
        title: "Welcome to Data Science",
        description: "Course overview",
        orderIndex: 0,
        lessonType: "video",
        duration: 600,
      },
    })
    
    await prisma.lesson.upsert({
      where: { id: "lesson-2" },
      update: {},
      create: {
        id: "lesson-2",
        courseId: course1.id,
        moduleId: module1.id,
        title: "Setting Up Your Environment",
        description: "Install Python and Jupyter",
        orderIndex: 1,
        lessonType: "video",
        duration: 1200,
      },
    })
    console.log("✓ Module and lessons created for:", course1.title)

    // Link courses to learning paths
    await prisma.learningPathCourse.upsert({
      where: {
        learningPathId_courseId: {
          learningPathId: learningPath1.id,
          courseId: course2.id,
        }
      },
      update: {},
      create: {
        learningPathId: learningPath1.id,
        courseId: course2.id,
        orderIndex: 0,
        isRequired: true,
        stepTitle: "Step 1: Web Development Basics",
      },
    })
    console.log("✓ Linked Web Development Masterclass to Full-Stack Path")

    await prisma.learningPathCourse.upsert({
      where: {
        learningPathId_courseId: {
          learningPathId: learningPath1.id,
          courseId: course3.id,
        }
      },
      update: {},
      create: {
        learningPathId: learningPath1.id,
        courseId: course3.id,
        orderIndex: 1,
        isRequired: false,
        stepTitle: "Step 2: Mobile App Integration",
      },
    })
    console.log("✓ Linked Mobile App Development to Full-Stack Path")

    await prisma.learningPathCourse.upsert({
      where: {
        learningPathId_courseId: {
          learningPathId: learningPath2.id,
          courseId: course1.id,
        }
      },
      update: {},
      create: {
        learningPathId: learningPath2.id,
        courseId: course1.id,
        orderIndex: 0,
        isRequired: true,
        stepTitle: "Step 1: Introduction to Data Science",
      },
    })
    console.log("✓ Linked Data Science course to Data Science Fundamentals Path")

    await prisma.learningPathCourse.upsert({
      where: {
        learningPathId_courseId: {
          learningPathId: learningPath3.id,
          courseId: course3.id,
        }
      },
      update: {},
      create: {
        learningPathId: learningPath3.id,
        courseId: course3.id,
        orderIndex: 0,
        isRequired: true,
        stepTitle: "Step 1: React Native Fundamentals",
      },
    })
    console.log("✓ Linked Mobile App Development to Mobile App Development Path")

    console.log("\n✅ Database seeding completed successfully!")
    console.log("\n🔐 Admin Credentials:")
    console.log("  Email:    " + ADMIN_EMAIL)
    console.log("  Password: [Set in ADMIN_PASSWORD env variable]")
    
  } catch (error) {
    console.error("\n❌ Error seeding database:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error("Fatal error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
