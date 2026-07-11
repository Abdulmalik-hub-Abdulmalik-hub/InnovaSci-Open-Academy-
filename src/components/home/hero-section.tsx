"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ChevronDown, BookOpen, Users, Award, Zap, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Domain {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  domainId: string | null
}

const difficultyLevels = [
  "All Difficulty Levels",
  "Beginner",
  "Intermediate",
  "Advanced",
]

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [domains, setDomains] = useState<Domain[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All Difficulty Levels")
  const [isDomainOpen, setIsDomainOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false)

  // Fetch domains and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [domainsRes, categoriesRes] = await Promise.all([
          fetch("/api/public/domains"),
          fetch("/api/admin/categories?includeInactive=true")
        ])
        
        const domainsData = await domainsRes.json()
        if (domainsData.success && domainsData.data?.domains) {
          setDomains(domainsData.data.domains || [])
        }
        
        const categoriesData = await categoriesRes.json()
        if (categoriesData.success && categoriesData.data?.categories) {
          setCategories(categoriesData.data.categories || [])
        }
      } catch (err) {
        console.error("Failed to fetch filters:", err)
      }
    }
    fetchData()
  }, [])

  // Filter categories based on selected domain
  const filteredCategories = categories.filter(
    cat => !selectedDomain || cat.domainId === selectedDomain
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (selectedDomain) params.set("domainId", selectedDomain)
    if (selectedCategory) params.set("categoryId", selectedCategory)
    if (selectedDifficulty !== "All Difficulty Levels") params.set("difficultyLevel", selectedDifficulty)
    window.location.href = `/courses?${params.toString()}`
  }

  const getSelectedDomainName = () => {
    if (!selectedDomain) return "All Domains"
    const domain = domains.find(d => d.id === selectedDomain)
    return domain ? `${domain.icon || ''} ${domain.name}` : "All Domains"
  }

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "All Categories"
    const cat = categories.find(c => c.id === selectedCategory)
    return cat ? cat.name : "All Categories"
  }

  return (
    <section className="relative overflow-hidden">
      {/* Premium Background with Subtle Gradient Glow */}
      <div className="absolute inset-0 -z-10">
        {/* Soft background gradient - light glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-purple-50/30" />
        
        {/* Subtle gradient orbs - premium soft glow effect */}
        <div className="absolute top-0 left-1/4 w-[clamp(300px,50vw,600px)] h-[clamp(300px,50vw,600px)] bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[clamp(350px,58vw,700px)] h-[clamp(350px,58vw,700px)] bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(450px,75vw,900px)] h-[clamp(450px,75vw,900px)] bg-gradient-to-t from-indigo-50/25 to-transparent rounded-full blur-[150px]" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:clamp(2rem,4vw,4rem)_clamp(2rem,4vw,4rem)] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,white_100%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content - Responsive vertical spacing */}
        <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-28 lg:pb-20 text-center">
          {/* Main Heading - Fluid typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-[hsl(var(--brand-purple))] via-[hsl(var(--brand-purple-light))] to-[hsl(var(--brand-blue))] dark:from-[hsl(var(--brand-purple-light))] dark:via-[hsl(var(--brand-purple))] dark:to-[hsl(var(--brand-blue))] bg-clip-text text-transparent">
                InnovaSci
              </span>
              <span className="text-foreground dark:text-white font-extrabold"> Open Academy</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground/70 font-medium tracking-wide">
              Powered by InnovaSci AI Labs
            </p>
          </motion.div>

          {/* Mission Statement - Responsive text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-3xl sm:max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12"
          >
            <div className="relative">
              {/* Left accent */}
              <div className="hidden xl:block absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[hsl(var(--brand-purple))] via-[hsl(var(--brand-blue))] to-[hsl(var(--brand-teal))] rounded-full" />
              
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed px-2 sm:px-4 lg:px-8">
                <span className="font-semibold text-foreground">Our Mission:</span>{" "}
                <span className="font-medium">
                  To democratize high-quality scientific and technological education through open-access learning. We are dedicated to empowering a global community of innovators, researchers, and learners with the skills and knowledge needed to solve complex real-world challenges.
                </span>
              </p>
            </div>
          </motion.div>

          {/* Course Discovery Panel - Responsive grid */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto"
          >
            {/* Glassmorphism Panel */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--brand-purple))/40] to-[hsl(var(--brand-blue))/40] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              {/* Main Panel - Responsive padding */}
              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-4 sm:p-6 md:p-8">
                {/* Search Input */}
                <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full h-12 sm:h-14 pl-12 sm:pl-14 pr-4 sm:pr-6 text-sm sm:text-base rounded-lg sm:rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 focus:border-[hsl(var(--brand-purple))] focus:ring-2 focus:ring-[hsl(var(--brand-purple))/20] transition-all duration-200 placeholder:text-muted-foreground outline-none"
                    />
                  </div>

                  {/* Filters Row - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* Domain Filter */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDomainOpen(!isDomainOpen)
                          setIsCategoryOpen(false)
                          setIsDifficultyOpen(false)
                        }}
                        className="w-full h-11 sm:h-12 px-3 sm:px-4 flex items-center justify-between rounded-lg sm:rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 hover:border-[hsl(var(--brand-purple))/50] transition-all duration-200 text-left text-sm"
                      >
                        <span className={!selectedDomain ? "text-muted-foreground" : "text-foreground truncate pr-2"}>
                          {getSelectedDomainName()}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isDomainOpen ? "rotate-180" : ""}`} />
                      </button>
                      
                      {/* Domain Dropdown */}
                      {isDomainOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-input dark:border-slate-700 overflow-hidden z-50 max-h-52 sm:max-h-64 overflow-y-auto"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDomain("")
                              setSelectedCategory("")
                              setIsDomainOpen(false)
                            }}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm transition-colors flex items-center gap-2 ${
                              !selectedDomain 
                                ? "bg-[hsl(var(--brand-purple))/10] text-[hsl(var(--brand-purple))] dark:text-[hsl(var(--brand-purple-light))] font-medium" 
                                : "text-foreground hover:bg-[hsl(var(--brand-purple))/5]"
                            }`}
                          >
                            <LayoutGrid className="h-4 w-4" />
                            All Domains
                          </button>
                          {domains.map((domain) => (
                            <button
                              key={domain.id}
                              type="button"
                              onClick={() => {
                                setSelectedDomain(domain.id)
                                setSelectedCategory("")
                                setIsDomainOpen(false)
                              }}
                              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm transition-colors flex items-center gap-2 ${
                                selectedDomain === domain.id 
                                  ? "bg-[hsl(var(--brand-purple))/10] text-[hsl(var(--brand-purple))] dark:text-[hsl(var(--brand-purple-light))] font-medium" 
                                  : "text-foreground hover:bg-[hsl(var(--brand-purple))/5]"
                              }`}
                            >
                              {domain.icon && <span>{domain.icon}</span>}
                              {domain.color && (
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: domain.color }} />
                              )}
                              <span className="truncate">{domain.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCategoryOpen(!isCategoryOpen)
                          setIsDomainOpen(false)
                          setIsDifficultyOpen(false)
                        }}
                        className="w-full h-11 sm:h-12 px-3 sm:px-4 flex items-center justify-between rounded-lg sm:rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 hover:border-[hsl(var(--brand-purple))/50] transition-all duration-200 text-left text-sm"
                      >
                        <span className={!selectedCategory ? "text-muted-foreground" : "text-foreground truncate pr-2"}>
                          {getSelectedCategoryName()}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isCategoryOpen ? "rotate-180" : ""}`} />
                      </button>
                      
                      {/* Category Dropdown */}
                      {isCategoryOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-input dark:border-slate-700 overflow-hidden z-50 max-h-52 sm:max-h-64 overflow-y-auto"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory("")
                              setIsCategoryOpen(false)
                            }}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm transition-colors ${
                              !selectedCategory 
                                ? "bg-[hsl(var(--brand-purple))/10] text-[hsl(var(--brand-purple))] dark:text-[hsl(var(--brand-purple-light))] font-medium" 
                                : "text-foreground hover:bg-[hsl(var(--brand-purple))/5]"
                            }`}
                          >
                            All Categories
                          </button>
                          {filteredCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(category.id)
                                setIsCategoryOpen(false)
                              }}
                              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm transition-colors ${
                                selectedCategory === category.id 
                                  ? "bg-[hsl(var(--brand-purple))/10] text-[hsl(var(--brand-purple))] dark:text-[hsl(var(--brand-purple-light))] font-medium" 
                                  : "text-foreground hover:bg-[hsl(var(--brand-purple))/5]"
                              }`}
                            >
                              {category.name}
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
                        className="w-full h-11 sm:h-12 px-3 sm:px-4 flex items-center justify-between rounded-lg sm:rounded-xl bg-muted/50 dark:bg-slate-800/50 border border-input dark:border-slate-700 hover:border-[hsl(var(--brand-purple))/50] transition-all duration-200 text-left text-sm sm:text-base"
                      >
                        <span className={selectedDifficulty === "All Difficulty Levels" ? "text-muted-foreground text-sm sm:text-base" : "text-foreground text-sm sm:text-base"}>
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
                              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base transition-colors ${
                                selectedDifficulty === level 
                                  ? "bg-[hsl(var(--brand-purple))/10] text-[hsl(var(--brand-purple))] dark:text-[hsl(var(--brand-purple-light))] font-medium" 
                                  : "text-foreground hover:bg-[hsl(var(--brand-purple))/5]"
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
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Search Courses
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Stats Bar - Responsive grid: 2 cols mobile, 4 cols desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 sm:mt-14 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto"
          >
            {/* Stats Card 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsl(var(--brand-purple))/10] dark:bg-[hsl(var(--brand-purple))/20] mb-2 sm:mb-3">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--brand-purple))]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">200+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Expert Courses</div>
            </div>
            
            {/* Stats Card 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsl(var(--brand-blue))/10] dark:bg-[hsl(var(--brand-blue))/20] mb-2 sm:mb-3">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--brand-blue))]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">50K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Learners</div>
            </div>
            
            {/* Stats Card 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsl(var(--brand-teal))/10] dark:bg-[hsl(var(--brand-teal))/20] mb-2 sm:mb-3">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--brand-teal))]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">95%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Completion Rate</div>
            </div>
            
            {/* Stats Card 4 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsl(var(--brand-purple))/10] dark:bg-[hsl(var(--brand-purple))/20] mb-2 sm:mb-3">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--brand-purple))]" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">AI</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Powered Learning</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
