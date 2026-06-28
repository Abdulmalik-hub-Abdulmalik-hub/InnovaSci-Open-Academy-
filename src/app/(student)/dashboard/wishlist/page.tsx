"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useStudentWishlist } from "@/hooks/useStudentWishlist"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, BookOpen, Clock, Trash2, ArrowRight, Loader2,
  Play, Users
} from "lucide-react"

export default function WishlistPage() {
  const { wishlist, loading, error, pagination, fetchWishlist, removeFromWishlist } = useStudentWishlist()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (courseId: string) => {
    setRemovingId(courseId)
    await removeFromWishlist(courseId)
    setRemovingId(null)
  }

  if (loading && wishlist.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground mt-1">
            Courses you've saved for later
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {pagination.total}
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">
              Saved Courses
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchWishlist()}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Wishlist Grid */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
                {item.course.thumbnailUrl ? (
                  <img 
                    src={item.course.thumbnailUrl} 
                    alt={item.course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/20 to-brand-blue/20">
                    <BookOpen className="h-12 w-12 text-brand-purple/30" />
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.courseId)}
                  disabled={removingId === item.courseId}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from wishlist"
                >
                  {removingId === item.courseId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>

                {/* Category Badge */}
                {item.course.category && (
                  <Badge className="absolute top-2 left-2 bg-brand-purple/90 text-white">
                    {item.course.category}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                {/* Difficulty */}
                {item.course.difficultyLevel && (
                  <Badge variant="outline" className="text-xs mb-2 capitalize">
                    {item.course.difficultyLevel}
                  </Badge>
                )}
                
                <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-brand-purple transition-colors">
                  {item.course.title}
                </h3>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {item.course.durationHours && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {item.course.durationHours}h
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {item.course.totalLessons} lessons
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold">
                    {item.course.isFree || item.course.price === 0 || item.course.price === null ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>${item.course.price}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Action */}
                <Link href={`/dashboard/learn/${item.courseId}`} className="block">
                  <Button className="w-full bg-brand-purple hover:bg-brand-purple/90">
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses in your wishlist yet</h3>
          <p className="text-muted-foreground mb-6">
            Start exploring courses and save the ones you're interested in!
          </p>
          <Button asChild>
            <Link href="/courses">
              Browse Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchWishlist({ page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchWishlist({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}