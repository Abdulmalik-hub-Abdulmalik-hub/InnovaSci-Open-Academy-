"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Lock, Check } from "lucide-react"

export interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  onEnroll: () => void
  courseTitle: string
  coursePrice: number
  isFree: boolean
  totalLessons: number
}

export function EnrollmentModal({
  isOpen,
  onClose,
  onEnroll,
  courseTitle,
  coursePrice,
  isFree,
  totalLessons,
}: EnrollmentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Enroll to Access All Lessons</h3>
              <p className="text-muted-foreground">
                This lesson is part of the full course. 
                Enroll now to unlock all {totalLessons} lessons and get lifetime access.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Course</span>
                  <span className="font-medium truncate ml-2">{courseTitle}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Total Lessons</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex items-center justify-between">
                  <span className="font-semibold">Price</span>
                  <span className="font-bold text-2xl">
                    {isFree ? "Free" : `$${coursePrice}`}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                size="lg"
                onClick={onEnroll}
              >
                {isFree ? (
                  <>
                    <Check className="w-4 h-4" />
                    Enroll for Free
                  </>
                ) : (
                  `Enroll Now for $${coursePrice}`
                )}
              </Button>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={onClose}
              >
                Continue Previewing
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                By enrolling, you get lifetime access to all course materials and a certificate of completion.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}