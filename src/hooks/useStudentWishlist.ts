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
      console.log("[useStudentWishlist] Fetching wishlist...")
      const params = new URLSearchParams()
      if (options?.page) params.set("page", options.page.toString())
      
      const url = `/api/student/wishlist?${params}`
      console.log("[useStudentWishlist] Request URL:", url)
      
      const response = await fetch(url)
      console.log("[useStudentWishlist] Response status:", response.status)
      console.log("[useStudentWishlist] Response statusText:", response.statusText)
      
      const data = await response.json()
      console.log("[useStudentWishlist] Response data:", JSON.stringify(data, null, 2))
      
      // Handle HTTP status codes
      if (response.status === 401) {
        const errorMsg = "Please log in to view your wishlist"
        setError(errorMsg)
        setTechnicalError("Authentication required - Please sign in to access this feature")
        console.error("[useStudentWishlist] 401 Unauthorized:", data)
        return
      }
      
      if (response.status === 403) {
        const errorMsg = "You don't have permission to view this content"
        setError(errorMsg)
        setTechnicalError("Access denied")
        console.error("[useStudentWishlist] 403 Forbidden:", data)
        return
      }
      
      if (response.status === 500) {
        const errorMsg = "Server error occurred"
        setError(errorMsg)
        setTechnicalError(data.technicalError || data.error || "Internal Server Error")
        console.error("[useStudentWishlist] 500 Server Error:", data)
        return
      }
      
      if (data.success) {
        console.log("[useStudentWishlist] Success! Items:", data.data?.wishlist?.length)
        setWishlist(data.data.wishlist)
        setPagination(data.data.pagination)
      } else {
        const errorMsg = data.error || "Failed to fetch wishlist"
        setError(errorMsg)
        // Capture technical error details if available
        if (data.technicalError) {
          setTechnicalError(data.technicalError)
          console.error("[useStudentWishlist] Technical Error:", data.technicalError)
        }
        if (data.errorDetails) {
          console.error("[useStudentWishlist] Error Details:", data.errorDetails)
          setTechnicalError(`${data.errorDetails.code}: ${data.errorDetails.message}`)
        }
        console.error("[useStudentWishlist] Fetch failed:", data)
      }
    } catch (err: any) {
      const errorMsg = "Network error. Please try again."
      setError(errorMsg)
      const techErr = err?.message || "Network connection failed"
      setTechnicalError(techErr)
      console.error("[useStudentWishlist] Network/Catch Error:", err)
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