"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, GraduationCap, DollarSign, Activity, 
  BookOpen, Award, ArrowUpRight, ArrowDownRight
} from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "$124,567",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    title: "Active Users",
    value: "50,234",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Total Courses",
    value: "234",
    change: "+15",
    trend: "up",
    icon: GraduationCap,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "Completion Rate",
    value: "94.2%",
    change: "-2.1%",
    trend: "down",
    icon: Activity,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
]

const recentActivity = [
  { user: "Sarah Chen", action: "enrolled in", target: "Machine Learning Basics", time: "2 minutes ago" },
  { user: "Michael Torres", action: "completed", target: "Data Science Fundamentals", time: "15 minutes ago" },
  { user: "Emily Watson", action: "started", target: "Computational Biology", time: "1 hour ago" },
  { user: "James Miller", action: "earned certificate", target: "Python Programming", time: "2 hours ago" },
  { user: "Anna Schmidt", action: "enrolled in", target: "AI & Deep Learning", time: "3 hours ago" },
]

const topCourses = [
  { title: "Introduction to Machine Learning", students: 15234, revenue: "$45,234", status: "published" },
  { title: "Computational Biology Fundamentals", students: 8934, revenue: "$32,100", status: "published" },
  { title: "Drug Discovery with AI", students: 4521, revenue: "$28,500", status: "draft" },
  { title: "Python for Scientific Computing", students: 22456, revenue: "$18,900", status: "published" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/70">{stat.title}</CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="flex items-center gap-1">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-white/50">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a2e] border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.user}</span>
                      {" "}{activity.action}{" "}
                      <span className="text-purple-400">{activity.target}</span>
                    </p>
                    <p className="text-xs text-white/50">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Top Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="text-lg font-bold text-white/30">{index + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm text-white line-clamp-1">{course.title}</p>
                    <p className="text-xs text-white/50">{course.students.toLocaleString()} students</p>
                  </div>
                  <Badge variant={course.status === "published" ? "default" : "secondary"}>
                    {course.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center">
              <GraduationCap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <span className="text-sm text-white">Add Course</span>
            </button>
            <button className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <span className="text-sm text-white">Add User</span>
            </button>
            <button className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center">
              <Award className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <span className="text-sm text-white">Issue Certificate</span>
            </button>
            <button className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center">
              <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <span className="text-sm text-white">View Analytics</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
