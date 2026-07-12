"use client"

import { useState, useEffect, useCallback } from "react"

// New interfaces for Category & Domain Certificates
export interface CategoryCertificateProgress {
  id: string
  name: string
  description: string | null
  category?: {
    id: string
    name: string
    slug: string
    domain?: {
      id: string
      name: string
      slug: string
      icon: string | null
      color: string | null
    }
  }
  domain?: {
    id: string
    name: string
    slug: string
    icon: string | null
    color: string | null
  }
  progress: {
    overall: number
    coursesCompleted: number
    totalCourses: number
    lessonsCompleted: number
    totalLessons: number
    exercisesCompleted: number
    miniProjectsCompleted: number
    totalMiniProjects: number
    capstonesCompleted: number
    totalCapstones: number
    earnedCategoryCertificates?: number
  }
  isEligible: boolean
  isIssued: boolean
  issuedCertificate: {
    id: string
    certificateCode: string
    verificationUrl: string
    issuedAt: string
  } | null
}

export interface CertificateStats {
  totalCertificates: number
  earnedCertificates: number
  eligibleCertificates: number
  inProgress: number
}

interface UseStudentCertificatesReturn {
  categoryCertificates: CategoryCertificateProgress[]
  domainCertificates: CategoryCertificateProgress[]
  stats: CertificateStats
  loading: boolean
  error: string | null
  fetchCertificates: () => Promise<void>
  refresh: () => void
}

export function useStudentCertificates(): UseStudentCertificatesReturn {
  const [categoryCertificates, setCategoryCertificates] = useState<CategoryCertificateProgress[]>([])
  const [domainCertificates, setDomainCertificates] = useState<CategoryCertificateProgress[]>([])
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    earnedCertificates: 0,
    eligibleCertificates: 0,
    inProgress: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCertificates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch new certificate progress data from API
      const response = await fetch("/api/student/certificates")
      const result = await response.json()

      if (result.success) {
        setCategoryCertificates(result.data.categoryCertificates || [])
        setDomainCertificates(result.data.domainCertificates || [])
        setStats(result.data.stats || {
          totalCertificates: 0,
          earnedCertificates: 0,
          eligibleCertificates: 0,
          inProgress: 0,
        })
      } else {
        setError(result.error || "Failed to load certificates")
      }
    } catch (err) {
      console.error("Fetch certificates error:", err)
      setError(err instanceof Error ? err.message : "Failed to load certificates")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  return {
    categoryCertificates,
    domainCertificates,
    stats,
    loading,
    error,
    fetchCertificates,
    refresh: fetchCertificates,
  }
}
