"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { 
  ChevronRight, CheckCircle2, Circle, Clock, BookOpen,
  Code, Database, Palette, FlaskConical, BarChart3, Cpu,
  Lock, GraduationCap, ArrowRight
} from "lucide-react"

// Learning path categories with courses
const learningPaths = [
  {
    id: "fundamentals",
    name: "Fundamentals",
    description: "Master the core concepts every scientist and developer needs",
    icon: GraduationCap,
    color: "purple",
    courses: [
      { 
        id: "f1", 
        title: "Python Programming Basics", 
        duration: "8 hours",
        lessons: 24,
        level: "Beginner",
        thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop"
      },
      { 
        id: "f2", 
        title: "Data Structures & Algorithms", 
        duration: "12 hours",
        lessons: 36,
        level: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop"
      },
      { 
        id: "f3", 
        title: "Mathematics for Scientists", 
        duration: "10 hours",
        lessons: 30,
        level: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop"
      },
    ]
  },
  {
    id: "frontend",
    name: "Front-end Development",
    description: "Build beautiful, responsive web interfaces",
    icon: Palette,
    color: "blue",
    courses: [
      { 
        id: "fe1", 
        title: "HTML & CSS Fundamentals", 
        duration: "6 hours",
        lessons: 18,
        level: "Beginner",
        thumbnail: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&h=300&fit=crop"
      },
      { 
        id: "fe2", 
        title: "JavaScript for Beginners", 
        duration: "10 hours",
        lessons: 32,
        level: "Beginner",
        thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop"
      },
      { 
        id: "fe3", 
        title: "React & TypeScript Mastery", 
        duration: "15 hours",
        lessons: 45,
        level: "Advanced",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop"
      },
    ]
  },
  {
    id: "backend",
    name: "Back-end Development",
    description: "Build robust APIs and data systems",
    icon: Database,
    color: "teal",
    courses: [
      { 
        id: "be1", 
        title: "API Design & RESTful Services", 
        duration: "8 hours",
        lessons: 22,
        level: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop"
      },
      { 
        id: "be2", 
        title: "Database Management", 
        duration: "10 hours",
        lessons: 28,
        level: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop"
      },
      { 
        id: "be3", 
        title: "Authentication & Security", 
        duration: "6 hours",
        lessons: 18,
        level: "Advanced",
        thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop"
      },
    ]
  },
  {
    id: "research",
    name: "Research Methods",
    description: "Scientific computing and research tools",
    icon: FlaskConical,
    color: "amber",
    courses: [
      { 
        id: "r1", 
        title: "Introduction to Machine Learning", 
        duration: "14 hours",
        lessons: 42,
        level: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop"
      },
      { 
        id: "r2", 
        title: "Computational Biology", 
        duration: "12 hours",
        lessons: 36,
        level: "Advanced",
        thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop"
      },
      { 
        id: "r3", 
        title: "Data Visualization & Storytelling", 
        duration: "8 hours",
        lessons: 24,
        level: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
      },
    ]
  },
]

// Demo user progress
const userProgress = {
  f1: { completed: true, progress: 100 },
  f2: { completed: false, progress: 45 },
}

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-600" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600" },
  teal: { bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-600" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" },
}

export default function LearningPathsPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const selectedPathData = learningPaths.find(p => p.id === selectedPath)
  const pathColor = selectedPathData ? colorMap[selectedPathData.color] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#2563EB]/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-[#7C3AED]/30 text-[#7C3AED]">
              <GraduationCap className="h-3.5 w-3.5 mr-1" />
              Curated Learning Roadmaps
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Your Learning Path to Mastery
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Follow structured, sequential roadmaps designed by experts. 
              Master scientific computing step by step with clear progression paths.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Learning Paths Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {learningPaths.map((path, index) => {
              const Icon = path.icon
              const colors = colorMap[path.color]
              const isSelected = selectedPath === path.id
              
              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all duration-300",
                      isSelected && `${colors.border} border-2 shadow-lg`
                    )}
                    onClick={() => setSelectedPath(isSelected ? null : path.id)}
                  >
                    {/* Color accent bar */}
                    <div className={cn("absolute top-0 left-0 right-0 h-1", `bg-${path.color}-500`)} />
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                          colors.bg
                        )}>
                          <Icon className={cn("h-6 w-6", colors.text)} />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {path.courses.length} Courses
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{path.name}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Course previews */}
                      <div className="space-y-2">
                        {path.courses.slice(0, 2).map((course, idx) => {
                          const progress = userProgress[course.id as keyof typeof userProgress]
                          return (
                            <div key={course.id} className="flex items-center gap-3">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                                progress?.completed ? "bg-green-500 text-white" : "bg-muted"
                              )}>
                                {progress?.completed ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </div>
                              <span className={cn(
                                "text-sm flex-1 truncate",
                                progress?.completed && "text-muted-foreground line-through"
                              )}>
                                {course.title}
                              </span>
                              <span className="text-xs text-muted-foreground">{course.duration}</span>
                            </div>
                          )
                        })}
                        {path.courses.length > 2 && (
                          <p className="text-xs text-muted-foreground pl-9">
                            +{path.courses.length - 2} more courses
                          </p>
                        )}
                      </div>

                      {/* Expand indicator */}
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn("gap-2", colors.text)}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPath(isSelected ? null : path.id)
                          }}
                        >
                          {isSelected ? "Hide Details" : "View Details"}
                          <ChevronRight className={cn("h-4 w-4 transition-transform", isSelected && "rotate-90")} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Expanded Timeline View */}
      {selectedPathData && pathColor && (
        <motion.section 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="py-12 bg-muted/30"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  pathColor.bg
                )}>
                  <selectedPathData.icon className={cn("h-6 w-6", pathColor.text)} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedPathData.name}</h2>
                  <p className="text-muted-foreground">{selectedPathData.description}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                
                {/* Course timeline items */}
                <div className="space-y-6">
                  {selectedPathData.courses.map((course, index) => {
                    const progress = userProgress[course.id as keyof typeof userProgress]
                    const isCompleted = progress?.completed
                    const courseProgress = progress?.progress || 0
                    
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-14"
                      >
                        {/* Timeline node */}
                        <div className={cn(
                          "absolute left-3 w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center",
                          isCompleted 
                            ? "border-green-500 bg-green-500" 
                            : "border-muted-foreground"
                        )}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          )}
                        </div>

                        {/* Course card */}
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Thumbnail */}
                              <div className="relative w-full md:w-48 h-32 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={course.thumbnail} 
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                                {isCompleted && (
                                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg">{course.title}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {course.duration}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        {course.lessons} lessons
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {course.level}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Progress */}
                                {!isCompleted && courseProgress > 0 && (
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span className="text-muted-foreground">Progress</span>
                                      <span className="font-medium">{courseProgress}%</span>
                                    </div>
                                    <Progress value={courseProgress} className="h-2" />
                                  </div>
                                )}

                                {/* Action */}
                                <div className="mt-4">
                                  <Link href={`/learn/${course.id}`}>
                                    <Button 
                                      size="sm"
                                      className={cn(
                                        isCompleted 
                                          ? "bg-green-500 hover:bg-green-600" 
                                          : "bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
                                      )}
                                    >
                                      {isCompleted ? "Review Course" : courseProgress > 0 ? "Continue" : "Start Course"}
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Back button */}
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => setSelectedPath(null)}>
                  View All Paths
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are mastering scientific computing 
              through our structured learning paths.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-[#7C3AED] hover:bg-white/90 font-semibold">
                Get Started for Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
