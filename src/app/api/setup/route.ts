import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/setup - Seed database with demo data (assumes tables exist)
export async function POST() {
  try {
    console.log("Starting database setup...")
    
    // Create Categories first
    const catDataScience = await prisma.category.upsert({
      where: { slug: "data-science" },
      update: {},
      create: { name: "Data Science", slug: "data-science" }
    })
    const catWebDev = await prisma.category.upsert({
      where: { slug: "web-development" },
      update: {},
      create: { name: "Web Development", slug: "web-development" }
    })
    const catMobileDev = await prisma.category.upsert({
      where: { slug: "mobile-development" },
      update: {},
      create: { name: "Mobile Development", slug: "mobile-development" }
    })
    
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

    // Create Demo Courses
    const course1 = await prisma.course.upsert({
      where: { slug: "introduction-to-data-science" },
      update: {},
      create: {
        title: "Introduction to Data Science",
        slug: "introduction-to-data-science",
        categoryId: catDataScience.id,
        shortDescription: "Learn the fundamentals of data science with Python and R",
        fullDescription: "This comprehensive course covers data analysis, visualization, machine learning, and statistical modeling.",
        difficultyLevel: "beginner",
        language: "English",
        durationHours: 40,
        price: 99.99,
        isFree: false,
        status: "published",
        introVideoUrl: "https://example.com/intro",
      },
    })

    const course2 = await prisma.course.upsert({
      where: { slug: "web-development-masterclass" },
      update: {},
      create: {
        title: "Web Development Masterclass",
        slug: "web-development-masterclass",
        categoryId: catWebDev.id,
        shortDescription: "Full-stack web development with React, Node.js, and modern tools",
        fullDescription: "Learn to build modern web applications from scratch using cutting-edge technologies.",
        difficultyLevel: "intermediate",
        language: "English",
        durationHours: 60,
        price: 149.99,
        isFree: false,
        status: "published",
        introVideoUrl: "https://example.com/intro",
      },
    })

    const course3 = await prisma.course.upsert({
      where: { slug: "mobile-app-development" },
      update: {},
      create: {
        title: "Mobile App Development",
        slug: "mobile-app-development",
        categoryId: catMobileDev.id,
        shortDescription: "Build iOS and Android apps with React Native",
        difficultyLevel: "intermediate",
        language: "English",
        durationHours: 45,
        price: 0,
        isFree: true,
        status: "published",
        introVideoUrl: "https://example.com/intro",
      },
    })
    console.log("✓ 3 demo courses created")

    // Create Module and Lessons
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
    console.log("✓ Module and lessons created")

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
    console.log("✓ Student enrolled in courses")

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

    return NextResponse.json({
      success: true,
      message: "Setup completed successfully!",
      credentials: {
        admin: { email: "admin@innovasci.com", password: "admin123" },
        student: { email: "student@innovasci.com", password: "student123" }
      }
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Setup error:", errorMessage)
    return NextResponse.json(
      { success: false, error: "Setup failed", details: errorMessage },
      { status: 500 }
    )
  }
}

// GET /api/setup - Check database status
export async function GET() {
  try {
    const [userCount, courseCount, enrollmentCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
    ])

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      data: {
        users: userCount,
        courses: courseCount,
        enrollments: enrollmentCount
      },
      needsSetup: userCount === 0
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({
      success: false,
      databaseConnected: false,
      error: errorMessage,
      needsSetup: true
    })
  }
}
