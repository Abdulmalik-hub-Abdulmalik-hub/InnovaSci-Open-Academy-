"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Menu, AlertTriangle, X, Power, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [loadingMaintenance, setLoadingMaintenance] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  
  // Check if user is admin
  const sessionRole = session?.user?.role
  const isAdmin = sessionRole === "ADMIN" || sessionRole === "SUPER_ADMIN"
  
  console.log("[Dashboard Layout] ============================================")
  console.log("[Dashboard Layout] Session status:", status)
  console.log("[Dashboard Layout] Session role:", sessionRole)
  console.log("[Dashboard Layout] isAdmin:", isAdmin)
  
  // CRITICAL: Verify role is not from Supabase
  if (sessionRole === 'authenticated') {
    console.error("[Dashboard Layout] CRITICAL ERROR: Session role is 'authenticated'!")
    console.error("[Dashboard Layout] This should NEVER happen - Prisma role must be used!")
    console.error("[Dashboard Layout] ============================================")
  }
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (status === "unauthenticated") {
      console.log("[Dashboard Layout] Not authenticated - redirecting to login")
      console.log("[Dashboard Layout] ============================================")
      router.push("/auth/login?callbackUrl=/admin")
      return
    }
    
    if (!isAdmin) {
      console.log("[Dashboard Layout] NOT ADMIN - Role is:", sessionRole)
      console.log("[Dashboard Layout] Expected: ADMIN or SUPER_ADMIN")
      console.log("[Dashboard Layout] Redirecting to /forbidden")
      console.log("[Dashboard Layout] ============================================")
      router.push("/forbidden")
    } else {
      console.log("[Dashboard Layout] ADMIN ACCESS CONFIRMED - Rendering dashboard")
      console.log("[Dashboard Layout] ============================================")
    }
  }, [status, isAdmin, sessionRole, router])
  
  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/70">Verifying access...</p>
        </div>
      </div>
    )
  }
  
  // Don't render if not admin
  if (!isAdmin) {
    console.log("[Dashboard Layout] Not admin - not rendering dashboard")
    console.log("[Dashboard Layout] ============================================")
    return null
  }
  
  console.log("[Dashboard Layout] Rendering admin dashboard for role:", sessionRole)
  console.log("[Dashboard Layout] ============================================")

  // Fetch maintenance status
  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const res = await fetch("/api/admin/system-settings")
        const data = await res.json()
        if (data.success && data.data.maintenanceMode) {
          setMaintenanceMode(true)
        }
      } catch (error) {
        console.error("Error fetching maintenance status:", error)
      }
    }
    fetchMaintenanceStatus()
  }, [])

  const turnOffMaintenance = async () => {
    setLoadingMaintenance(true)
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: false,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMaintenanceMode(false)
        toast.success("Maintenance Mode DISABLED - Students can now access the platform")
        router.refresh()
      }
    } catch (error) {
      console.error("Error turning off maintenance mode:", error)
      toast.error("Failed to turn off maintenance mode")
    } finally {
      setLoadingMaintenance(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Maintenance Mode Banner - Always visible when maintenance is active */}
      {maintenanceMode && !bannerDismissed && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/95 text-amber-950 px-4 py-3 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="font-semibold">
                ⚠️ MAINTENANCE MODE IS ACTIVE — Students cannot access the platform.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={turnOffMaintenance}
                disabled={loadingMaintenance}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Power className="h-4 w-4 mr-2" />
                {loadingMaintenance ? "Turning Off..." : "Turn Off Maintenance"}
              </Button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1 hover:bg-amber-600/20 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`lg:pl-[280px] ${maintenanceMode && !bannerDismissed ? "pt-14" : ""}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0f0f1a]/95 backdrop-blur border-b border-white/10 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white">Super Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
              Notifications
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
