"use client"

import { useState } from "react"
import { StudentSidebar } from "@/components/layout/student-sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a]">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 h-16 bg-gray-50 dark:bg-[#0f0f1a]/95 backdrop-blur border-b border-gray-200 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Student Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
