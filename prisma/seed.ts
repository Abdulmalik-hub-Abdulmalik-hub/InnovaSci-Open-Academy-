import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")
  
  try {
    // Create Categories first
    const categories = [
      { name: "Data Science", slug: "data-science" },
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
    ]
    
    const createdCategories: Record<string, any> = {}
    for (const cat of categories) {
      createdCategories[cat.slug] = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: { name: cat.name, slug: cat.slug }
      })
      console.log("✓ Category:", cat.name)
    }
    
    // Create Admin User
    const admin = await prisma.user.upsert({
      where: { email: "admin@innovasci.com" },
      update: {},
      create: {
        email: "admin@innovasci.com",
        passwordHash: "admin123",
        role: "ADMIN",
        status: "ACTIVE",
        profile: {
          create: {
            fullName: "Admin User",
            username: "admin",
          }
        }
      },
      include: { profile: true }
    })
    console.log("✓ Admin user:", admin.email)

    // Create Student User
    const student = await prisma.user.upsert({
      where: { email: "student@innovasci.com" },
      update: {},
      create: {
        email: "student@innovasci.com",
        passwordHash: "student123",
        role: "STUDENT",
        status: "ACTIVE",
        profile: {
          create: {
            fullName: "Demo Student",
            username: "student",
            country: "Nigeria",
          }
        }
      },
      include: { profile: true }
    })
    console.log("✓ Student user:", student.email)

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

    // Create Demo Courses
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

    // Enroll student in courses
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: course1.id } },
      update: {},
      create: {
        userId: student.id,
        courseId: course1.id,
        progressPercent: 35,
        completed: false,
      },
    })
    console.log("✓ Enrolled in:", course1.title)

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: course3.id } },
      update: {},
      create: {
        userId: student.id,
        courseId: course3.id,
        progressPercent: 100,
        completed: true,
        completedAt: new Date(),
      },
    })
    console.log("✓ Enrolled in:", course3.title)

    // Create sample payment
    await prisma.payment.upsert({
      where: { id: "sample-payment-1" },
      update: {},
      create: {
        id: "sample-payment-1",
        userId: student.id,
        amount: 99.99,
        currency: "NGN",
        status: "COMPLETED",
        paymentMethod: "card",
        transactionId: "txn_123456",
      },
    })
    console.log("✓ Sample payment created")

    console.log("\n✅ Database seeding completed successfully!")
    console.log("\nDemo Credentials:")
    console.log("  Admin:   admin@innovasci.com / admin123")
    console.log("  Student: student@innovasci.com / student123")
    
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
