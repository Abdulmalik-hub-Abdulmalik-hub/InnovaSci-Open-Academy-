"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  Brain, ChevronRight, Search, Loader2, BookOpen, Clock, Target
} from "lucide-react"

interface Quiz {
  id: string
  title: string
  courseId: string
  courseName: string
  lessonId: string
  lessonName: string
  questions: number
  duration: number
  passingScore: number
  attempts: number
  bestScore: number | null
  status: "not_started" | "in_progress" | "completed" | "passed"
}

export default function QuizzesPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    // In production, this would fetch from an API
    // For now, show empty state with message
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const stats = {
    total: quizzes.length,
    passed: quizzes.filter(q => q.status === "passed").length,
    inProgress: quizzes.filter(q => q.status === "in_progress").length,
    notStarted: quizzes.filter(q => q.status === "not_started").length,
  }

  const getStatusBadge = (status: Quiz["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-500">Passed</Badge>
      case "in_progress":
        return <Badge className="bg-amber-500">In Progress</Badge>
      case "not_started":
        return <Badge variant="outline">Not Started</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Practice & Quizzes</h1>
          <p className="text-white/60 mt-1">
            Test your knowledge and track your progress with quizzes
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-white/60">Total Quizzes</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <Target className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.passed}</p>
              <p className="text-xs text-white/60">Passed</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              <p className="text-xs text-white/60">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-white/40 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.notStarted}</p>
              <p className="text-xs text-white/60">Not Started</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Quizzes List */}
        {filteredQuizzes.length > 0 ? (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                      quiz.status === "passed"
                        ? "bg-green-500/20"
                        : quiz.status === "in_progress"
                          ? "bg-amber-500/20"
                          : "bg-white/10"
                    )}>
                      <Brain className={cn(
                        "h-7 w-7",
                        quiz.status === "passed"
                          ? "text-green-400"
                          : quiz.status === "in_progress"
                            ? "text-amber-400"
                            : "text-white/60"
                      )} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-white">{quiz.title}</h3>
                          <p className="text-sm text-white/60 mt-0.5">
                            {quiz.courseName} • {quiz.lessonName}
                          </p>
                        </div>
                        {getStatusBadge(quiz.status)}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {quiz.questions} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {quiz.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Pass: {quiz.passingScore}%
                        </span>
                      </div>
                    </div>

                    <Button className="bg-purple-500 hover:bg-purple-600 flex-shrink-0">
                      {quiz.status === "passed" ? "Retake" : 
                       quiz.status === "in_progress" ? "Continue" : "Start"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Brain className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No quizzes available</h3>
            <p className="text-white/60">
              {searchQuery
                ? "Try adjusting your search"
                : "Quizzes will appear here when you enroll in courses with quiz content"}
            </p>
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-white mb-2">Coming Soon: Interactive Quizzes</h4>
                <p className="text-white/60">
                  Practice quizzes tied to your enrolled courses will help reinforce your learning. 
                  Complete quizzes to track your knowledge retention and earn practice points!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}