import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Admin configuration from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@innovasci.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// System Admin UUID - MUST use this exact ID
const SYSTEM_ADMIN_ID = "d2b7ac6d-0e84-4be7-89bd-4f93b15a2b51"

// POST /api/setup - Seed database (assumes tables exist)
export async function POST() {
  try {
    // Validate admin credentials are configured
    if (!ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: "ADMIN_PASSWORD environment variable is not set. Please configure it in your .env file."
      }, { status: 500 })
    }

    console.log("Starting database setup...")
    
    // Hash the admin password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    
    // Find or create Categories
    let catDataScience = await prisma.category.findFirst({
      where: { slug: "data-science", domainId: null }
    })
    if (!catDataScience) {
      catDataScience = await prisma.category.create({
        data: { name: "Data Science", slug: "data-science", domainId: null }
      })
    }
    
    let catWebDev = await prisma.category.findFirst({
      where: { slug: "web-development", domainId: null }
    })
    if (!catWebDev) {
      catWebDev = await prisma.category.create({
        data: { name: "Web Development", slug: "web-development", domainId: null }
      })
    }
    
    let catMobileDev = await prisma.category.findFirst({
      where: { slug: "mobile-development", domainId: null }
    })
    if (!catMobileDev) {
      catMobileDev = await prisma.category.create({
        data: { name: "Mobile Development", slug: "mobile-development", domainId: null }
      })
    }
    
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

    // Initialize System Settings
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
    console.log("✓ 3 courses created")

    // Create Module and Lessons for course1
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

    // Seed Scholarship Types
    const scholarshipTypes = [
      {
        name: "Excellence Scholarship",
        slug: "excellence",
        description: "For students with outstanding academic achievement and exceptional performance.",
        icon: "GraduationCap",
        color: "#8B5CF6",
        orderIndex: 1,
      },
      {
        name: "Research & Innovation Scholarship",
        slug: "research-innovation",
        description: "For students involved in scientific research, AI, computational sciences, drug discovery, innovation, and technology.",
        icon: "FlaskConical",
        color: "#3B82F6",
        orderIndex: 2,
      },
      {
        name: "Opportunity Scholarship",
        slug: "opportunity",
        description: "For talented students who require financial assistance or special educational support.",
        icon: "Heart",
        color: "#EC4899",
        orderIndex: 3,
      },
      {
        name: "Global Partnership Scholarship",
        slug: "global-partnership",
        description: "For scholarships funded by governments, universities, NGOs, companies, foundations, donors, or strategic partners.",
        icon: "Globe",
        color: "#10B981",
        orderIndex: 4,
      },
      {
        name: "Leadership & Impact Scholarship",
        slug: "leadership-impact",
        description: "For students demonstrating leadership, community service, entrepreneurship, innovation, or outstanding societal impact.",
        icon: "Star",
        color: "#F59E0B",
        orderIndex: 5,
      },
      {
        name: "Custom Scholarship",
        slug: "custom",
        description: "A flexible scholarship type that allows administrators to create any additional scholarship program.",
        icon: "Sparkles",
        color: "#6366F1",
        orderIndex: 6,
      },
    ]

    let scholarshipTypesCreated = 0
    for (const type of scholarshipTypes) {
      const existing = await prisma.scholarshipType.findFirst({
        where: { OR: [{ slug: type.slug }, { name: type.name }] },
      })
      
      if (!existing) {
        await prisma.scholarshipType.create({
          data: {
            ...type,
            isActive: true,
          },
        })
        scholarshipTypesCreated++
      }
    }
    console.log(`Created ${scholarshipTypesCreated} scholarship types`)


    return NextResponse.json({
      success: true,
      message: "Setup completed successfully!",
      adminEmail: ADMIN_EMAIL
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
