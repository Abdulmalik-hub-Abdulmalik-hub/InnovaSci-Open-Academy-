"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users, UserPlus, Shield, UserCog, Settings, ChevronRight,
  ArrowRight, CheckCircle2, Clock, UserX, Monitor
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const MENU_ITEMS = [
  {
    title: "Staff Directory",
    description: "View and manage all staff members, their profiles, assignments, and activity",
    href: "/admin/staff-management/staff-directory",
    icon: Users,
    color: "#7C3AED",
    badge: null,
  },
  {
    title: "Create Staff",
    description: "Add new staff members with portal assignments and academic responsibilities",
    href: "/admin/staff-management/staff-create",
    icon: UserPlus,
    color: "#10B981",
    badge: "New",
  },
  {
    title: "Portal Management",
    description: "Configure and manage portal types for different staff roles",
    href: "/admin/portal-management",
    icon: Shield,
    color: "#2563EB",
    badge: null,
  },
  {
    title: "Role Management",
    description: "Define roles, permissions, and access levels for staff members",
    href: "/admin/roles",
    icon: UserCog,
    color: "#D97706",
    badge: null,
  },
]

const QUICK_STATS = [
  {
    label: "Total Staff",
    value: "24",
    icon: Users,
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    label: "Active Sessions",
    value: "8",
    icon: Monitor,
    color: "bg-green-500/20 text-green-400",
  },
  {
    label: "Active Staff",
    value: "20",
    icon: CheckCircle2,
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    label: "Suspended",
    value: "2",
    icon: UserX,
    color: "bg-red-500/20 text-red-400",
  },
]

export default function StaffManagementPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Staff Management</h1>
        <p className="text-white/60">Manage staff accounts, portals, roles, and assignments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.title} href={item.href}>
              <Card className="bg-[#1a1a2e] border-white/10 hover:border-white/20 transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        {item.badge && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/60 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/30 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Enterprise Staff Management</h3>
              <p className="text-sm text-white/60">
                This module provides comprehensive staff management capabilities including:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Centralized staff directory with complete profiles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Portal-based access control and role management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Domain, category, and course assignment system
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Activity tracking and security monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Performance analytics per role type
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
