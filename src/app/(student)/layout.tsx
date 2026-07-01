"use client"

import { useState } from "react"
import { StudentSidebar } from "@/components/layout/student-sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a]">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area - Responsive padding and margins */}
      <div className={cn(
        "min-h-screen transition-all duration-300",
        "lg:pl-[280px]"
      )}>
        {/* Header - Responsive height and spacing */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-gray-50 dark:bg-[#0f0f1a]/95 backdrop-blur border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left side - Mobile menu button and title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-semibold">Student Dashboard</h1>
          </div>
          
          {/* Right side - User avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </header>

        {/* Main content - Responsive padding */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
