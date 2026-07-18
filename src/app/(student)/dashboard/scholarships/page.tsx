"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  FileText,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { format } from "date-fns"

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-amber-500/20 text-amber-400", icon: Clock, label: "Pending Acceptance" },
  ACCEPTED: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Active" },
  DECLINED: { color: "bg-red-500/20 text-red-400", icon: Clock, label: "Declined" },
  REVOKED: { color: "bg-red-500/20 text-red-400", icon: Clock, label: "Revoked" },
  EXPIRED: { color: "bg-gray-500/20 text-gray-400", icon: Clock, label: "Expired" },
}

export default function StudentScholarshipsPage() {
  const [awards, setAwards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from the API
    // For now, we'll show an empty state
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          My Scholarships
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View your scholarship awards and benefits
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/scholarships">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Browse Scholarships</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Explore available scholarship opportunities</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/scholarships/track">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Track Applications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check the status of your applications</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Awarded Scholarships */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            My Awards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            </div>
          ) : awards.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Scholarship Awards Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Once you are awarded a scholarship, it will appear here with all the details and benefits.
              </p>
              <Link href="/scholarships">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Browse Scholarships
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {awards.map((award) => {
                const config = statusConfig[award.status] || { color: "bg-gray-500/20 text-gray-400", icon: Clock, label: award.status }
                const Icon = config.icon
                
                return (
                  <motion.div
                    key={award.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl border border-purple-500/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Award className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {award.scholarship?.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Award #{award.awardNumber}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={config.color}>
                              <Icon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                            {award.amount && (
                              <Badge variant="outline" className="border-green-500/50 text-green-500">
                                {award.currency} {Number(award.amount).toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/dashboard/scholarships/${award.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Benefits */}
                    {award.benefits && (
                      <div className="mt-4 pt-4 border-t border-purple-500/20">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Benefits:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {award.benefits.plans?.map((planId: string) => (
                            <Badge key={planId} variant="outline" className="border-purple-500/50 text-purple-500">
                              <BookOpen className="h-3 w-3 mr-1" />
                              Membership Access
                            </Badge>
                          ))}
                          {award.benefits.domains?.map((domainId: string) => (
                            <Badge key={domainId} variant="outline" className="border-blue-500/50 text-blue-500">
                              <Users className="h-3 w-3 mr-1" />
                              Domain Access
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Acceptance Deadline */}
                    {award.status === "PENDING" && award.acceptanceDeadline && (
                      <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Please accept your award by {format(new Date(award.acceptanceDeadline), "MMMM d, yyyy")}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Information */}
      {awards.some(a => a.status === "ACCEPTED") && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Your Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Your scholarship benefits have been applied to your account. You now have access to:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-500/5 rounded-lg text-center">
                <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Premium Courses</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Included in your scholarship</p>
              </div>
              <div className="p-4 bg-blue-500/5 rounded-lg text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Domain Access</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Research environments</p>
              </div>
              <div className="p-4 bg-green-500/5 rounded-lg text-center">
                <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Certificates</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Earn as you learn</p>
              </div>
              <div className="p-4 bg-amber-500/5 rounded-lg text-center">
                <GraduationCap className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Mentorship</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Expert guidance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
