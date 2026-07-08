"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDashboard, formatRelativeTime } from "@/hooks/useDashboard"
import { 
  Users, GraduationCap, DollarSign, Activity, 
  BookOpen, Award, ArrowUpRight, ArrowDownRight,
  RefreshCw, AlertCircle, Loader2, Plus
} from "lucide-react"

function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color, 
  bg,
  loading 
}: { 
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down"
  icon: React.ElementType
  color: string
  bg: string
  loading?: boolean
}) {
  return (
    <Card className="bg-[#1a1a2e] border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white/50" />
          ) : (
            <Icon className={`h-5 w-5 ${color}`} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-20 bg-white/10 rounded animate-pulse mb-1" />
        ) : (
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
        )}
        {change && (
          <div className="flex items-center gap-1">
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-400" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-sm ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
              {change}
            </span>
            <span className="text-sm text-white/50">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#1a1a2e] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
              <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-white/10 rounded animate-pulse mb-1" />
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a2e] border-white/10 lg:col-span-2">
          <CardHeader>
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <div className="h-6 w-28 bg-white/10 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <div className="h-6 w-6 bg-white/10 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Failed to load dashboard</h3>
      <p className="text-white/60 mb-4 text-center max-w-md">{error}</p>
      <Button onClick={onRetry} className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}

export default function AdminDashboard() {
  const { data, loading, error, refresh } = useDashboard()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  if (lastUpdated) {
    // Update last updated time
  }

  if (loading && !data) {
    return <LoadingSkeleton />
  }

  if (error && !data) {
    return <ErrorState error={error} onRetry={refresh} />
  }

  if (!data) {
    return <LoadingSkeleton />
  }

  const { stats, recentActivity, topCourses } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60">Welcome back! Here&apos;s your platform overview.</p>
        </div>
        <Button 
          onClick={refresh} 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Total Revenue"
            value={stats.formattedRevenue || "$0"}
            change="+12.5%"
            trend="up"
            icon={DollarSign}
            color="text-green-400"
            bg="bg-green-400/10"
            loading={loading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Active Users"
            value={stats.activeUsers?.toLocaleString() || 0}
            change="+8.2%"
            trend="up"
            icon={Users}
            color="text-blue-400"
            bg="bg-blue-400/10"
            loading={loading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Total Courses"
            value={stats.totalCourses || 0}
            change={`${stats.publishedCourses || 0} published`}
            trend="up"
            icon={GraduationCap}
            color="text-purple-400"
            bg="bg-purple-400/10"
            loading={loading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate || 0}%`}
            change="-2.1%"
            trend="down"
            icon={Activity}
            color="text-amber-400"
            bg="bg-amber-400/10"
            loading={loading}
          />
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10 p-4">
          <div className="text-sm text-white/60">Total Enrollments</div>
          <div className="text-xl font-bold text-white">{stats.totalEnrollments?.toLocaleString() || 0}</div>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10 p-4">
          <div className="text-sm text-white/60">Completed Courses</div>
          <div className="text-xl font-bold text-green-400">{stats.completedEnrollments?.toLocaleString() || 0}</div>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10 p-4">
          <div className="text-sm text-white/60">Total Users</div>
          <div className="text-xl font-bold text-white">{stats.totalUsers?.toLocaleString() || 0}</div>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10 p-4">
          <div className="text-sm text-white/60">Draft Courses</div>
          <div className="text-xl font-bold text-amber-400">{stats.draftCourses || 0}</div>
        </Card>
      </div>

      {/* Recent Activity & Top Courses */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="bg-[#1a1a2e] border-white/10 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              Recent Activity
            </CardTitle>
            {lastUpdated && (
              <span className="text-xs text-white/40">
                Updated {formatRelativeTime(lastUpdated.toISOString())}
              </span>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                No recent activity yet
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {activity.userName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        <span className="font-medium">{activity.userName}</span>
                        {" "}{activity.action}{" "}
                        <span className="text-purple-400">{activity.target || `$${activity.amount}`}</span>
                      </p>
                      <p className="text-xs text-white/50">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                    {activity.type === "payment" && (
                      <Badge className="bg-green-500/20 text-green-400">
                        ${activity.amount}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Top Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                    <div className="h-6 w-6 bg-white/10 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topCourses.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                No courses yet
              </div>
            ) : (
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div 
                    key={course.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-lg font-bold text-white/30">{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white line-clamp-1">{course.title}</p>
                      <p className="text-xs text-white/50">
                        {course.students?.toLocaleString() || 0} students • {course.completed || 0} completed
                      </p>
                    </div>
                    <Badge 
                      variant={course.status === "published" ? "default" : "secondary"}
                      className={course.status === "published" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-amber-500/20 text-amber-400"
                      }
                    >
                      {course.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a 
              href="/admin/courses/create"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center cursor-pointer"
            >
              <GraduationCap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <span className="text-sm text-white">Add Course</span>
            </a>
            <a 
              href="/admin/users?action=create"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center cursor-pointer"
            >
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <span className="text-sm text-white">Add User</span>
            </a>
            <a 
              href="/admin/certificates"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center cursor-pointer"
            >
              <Award className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <span className="text-sm text-white">Certificates</span>
            </a>
            <a 
              href="/admin/analytics"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center cursor-pointer"
            >
              <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <span className="text-sm text-white">View Analytics</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
