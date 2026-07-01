"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Globe, Award, Users, BookOpen } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Industry-Leading Content",
    description: "Courses developed with top research institutions and industry experts.",
    color: "text-[hsl(var(--brand-purple))]",
    bg: "bg-[hsl(var(--brand-purple))/10]",
  },
  {
    icon: Zap,
    title: "AI-Powered Learning",
    description: "Personalized learning paths powered by InnovaSci AI Labs technology.",
    color: "text-[hsl(var(--brand-blue))]",
    bg: "bg-[hsl(var(--brand-blue))/10]",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description: "Learn from anywhere in the world with multi-language support.",
    color: "text-[hsl(var(--brand-teal))]",
    bg: "bg-[hsl(var(--brand-teal))/10]",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description: "Earn industry-recognized certificates upon course completion.",
    color: "text-[hsl(var(--brand-purple))]",
    bg: "bg-[hsl(var(--brand-purple))/10]",
  },
  {
    icon: Users,
    title: "Expert-Led Content",
    description: "Learn from world-class scientists and researchers in their fields.",
    color: "text-[hsl(var(--brand-blue))]",
    bg: "bg-[hsl(var(--brand-blue))/10]",
  },
  {
    icon: BookOpen,
    title: "Hands-on Projects",
    description: "Apply your knowledge with real-world scientific projects.",
    color: "text-[hsl(var(--brand-teal))]",
    bg: "bg-[hsl(var(--brand-teal))/10]",
  },
]

export function Features() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Why Choose <span className="bg-gradient-to-r from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] bg-clip-text text-transparent">InnovaSci</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Experience the future of scientific education with our cutting-edge platform.
          </p>
        </motion.div>

        {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="p-5 sm:p-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-3 sm:mb-4`}>
                    <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0">
                  <p className="text-muted-foreground text-sm sm:text-base">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
