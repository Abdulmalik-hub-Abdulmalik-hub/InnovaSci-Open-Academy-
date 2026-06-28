"use client"

import { useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  courseId: string
  initialInWishlist?: boolean
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function WishlistButton({
  courseId,
  initialInWishlist = false,
  size = "md",
  showText = false,
  className
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    
    setLoading(true)
    // Optimistic update
    const newState = !inWishlist
    setInWishlist(newState)
    
    try {
      const response = await fetch("/api/student/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        // Revert on error
        setInWishlist(!newState)
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error)
      // Revert on error
      setInWishlist(!newState)
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200",
        inWishlist 
          ? "bg-red-500/90 text-white hover:bg-red-600" 
          : "bg-white/90 dark:bg-gray-800/90 text-gray-600 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700",
        sizeClasses[size],
        className
      )}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {loading ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : (
        <Heart 
          className={cn(
            iconSizes[size],
            "transition-transform",
            inWishlist ? "fill-current scale-110" : "hover:scale-110"
          )} 
        />
      )}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {inWishlist ? "Saved" : "Save"}
        </span>
      )}
    </button>
  )
}

// Hook to manage wishlist state across components
export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

  const toggleWishlist = async (courseId: string) => {
    const isInWishlist = wishlistIds.has(courseId)
    
    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev)
      if (isInWishlist) {
        next.delete(courseId)
      } else {
        next.add(courseId)
      }
      return next
    })

    try {
      const response = await fetch("/api/student/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        // Revert on error
        setWishlistIds(prev => {
          const next = new Set(prev)
          if (isInWishlist) {
            next.add(courseId)
          } else {
            next.delete(courseId)
          }
          return next
        })
      }
      
      return data.data?.inWishlist ?? !isInWishlist
    } catch (error) {
      console.error("Wishlist toggle error:", error)
      // Revert on error
      setWishlistIds(prev => {
        const next = new Set(prev)
        if (isInWishlist) {
          next.add(courseId)
        } else {
          next.delete(courseId)
        }
        return next
      })
      return isInWishlist
    }
  }

  const isInWishlist = (courseId: string) => wishlistIds.has(courseId)

  return { wishlistIds, toggleWishlist, isInWishlist, setWishlistIds }
}