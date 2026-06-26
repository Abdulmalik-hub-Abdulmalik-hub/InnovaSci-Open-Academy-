"use client"

import { useState, useCallback } from "react"

export interface CertificateUser {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
}

export interface CertificateCourse {
  id: string
  title: string
  slug: string
  thumbnailUrl: string | null
}

export interface Certificate {
  id: string
  verificationCode: string
  certificateUrl: string | null
  status: string
  issuedAt: string
  user?: CertificateUser | null
  course?: CertificateCourse | null
}

interface UseCertificatesReturn {
  certificates: Certificate[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  fetchCertificates: (params?: {
    page?: number
    limit?: number
    status?: string
    courseId?: string
    search?: string
  }) => Promise<void>
  generateCertificate: (userId: string, courseId: string) => Promise<{ success: boolean; error?: string; certificate?: Certificate }>
  revokeCertificate: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteCertificate: (id: string) => Promise<{ success: boolean; error?: string }>
  verifyCertificate: (code: string) => Promise<{ valid: boolean; error?: string }>
}

export function useCertificates(): UseCertificatesReturn {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchCertificates = useCallback(async (params?: {
    page?: number
    limit?: number
    status?: string
    courseId?: string
    search?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      searchParams.set("page", String(params?.page || 1))
      searchParams.set("limit", String(params?.limit || 20))
      if (params?.status) searchParams.set("status", params.status)
      if (params?.courseId) searchParams.set("courseId", params.courseId)
      if (params?.search) searchParams.set("search", params.search)

      const response = await fetch(`/api/admin/certificates?${searchParams.toString()}`)
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

  const generateCertificate = useCallback(async (
    userId: string,
    courseId: string
  ): Promise<{ success: boolean; error?: string; certificate?: Certificate }> => {
    try {
      const response = await fetch("/api/admin/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      await fetchCertificates()
      return { success: true, certificate: result.data.certificate }
    } catch (err) {
      console.error("Generate certificate error:", err)
      return { success: false, error: "Failed to generate certificate" }
    }
  }, [fetchCertificates])

  const revokeCertificate = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/certificates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revoked" }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setCertificates(prev => prev.map(c => 
        c.id === id ? { ...c, status: "revoked" } : c
      ))
      return { success: true }
    } catch (err) {
      console.error("Revoke certificate error:", err)
      return { success: false, error: "Failed to revoke certificate" }
    }
  }, [])

  const deleteCertificate = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/certificates/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      setCertificates(prev => prev.filter(c => c.id !== id))
      return { success: true }
    } catch (err) {
      console.error("Delete certificate error:", err)
      return { success: false, error: "Failed to delete certificate" }
    }
  }, [])

  const verifyCertificate = useCallback(async (code: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/public/certificates/verify?code=${encodeURIComponent(code)}`)
      const result = await response.json()

      if (!result.success) {
        return { valid: false, error: result.error }
      }

      return { valid: result.data.valid }
    } catch (err) {
      console.error("Verify certificate error:", err)
      return { valid: false, error: "Failed to verify certificate" }
    }
  }, [])

  return {
    certificates,
    loading,
    error,
    pagination,
    fetchCertificates,
    generateCertificate,
    revokeCertificate,
    deleteCertificate,
    verifyCertificate,
  }
}