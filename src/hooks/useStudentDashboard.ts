"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface CurrentEnrollment {
  id: string
  courseId: string
  course: {
    id: string
    title: string
    thumbnailUrl: string | null
    category: string | null
    durationHours: number | null
    totalLessons: number
  }
  progressPercent: number
  enrolledAt: string
}

export interface EnrollmentSummary {
  id: string
  courseId: string
  course: {
    id: string
    title: string
    thumbnailUrl: string | null
    category: string | null
    durationHours: number | null
    totalLessons: number
  }
  progressPercent: number
  completed: boolean
  enrolledAt: string
}

export interface Certificate {
  id: string
  verificationCode: string
  certificateUrl: string | null
  issuedAt: string
  course: {
    id: string
    title: string
    thumbnailUrl: string | null
  }
}

export interface RecommendedCourse {
  id: string
  title: string
  thumbnailUrl: string | null
  shortDescription: string | null
  category: string | null
  durationHours: number | null
  studentCount: number
}

export interface RecentActivity {
  type: string
  course: string
  lesson: string
  timestamp: string
}

export interface DashboardStats {
  totalEnrolled: number
  completedCourses: number
  totalHoursLearned: number
  certificatesEarned: number
  activeAwards: number
  pendingApplications: number
}

export interface StudentAward {
  id: string
  awardNumber: string
  status: string
  amount: number | null
  currency: string
  benefits: any
  startDate: string | null
  endDate: string | null
  acceptanceDeadline: string | null
  scholarship: {
    id: string
    name: string
    slug: string
    type: string
  }
}

export interface StudentApplication {
  id: string
  applicationNumber: string
  trackingNumber: string
  status: string
  scholarship: {
    id: string
    name: string
    slug: string
    type: string
    thumbnailUrl: string | null
  }
  createdAt: string
  submittedAt: string | null
}

export interface StudentDashboardData {
  currentEnrollment: CurrentEnrollment | null
  enrollments: EnrollmentSummary[]
  certificates: Certificate[]
  recommendedCourses: RecommendedCourse[]
  recentActivity: RecentActivity[]
  awards: StudentAward[]
  applications: StudentApplication[]
  stats: DashboardStats
}

interface UseStudentDashboardReturn {
  data: StudentDashboardData | null
  loading: boolean
  error: string | null
  retryCount: number
  lastFetchTime: Date | null
  refresh: () => void
}

// Maximum retry attempts
const MAX_RETRIES = 3

// Timeout in milliseconds
const FETCH_TIMEOUT = 15000

export function useStudentDashboard(): UseStudentDashboardReturn {
  const [data, setData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchDashboard = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    const endpoint = "/api/student/dashboard"
    const startTime = Date.now()

    try {
      console.log(`[useStudentDashboard] Fetching from ${endpoint} (attempt ${retryCount + 1})`)

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after ${FETCH_TIMEOUT}ms`))
        }, FETCH_TIMEOUT)
      })

      // Create fetch promise with abort controller
      const fetchPromise = fetch(endpoint, {
        signal: abortControllerRef.current.signal,
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise])
      const duration = Date.now() - startTime

      console.log(`[useStudentDashboard] Response received in ${duration}ms`, {
        status: response.status,
        statusText: response.statusText,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[useStudentDashboard] HTTP Error:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      console.log(`[useStudentDashboard] Response:`, {
        success: result.success,
        hasData: !!result.data,
        warning: result.warning,
        error: result.error,
        code: result.code,
      })

      if (!result.success) {
        throw new Error(result.error || result.message || "Failed to fetch dashboard data")
      }

      setData(result.data)
      setLastFetchTime(new Date())
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const duration = Date.now() - startTime
      const errorMessage = err instanceof Error ? err.message : "Unknown error"

      // Check if this is an abort error (cancelled request)
      if (err instanceof Error && err.name === "AbortError") {
        console.log(`[useStudentDashboard] Request aborted`)
        return
      }

      console.error(`[useStudentDashboard] Fetch failed after ${duration}ms:`, {
        error: err,
        message: errorMessage,
        name: err instanceof Error ? err.name : "Unknown",
        stack: err instanceof Error ? err.stack : undefined,
        attempt: retryCount + 1,
        maxRetries: MAX_RETRIES,
      })

      // Retry logic
      if (retryCount < MAX_RETRIES - 1) {
        const nextRetry = retryCount + 1
        console.log(`[useStudentDashboard] Scheduling retry ${nextRetry}/${MAX_RETRIES}`)
        setRetryCount(nextRetry)
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, nextRetry), 5000)
        setTimeout(() => {
          fetchDashboard()
        }, delay)
        return
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [retryCount])

  useEffect(() => {
    fetchDashboard()

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, []) // Only run on mount

  return {
    data,
    loading,
    error,
    retryCount,
    lastFetchTime,
    refresh: fetchDashboard,
  }
}
