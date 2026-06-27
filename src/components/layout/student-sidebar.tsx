"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { HeaderLogo, FooterBranding } from "./logo"
import { 
  LayoutDashboard, BookOpen, Award, User, Settings,
  Heart, Clock, X, Menu, Map, HelpCircle, Brain, ChevronDown
} from "lucide-react"

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { title: "My Learning Paths", href: "/dashboard/learning-paths", icon: Map },
  { title: "Practice & Quizzes", href: "/dashboard/quizzes", icon: Brain },
  { title: "Certificates", href: "/dashboard/certificates", icon: Award },
]

const secondaryMenuItems = [
  { title: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { title: "Learning History", href: "/dashboard/history", icon: Clock },
  { title: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
]

const bottomMenuItems = [
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
        "fixed left-0 top-0 z-50 h-screen w-[260px] bg-white dark:bg-[#0f0f1a] border-r border-gray-100 dark:border-white/5 flex flex-col",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-100 dark:border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">IO</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">InnovaSci</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Learning
            </p>
            <ul className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-white")} />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Secondary Navigation */}
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Account
            </p>
            <ul className="space-y-0.5">
              {secondaryMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-white")} />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-100 dark:border-white/5 py-3 px-3">
          <ul className="space-y-0.5">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-white")} />
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <FooterBranding />
      </aside>
    </>
  )
}
