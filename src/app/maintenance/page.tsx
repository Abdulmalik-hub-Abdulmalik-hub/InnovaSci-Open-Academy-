import { prisma } from "@/lib/prisma"
import { Settings, Mail, Clock, RefreshCw } from "lucide-react"

export const revalidate = 60 // Revalidate every 60 seconds

async function getMaintenanceSettings() {
  try {
    // Get maintenance message from SystemSetting model
    const maintenanceMessageSetting = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_message" },
      select: { value: true },
    })
    
    return {
      message: maintenanceMessageSetting?.value || "We are performing scheduled maintenance. Please check back soon."
    }
  } catch (error) {
    console.error("Error fetching maintenance settings:", error)
    return {
      message: "We are performing scheduled maintenance. Please check back soon."
    }
  }
}

export default async function MaintenancePage() {
  const settings = await getMaintenanceSettings()
  const message = settings?.message || "We are performing scheduled maintenance. Please check back soon."

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Settings className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30">
            <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Under Maintenance
        </h1>

        {/* Message */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <p className="text-lg text-white/80 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">What to expect</h3>
            </div>
            <p className="text-white/60 text-sm">
              We&apos;re working to improve your experience. The platform will be back shortly.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Need help?</h3>
            </div>
            <p className="text-white/60 text-sm">
              Contact us at{" "}
              <a href="mailto:support@innovasci.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                support@innovasci.com
              </a>
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="mt-12">
          <p className="text-white/40 text-sm">
            Powered by{" "}
            <span className="text-purple-400 font-semibold">InnovaSci Open Academy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
