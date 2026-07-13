"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus, RefreshCw, Settings, Users, Shield, CheckCircle2,
  XCircle, MoreHorizontal, Edit, Trash2, Eye, Globe, LayoutDashboard,
  Loader2, ArrowLeft, ArrowRight, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"

const PORTAL_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#7C3AED",
  ADMIN: "#2563EB",
  ACADEMIC_DIRECTOR: "#059669",
  INSTRUCTOR: "#0891B2",
  REVIEWER: "#D97706",
  PROJECT_SUPERVISOR: "#6366F1",
  FINANCE_OFFICER: "#10B981",
  ADMISSION_OFFICER: "#EC4899",
  STUDENT_AFFAIRS: "#F43F5E",
  QUALITY_ASSURANCE: "#8B5CF6",
  RESEARCH_COORDINATOR: "#0EA5E9",
  SUPPORT_STAFF: "#64748B",
}

const PORTAL_ICONS: Record<string, any> = {
  SUPER_ADMIN: Shield,
  ADMIN: Settings,
  ACADEMIC_DIRECTOR: Globe,
  INSTRUCTOR: Globe,
  REVIEWER: CheckCircle2,
  PROJECT_SUPERVISOR: Users,
  FINANCE_OFFICER: Globe,
  ADMISSION_OFFICER: Users,
  STUDENT_AFFAIRS: Globe,
  QUALITY_ASSURANCE: CheckCircle2,
  RESEARCH_COORDINATOR: Globe,
  SUPPORT_STAFF: Users,
}

function PortalCard({ portal, onAction }: { portal: any; onAction: (action: string, portal: any) => void }) {
  const Icon = PORTAL_ICONS[portal.name] || Globe
  const color = portal.color || PORTAL_COLORS[portal.name] || "#6366F1"

  return (
    <Card className="bg-[#1a1a2e] border-white/10 hover:border-white/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{portal.displayName}</h3>
              <p className="text-xs text-white/50">{portal.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={portal.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
              {portal.isActive ? "Active" : "Inactive"}
            </Badge>
            {portal.isSystem && (
              <Badge className="bg-purple-500/20 text-purple-400">System</Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-white/60 mb-4 line-clamp-2">
          {portal.description || "No description provided"}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-white/50">
              <Users className="h-4 w-4 inline mr-1" />
              {portal._count?.staffAssignments || 0} staff
            </span>
            {portal.dashboardRoute && (
              <span className="text-white/50">
                <LayoutDashboard className="h-4 w-4 inline mr-1" />
                {portal.dashboardRoute}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-white/40">{color}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
              <DropdownMenuItem className="cursor-pointer">
                <Link href={`/admin/portal-management/${portal.id}`} className="flex items-center w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("edit", portal)} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit Portal
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              {portal.isActive ? (
                <DropdownMenuItem onClick={() => onAction("disable", portal)} className="cursor-pointer text-yellow-400">
                  <XCircle className="h-4 w-4 mr-2" />
                  Disable Portal
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onAction("enable", portal)} className="cursor-pointer text-green-400">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Enable Portal
                </DropdownMenuItem>
              )}
              {!portal.isSystem && (
                <>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => onAction("delete", portal)} className="cursor-pointer text-red-400">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Portal
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

function PortalStats({ portals }: { portals: any[] }) {
  const activePortals = portals.filter(p => p.isActive).length
  const totalStaff = portals.reduce((acc, p) => acc + (p._count?.staffAssignments || 0), 0)
  const systemPortals = portals.filter(p => p.isSystem).length
  const customPortals = portals.filter(p => !p.isSystem).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-white">{portals.length}</p>
          <p className="text-xs text-white/50">Total Portals</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{activePortals}</p>
          <p className="text-xs text-white/50">Active</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{totalStaff}</p>
          <p className="text-xs text-white/50">Total Staff</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{systemPortals}</p>
          <p className="text-xs text-white/50">System Portals</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PortalManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [portals, setPortals] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPortal, setNewPortal] = useState({ name: "", displayName: "", description: "", icon: "", color: "" })
  const [initLoading, setInitLoading] = useState(false)

  const fetchPortals = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/portals")
      const data = await res.json()
      if (data.success) {
        setPortals(data.data)
      }
    } catch (error) {
      console.error("Error fetching portals:", error)
      toast.error("Failed to load portals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortals()
  }, [])

  const handleAction = async (action: string, portal: any) => {
    switch (action) {
      case "enable":
        await fetch(`/api/admin/portals/${portal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true })
        })
        toast.success("Portal enabled")
        fetchPortals()
        break
      case "disable":
        await fetch(`/api/admin/portals/${portal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: false })
        })
        toast.success("Portal disabled")
        fetchPortals()
        break
      case "delete":
        if (confirm(`Are you sure you want to delete ${portal.displayName}?`)) {
          const res = await fetch(`/api/admin/portals/${portal.id}`, { method: "DELETE" })
          const data = await res.json()
          if (data.success) {
            toast.success("Portal deleted")
            fetchPortals()
          } else {
            toast.error(data.error || "Failed to delete portal")
          }
        }
        break
    }
  }

  const handleInitialize = async () => {
    setInitLoading(true)
    try {
      const res = await fetch("/api/admin/portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Initialized ${data.data.length} default portals`)
        fetchPortals()
      }
    } catch (error) {
      toast.error("Failed to initialize portals")
    } finally {
      setInitLoading(false)
    }
  }

  const handleCreatePortal = async () => {
    if (!newPortal.name || !newPortal.displayName) {
      toast.error("Name and display name are required")
      return
    }
    try {
      const res = await fetch("/api/admin/portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPortal)
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Portal created successfully")
        setShowCreateDialog(false)
        setNewPortal({ name: "", displayName: "", description: "", icon: "", color: "" })
        fetchPortals()
      } else {
        toast.error(data.error || "Failed to create portal")
      }
    } catch (error) {
      toast.error("Failed to create portal")
    }
  }

  const filteredPortals = portals.filter(p =>
    p.displayName.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const systemPortals = filteredPortals.filter(p => p.isSystem)
  const customPortals = filteredPortals.filter(p => !p.isSystem)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Portal Management</h1>
          <p className="text-white/60">Manage portal types and their configurations</p>
        </div>
        <div className="flex items-center gap-3">
          {portals.length === 0 && (
            <Button
              onClick={handleInitialize}
              disabled={initLoading}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {initLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Initialize Default Portals
            </Button>
          )}
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Portal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <PortalStats portals={portals} />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          placeholder="Search portals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Portals Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : filteredPortals.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-12 text-center">
            <Globe className="h-12 w-12 mx-auto mb-3 text-white/30" />
            <p className="text-white/50">No portals found</p>
            <p className="text-sm text-white/30 mt-1">
              {portals.length === 0
                ? "Initialize default portals or create a new one"
                : "Try adjusting your search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
              All ({filteredPortals.length})
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-white/10">
              System ({systemPortals.length})
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-white/10">
              Custom ({customPortals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPortals.map(portal => (
                <PortalCard key={portal.id} portal={portal} onAction={handleAction} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemPortals.map(portal => (
                <PortalCard key={portal.id} portal={portal} onAction={handleAction} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customPortals.map(portal => (
                <PortalCard key={portal.id} portal={portal} onAction={handleAction} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Portal Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Create New Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white">Portal Name *</label>
                <Input
                  value={newPortal.name}
                  onChange={(e) => setNewPortal({ ...newPortal, name: e.target.value.toUpperCase().replace(/\s/g, "_") })}
                  placeholder="e.g., DATA_ANALYST"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white">Display Name *</label>
                <Input
                  value={newPortal.displayName}
                  onChange={(e) => setNewPortal({ ...newPortal, displayName: e.target.value })}
                  placeholder="e.g., Data Analyst"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white">Description</label>
                <Input
                  value={newPortal.description}
                  onChange={(e) => setNewPortal({ ...newPortal, description: e.target.value })}
                  placeholder="Brief description..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white">Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newPortal.color || "#6366F1"}
                    onChange={(e) => setNewPortal({ ...newPortal, color: e.target.value })}
                    className="w-16 h-10 p-1 bg-white/5 border-white/10"
                  />
                  <Input
                    value={newPortal.color || "#6366F1"}
                    onChange={(e) => setNewPortal({ ...newPortal, color: e.target.value })}
                    placeholder="#6366F1"
                    className="flex-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t border-white/10 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  setNewPortal({ name: "", displayName: "", description: "", icon: "", color: "" })
                }}
                className="border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePortal}
                className="bg-gradient-to-r from-purple-500 to-blue-500"
              >
                Create Portal
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
