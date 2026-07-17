"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  GraduationCap,
  Award,
  DollarSign,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Download,
  Calendar,
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

interface AnalyticsData {
  overview: {
    totalScholarships: number
    activeScholarships: number
    draftScholarships: number
    closedScholarships: number
    totalApplications: number
    pendingApplications: number
    underReviewApplications: number
    interviewApplications: number
    approvedApplications: number
    rejectedApplications: number
    awardedApplications: number
    enrolledApplications: number
  }
  budget: {
    totalBudget: number
    usedBudget: number
    remainingBudget: number
    utilizationRate: number
  }
  conversion: {
    approvalRate: number
    completionRate: number
    interviewRate: number
  }
  topScholarships: any[]
  topSponsors: any[]
  demographics: {
    countries: { country: string; count: number }[]
    gender: { gender: string; count: number }[]
  }
  trend: { date: string; count: number }[]
  recentApplications: any[]
}

const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1"]

export default function ScholarshipAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/scholarships/analytics?period=${period}`)
      const data = await res.json()

      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/60">Failed to load analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Analytics</h1>
          <p className="text-white/60">Track performance and insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Total Scholarships</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.overview.totalScholarships}</p>
                <p className="text-xs text-purple-300 mt-1">{analytics.overview.activeScholarships} active</p>
              </div>
              <GraduationCap className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Total Applications</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.overview.totalApplications}</p>
                <p className="text-xs text-blue-300 mt-1">{analytics.overview.pendingApplications} pending</p>
              </div>
              <FileText className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-200">Approval Rate</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.conversion.approvalRate}%</p>
                <p className="text-xs text-green-300 mt-1">{analytics.overview.approvedApplications} approved</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-200">Budget Used</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.budget.utilizationRate}%</p>
                <p className="text-xs text-orange-300 mt-1">{formatCurrency(analytics.budget.usedBudget)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Pending", value: analytics.overview.pendingApplications },
                      { name: "Under Review", value: analytics.overview.underReviewApplications },
                      { name: "Interview", value: analytics.overview.interviewApplications },
                      { name: "Approved", value: analytics.overview.approvedApplications },
                      { name: "Rejected", value: analytics.overview.rejectedApplications },
                      { name: "Awarded", value: analytics.overview.awardedApplications },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {["#F59E0B", "#3B82F6", "#EC4899", "#10B981", "#EF4444", "#7C3AED"].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a1a2e", 
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: "rgba(255,255,255,0.7)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Application Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a1a2e", 
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Scholarships */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Scholarships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Scholarship</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Applications</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Conversion</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Budget</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topScholarships.map((scholarship, index) => (
                  <tr key={scholarship.id} className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-white font-medium">{scholarship.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{scholarship.applications}</td>
                    <td className="py-3 px-4 text-right text-white">{scholarship.views}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={scholarship.conversionRate > 10 ? "default" : "secondary"}>
                        {scholarship.conversionRate}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-green-400">
                      {scholarship.budget ? formatCurrency(scholarship.budget) : "N/A"}
                    </td>
                  </tr>
                ))}
                {analytics.topScholarships.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/60">
                      No scholarship data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Demographics & Budget */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.demographics.gender}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="gender" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a1a2e", 
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.demographics.countries.slice(0, 5).map((country, index) => (
                <div key={country.country} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{country.country}</p>
                    <div className="h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ 
                          width: `${(country.count / analytics.demographics.countries[0].count) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">{country.count}</span>
                </div>
              ))}
              {analytics.demographics.countries.length === 0 && (
                <p className="text-center text-white/60 py-8">No country data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Sponsors */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Top Sponsors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {analytics.topSponsors.map((sponsor) => (
              <div key={sponsor.id} className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                    {sponsor.logoUrl ? (
                      <img src={sponsor.logoUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <Award className="h-5 w-5 text-white/40" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{sponsor.name}</p>
                    <p className="text-xs text-white/60">{sponsor.activeScholarships} scholarships</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40">Students</p>
                    <p className="text-white font-medium">{sponsor.sponsoredStudents}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Budget</p>
                    <p className="text-green-400 font-medium">
                      {sponsor.totalBudget ? formatCurrency(sponsor.totalBudget) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {analytics.topSponsors.length === 0 && (
              <p className="col-span-full text-center text-white/60 py-8">No sponsor data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
