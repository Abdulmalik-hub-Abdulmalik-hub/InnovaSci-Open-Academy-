"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  GraduationCap, 
  Plus, 
  TrendingUp, 
  Users, 
  Award, 
  DollarSign,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  totalScholarships: number
  activeScholarships: number
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  awardedApplications: number
}

interface TopScholarship {
  id: string
  name: string
  slug: string
  applications: number
  views: number
  conversionRate: number
}

interface RecentApplication {
  id: string
  applicationNumber: string
  applicantName: string
  email: string
  country: string
  status: string
  scholarship: string
  submittedAt: string
}

export default function ScholarshipsDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [topScholarships, setTopScholarships] = useState<TopScholarship[]>([])
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [scholarshipTypes, setScholarshipTypes] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, scholarshipsRes] = await Promise.all([
        fetch("/api/admin/scholarships/analytics"),
        fetch("/api/admin/scholarships?limit=5")
      ])

      const analyticsData = await analyticsRes.json()
      const scholarshipsData = await scholarshipsRes.json()

      if (analyticsData.success) {
        setStats(analyticsData.data.overview)
        setTopScholarships(analyticsData.data.topScholarships?.slice(0, 5) || [])
        setRecentApplications(analyticsData.data.recentApplications?.slice(0, 5) || [])
      }

      if (scholarshipsData.success) {
        setScholarshipTypes(scholarshipsData.data?.scholarships || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "success" | "destructive" | "warning"; label: string }> = {
      SUBMITTED: { variant: "secondary", label: "Submitted" },
      UNDER_REVIEW: { variant: "warning", label: "Under Review" },
      INTERVIEW: { variant: "warning", label: "Interview" },
      APPROVED: { variant: "success", label: "Approved" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      WAITLISTED: { variant: "warning", label: "Waitlisted" },
      AWARDED: { variant: "success", label: "Awarded" },
      ENROLLED: { variant: "success", label: "Enrolled" },
    }
    const config = statusMap[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarships & Financial Aid</h1>
          <p className="text-white/60">Manage scholarship programs and applications</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/scholarships/programs">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <FileText className="h-4 w-4 mr-2" />
              View Programs
            </Button>
          </Link>
          <Link href="/admin/scholarships/programs/create">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Scholarship
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Total Scholarships</CardTitle>
            <GraduationCap className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.totalScholarships || 0}</div>
            <p className="text-xs text-purple-300 mt-1">
              {stats?.activeScholarships || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Total Applications</CardTitle>
            <Users className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.totalApplications || 0}</div>
            <p className="text-xs text-blue-300 mt-1">
              {stats?.pendingApplications || 0} pending review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-200">Approved</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.approvedApplications || 0}</div>
            <p className="text-xs text-green-300 mt-1">
              {stats?.awardedApplications || 0} awarded
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-200">Rejected</CardTitle>
            <XCircle className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.rejectedApplications || 0}</div>
            <p className="text-xs text-orange-300 mt-1">
              {stats?.pendingApplications || 0} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/admin/scholarships/programs">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <GraduationCap className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-white">Programs</h3>
              <p className="text-sm text-white/60">Manage scholarships</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/scholarships/applications">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="font-semibold text-white">Applications</h3>
              <p className="text-sm text-white/60">Review applications</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/scholarships/sponsors">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="font-semibold text-white">Sponsors</h3>
              <p className="text-sm text-white/60">Manage sponsors</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/scholarships/types">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 text-orange-400 mb-3" />
              <h3 className="font-semibold text-white">Types</h3>
              <p className="text-sm text-white/60">Scholarship types</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/scholarships/analytics">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <BarChart3 className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white">Analytics</h3>
              <p className="text-sm text-white/60">View insights</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Scholarships */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Top Performing Scholarships</CardTitle>
              <Link href="/admin/scholarships/programs">
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                  View All <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topScholarships.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No scholarships yet</p>
                <Link href="/admin/scholarships/programs/create">
                  <Button variant="link" className="text-purple-400">Create your first scholarship</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {topScholarships.map((scholarship, index) => (
                  <div key={scholarship.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{scholarship.name}</p>
                        <p className="text-sm text-white/60">{scholarship.applications} applications</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{scholarship.conversionRate}%</p>
                      <p className="text-xs text-white/60">conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recent Applications</CardTitle>
              <Link href="/admin/scholarships/applications">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  View All <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium text-white">{app.applicantName}</p>
                      <p className="text-sm text-white/60">{app.scholarship}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/admin/scholarships/applications?status=SUBMITTED">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/20 hover:bg-white/10">
                <Clock className="h-6 w-6 text-yellow-400" />
                <span className="text-sm">Review Pending</span>
              </Button>
            </Link>
            <Link href="/admin/scholarships/applications?status=UNDER_REVIEW">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/20 hover:bg-white/10">
                <Eye className="h-6 w-6 text-blue-400" />
                <span className="text-sm">Under Review</span>
              </Button>
            </Link>
            <Link href="/admin/scholarships/awards">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/20 hover:bg-white/10">
                <Award className="h-6 w-6 text-green-400" />
                <span className="text-sm">Award Students</span>
              </Button>
            </Link>
            <Link href="/admin/scholarships/sponsors">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/20 hover:bg-white/10">
                <DollarSign className="h-6 w-6 text-purple-400" />
                <span className="text-sm">Manage Sponsors</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
