import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Admin configuration from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@innovasci.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// System Admin UUID - MUST use this exact ID
const SYSTEM_ADMIN_ID = "d2b7ac6d-0e84-4be7-89bd-4f93b15a2b51"

// POST /api/admin/seed - Seed database (requires admin authentication)
export async function POST() {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate admin credentials are configured
    if (!ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: "ADMIN_PASSWORD environment variable is not set."
      }, { status: 500 })
    }

    console.log("Starting database seed...")

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

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
    console.log("✓ Categories created")

    // Create Admin User with secure password from env
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
    console.log("✓ Admin user:", admin.email)

    // Create Sample Courses
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
    console.log("✓ Course:", course1.title)

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
    console.log("✓ Course:", course2.title)

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
    console.log("✓ Module and lessons created")

    return NextResponse.json({
      success: true,
      message: "Database seed completed successfully!",
      data: {
        admin: admin.email,
        courses: [course1.title, course2.title, course3.title]
      }
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Seed error:", errorMessage)
    return NextResponse.json(
      { success: false, error: "Failed to seed database", details: errorMessage },
      { status: 500 }
    )
  }
}

// GET /api/admin/seed - Check seed status (requires admin authentication)
export async function GET() {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [userCount, courseCount, enrollmentCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        courses: courseCount,
        enrollments: enrollmentCount,
        seeded: userCount > 0
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: "Database not connected or not set up yet", details: errorMessage },
      { status: 500 }
    )
  }
}
