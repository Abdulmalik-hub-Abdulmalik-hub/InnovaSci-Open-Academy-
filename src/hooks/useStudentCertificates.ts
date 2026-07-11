"use client"

import { useState, useEffect, useCallback } from "react"

export interface StudentCertificate {
  id: string
  verificationCode: string
  certificateUrl: string | null
  issuedAt: string
  course: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string | null
    category: string | null
  }
}

// New interfaces for Category & Domain Certificates
export interface CategoryCertificateProgress {
  id: string
  name: string
  description: string | null
  category: {
    id: string
    name: string
    slug: string
    domain: {
      id: string
      name: string
      slug: string
      icon: string | null
      color: string | null
    }
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

export interface DomainCertificateProgress {
  id: string
  name: string
  description: string | null
  domain: {
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
    earnedCategoryCertificates: number
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
  // Legacy course certificates
  certificates: StudentCertificate[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  // New Category & Domain certificates
  categoryCertificates: CategoryCertificateProgress[]
  domainCertificates: DomainCertificateProgress[]
  stats: CertificateStats
  loading: boolean
  error: string | null
  fetchCertificates: (params?: { page?: number; limit?: number }) => Promise<void>
  refresh: () => void
}

export function useStudentCertificates(): UseStudentCertificatesReturn {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([])
  const [categoryCertificates, setCategoryCertificates] = useState<CategoryCertificateProgress[]>([])
  const [domainCertificates, setDomainCertificates] = useState<DomainCertificateProgress[]>([])
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    earnedCertificates: 0,
    eligibleCertificates: 0,
    inProgress: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchCertificates = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch new certificate progress data
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
      }

      // Also fetch legacy certificates for backward compatibility
      const searchParams = new URLSearchParams()
      searchParams.set("page", String(params?.page || 1))
      searchParams.set("limit", String(params?.limit || 20))

      const legacyResponse = await fetch(`/api/student/certificates?${searchParams.toString()}`)
      const legacyResult = await legacyResponse.json()

      if (legacyResult.success) {
        setCertificates(legacyResult.data.certificates || [])
        setPagination(legacyResult.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        })
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
    certificates,
    pagination,
    categoryCertificates,
    domainCertificates,
    stats,
    loading,
    error,
    fetchCertificates,
    refresh: fetchCertificates,
  }
}
