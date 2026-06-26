"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Shield, Users, Key, Plus, Settings, Loader2, Check,
  X, AlertTriangle, Edit, Trash2, ChevronRight
} from "lucide-react"

interface Role {
  id: string
  name: string
  displayName: string
  description: string
  isSystem: boolean
  _count: { users: number }
  permissions: { id: string; name: string }[]
}

interface Permission {
  id: string
  name: string
  displayName: string
  description: string
  resource: string
  action: string
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editingPermissions, setEditingPermissions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/roles/permissions")
      ])
      
      const rolesData = await rolesRes.json()
      const permsData = await permsRes.json()
      
      if (rolesData.success) setRoles(rolesData.data)
      if (permsData.success) setPermissions(permsData.data)
      
      if (!rolesData.success && !permsData.success) {
        setError("Failed to fetch data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleInitialize = async () => {
    setInitializing(true)
    try {
      // Initialize permissions first
      await fetch("/api/admin/roles/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true })
      })
      
      // Then initialize roles
      await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true })
      })
      
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize")
    } finally {
      setInitializing(false)
    }
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setEditingPermissions(role.permissions.map(p => p.name))
  }

  const handlePermissionToggle = (permName: string) => {
    setEditingPermissions(prev => 
      prev.includes(permName) 
        ? prev.filter(p => p !== permName)
        : [...prev, permName]
    )
  }

  const handleSavePermissions = async () => {
    if (!selectedRole) return
    
    setSaving(true)
    try {
      // For now, just log the permission change
      // In a full implementation, this would update the role's permissions
      console.log("Saving permissions for role:", selectedRole.name, editingPermissions)
      
      // Update local state
      setRoles(prev => prev.map(r => 
        r.id === selectedRole.id 
          ? { ...r, permissions: editingPermissions.map(name => ({ id: name, name })) }
          : r
      ))
      
      setSelectedRole(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "users": return <Users className="h-4 w-4" />
      case "roles": return <Shield className="h-4 w-4" />
      case "courses": return <Key className="h-4 w-4" />
      case "settings": return <Settings className="h-4 w-4" />
      default: return <Key className="h-4 w-4" />
    }
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = []
    acc[perm.resource].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
            <p className="text-white/60">Manage user access control</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {roles.length === 0 && (
            <Button
              variant="outline"
              onClick={handleInitialize}
              disabled={initializing}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {initializing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Initialize Defaults
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchData}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-400">
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {roles.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Roles Configured</h3>
            <p className="text-white/50 mb-6">
              Initialize default roles and permissions to set up access control.
            </p>
            <Button
              onClick={handleInitialize}
              disabled={initializing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {initializing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Initialize Default Roles
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Roles List */}
          <div className="col-span-4">
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Roles</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full p-4 rounded-lg text-left transition-colors flex items-center justify-between ${
                      selectedRole?.id === role.id
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{role.displayName}</span>
                        {role.isSystem && (
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">System</Badge>
                        )}
                      </div>
                      <p className="text-white/40 text-sm mt-1">{role.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/10 text-white/60">
                        {role._count.users} users
                      </Badge>
                      <Badge className="bg-white/10 text-white/60">
                        {role.permissions.length} perms
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-white/40" />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Permissions Panel */}
          <div className="col-span-8">
            {selectedRole ? (
              <Card className="bg-[#1a1a2e] border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        {selectedRole.displayName}
                      </CardTitle>
                      <CardDescription className="text-white/40 mt-1">
                        {selectedRole.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedRole(null)}
                        className="text-white/60"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePermissions}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Permission Groups */}
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="space-y-3">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        {getResourceIcon(resource)}
                        {resource.charAt(0).toUpperCase() + resource.slice(1)}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => {
                          const isAssigned = editingPermissions.includes(perm.name)
                          return (
                            <button
                              key={perm.id}
                              onClick={() => !selectedRole.isSystem && handlePermissionToggle(perm.name)}
                              disabled={selectedRole.isSystem}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selectedRole.isSystem
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:border-white/20 cursor-pointer"
                              } ${
                                isAssigned
                                  ? "bg-green-500/10 border-green-500/30"
                                  : "bg-white/5 border-white/10"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white text-sm font-medium">{perm.displayName}</p>
                                  <p className="text-white/40 text-xs mt-0.5">{perm.name}</p>
                                </div>
                                {isAssigned && (
                                  <Check className="h-4 w-4 text-green-400" />
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {selectedRole.isSystem && (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        <p className="text-yellow-400 text-sm">
                          System roles have fixed permissions and cannot be modified.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#1a1a2e] border-white/10">
                <CardContent className="p-12 text-center">
                  <Shield className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50">Select a role to view and manage permissions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}