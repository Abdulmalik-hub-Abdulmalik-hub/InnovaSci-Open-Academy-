"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GraduationCap,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  RefreshCw,
  Loader2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"

export default function ScholarshipAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [scholarshipFilter, setScholarshipFilter] = useState("")

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("period", period)
      if (scholarshipFilter) params.set("scholarshipId", scholarshipFilter)

      const response = await fetch(`/api/admin/scholarship-analytics?${params}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period, scholarshipFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            Scholarship Analytics
          </h1>
          <p className="text-white/60 mt-1">Monitor scholarship performance and trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            disabled={loading}
            className="border-white/10 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && !analytics ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        </div>
      ) : analytics ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-[#1a1a2e] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Scholarships</p>
                      <p className="text-3xl font-bold text-white">{analytics.overview?.totalScholarships || 0}</p>
                      <p className="text-green-400 text-sm mt-1">
                        {analytics.overview?.activeScholarships || 0} active
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-[#1a1a2e] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Applications</p>
                      <p className="text-3xl font-bold text-white">{analytics.overview?.totalApplications || 0}</p>
                      <p className="text-blue-400 text-sm mt-1">
                        {analytics.overview?.completionRate || 0}% completion rate
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-[#1a1a2e] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Awards</p>
                      <p className="text-3xl font-bold text-white">{analytics.overview?.totalAwards || 0}</p>
                      <p className="text-green-400 text-sm mt-1">
                        {analytics.awardStats?.ACCEPTED || 0} accepted
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Award className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-[#1a1a2e] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Budget</p>
                      <p className="text-3xl font-bold text-white">
                        ${(analytics.overview?.totalBudget || 0).toLocaleString()}
                      </p>
                      <p className="text-amber-400 text-sm mt-1">
                        ${(analytics.overview?.totalSpent || 0).toLocaleString()} spent
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Status Distribution */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.applicationStats || {}).map(([status, count]) => {
                    const total = analytics.overview?.totalApplications || 1
                    const percentage = Math.round((count / total) * 100)
                    
                    const colors: Record<string, string> = {
                      SUBMITTED: "bg-blue-500",
                      UNDER_REVIEW: "bg-purple-500",
                      INTERVIEW: "bg-amber-500",
                      APPROVED: "bg-green-500",
                      REJECTED: "bg-red-500",
                      AWARDED: "bg-emerald-500",
                    }
                    
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm">{status.replace("_", " ")}</span>
                          <span className="text-white font-medium">{count as number}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[status] || "bg-gray-500"} rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Scholarships */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Scholarships</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topScholarships && analytics.topScholarships.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topScholarships.map((scholarship: any, index: number) => (
                      <div key={scholarship.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{scholarship.name}</p>
                          <p className="text-white/50 text-sm">{scholarship.type.replace("_", " ")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{scholarship.applicationCount} apps</p>
                          <p className="text-white/50 text-sm">{scholarship.viewCount} views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    No scholarship data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Country Distribution */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.countryDistribution && analytics.countryDistribution.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.countryDistribution.slice(0, 8).map((item: any, index: number) => (
                      <div key={item.country} className="flex items-center gap-3">
                        <span className="text-white/50 text-sm w-6">{index + 1}</span>
                        <span className="text-white flex-1">{item.country || "Unknown"}</span>
                        <Badge variant="outline" className="border-white/20 text-white/80">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    No country data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.genderDistribution && analytics.genderDistribution.length > 0 ? (
                  <div className="flex items-center justify-center gap-8 py-4">
                    {analytics.genderDistribution.map((item: any) => (
                      <div key={item.gender} className="text-center">
                        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-2 mx-auto">
                          <span className="text-2xl font-bold text-purple-400">{item.count}</span>
                        </div>
                        <p className="text-white/80">{item.gender || "Not Specified"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    No gender data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Trend Chart Placeholder */}
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Application Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.trend && analytics.trend.length > 0 ? (
                <div className="h-64 flex items-end gap-1">
                  {analytics.trend.slice(-14).map((day: any, index: number) => {
                    const maxValue = Math.max(...analytics.trend.map((d: any) => d.submitted + d.approved + d.rejected), 1)
                    const height = Math.max(((day.submitted + day.approved + day.rejected) / maxValue) * 100, 5)
                    
                    return (
                      <div
                        key={day.date}
                        className="flex-1 group relative"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          <p className="font-medium">{day.date}</p>
                          <p>Submitted: {day.submitted}</p>
                          <p>Approved: {day.approved}</p>
                          <p>Rejected: {day.rejected}</p>
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t"
                          style={{ height: "100%" }}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-white/50">
                  No trend data available for this period
                </div>
              )}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span className="text-white/60 text-sm">Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-white/60 text-sm">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-white/60 text-sm">Rejected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-20 text-white/60">
          Failed to load analytics. Please try again.
        </div>
      )}
    </div>
  )
}
