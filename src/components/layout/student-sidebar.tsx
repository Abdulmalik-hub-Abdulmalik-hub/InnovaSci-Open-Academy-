"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FooterBranding } from "./logo"
import { 
  LayoutDashboard, BookOpen, Award, User, Settings,
  Heart, Clock, X, Menu, Map, HelpCircle,
  ChevronDown, Home, Users, Mail, MessageSquare, CreditCard, GraduationCap
} from "lucide-react"

interface MenuItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
}

// Main navigation items (global sidebar - always visible)
// These are the core platform sections - NOT student dashboard features
const mainNavItems: MenuItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Courses", href: "/courses", icon: GraduationCap },
  { title: "Membership", href: "/membership", icon: Users },
  { title: "Learning Path", href: "/learning-paths", icon: Map },
  { title: "Forum", href: "/forum", icon: MessageSquare },
  { title: "Contact", href: "/contact", icon: Mail },
]

// Quick access items - These are the student dashboard features
// Only include user-specific learning features here
const quickAccessItems: MenuItem[] = [
  { title: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { title: "Certificates", href: "/dashboard/certificates", icon: Award },
  { title: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { title: "Learning History", href: "/dashboard/history", icon: Clock },
]

// Support items
const supportItems: MenuItem[] = [
  { title: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  { title: "Settings", href: "/dashboard/settings/profile", icon: Settings },
]

function MenuSection({ 
  title, 
  items, 
  onClose,
  showTitle = true
}: { 
  title: string
  items: MenuItem[]
  onClose: () => void
  showTitle?: boolean
}) {
  const pathname = usePathname()

  return (
    <div className="mb-4">
      {showTitle && title && (
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-white")} />
                  {item.title}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

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

        {/* Main Navigation - Always Visible */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <MenuSection title="Navigation" items={mainNavItems} onClose={onClose} />
          
          <div className="h-px bg-gray-100 dark:bg-white/10 my-4" />
          
          <MenuSection title="Quick Access" items={quickAccessItems} onClose={onClose} showTitle />
          
          <div className="h-px bg-gray-100 dark:bg-white/10 my-4" />
          
          <MenuSection title="Support" items={supportItems} onClose={onClose} showTitle />
        </nav>

        <FooterBranding />
      </aside>
    </>
  )
}
