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

interface UseStudentCertificatesReturn {
  certificates: StudentCertificate[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  fetchCertificates: (params?: { page?: number; limit?: number }) => Promise<void>
  refresh: () => void
}

export function useStudentCertificates(): UseStudentCertificatesReturn {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([])
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
      const searchParams = new URLSearchParams()
      searchParams.set("page", String(params?.page || 1))
      searchParams.set("limit", String(params?.limit || 20))

      const response = await fetch(`/api/student/certificates?${searchParams.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch certificates")
      }

      setCertificates(result.data.certificates)
      setPagination(result.data.pagination)
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
    loading,
    error,
    pagination,
    fetchCertificates,
    refresh: fetchCertificates,
  }
}
