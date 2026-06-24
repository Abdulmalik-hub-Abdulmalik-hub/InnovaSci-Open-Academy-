"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, BookOpen, ArrowRight, Play } from "lucide-react"

const courses = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    category: "AI & Data Science",
    difficulty: "Beginner",
    duration: 24,
    students: 15234,
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop",
    instructor: "Dr. Sarah Chen",
    price: 0,
    isFree: true,
  },
  {
    id: "2",
    title: "Computational Biology Fundamentals",
    category: "Life Sciences",
    difficulty: "Intermediate",
    duration: 36,
    students: 8934,
    thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=450&fit=crop",
    instructor: "Prof. Michael Torres",
    price: 49.99,
    isFree: false,
  },
  {
    id: "3",
    title: "Drug Discovery with AI",
    category: "Pharmaceutical",
    difficulty: "Advanced",
    duration: 48,
    students: 4521,
    thumbnail: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=450&fit=crop",
    instructor: "Dr. Emily Watson",
    price: 99.99,
    isFree: false,
  },
  {
    id: "4",
    title: "Python for Scientific Computing",
    category: "Programming",
    difficulty: "Beginner",
    duration: 20,
    students: 22456,
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop",
    instructor: "Dr. James Miller",
    price: 0,
    isFree: true,
  },
]

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export function CourseCatalog() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Our <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">Courses</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover world-class courses taught by leading experts in AI, Data Science, Computational Biology, and more.
          </p>
        </motion.div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category Badge */}
                  <Badge className="absolute top-3 left-3 bg-brand-purple/90 text-white">
                    {course.category}
                  </Badge>

                  {/* Difficulty Badge */}
                  <Badge 
                    className={`absolute top-3 right-3 ${difficultyColors[course.difficulty as keyof typeof difficultyColors]}`}
                  >
                    {course.difficulty}
                  </Badge>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-brand-purple ml-1" />
                    </div>
                  </div>
                </div>

                <CardHeader className="p-4">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-brand-purple transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    by {course.instructor}
                  </p>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}h
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.students.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {Math.floor(course.duration * 3)} lessons
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <div className="font-bold">
                    {course.isFree ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>${course.price}</span>
                    )}
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm" variant="ghost" className="gap-1">
                      View Course
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/courses">
            <Button size="lg" variant="outline" className="gap-2">
              View All Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
