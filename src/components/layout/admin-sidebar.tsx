"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { HeaderLogo, FooterBranding } from "./logo"
import { 
  LayoutDashboard, Users, BookOpen, Video, Award, CreditCard, 
  Mail, HardDrive, BarChart3, Database, Settings, ScrollText, 
  Headphones, FileText, X
} from "lucide-react"

// Menu items with icons
const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Learning Materials",
    href: "/admin/materials",
    icon: FileText,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Videos",
    href: "/admin/videos",
    icon: Video,
  },
  {
    title: "Certificates",
    href: "/admin/certificates",
    icon: Award,
  },
  {
    title: "Pricing & Plans",
    href: "/admin/pricing",
    icon: CreditCard,
  },
  {
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
  },
  {
    title: "Storage Manager",
    href: "/admin/storage",
    icon: HardDrive,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Database Explorer",
    href: "/admin/database",
    icon: Database,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ScrollText,
  },
  {
    title: "Support Center",
    href: "/admin/support",
    icon: Headphones,
  },
]

export function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px] bg-[#1a1a2e] border-r border-white/10 flex flex-col",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <HeaderLogo />
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose()}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer Branding with InnovaSci AI Labs */}
        <FooterBranding />
      </motion.aside>
    </>
  )
}
