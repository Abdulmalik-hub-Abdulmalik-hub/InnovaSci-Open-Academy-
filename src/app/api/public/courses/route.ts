import { NextResponse } from "next/server"

// Mock data for demonstration - Replace with actual database queries
const courses = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    category: "AI & Data Science",
    difficulty_level: "Beginner",
    duration_hours: 24,
    students: 15234,
    thumbnail_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop",
    instructor: { full_name: "Dr. Sarah Chen", avatar_url: null },
    price: 0,
    is_free: true,
    status: "published",
    short_description: "Learn the fundamentals of machine learning algorithms and their applications."
  },
  {
    id: "2",
    title: "Computational Biology Fundamentals",
    category: "Life Sciences",
    difficulty_level: "Intermediate",
    duration_hours: 36,
    students: 8934,
    thumbnail_url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop",
    instructor: { full_name: "Prof. Michael Torres", avatar_url: null },
    price: 49.99,
    is_free: false,
    status: "published",
    short_description: "Master molecular modeling and bioinformatics tools for biological research."
  },
  {
    id: "3",
    title: "Drug Discovery with AI",
    category: "Pharmaceutical",
    difficulty_level: "Advanced",
    duration_hours: 48,
    students: 4521,
    thumbnail_url: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=450&fit=crop",
    instructor: { full_name: "Dr. Emily Watson", avatar_url: null },
    price: 99.99,
    is_free: false,
    status: "published",
    short_description: "Explore AI-driven approaches to modern drug discovery and development."
  },
  {
    id: "4",
    title: "Python for Scientific Computing",
    category: "Programming",
    difficulty_level: "Beginner",
    duration_hours: 20,
    students: 22456,
    thumbnail_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop",
    instructor: { full_name: "Dr. James Miller", avatar_url: null },
    price: 0,
    is_free: true,
    status: "published",
    short_description: "Build a foundation in Python for scientific computing and data analysis."
  },
]

export async function GET() {
  try {
    // Filter only published courses
    const publishedCourses = courses.filter(course => course.status === "published")
    
    return NextResponse.json({
      success: true,
      data: publishedCourses,
      total: publishedCourses.length
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
