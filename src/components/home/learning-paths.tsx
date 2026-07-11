"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Code, Dna, FlaskConical, Brain, Atom, BookOpen, Loader2 } from "lucide-react"

// Icon mapping for domains
const iconMap: Record<string, any> = {
  FlaskConical,
  Dna,
  Atom,
  Code,
  Brain,
  BookOpen,
}

const colorMap: Record<string, string> = {
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  teal: "bg-teal-500",
  amber: "bg-amber-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  red: "bg-red-500",
  indigo: "bg-indigo-500",
}

interface LearningPathCard {
  id: string
  title: string
  slug: string
  subtitle: string | null
  description: string | null
  thumbnailUrl: string | null
  difficultyLevel: string
  estimatedHours: number | null
  totalCourses: number
  domains: Array<{ id: string; name: string; slug: string; color: string | null; icon: string | null }>
  categories: Array<{ id: string; name: string; slug: string; color: string | null }>
}

export function LearningPaths() {
  const [learningPaths, setLearningPaths] = useState<LearningPathCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLearningPaths() {
      try {
        const response = await fetch("/api/learning-paths")
        const result = await response.json()
        
        if (result.success && result.data?.learningPaths) {
          setLearningPaths(result.data.learningPaths.slice(0, 6)) // Show max 6 on landing page
        } else {
          setLearningPaths([])
        }
      } catch (err) {
        console.error("Failed to fetch learning paths:", err)
        setError("Failed to load learning paths")
        setLearningPaths([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchLearningPaths()
  }, [])

  const getDomainColor = (domain: LearningPathCard['domains'][0]) => {
    if (domain.color) return domain.color
    // Default colors based on domain name
    const name = domain.name.toLowerCase()
    if (name.includes("chemistry") || name.includes("molecular")) return "purple"
    if (name.includes("bio") || name.includes("genomic")) return "blue"
    if (name.includes("ai") || name.includes("machine") || name.includes("data")) return "teal"
    if (name.includes("drug") || name.includes("pharma")) return "amber"
    return "purple"
  }

  if (error) {
    return null // Hide section on error
  }

  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Learning <span className="bg-gradient-to-r from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] bg-clip-text text-transparent">Paths</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Follow structured learning paths designed by industry experts to master cutting-edge scientific domains.
          </p>
        </motion.div>

        {/* Learning Paths Grid - Responsive */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-full overflow-hidden">
                <div className="h-1.5 sm:h-2 bg-muted" />
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mt-3" />
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : learningPaths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {learningPaths.map((path, index) => {
              const domain = path.domains[0]
              const colorKey = domain ? getDomainColor(domain) : "purple"
              const colorClass = colorMap[colorKey] || colorMap.purple
              const IconComponent = domain?.icon && iconMap[domain.icon] 
                ? iconMap[domain.icon] 
                : BookOpen
              
              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Colored Header Bar */}
                    <div className={`h-1.5 sm:h-2 ${colorClass}`} />
                    
                    <CardHeader className="pb-2 p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colorClass} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {path.difficultyLevel?.toLowerCase() || "All Levels"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg sm:text-xl">{path.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 pt-0">
                      <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base line-clamp-2">
                        {path.description || path.subtitle || `Master ${path.title} with our structured curriculum`}
                      </p>
                      
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        <span>{path.totalCourses} Course{path.totalCourses !== 1 ? "s" : ""}</span>
                        {path.estimatedHours && (
                          <>
                            <span>•</span>
                            <span>{path.estimatedHours}h</span>
                          </>
                        )}
                      </div>

                      <Link href="/learning-paths" className="block">
                        <Button variant="ghost" className="w-full justify-between group-hover:text-[hsl(var(--brand-purple))] transition-colors text-sm sm:text-base">
                          Explore Path
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No learning paths available yet. Check back soon!</p>
          </div>
        )}

        {/* View All Button */}
        {learningPaths.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/learning-paths">
              <Button variant="outline" size="lg" className="font-medium">
                View All Learning Paths
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
