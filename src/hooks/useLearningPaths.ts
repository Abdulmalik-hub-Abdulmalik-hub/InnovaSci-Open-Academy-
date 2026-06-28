"use client"

import { useState, useEffect, useCallback } from "react"

export interface LearningPathCourse {
  id: string
  title: string
  slug: string
  thumbnailUrl: string | null
  price: number
  isFree: boolean
  orderIndex: number
  isRequired: boolean
  stepTitle: string | null
  totalLessons: number | null
  durationHours: number | null
  enrolled: boolean
  progressPercent: number
  completed: boolean
}

export interface LearningPath {
  id: string
  title: string
  slug: string
  subtitle: string | null
  description: string | null
  thumbnailUrl: string | null
  difficultyLevel: string
  estimatedHours: number | null
  courses: LearningPathCourse[]
  stats: {
    totalCourses: number
    completedCourses: number
    enrolledCourses: number
    overallProgress: number
    isCompleted: boolean
  }
}

interface UseLearningPathsReturn {
  learningPaths: LearningPath[]
  loading: boolean
  error: string | null
  fetchLearningPaths: () => Promise<void>
  refresh: () => void
  activePath: LearningPath | null
}

export function useLearningPaths(): UseLearningPathsReturn {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLearningPaths = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/student/learning-paths")
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch learning paths")
      }

      setLearningPaths(result.data.learningPaths)
    } catch (err) {
      console.error("Fetch learning paths error:", err)
      setError(err instanceof Error ? err.message : "Failed to load learning paths")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLearningPaths()
  }, [fetchLearningPaths])

  // Get the active path (in progress, not completed)
  const activePath = learningPaths.find(
    p => p.stats.enrolledCourses > 0 && !p.stats.isCompleted
  ) || null

  return {
    learningPaths,
    loading,
    error,
    fetchLearningPaths,
    refresh: fetchLearningPaths,
    activePath,
  }
}
