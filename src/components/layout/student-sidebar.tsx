"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { HeaderLogo, FooterBranding } from "./logo"
import { 
  LayoutDashboard, BookOpen, Award, User, Settings,
  Heart, Clock, X, Menu, Map, HelpCircle, Brain
} from "lucide-react"

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { title: "My Learning Paths", href: "/dashboard/learning-paths", icon: Map },
  { title: "Practice & Quizzes", href: "/dashboard/quizzes", icon: Brain },
  { title: "Certificates", href: "/dashboard/certificates", icon: Award },
  { title: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { title: "Learning History", href: "/dashboard/history", icon: Clock },
  { title: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  { title: "Profile", href: "/dashboard/profile", icon: User },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function StudentSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-[280px] bg-white dark:bg-[#1a1a2e] border-r border-gray-200 dark:border-white/10 flex flex-col",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-white/10">
          <HeaderLogo />
          <button onClick={onClose} className="lg:hidden text-gray-500 dark:text-white/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white shadow-lg"
                        : "text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <FooterBranding />
      </aside>
    </>
  )
}
