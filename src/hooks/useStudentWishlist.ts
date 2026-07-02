"use client"

import { useState, useEffect, useCallback } from "react"

export interface WishlistItem {
  id: string
  courseId: string
  addedAt: string
  course: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string | null
    category: string | null
    shortDescription: string | null
    durationHours: number | null
    difficultyLevel: string | null
    price: number | null
    isFree: boolean
    totalLessons: number
  }
}

interface WishlistError {
  message: string
  technicalError?: string
  errorDetails?: {
    message: string
    code: string
    stack?: string
  }
}

export function useStudentWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [technicalError, setTechnicalError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchWishlist = useCallback(async (options?: { page?: number }) => {
    setLoading(true)
    setError(null)
    setTechnicalError(null)
    
    try {
      const params = new URLSearchParams()
      if (options?.page) params.set("page", options.page.toString())
      
      const response = await fetch(`/api/student/wishlist?${params}`)
      const data = await response.json()
      
      // Handle HTTP status codes
      if (response.status === 401) {
        setError("Please log in to view your wishlist")
        setTechnicalError("Authentication required - Please sign in to access this feature")
        return
      }
      
      if (response.status === 403) {
        setError("You don't have permission to view this content")
        setTechnicalError("Access denied")
        return
      }
      
      if (data.success) {
        setWishlist(data.data.wishlist)
        setPagination(data.data.pagination)
      } else {
        setError(data.error || "Failed to fetch wishlist")
        // Capture technical error details if available
        if (data.technicalError) {
          setTechnicalError(data.technicalError)
        }
        if (data.errorDetails && process.env.NODE_ENV === "development") {
          setTechnicalError(`${data.errorDetails.code}: ${data.errorDetails.message}`)
        }
      }
    } catch (err: any) {
      setError("Network error. Please try again.")
      setTechnicalError(err?.message || "Network connection failed")
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleWishlist = async (courseId: string) => {
    try {
      const response = await fetch("/api/student/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (data.data.action === "added") {
          // Refresh to get full course data
          await fetchWishlist()
        } else {
          // Remove from local state
          setWishlist(prev => prev.filter(item => item.courseId !== courseId))
          setPagination(prev => ({
            ...prev,
            total: prev.total - 1
          }))
        }
        return data.data.inWishlist
      }
      return null
    } catch (err: any) {
      console.error("Wishlist toggle error:", err)
      return null
    }
  }

  const removeFromWishlist = async (courseId: string) => {
    return toggleWishlist(courseId)
  }

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  return {
    wishlist,
    loading,
    error,
    technicalError,
    pagination,
    fetchWishlist,
    toggleWishlist,
    removeFromWishlist
  }
}