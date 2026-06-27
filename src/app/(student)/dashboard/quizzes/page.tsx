"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  Brain, Play, CheckCircle2, Clock, Trophy, ChevronRight,
  Search, BarChart3, Target, Zap, BookOpen, RefreshCw
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

const mockQuizzes: Quiz[] = [
  {
    id: "q1",
    title: "Python Fundamentals Assessment",
    courseId: "c1",
    courseName: "Python for Scientific Computing",
    lessonId: "l1",
    lessonName: "Introduction to Python",
    questions: 20,
    duration: 15,
    passingScore: 70,
    attempts: 2,
    bestScore: 85,
    status: "passed"
  },
  {
    id: "q2",
    title: "Data Structures Quiz",
    courseId: "c2",
    courseName: "Data Structures & Algorithms",
    lessonId: "l2",
    lessonName: "Arrays and Linked Lists",
    questions: 15,
    duration: 10,
    passingScore: 70,
    attempts: 1,
    bestScore: 65,
    status: "in_progress"
  },
  {
    id: "q3",
    title: "Machine Learning Basics",
    courseId: "c3",
    courseName: "Introduction to Machine Learning",
    lessonId: "l3",
    lessonName: "Neural Network Basics",
    questions: 25,
    duration: 20,
    passingScore: 75,
    attempts: 0,
    bestScore: null,
    status: "not_started"
  },
  {
    id: "q4",
    title: "Bioinformatics Fundamentals",
    courseId: "c4",
    courseName: "Computational Biology Fundamentals",
    lessonId: "l4",
    lessonName: "DNA Sequencing",
    questions: 18,
    duration: 12,
    passingScore: 70,
    attempts: 0,
    bestScore: null,
    status: "not_started"
  }
]

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<"all" | "passed" | "in_progress" | "not_started">("all")

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || quiz.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: quizzes.length,
    passed: quizzes.filter(q => q.status === "passed").length,
    inProgress: quizzes.filter(q => q.status === "in_progress").length,
    notStarted: quizzes.filter(q => q.status === "not_started").length,
    avgScore: quizzes.filter(q => q.bestScore !== null)
      .reduce((acc, q) => acc + (q.bestScore || 0), 0) / 
      quizzes.filter(q => q.bestScore !== null).length || 0
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice & Quizzes</h1>
        <p className="text-muted-foreground mt-1">
          Test your knowledge and track your progress with quizzes
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-brand-purple mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.passed}</p>
            <p className="text-xs text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RefreshCw className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.notStarted}</p>
            <p className="text-xs text-muted-foreground">Not Started</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-brand-purple mx-auto mb-2" />
            <p className="text-2xl font-bold">{Math.round(stats.avgScore)}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "passed", "in_progress", "not_started"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "px-4 py-2 text-sm rounded-lg transition-colors",
                selectedStatus === status
                  ? "bg-brand-purple text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {status === "all" ? "All" : 
               status === "passed" ? "Passed" : 
               status === "in_progress" ? "In Progress" : "Not Started"}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length > 0 ? (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <Card 
              key={quiz.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Quiz Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                    quiz.status === "passed"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : quiz.status === "in_progress"
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    <Brain className={cn(
                      "h-7 w-7",
                      quiz.status === "passed"
                        ? "text-green-600 dark:text-green-400"
                        : quiz.status === "in_progress"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-400"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {quiz.courseName} • {quiz.lessonName}
                        </p>
                      </div>
                      {getStatusBadge(quiz.status)}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                      {quiz.attempts > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {quiz.attempts} attempt{quiz.attempts !== 1 ? "s" : ""}
                        </span>
                      )}
                      {quiz.bestScore !== null && (
                        <span className={cn(
                          "flex items-center gap-1 font-medium",
                          quiz.bestScore >= quiz.passingScore 
                            ? "text-green-600" 
                            : "text-amber-600"
                        )}>
                          <Trophy className="h-4 w-4" />
                          Best: {quiz.bestScore}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <Button 
                    className={cn(
                      "flex-shrink-0",
                      quiz.status === "passed" 
                        ? "bg-green-500 hover:bg-green-600"
                        : quiz.status === "in_progress"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : "bg-brand-purple hover:bg-brand-purple/90"
                    )}
                  >
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
          <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No quizzes found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedStatus !== "all"
              ? "Try adjusting your filters"
              : "Quizzes will appear here when you enroll in courses"}
          </p>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-brand-purple/5 to-brand-blue/5 border-brand-purple/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-brand-purple" />
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Why Take Quizzes?</h4>
              <p className="text-muted-foreground">
                Quizzes help reinforce your learning and identify areas where you need more practice. 
                Each quiz is tied to a specific lesson and includes multiple-choice questions covering 
                the key concepts. Complete quizzes to earn practice points and track your knowledge retention!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
