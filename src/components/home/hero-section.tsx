"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, ChevronDown, BookOpen, Users, Award, Zap } from "lucide-react"
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
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/25 via-cyan-500/15 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-t from-teal-600/15 via-emerald-500/10 to-transparent rounded-full blur-[150px]" />
        
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
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 dark:from-violet-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                InnovaSci
              </span>
              <span className="text-foreground dark:text-white font-extrabold"> Open Academy</span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Democratizing scientific and technological education through AI-powered learning. 
            Master cutting-edge fields from AI to Drug Discovery with world-class instructors.
          </motion.p>

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
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-blue-500/50 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
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
                      className="w-full h-14 pl-14 pr-6 text-base rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 placeholder:text-muted-foreground outline-none"
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
                        className="w-full h-12 px-4 flex items-center justify-between rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 hover:border-violet-500/50 transition-all duration-200 text-left"
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
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors ${
                                selectedCategory === category ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium" : "text-foreground"
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
                        className="w-full h-12 px-4 flex items-center justify-between rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 hover:border-violet-500/50 transition-all duration-200 text-left"
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
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors ${
                                selectedDifficulty === level ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium" : "text-foreground"
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
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-700 hover:via-purple-700 hover:to-blue-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300"
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
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 mb-3">
                <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">200+</div>
              <div className="text-sm text-muted-foreground">Expert Courses</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 mb-3">
                <Award className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">95%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 mb-3">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
