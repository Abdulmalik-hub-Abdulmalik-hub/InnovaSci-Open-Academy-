"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Award, Users, DollarSign, TrendingUp, Clock, CheckCircle,
  XCircle, AlertCircle, Plus, ArrowRight, BarChart3,
  FileText, GraduationCap, Building, RefreshCw
} from "lucide-react"

interface DashboardStats {
  totalScholarships: number
  activeScholarships: number
  totalApplications: number
  totalAwards: number
  totalSponsors: number
  totalBudget: number
  budgetUsed: number
}

interface ApplicationStats {
  submitted: number
  underReview: number
  interview: number
  additionalInfo: number
  approved: number
  rejected: number
  approvalRate: number
}

export default function ScholarshipDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [appStats, setAppStats] = useState<ApplicationStats | null>(null)
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/scholarships/analytics?period=30d")
      const data = await response.json()

      if (data.success) {
        setStats(data.data.summary)
        setAppStats(data.data.applicationStats)
      } else {
        setError(data.error || "Failed to fetch data")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statCards = [
    {
      title: "Total Scholarships",
      value: stats?.totalScholarships || 0,
      icon: Award,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      href: "/admin/scholarships/programs",
    },
    {
      title: "Active Scholarships",
      value: stats?.activeScholarships || 0,
      icon: GraduationCap,
      color: "text-green-400",
      bg: "bg-green-400/10",
      href: "/admin/scholarships/programs?status=PUBLISHED",
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      href: "/admin/scholarships/applications",
    },
    {
      title: "Total Awards",
      value: stats?.totalAwards || 0,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      href: "/admin/scholarships/awards",
    },
  ]

  const financialCards = [
    {
      title: "Total Budget",
      value: stats ? formatCurrency(stats.totalBudget) : "$0",
      icon: DollarSign,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      title: "Budget Used",
      value: stats ? formatCurrency(stats.budgetUsed) : "$0",
      icon: TrendingUp,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      title: "Budget Remaining",
      value: stats ? formatCurrency(stats.totalBudget - stats.budgetUsed) : "$0",
      icon: Clock,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      title: "Active Sponsors",
      value: stats?.totalSponsors || 0,
      icon: Building,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      href: "/admin/scholarships/sponsors",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Dashboard</h1>
          <p className="text-white/60 mt-1">
            Manage scholarships, applications, and financial aid programs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admin/scholarships/programs/new">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              New Scholarship
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-[#1a1a2e] border-white/10 hover:border-white/20 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  {loading ? (
                    <Skeleton className="h-5 w-5 rounded" />
                  ) : (
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                )}
                {stat.href && !loading && (
                  <Link href={stat.href}>
                    <p className="text-xs text-white/50 hover:text-white/80 mt-1 cursor-pointer flex items-center gap-1">
                      View all <ArrowRight className="h-3 w-3" />
                    </p>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 4) * 0.1 }}
          >
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  {loading ? (
                    <Skeleton className="h-5 w-5 rounded" />
                  ) : (
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Application Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Application Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatusCard
                  label="Submitted"
                  value={appStats?.submitted || 0}
                  color="bg-blue-500"
                  icon={FileText}
                />
                <StatusCard
                  label="Under Review"
                  value={appStats?.underReview || 0}
                  color="bg-yellow-500"
                  icon={Clock}
                />
                <StatusCard
                  label="Interview"
                  value={appStats?.interview || 0}
                  color="bg-purple-500"
                  icon={Users}
                />
                <StatusCard
                  label="Info Needed"
                  value={appStats?.additionalInfo || 0}
                  color="bg-orange-500"
                  icon={AlertCircle}
                />
                <StatusCard
                  label="Approved"
                  value={appStats?.approved || 0}
                  color="bg-green-500"
                  icon={CheckCircle}
                />
                <StatusCard
                  label="Rejected"
                  value={appStats?.rejected || 0}
                  color="bg-red-500"
                  icon={XCircle}
                />
                <StatusCard
                  label="Approval Rate"
                  value={`${appStats?.approvalRate || 0}%`}
                  color="bg-emerald-500"
                  icon={TrendingUp}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                href="/admin/scholarships/programs/new"
                icon={Award}
                label="Create Scholarship"
                color="text-purple-400"
                bg="bg-purple-400/10"
              />
              <QuickAction
                href="/admin/scholarships/applications"
                icon={FileText}
                label="Review Applications"
                color="text-blue-400"
                bg="bg-blue-400/10"
              />
              <QuickAction
                href="/admin/scholarships/sponsors/new"
                icon={Building}
                label="Add Sponsor"
                color="text-amber-400"
                bg="bg-amber-400/10"
              />
              <QuickAction
                href="/admin/scholarships/analytics"
                icon={BarChart3}
                label="View Analytics"
                color="text-green-400"
                bg="bg-green-400/10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard
          href="/admin/scholarships/types"
          title="Scholarship Types"
          description="Manage scholarship categories and classifications"
          icon={Award}
        />
        <NavCard
          href="/admin/scholarships/programs"
          title="Scholarship Programs"
          description="Create, edit, and manage scholarship programs"
          icon={FileText}
        />
        <NavCard
          href="/admin/scholarships/applications"
          title="Applications"
          description="Review and process scholarship applications"
          icon={Users}
        />
        <NavCard
          href="/admin/scholarships/awards"
          title="Awards"
          description="Manage awarded scholarships and recipients"
          icon={CheckCircle}
        />
        <NavCard
          href="/admin/scholarships/sponsors"
          title="Sponsors"
          description="Manage scholarship sponsors and partners"
          icon={Building}
        />
        <NavCard
          href="/admin/scholarships/analytics"
          title="Analytics"
          description="View scholarship analytics and reports"
          icon={BarChart3}
        />
      </div>
    </div>
  )
}

function StatusCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string
  value: number | string
  color: string
  icon: React.ElementType
}) {
  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-white/5">
      <Icon className={`h-5 w-5 ${color.replace("bg-", "text-")} mb-2`} />
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/60 text-center mt-1">{label}</div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
  color,
  bg,
}: {
  href: string
  icon: React.ElementType
  label: string
  color: string
  bg: string
}) {
  return (
    <Link href={href}>
      <div className={`flex flex-col items-center justify-center p-4 rounded-lg ${bg} hover:opacity-80 transition-opacity cursor-pointer`}>
        <Icon className={`h-6 w-6 ${color} mb-2`} />
        <span className="text-sm text-white/80 text-center">{label}</span>
      </div>
    </Link>
  )
}

function NavCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <Link href={href}>
      <Card className="bg-[#1a1a2e] border-white/10 hover:border-white/20 transition-all hover:bg-[#1f1f35] cursor-pointer h-full">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/60">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
