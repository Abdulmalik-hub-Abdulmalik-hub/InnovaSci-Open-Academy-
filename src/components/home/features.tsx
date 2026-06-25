"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Globe, Award, Users, BookOpen } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Industry-Leading Content",
    description: "Courses developed with top research institutions and industry experts.",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
  },
  {
    icon: Zap,
    title: "AI-Powered Learning",
    description: "Personalized learning paths powered by InnovaSci AI Labs technology.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description: "Learn from anywhere in the world with multi-language support.",
    color: "text-brand-teal",
    bg: "bg-brand-teal/10",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description: "Earn industry-recognized certificates upon course completion.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "Expert-Led Content",
    description: "Learn from world-class scientists and researchers in their fields.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: BookOpen,
    title: "Hands-on Projects",
    description: "Apply your knowledge with real-world scientific projects.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
]

export function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">InnovaSci</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the future of scientific education with our cutting-edge platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
