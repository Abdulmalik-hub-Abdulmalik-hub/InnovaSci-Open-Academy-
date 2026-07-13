"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3, Award, Users, DollarSign, TrendingUp, CheckCircle,
  XCircle, Clock, Globe, Calendar, RefreshCw, Download, Eye
} from "lucide-react"

interface AnalyticsData {
  summary: {
    totalScholarships: number
    activeScholarships: number
    totalApplications: number
    totalAwards: number
    totalSponsors: number
    totalBudget: number
    budgetUsed: number
    budgetRemaining: number
  }
  scholarshipStats: {
    total: number
    draft: number
    published: number
    closed: number
    archived: number
  }
  applicationStats: {
    total: number
    submitted: number
    underReview: number
    interview: number
    additionalInfo: number
    approved: number
    rejected: number
    withdrawn: number
    approvalRate: number
  }
  applicationsTrend: { date: string; count: number }[]
  countryDistribution: { country: string; count: number }[]
  genderDistribution: { gender: string; count: number }[]
  topScholarships: { scholarship: any; applicationCount: number }[]
  period: string
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/scholarships/analytics?period=${period}`)
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPeriodLabel = (p: string) => {
    const labels: Record<string, string> = {
      "7d": "Last 7 days",
      "30d": "Last 30 days",
      "90d": "Last 90 days",
      "1y": "Last year",
      all: "All time",
    }
    return labels[p] || p
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Analytics</h1>
          <p className="text-white/60 mt-1">
            Comprehensive insights into your scholarship programs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            className="border-white/20 text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Budget</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(analytics?.summary.totalBudget || 0)}
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    {loading ? <Skeleton className="h-4 w-16" /> : `${formatCurrency(analytics?.summary.budgetUsed || 0)} used`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-400" />
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
                  <p className="text-white/60 text-sm">Total Applications</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {loading ? <Skeleton className="h-8 w-24" /> : analytics?.summary.totalApplications.toLocaleString()}
                  </p>
                  <p className="text-blue-400 text-sm mt-1">
                    {loading ? <Skeleton className="h-4 w-20" /> : `${analytics?.applicationStats.approvalRate || 0}% approval rate`}
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
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active Scholarships</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {loading ? <Skeleton className="h-8 w-24" /> : analytics?.summary.activeScholarships}
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    {loading ? <Skeleton className="h-4 w-16" /> : `of ${analytics?.scholarshipStats.total || 0} total`}
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
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Awards</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {loading ? <Skeleton className="h-8 w-24" /> : analytics?.summary.totalAwards}
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    {loading ? <Skeleton className="h-4 w-20" /> : `${analytics?.summary.totalSponsors || 0} sponsors`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Application Status Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Application Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <StatusBar
                    label="Submitted"
                    value={analytics?.applicationStats.submitted || 0}
                    total={analytics?.applicationStats.total || 0}
                    color="bg-blue-500"
                    icon={Eye}
                  />
                  <StatusBar
                    label="Under Review"
                    value={analytics?.applicationStats.underReview || 0}
                    total={analytics?.applicationStats.total || 0}
                    color="bg-yellow-500"
                    icon={Clock}
                  />
                  <StatusBar
                    label="Interview"
                    value={analytics?.applicationStats.interview || 0}
                    total={analytics?.applicationStats.total || 0}
                    color="bg-purple-500"
                    icon={Users}
                  />
                  <StatusBar
                    label="Additional Info"
                    value={analytics?.applicationStats.additionalInfo || 0}
                    total={analytics?.applicationStats.total || 0}
                    color="bg-orange-500"
                    icon={Clock}
                  />
                  <StatusBar
                    label="Approved"
                    value={analytics?.applicationStats.approved || 0}
                    total={analytics?.applicationStats.total || 0}
                    color="bg-green-500"
                    icon={CheckCircle}
                  />
                  <StatusBar
                    label="Rejected"
                    value={analytics?.applicationStats.rejected || 0}
                    total={analytics?.applicationStats.total || 0}
                    color="bg-red-500"
                    icon={XCircle}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Scholarships */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-400" />
                Top Performing Scholarships
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : analytics?.topScholarships.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  No scholarship data available
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics?.topScholarships.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {item.scholarship?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-white/50">
                          {item.scholarship?.type?.name || "General"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{item.applicationCount}</p>
                        <p className="text-xs text-white/50">applications</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Geographic Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-400" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : analytics?.countryDistribution.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  No geographic data available
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics?.countryDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-24 text-white/70 text-sm truncate">{item.country}</div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                          style={{
                            width: `${(item.count / (analytics?.countryDistribution[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="w-12 text-right text-white/70 text-sm">{item.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : analytics?.genderDistribution.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  No gender data available
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {analytics?.genderDistribution.map((item, index) => {
                    const colors = ["bg-blue-500/20 text-blue-400", "bg-pink-500/20 text-pink-400", "bg-gray-500/20 text-gray-400"]
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${colors[index % 3]} text-center`}
                      >
                        <p className="text-2xl font-bold">{item.count}</p>
                        <p className="text-sm mt-1">{item.gender}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function StatusBar({
  label,
  value,
  total,
  color,
  icon: Icon,
}: {
  label: string
  value: number
  total: number
  color: string
  icon: React.ElementType
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <Icon className={`h-4 w-4 ${color.replace("bg-", "text-")}`} />
      <div className="w-28 text-white/70 text-sm">{label}</div>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="w-12 text-right text-white/70 text-sm">{value}</div>
      <div className="w-12 text-right text-white/50 text-sm">{percentage.toFixed(1)}%</div>
    </div>
  )
}
