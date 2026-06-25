"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAnalytics } from "@/hooks/useAnalytics"
import {
  Users, GraduationCap, DollarSign, TrendingUp, TrendingDown,
  RefreshCw, Loader2, Download, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts"

const COLORS = ["#7C3AED", "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  prefix = "",
  suffix = "",
  loading
}: { 
  title: string
  value: number | string
  change?: number
  icon: React.ElementType
  color: string
  prefix?: string
  suffix?: string
  loading?: boolean
}) {
  const isPositive = change && change >= 0
  
  return (
    <Card className="bg-[#1a1a2e] border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">{title}</p>
            {loading ? (
              <div className="h-9 w-28 bg-white/10 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-white mt-1">
                {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
              </p>
            )}
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span className="text-sm">{Math.abs(change).toFixed(1)}%</span>
                <span className="text-white/40 text-xs">vs last month</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            ) : (
              <Icon className="h-6 w-6 text-white" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-6">
              <div className="h-20 bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i} className="bg-[#1a1a2e] border-white/10">
            <CardContent className="h-80 bg-white/10 rounded animate-pulse" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data, loading, error, period, setPeriod, refresh } = useAnalytics()
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  if (loading && !data) {
    return <LoadingSkeleton />
  }

  const { overview, charts, categories, topCourses } = data || {
    overview: {},
    charts: {
      usersOverTime: [],
      enrollmentsOverTime: [],
      revenueOverTime: [],
      revenueByDayOfWeek: [],
    },
    categories: [],
    topCourses: []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-white/60">Real-time platform insights and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">Last year</option>
          </select>
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
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20 p-4">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={overview.totalRevenue || 0}
          prefix="$"
          change={overview.revenueGrowthRate}
          icon={DollarSign}
          color="bg-green-500/20"
          loading={loading}
        />
        <StatCard
          title="Total Users"
          value={overview.totalUsers || 0}
          change={overview.userGrowthRate}
          icon={Users}
          color="bg-blue-500/20"
          loading={loading}
        />
        <StatCard
          title="Enrollments"
          value={overview.totalEnrollments || 0}
          icon={GraduationCap}
          color="bg-purple-500/20"
          loading={loading}
        />
        <StatCard
          title="This Month"
          value={overview.revenueThisMonth || 0}
          prefix="$"
          icon={TrendingUp}
          color="bg-amber-500/20"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Revenue Over Time</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded text-sm ${chartType === "line" ? "bg-purple-500 text-white" : "bg-white/10 text-white/60"}`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1 rounded text-sm ${chartType === "bar" ? "bg-purple-500 text-white" : "bg-white/10 text-white/60"}`}
              >
                Bar
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="h-full bg-white/10 rounded animate-pulse" />
              ) : (charts.revenueOverTime && charts.revenueOverTime.length > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={charts.revenueOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#7C3AED" strokeWidth={2} dot={false} />
                    </LineChart>
                  ) : (
                    <BarChart data={charts.revenueOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Bar dataKey="amount" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/40">
                  No revenue data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="h-full bg-white/10 rounded animate-pulse" />
              ) : (charts.usersOverTime && charts.usersOverTime.length > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.usersOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} />
                    <YAxis stroke="#ffffff40" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                      formatter={(value: number) => [value, "New Users"]}
                    />
                    <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/40">
                  No user data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue by Day */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Revenue by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="h-full bg-white/10 rounded animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.revenueByDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="day" stroke="#ffffff40" fontSize={12} />
                    <YAxis stroke="#ffffff40" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses by Category */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Courses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="h-full bg-white/10 rounded animate-pulse" />
              ) : categories?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="category"
                    >
                      {categories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff20", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/40">
                  No category data
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {categories?.map((cat, index) => (
                <div key={cat.category} className="flex items-center gap-2 text-xs text-white/60">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {cat.category} ({cat.count})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Top Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 bg-white/10 rounded animate-pulse" />
                ))}
              </div>
            ) : topCourses?.length > 0 ? (
              <div className="space-y-3">
                {topCourses.slice(0, 5).map((course, i) => (
                  <div key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                    <span className="text-lg font-bold text-white/30 w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{course.title}</p>
                      <p className="text-xs text-white/50">{course.enrollments} enrollments</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">No courses yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
