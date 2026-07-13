"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Building,
  Shield, Key, Monitor, Smartphone, Tablet, LogOut, Clock,
  CheckCircle2, XCircle, AlertTriangle, Edit, Save, X,
  Activity, BookOpen, Users, Award, FileText, Bell,
  Eye, EyeOff, RefreshCw, UserX, UserCheck, Download,
  ChevronRight, Loader2, ExternalLink, Globe, Lock,
  Plus, Minus, Unlock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"

// Activity icon mapping
const activityIcons: Record<string, any> = {
  ACCOUNT_CREATED: User,
  ROLE_ASSIGNED: Shield,
  ROLE_CHANGED: Shield,
  PORTAL_ENABLED: CheckCircle2,
  PORTAL_DISABLED: XCircle,
  PASSWORD_CHANGED: Key,
  PASSWORD_RESET: Key,
  PASSWORD_FORCED: Key,
  LOGIN: LogOut,
  LOGOUT: LogOut,
  PROJECT_ASSIGNED: FileText,
  COURSE_ASSIGNED: BookOpen,
  ASSIGNMENT_ADDED: Plus,
  ASSIGNMENT_REMOVED: Minus,
  REVIEW_COMPLETED: CheckCircle2,
  CERTIFICATE_APPROVED: Award,
  SUSPENDED: UserX,
  REACTIVATED: UserCheck,
  SESSION_TERMINATED: Monitor,
  ACCOUNT_UNLOCKED: Unlock,
  STATUS_CHANGED: Activity,
}

const statusColors: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "bg-green-500/20", text: "text-green-400" },
  INACTIVE: { bg: "bg-gray-500/20", text: "text-gray-400" },
  SUSPENDED: { bg: "bg-red-500/20", text: "text-red-400" },
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Administrator",
  ADMIN: "Administrator",
  ACADEMIC_DIRECTOR: "Academic Director",
  INSTRUCTOR: "Instructor",
  REVIEWER: "Reviewer",
  PROJECT_SUPERVISOR: "Project Supervisor",
  FINANCE_OFFICER: "Finance Officer",
  ADMISSION_OFFICER: "Admission Officer",
  STUDENT_AFFAIRS: "Student Affairs Officer",
  QUALITY_ASSURANCE: "Quality Assurance Officer",
  RESEARCH_COORDINATOR: "Research Coordinator",
  SUPPORT_STAFF: "Support Staff",
}

// Timeline component
function TimelineItem({ activity, index }: { activity: any; index: number }) {
  const Icon = activityIcons[activity.action] || Activity
  const categoryColors: Record<string, string> = {
    ACCOUNT: "bg-blue-500",
    ROLE: "bg-purple-500",
    PORTAL: "bg-green-500",
    SECURITY: "bg-red-500",
    ASSIGNMENT: "bg-amber-500",
    PROJECT: "bg-cyan-500",
    COURSE: "bg-indigo-500",
    SYSTEM: "bg-gray-500",
  }

  return (
    <div className="flex gap-4 pb-6 relative">
      {/* Timeline line */}
      {index !== 0 && (
        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
      )}
      
      {/* Icon */}
      <div className={`w-8 h-8 rounded-full ${categoryColors[activity.category] || 'bg-gray-500'} flex items-center justify-center z-10 flex-shrink-0`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-white">{activity.description}</p>
            {activity.performedBy && (
              <p className="text-xs text-white/50 mt-1">
                by {activity.performedByName || "System"}
              </p>
            )}
          </div>
          <span className="text-xs text-white/40 whitespace-nowrap">
            {formatDate(activity.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Session card component
function SessionCard({ session, onTerminate }: { session: any; onTerminate: () => void }) {
  const DeviceIcon = session.deviceType === "MOBILE" ? Smartphone 
    : session.deviceType === "TABLET" ? Tablet 
    : Monitor

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <DeviceIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white">{session.browser || "Unknown Browser"}</p>
              <p className="text-sm text-white/60">{session.os || "Unknown OS"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onTerminate}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Terminate
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-white/40">IP Address:</span>
            <span className="text-white/80 ml-2">{session.ipAddress || "N/A"}</span>
          </div>
          <div>
            <span className="text-white/40">Location:</span>
            <span className="text-white/80 ml-2">{session.city || session.country || "Unknown"}</span>
          </div>
          <div>
            <span className="text-white/40">Started:</span>
            <span className="text-white/80 ml-2">{formatDate(session.createdAt)}</span>
          </div>
          <div>
            <span className="text-white/40">Last Active:</span>
            <span className="text-white/80 ml-2">{formatDate(session.lastActiveAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Assignment card component
function AssignmentCard({ assignment }: { assignment: any }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className="text-xs"
                style={{ backgroundColor: assignment.portal?.color || '#6366f1', color: 'white' }}
              >
                {assignment.portal?.displayName || "Portal"}
              </Badge>
              {assignment.isPrimary && (
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">Primary</Badge>
              )}
            </div>
            <div className="space-y-1">
              {assignment.domain && (
                <p className="text-sm text-white">
                  <span className="text-white/40">Domain:</span> {assignment.domain.name}
                </p>
              )}
              {assignment.category && (
                <p className="text-sm text-white">
                  <span className="text-white/40">Category:</span> {assignment.category.name}
                </p>
              )}
              {assignment.difficultyLevel && (
                <p className="text-sm text-white">
                  <span className="text-white/40">Difficulty:</span> {assignment.difficultyLevel}
                </p>
              )}
              {assignment.course && (
                <p className="text-sm text-white">
                  <span className="text-white/40">Course:</span> {assignment.course.title}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>Assigned: {formatDate(assignment.assignedAt)}</span>
          <Badge className={assignment.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
            {assignment.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function
function formatDate(date: string | Date): string {
  if (!date) return "N/A"
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export default function StaffProfilePage() {
  const router = useRouter()
  const params = useParams()
  const staffId = params.id as string

  // State
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [timeline, setTimeline] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [security, setSecurity] = useState<any>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  // Fetch staff details
  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`)
      const data = await res.json()
      
      if (data.success) {
        setStaff(data.data)
      } else {
        toast.error("Staff not found")
        router.push("/admin/staff-management/staff-directory")
      }
    } catch (error) {
      console.error("Error fetching staff:", error)
      toast.error("Failed to load staff details")
    } finally {
      setLoading(false)
    }
  }

  // Fetch timeline
  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/timeline?limit=50`)
      const data = await res.json()
      if (data.success) {
        setTimeline(data.data.activities)
      }
    } catch (error) {
      console.error("Error fetching timeline:", error)
    }
  }

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/sessions`)
      const data = await res.json()
      if (data.success) {
        setSessions(data.data)
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
    }
  }

  // Fetch security data
  const fetchSecurity = async () => {
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/security`)
      const data = await res.json()
      if (data.success) {
        setSecurity(data.data)
      }
    } catch (error) {
      console.error("Error fetching security:", error)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (staffId) {
      fetchStaff()
      fetchTimeline()
      fetchSessions()
      fetchSecurity()
    }
  }, [staffId])

  // Reset password
  const handleResetPassword = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password" })
      })
      const data = await res.json()
      if (data.success) {
        setTempPassword(data.temporaryPassword)
        toast.success("Password reset successfully")
        fetchSecurity()
      } else {
        toast.error(data.error || "Failed to reset password")
      }
    } catch (error) {
      toast.error("Failed to reset password")
    } finally {
      setActionLoading(false)
    }
  }

  // Force password change
  const handleForcePasswordChange = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "force_password_change" })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Password change forced successfully")
        fetchSecurity()
      } else {
        toast.error(data.error || "Failed to force password change")
      }
    } catch (error) {
      toast.error("Failed to force password change")
    } finally {
      setActionLoading(false)
    }
  }

  // Unlock account
  const handleUnlock = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlock_account" })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Account unlocked successfully")
        fetchSecurity()
        fetchStaff()
      } else {
        toast.error(data.error || "Failed to unlock account")
      }
    } catch (error) {
      toast.error("Failed to unlock account")
    } finally {
      setActionLoading(false)
    }
  }

  // Suspend account
  const handleSuspend = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend" })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Account suspended successfully")
        setShowSuspendDialog(false)
        fetchStaff()
        fetchSecurity()
      } else {
        toast.error(data.error || "Failed to suspend account")
      }
    } catch (error) {
      toast.error("Failed to suspend account")
    } finally {
      setActionLoading(false)
    }
  }

  // Terminate session
  const handleTerminateSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "terminate", sessionId })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Session terminated successfully")
        fetchSessions()
      } else {
        toast.error(data.error || "Failed to terminate session")
      }
    } catch (error) {
      toast.error("Failed to terminate session")
    }
  }

  // Terminate all sessions
  const handleTerminateAllSessions = async () => {
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "terminate" })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchSessions()
      } else {
        toast.error(data.error || "Failed to terminate sessions")
      }
    } catch (error) {
      toast.error("Failed to terminate sessions")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!staff) {
    return null
  }

  const StatusIcon = statusColors[staff.user.status]?.text.includes("green") ? CheckCircle2 
    : staff.user.status === "SUSPENDED" ? XCircle : Clock

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Staff Profile</h1>
          <p className="text-white/60">View and manage staff member details</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage src={staff.user.profile?.avatarUrl || staff.staffAvatarUrl} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500">
                  {staff.user.profile?.fullName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {staff.user.profile?.fullName || staff.fullName || "Unknown"}
                  </h2>
                  <p className="text-white/60">{staff.user.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={statusColors[staff.user.status]?.bg + " " + statusColors[staff.user.status]?.text}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {staff.user.status}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-white/80">
                      {roleLabels[staff.user.role] || staff.user.role}
                    </Badge>
                    {staff.staffId && (
                      <span className="text-sm text-white/40">
                        ID: {staff.staffId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {staff.user.status === "ACTIVE" ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowSuspendDialog(true)}
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Suspend
                    </Button>
                  ) : staff.user.status === "SUSPENDED" ? (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await fetch(`/api/admin/staff/${staffId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "ACTIVE" })
                        })
                        fetchStaff()
                        toast.success("Account activated")
                      }}
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/staff-management/staff-directory/${staffId}/edit`)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/40">Assignments</p>
                  <p className="text-xl font-bold text-white">{staff.assignments?.length || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/40">Active Sessions</p>
                  <p className="text-xl font-bold text-white">{staff.sessions?.length || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/40">Last Login</p>
                  <p className="text-sm font-bold text-white truncate">
                    {staff.user.lastLogin ? formatDate(staff.user.lastLogin) : "Never"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/40">Member Since</p>
                  <p className="text-sm font-bold text-white">
                    {formatDate(staff.user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
            Overview
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-white/10">
            Assignments
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white/10">
            Security
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-white/10">
            Activity
          </TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-white/10">
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40">Full Name</p>
                    <p className="text-white">{staff.user.profile?.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Email</p>
                    <p className="text-white">{staff.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Phone</p>
                    <p className="text-white">{staff.user.profile?.phone || staff.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Gender</p>
                    <p className="text-white">{staff.user.profile?.gender || staff.gender || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Country</p>
                    <p className="text-white">{staff.user.profile?.country || staff.country || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">City</p>
                    <p className="text-white">{staff.user.profile?.city || staff.city || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-400" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40">Staff ID</p>
                    <p className="text-white">{staff.staffId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Title</p>
                    <p className="text-white">{staff.title || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Department</p>
                    <p className="text-white">{staff.department || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Employee Type</p>
                    <p className="text-white">{staff.employeeType || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Role</p>
                    <p className="text-white">{roleLabels[staff.user.role] || staff.user.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Status</p>
                    <Badge className={statusColors[staff.user.status]?.bg + " " + statusColors[staff.user.status]?.text}>
                      {staff.user.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            {staff.performanceStats && (
              <Card className="bg-[#1a1a2e] border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    Performance Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {staff.performanceStats.type === "instructor" && (
                      <>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Courses Assigned</p>
                          <p className="text-2xl font-bold text-white">{staff.performanceStats.coursesAssigned}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Students Enrolled</p>
                          <p className="text-2xl font-bold text-white">{staff.performanceStats.studentsEnrolled}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Reviews Completed</p>
                          <p className="text-2xl font-bold text-white">{staff.performanceStats.reviewsCompleted}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Completion Rate</p>
                          <p className="text-2xl font-bold text-white">85%</p>
                        </div>
                      </>
                    )}
                    {staff.performanceStats.type === "reviewer" && (
                      <>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Pending Reviews</p>
                          <p className="text-2xl font-bold text-yellow-400">{staff.performanceStats.pendingReviews}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Completed Reviews</p>
                          <p className="text-2xl font-bold text-green-400">{staff.performanceStats.completedReviews}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Total Reviews</p>
                          <p className="text-2xl font-bold text-white">{staff.performanceStats.totalReviews}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Approval Rate</p>
                          <p className="text-2xl font-bold text-purple-400">{staff.performanceStats.approvalRate}%</p>
                        </div>
                      </>
                    )}
                    {staff.performanceStats.type === "supervisor" && (
                      <>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Students Supervised</p>
                          <p className="text-2xl font-bold text-white">{staff.performanceStats.totalStudents}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Milestones Approved</p>
                          <p className="text-2xl font-bold text-green-400">{staff.performanceStats.milestonesApproved}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Milestones Pending</p>
                          <p className="text-2xl font-bold text-yellow-400">{staff.performanceStats.milestonesPending}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-xs text-white/40">Completion Rate</p>
                          <p className="text-2xl font-bold text-blue-400">78%</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Current Assignments</h3>
            <Button
              onClick={() => router.push(`/admin/staff-management/staff-directory/${staffId}/assignments`)}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Assignments
            </Button>
          </div>
          {staff.assignments?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.assignments.map((assignment: any) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-white/30" />
                <p className="text-white/50">No assignments yet</p>
                <p className="text-sm text-white/30 mt-1">
                  Assign domains, categories, or courses to this staff member
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Security */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Password Status</p>
                      <p className="text-sm text-white/50">
                        Last changed: {staff.user.passwordChangedAt ? formatDate(staff.user.passwordChangedAt) : "Never"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowResetDialog(true)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Key className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Account Lock</p>
                      <p className="text-sm text-white/50">
                        {staff.isLocked ? (
                          <span className="text-red-400">Locked until {formatDate(staff.user.lockedUntil)}</span>
                        ) : (
                          <span className="text-green-400">Not locked</span>
                        )}
                      </p>
                    </div>
                    {staff.isLocked && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUnlock}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Unlock
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Failed Login Attempts</p>
                      <p className="text-sm text-white/50">
                        {staff.loginAttempts || 0} attempts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-white/50">
                        {staff.user.twoFactorEnabled ? "Enabled" : "Not enabled"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={handleForcePasswordChange}
                    className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Force Password Change on Next Login
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-purple-400" />
                    Active Sessions
                  </CardTitle>
                  {sessions.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTerminateAllSessions}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Terminate All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onTerminate={() => handleTerminateSession(session.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-white/50">
                    <Monitor className="h-12 w-12 mx-auto mb-3 text-white/30" />
                    <p>No active sessions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="space-y-0">
                  {timeline.map((activity, index) => (
                    <TimelineItem key={activity.id} activity={activity} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/50">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-white/30" />
                  <p>No activity recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                Assigned Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staff.permissions?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {staff.permissions.map((permission: any) => (
                    <div
                      key={permission.id || permission.name}
                      className="p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <p className="font-medium text-white">{permission.displayName || permission.name}</p>
                      <p className="text-xs text-white/50 capitalize">{permission.resource} - {permission.action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/50">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-white/30" />
                  <p>No specific permissions assigned</p>
                  <p className="text-sm text-white/30 mt-1">
                    Permissions are inherited from the assigned role
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Reset Password</DialogTitle>
            <DialogDescription className="text-white/60">
              {tempPassword ? (
                <div className="mt-2 p-4 bg-green-500/20 rounded-lg">
                  <p className="text-green-400 font-medium">New temporary password:</p>
                  <p className="text-white font-mono text-lg mt-1">{tempPassword}</p>
                  <p className="text-sm text-white/50 mt-2">
                    Please share this password securely with the staff member.
                  </p>
                </div>
              ) : (
                "Generate a new temporary password for this staff member."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {tempPassword ? (
              <Button onClick={() => { setShowResetDialog(false); setTempPassword(null) }}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowResetDialog(false)}
                  className="border-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Reset Password
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="bg-[#1a1a2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Suspend Account</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to suspend this account? The user will not be able to log in until the account is reactivated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserX className="h-4 w-4 mr-2" />
              )}
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
