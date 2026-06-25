"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Filter, Plus, MoreHorizontal, Mail, Phone, 
  Shield, Trash2, Edit, UserCheck, UserX, Eye
} from "lucide-react"

// Mock users data
const mockUsers = [
  { id: "1", name: "Abdulmalik Musba", email: "abdulmalikmusba@gmail.com", role: "ADMIN", status: "ACTIVE", country: "Nigeria", enrolled: 5, certificates: 2, joined: "2024-01-15" },
  { id: "2", name: "Michael Torres", email: "mtorres@example.com", role: "STUDENT", status: "ACTIVE", country: "Brazil", enrolled: 8, certificates: 3, joined: "2024-03-10" },
  { id: "3", name: "Emily Watson", email: "e.watson@example.com", role: "STUDENT", status: "SUSPENDED", country: "UK", enrolled: 3, certificates: 1, joined: "2024-04-05" },
  { id: "4", name: "James Miller", email: "jmiller@example.com", role: "STUDENT", status: "ACTIVE", country: "Canada", enrolled: 15, certificates: 5, joined: "2024-01-25" },
]

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  STUDENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500",
  SUSPENDED: "bg-red-500",
  DEACTIVATED: "bg-gray-500",
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-white/60">Manage all platform users and their permissions</p>
        </div>
        <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">1,234</div>
            <div className="text-sm text-white/60">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">1,150</div>
            <div className="text-sm text-white/60">Active Students</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">12</div>
            <div className="text-sm text-white/60">Suspended</div>
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
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-sm text-white/60">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Enrolled</th>
                  <th className="px-4 py-3">Certificates</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="text-sm hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-white/60 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={roleColors[user.role]}>
                        {user.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[user.status]}`} />
                        <span className="text-white/80">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/80">{user.country}</td>
                    <td className="px-4 py-3 text-white/80">{user.enrolled}</td>
                    <td className="px-4 py-3 text-white/80">{user.certificates}</td>
                    <td className="px-4 py-3 text-white/60">{user.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                          <Shield className="h-4 w-4" />
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
