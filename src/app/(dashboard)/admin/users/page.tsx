"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useUsers, User } from "@/hooks/useUsers"
import { 
  Search, Plus, MoreHorizontal, Mail, Phone, 
  Shield, Trash2, Edit, UserCheck, UserX, Eye,
  RefreshCw, Loader2, X, ShieldCheck
} from "lucide-react"

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  STUDENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500",
  INACTIVE: "bg-gray-500",
  SUSPENDED: "bg-red-500",
}

function UserModal({ 
  user, 
  onClose, 
  onSave 
}: { 
  user?: User | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    email: user?.email ?? "",
    role: user?.role ?? "STUDENT",
    status: user?.status ?? "ACTIVE",
    fullName: user?.fullName ?? user?.profile?.fullName ?? "",
    username: user?.username ?? user?.profile?.username ?? "",
    password: "",
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email ?? "",
        role: user.role ?? "STUDENT",
        status: user.status ?? "ACTIVE",
        fullName: user.fullName ?? user.profile?.fullName ?? "",
        username: user.username ?? user.profile?.username ?? "",
        password: "",
      })
    } else {
      setFormData({
        email: "",
        role: "STUDENT",
        status: "ACTIVE",
        fullName: "",
        username: "",
        password: "",
      })
    }
  }, [user])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users"
      const method = user ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Failed to save user")
        return
      }

      onSave()
      onClose()
    } catch (err) {
      setError("Failed to save user")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">
            {user ? "Edit User" : "Add New User"}
          </CardTitle>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="text-sm text-white/70 mb-1 block">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            {!user && (
              <div>
                <label className="text-sm text-white/70 mb-1 block">Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required={!user}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="ADMIN">Super Admin</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Username</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/20 text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (user ? "Save Changes" : "Create User")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UsersPage() {
  const { users, loading, error, pagination, fetchUsers, createUser, updateUser, deleteUser, refresh } = useUsers()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers({
        page: 1,
        limit: 20,
        search: searchQuery,
        role: selectedRole,
        status: selectedStatus,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedRole, selectedStatus])

  const handleAddUser = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleDeleteUser = async (id: string) => {
    const result = await deleteUser(id)
    if (result.success) {
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-white/60">Manage all platform users</p>
        </div>
        <Button onClick={handleAddUser} className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{pagination.total}</div>
            <div className="text-sm text-white/60">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {users.filter(u => u.status === "ACTIVE").length}
            </div>
            <div className="text-sm text-white/60">Active Users</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">
              {users.filter(u => u.status === "SUSPENDED").length}
            </div>
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
              <option value="ADMIN">Super Admin</option>
              <option value="STUDENT">Student</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
	          <span className="text-red-400">{error}</span>
            <Button variant="outline" size="sm" onClick={refresh} className="border-red-500/20 text-red-400">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>All Users ({pagination.total})</span>
            <Button variant="ghost" size="sm" onClick={refresh} className="text-white/60 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-sm text-white/60">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3">Certificates</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="text-sm hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white font-medium">
                            {user.profile?.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {user.profile?.fullName || "No name"}
                            </div>
                            <div className="text-white/60 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={roleColors[user.role] || "bg-gray-100 text-gray-800"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusColors[user.status]}`} />
                          <span className="text-white/80">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/80">{user.enrollments}</td>
                      <td className="px-4 py-3 text-white/80">{user.certificates}</td>
                      <td className="px-4 py-3 text-white/60">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 rounded-lg hover:bg-white/10 text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchUsers({ page: pagination.page - 1, limit: pagination.limit, search: searchQuery, role: selectedRole, status: selectedStatus })}
            className="border-white/20 text-white"
          >
            Previous
          </Button>
          <span className="text-white/60">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchUsers({ page: pagination.page + 1, limit: pagination.limit, search: searchQuery, role: selectedRole, status: selectedStatus })}
            className="border-white/20 text-white"
          >
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={refresh}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white">Delete User?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteUser(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
