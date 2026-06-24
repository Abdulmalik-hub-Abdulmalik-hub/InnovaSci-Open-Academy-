"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye, Copy, Upload } from "lucide-react"

const mockCourses = [
  { id: "1", title: "Introduction to Machine Learning", category: "AI & Data Science", status: "PUBLISHED", students: 15234, price: 0, isFree: true, lessons: 45 },
  { id: "2", title: "Computational Biology Fundamentals", category: "Life Sciences", status: "PUBLISHED", students: 8934, price: 49.99, isFree: false, lessons: 62 },
  { id: "3", title: "Drug Discovery with AI", category: "Pharmaceutical", status: "DRAFT", students: 0, price: 99.99, isFree: false, lessons: 78 },
  { id: "4", title: "Python for Scientific Computing", category: "Programming", status: "PUBLISHED", students: 22456, price: 0, isFree: true, lessons: 35 },
  { id: "5", title: "Quantum Computing Basics", category: "Physics", status: "ARCHIVED", students: 5421, price: 79.99, isFree: false, lessons: 50 },
]

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-green-500",
  DRAFT: "bg-yellow-500",
  ARCHIVED: "bg-gray-500",
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || course.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Management</h1>
          <p className="text-white/60">Create, manage, and publish courses</p>
        </div>
        <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">234</div>
            <div className="text-sm text-white/60">Total Courses</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">189</div>
            <div className="text-sm text-white/60">Published</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">32</div>
            <div className="text-sm text-white/60">Drafts</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">50K+</div>
            <div className="text-sm text-white/60">Total Students</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Courses ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-sm text-white/60">
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Lessons</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="text-sm hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{course.title}</div>
                    </td>
                    <td className="px-4 py-3 text-white/80">{course.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[course.status]}`} />
                        <span className="text-white/80">{course.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/80">{course.students.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {course.isFree ? (
                        <Badge className="bg-green-500/20 text-green-400">Free</Badge>
                      ) : (
                        <span className="text-white">${course.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/80">{course.lessons}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
