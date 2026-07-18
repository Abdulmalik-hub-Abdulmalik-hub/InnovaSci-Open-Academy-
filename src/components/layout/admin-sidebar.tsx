"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { HeaderLogo, FooterBranding } from "./logo"
import { 
  LayoutDashboard, Users, Video, Award, CreditCard, 
  Mail, HardDrive, BarChart3, Database, Settings, ScrollText, 
  Headphones, FileText, X, LayoutTemplate, Folder, 
  Layers, BookOpen, LayoutGrid, BadgeCheck, Shield,
  FileBadge, Scroll, Bookmark, FolderGit2, DollarSign,
  Users2, BarChart4, FileTextIcon,
  Building2, SettingsIcon, Megaphone
} from "lucide-react"

// =============================================================================
// ADMIN SIDEBAR - NEUTRAL/DISTINCT STYLING (NO BRAND COLORS)
// =============================================================================
// This sidebar remains neutral to avoid confusion with the public-facing platform.
// Uses a distinct dark theme with neutral colors for clear separation.
// =============================================================================

// Menu items with icons
const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Staff Management",
    href: "/admin/staff-management",
    icon: Users,
    submenu: [
      { title: "Staff Directory", href: "/admin/staff-management/staff-directory" },
      { title: "Create Staff", href: "/admin/staff-management/staff-create" },
      { title: "Portal Management", href: "/admin/portal-management" },
      { title: "Role Management", href: "/admin/roles" },
    ],
  },
  {
    title: "Academic Management",
    href: "/admin/domains",
    icon: LayoutGrid,
    submenu: [
      { title: "Domains", href: "/admin/domains" },
      { title: "Categories", href: "/admin/categories" },
      { title: "Courses", href: "/admin/mccs/courses" },
      { title: "Difficulty Capstones", href: "/admin/courses/capstones/difficulty" },
      { title: "Professional Capstones", href: "/admin/courses/capstones/professional" },
    ],
  },
  {
    title: "Student Projects",
    href: "/admin/projects",
    icon: FolderGit2,
    submenu: [
      { title: "All Projects", href: "/admin/projects" },
      { title: "Review Queue", href: "/admin/projects?status=SUBMITTED" },
      { title: "Rubrics", href: "/admin/projects/rubrics" },
    ],
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
    title: "Videos",
    href: "/admin/videos",
    icon: Video,
  },
  {
    title: "Certificate Management",
    href: "/admin/certificates",
    icon: Award,
    submenu: [
      { title: "Category Certificates", href: "/admin/certificates/categories" },
      { title: "Domain Certificates", href: "/admin/certificates/domains" },
      { title: "Certificate Templates", href: "/admin/certificates/templates" },
      { title: "Certificate Verification", href: "/admin/certificates/verification" },
      { title: "Certificate Analytics", href: "/admin/certificates/analytics" },
      { title: "Certificate Settings", href: "/admin/certificates/settings" },
    ],
  },
  {
    title: "Pricing & Plans",
    href: "/admin/pricing",
    icon: CreditCard,
    submenu: [
      { title: "Plans Management", href: "/admin/pricing" },
      { title: "Exchange Rates", href: "/admin/exchange-rates" },
    ],
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
      {/* Mobile Overlay - Touch-friendly */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Distinct neutral styling */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px] bg-[#1a1a2e] border-r border-white/10 flex flex-col",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 border-b border-white/10">
          <HeaderLogo />
          <button
            onClick={onClose}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const hasSubmenu = !!item.submenu
              const isSubmenuActive = item.submenu?.some(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"))
              
              return (
                <li key={item.href}>
                  {hasSubmenu ? (
                    <div>
                      <Link
                        href={item.href}
                        onClick={() => onClose()}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive || isSubmenuActive
                            ? "bg-white/15 text-white shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5", (isActive || isSubmenuActive) && "text-white")} />
                        {item.title}
                      </Link>
                      {/* Submenu */}
                      <ul className="ml-6 mt-1 space-y-0.5">
                        {item.submenu?.map((subitem) => {
                          if (!subitem.href) return null
                          const isSubActive = pathname === subitem.href || pathname.startsWith(subitem.href + "/")
                          return (
                            <li key={subitem.href}>
                              <Link
                                href={subitem.href}
                                onClick={() => onClose()}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                  isSubActive
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                )}
                              >
                                {isSubActive && (
                                  <div className="w-1 h-1 rounded-full bg-white/60" />
                                )}
                                {subitem.title}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => onClose()}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-white/15 text-white shadow-lg"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                      {item.title}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer Branding */}
        <FooterBranding />
      </motion.aside>
    </>
  )
}
