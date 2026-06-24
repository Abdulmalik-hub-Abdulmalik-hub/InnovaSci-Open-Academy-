"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Dna, FlaskConical, Brain, Atom } from "lucide-react"

const learningPaths = [
  {
    id: "computational-chemistry",
    title: "Computational Chemistry",
    description: "Master molecular modeling, DFT calculations, and drug-target interactions using computational methods.",
    icon: FlaskConical,
    courses: 8,
    duration: "120 hours",
    level: "Advanced",
    color: "bg-brand-purple",
  },
  {
    id: "bioinformatics",
    title: "Bioinformatics",
    description: "Analyze biological data, sequence genomes, and understand protein structures with AI tools.",
    icon: Dna,
    courses: 6,
    duration: "90 hours",
    level: "Intermediate",
    color: "bg-brand-blue",
  },
  {
    id: "drug-discovery",
    title: "Drug Discovery",
    description: "Learn AI-driven drug design, molecular docking, and clinical trial analysis.",
    icon: Atom,
    courses: 10,
    duration: "150 hours",
    level: "Advanced",
    color: "bg-brand-teal",
  },
  {
    id: "scientific-programming",
    title: "Scientific Programming",
    description: "Build a foundation in Python, R, and Julia for scientific computing and data analysis.",
    icon: Code,
    courses: 5,
    duration: "75 hours",
    level: "Beginner",
    color: "bg-orange-500",
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    description: "Deep dive into neural networks, deep learning, and their applications in scientific research.",
    icon: Brain,
    courses: 12,
    duration: "180 hours",
    level: "Intermediate",
    color: "bg-pink-500",
  },
]

export function LearningPaths() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Learning <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">Paths</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Follow structured learning paths designed by industry experts to master cutting-edge scientific domains.
          </p>
        </motion.div>

        {/* Learning Paths Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full group hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Colored Header Bar */}
                <div className={`h-2 ${path.color}`} />
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-lg ${path.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <path.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline">{path.level}</Badge>
                  </div>
                  <CardTitle className="text-xl">{path.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4">{path.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{path.courses} Courses</span>
                    <span>•</span>
                    <span>{path.duration}</span>
                  </div>

                  <Link href={`/learning-paths/${path.id}`}>
                    <Button variant="ghost" className="w-full justify-between group-hover:text-brand-purple transition-colors">
                      Explore Path
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
