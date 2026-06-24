"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles, Brain, FlaskConical, Atom } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-brand-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-teal/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 text-brand-purple text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              Powered by InnovaSci AI Labs
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Democratizing
              </span>
              <br />
              <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-teal bg-clip-text text-transparent">
                Scientific Education
              </span>
            </motion.h1>

            {/* Mission Statement */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Our mission is to democratize high-quality scientific and technological education 
              for learners worldwide. Access world-class courses in AI, Data Science, 
              Computational Biology, and more.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/courses">
                <Button size="lg" className="w-full sm:w-auto bg-brand-purple hover:bg-brand-purple/90 gap-2">
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <Play className="h-4 w-4" />
                  Explore Courses
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t"
            >
              <div>
                <div className="text-3xl font-bold text-brand-purple">50K+</div>
                <div className="text-sm text-muted-foreground">Active Learners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-blue">200+</div>
                <div className="text-sm text-muted-foreground">Expert Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-teal">95%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main visual container */}
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 rounded-3xl blur-2xl" />
                
                {/* Main card */}
                <div className="relative bg-card rounded-3xl border shadow-2xl p-8 h-full flex flex-col justify-center">
                  {/* AI Brain Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-xl" />
                      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
                        <Brain className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Feature pills */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 text-brand-purple text-sm">
                      <Atom className="h-4 w-4" />
                      Quantum Computing
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue text-sm">
                      <Brain className="h-4 w-4" />
                      Machine Learning
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/10 text-brand-teal text-sm">
                      <FlaskConical className="h-4 w-4" />
                      Drug Discovery
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-8">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Learning Progress</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "78%" }}
                        transition={{ delay: 1, duration: 1 }}
                        className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
