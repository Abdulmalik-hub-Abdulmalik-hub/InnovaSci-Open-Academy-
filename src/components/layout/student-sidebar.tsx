"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { FooterBranding, AcademyLogo } from "./logo"
import { 
  BookOpen, Award, Settings,
  Heart, Clock, X, HelpCircle,
  Code2, Briefcase, TrendingUp, Star, GraduationCap, Target,
  MessageCircle, BookMarked, Route, BrainCircuit, Shield
} from "lucide-react"

interface MenuItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  description?: string
}

// =============================================================================
// STUDENT DASHBOARD SIDEBAR - INNOVASCI BRAND COLORS
// =============================================================================
// Uses Primary Purple for active states, Teal for CTAs, Blue for accents
// This sidebar ONLY contains student-specific features.
// =============================================================================

// Quick access items - Student Dashboard features ONLY
const quickAccessItems: MenuItem[] = [
  { title: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { title: "Learning Paths", href: "/dashboard/learning-paths", icon: Route },
  { title: "Quizzes", href: "/dashboard/quizzes", icon: BrainCircuit },
  { title: "My Projects", href: "/dashboard/projects", icon: Code2 },
  { title: "Portfolio", href: "/portfolio", icon: Briefcase },
  { title: "Certifications", href: "/dashboard/certificates", icon: Award, description: "Category & Domain Progress" },
]

// Community items
const communityItems: MenuItem[] = [
  { title: "Forum", href: "/dashboard/forum", icon: MessageCircle },
  { title: "Knowledge Base", href: "/dashboard/knowledge-base", icon: BookMarked },
  { title: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { title: "Learning History", href: "/dashboard/history", icon: Clock },
]

// Support items
const supportItems: MenuItem[] = [
  { title: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  { title: "Profile Settings", href: "/dashboard/settings/profile", icon: Settings },
  { title: "Security", href: "/dashboard/settings/security", icon: Shield },
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
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                    ? "bg-[hsl(var(--brand-purple))] text-white shadow-md shadow-[hsl(var(--brand-purple))/20]"
                    : "text-muted-foreground hover:bg-[hsl(var(--brand-purple))/5] hover:text-[hsl(var(--brand-purple))]"
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-white")} />
                  {item.title}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-[hsl(var(--brand-teal))]/20 text-[hsl(var(--brand-teal))] rounded-full">
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
      {/* Mobile Overlay - Touch-friendly backdrop */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Responsive width */}
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px] bg-white dark:bg-[#0f0f1a] border-r border-border flex flex-col",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header - Touch-friendly close button */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <AcademyLogo className="h-7 w-auto" />
          </Link>
          <button 
            onClick={onClose} 
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student Dashboard Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <MenuSection title="Quick Access" items={quickAccessItems} onClose={onClose} showTitle />
          
          <div className="h-px bg-border my-4" />
          
          <MenuSection title="Community" items={communityItems} onClose={onClose} showTitle />
          
          <div className="h-px bg-border my-4" />
          
          <MenuSection title="Support" items={supportItems} onClose={onClose} showTitle />
        </nav>

        <FooterBranding />
      </motion.aside>
    </>
  )
}
