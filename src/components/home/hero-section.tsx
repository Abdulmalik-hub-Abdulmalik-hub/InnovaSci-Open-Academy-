"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, ChevronDown, BookOpen, Users, Award, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  "All Categories",
  "Artificial Intelligence",
  "Data Science",
  "Machine Learning",
  "Computational Biology",
  "Quantum Computing",
  "Drug Discovery",
  "Web Development",
  "Cloud Computing",
]

const difficultyLevels = [
  "All Difficulty Levels",
  "Beginner",
  "Intermediate",
  "Advanced",
]

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulty Levels")
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (selectedCategory !== "All Categories") params.set("category", selectedCategory)
    if (selectedDifficulty !== "All Difficulty Levels") params.set("difficulty", selectedDifficulty)
    window.location.href = `/courses?${params.toString()}`
  }

  return (
    <section className="relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient orbs with brand meanings */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-brand-purple/25 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-brand-blue/20 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-t from-brand-teal/15 to-transparent rounded-full blur-[150px]" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,white_100%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="pt-16 pb-12 md:pt-24 md:pb-16 lg:pt-32 lg:pb-24 text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-blue dark:from-brand-purple-light dark:via-brand-purple dark:to-brand-blue bg-clip-text text-transparent">
                InnovaSci
              </span>
              <span className="text-foreground dark:text-white font-extrabold"> Open Academy</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground/70 font-medium tracking-wide">
              Powered by InnovaSci AI Labs
            </p>
          </motion.div>

          {/* Brand Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 text-brand-purple text-sm font-medium border border-brand-purple/20">
              <Sparkles className="h-4 w-4" />
              Innovation + Creativity
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-medium border border-brand-blue/20">
              <Zap className="h-4 w-4" />
              Trust + AI + Intelligence
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-medium border border-brand-teal/20">
              <BookOpen className="h-4 w-4" />
              Science + Research
            </span>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="relative">
              {/* Left accent */}
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-purple via-brand-blue to-brand-teal rounded-full" />
              
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed px-4 lg:px-8">
                <span className="font-semibold text-foreground">Our Mission:</span> Democratizing scientific and technological education through open-access learning — 
                <span className="text-brand-purple font-medium"> empowering innovation</span>, 
                <span className="text-brand-blue font-medium"> advancing AI literacy</span>, and 
                <span className="text-brand-teal font-medium"> driving scientific discovery</span> for a global community of innovators.
              </p>
            </div>
          </motion.div>

          {/* Course Discovery Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {/* Glassmorphism Panel */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/40 to-brand-blue/40 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              {/* Main Panel */}
              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-6 sm:p-8">
                {/* Search Input */}
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full h-14 pl-14 pr-6 text-base rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 placeholder:text-muted-foreground outline-none"
                    />
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Filter */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCategoryOpen(!isCategoryOpen)
                          setIsDifficultyOpen(false)
                        }}
                        className="w-full h-12 px-4 flex items-center justify-between rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 hover:border-brand-purple/50 transition-all duration-200 text-left"
                      >
                        <span className={selectedCategory === "All Categories" ? "text-muted-foreground" : "text-foreground"}>
                          {selectedCategory}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                      </button>
                      
                      {/* Category Dropdown */}
                      {isCategoryOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-input dark:border-slate-700 overflow-hidden z-50 max-h-64 overflow-y-auto"
                        >
                          {categories.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(category)
                                setIsCategoryOpen(false)
                              }}
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-brand-purple/10 transition-colors ${
                                selectedCategory === category ? "bg-brand-purple/10 text-brand-purple dark:text-brand-purple-light font-medium" : "text-foreground"
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Difficulty Filter */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDifficultyOpen(!isDifficultyOpen)
                          setIsCategoryOpen(false)
                        }}
                        className="w-full h-12 px-4 flex items-center justify-between rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 hover:border-brand-purple/50 transition-all duration-200 text-left"
                      >
                        <span className={selectedDifficulty === "All Difficulty Levels" ? "text-muted-foreground" : "text-foreground"}>
                          {selectedDifficulty}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isDifficultyOpen ? "rotate-180" : ""}`} />
                      </button>
                      
                      {/* Difficulty Dropdown */}
                      {isDifficultyOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-input dark:border-slate-700 overflow-hidden z-50"
                        >
                          {difficultyLevels.map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                setSelectedDifficulty(level)
                                setIsDifficultyOpen(false)
                              }}
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-brand-purple/10 transition-colors ${
                                selectedDifficulty === level ? "bg-brand-purple/10 text-brand-purple dark:text-brand-purple-light font-medium" : "text-foreground"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Search Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 transition-all duration-300"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search Courses
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 mb-3">
                <BookOpen className="h-6 w-6 text-brand-purple" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">200+</div>
              <div className="text-sm text-muted-foreground">Expert Courses</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 mb-3">
                <Users className="h-6 w-6 text-brand-blue" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-teal/10 dark:bg-brand-teal/20 mb-3">
                <Award className="h-6 w-6 text-brand-teal" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">95%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 mb-3">
                <Zap className="h-6 w-6 text-brand-purple" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">AI</div>
              <div className="text-sm text-muted-foreground">Powered Learning</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
