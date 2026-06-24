"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, GraduationCap, DollarSign, Award, 
  TrendingUp, Video, Mail, Download
} from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-white/60">Real-time platform insights and metrics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">$124,567</p>
                <p className="text-green-400 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +12.5%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active Users</p>
                <p className="text-3xl font-bold text-white">50,234</p>
                <p className="text-green-400 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +8.2%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Course Enrollments</p>
                <p className="text-3xl font-bold text-white">15,892</p>
                <p className="text-green-400 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +23.1%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Certificates Issued</p>
                <p className="text-3xl font-bold text-white">3,456</p>
                <p className="text-green-400 text-sm flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +15.3%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-white/40">
              Chart visualization will appear here
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-white/40">
              Chart visualization will appear here
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Introduction to Machine Learning", students: 15234, revenue: "$45,234" },
              { title: "Computational Biology Fundamentals", students: 8934, revenue: "$32,100" },
              { title: "Drug Discovery with AI", students: 4521, revenue: "$28,500" },
              { title: "Python for Scientific Computing", students: 22456, revenue: "$18,900" },
            ].map((course, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-white/30">{i + 1}</span>
                  <div>
                    <p className="font-medium text-white">{course.title}</p>
                    <p className="text-sm text-white/60">{course.students.toLocaleString()} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{course.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
