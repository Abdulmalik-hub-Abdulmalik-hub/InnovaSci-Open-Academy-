"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to profile settings by default
    router.replace("/dashboard/settings/profile")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[hsl(var(--brand-purple))] border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    </div>
  )
}
