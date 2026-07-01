"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, X, Moon, Sun, User, 
  LayoutDashboard, BookOpen, Settings, LogOut, ChevronDown,
  CreditCard, MessageSquare, Compass, Mail, Home, BookText
} from "lucide-react"
import { AcademyLogo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Navigation items - Landing Page Global Navigation
// This is the ONLY place for platform-level navigation
// Completely independent from Student Dashboard navigation
const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: BookText },
  { href: "/membership", label: "Membership", icon: CreditCard },
  { href: "/learning-paths", label: "Learning Paths", icon: Compass },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/contact", label: "Contact", icon: Mail },
]

// User dropdown menu items
const userMenuItems = [
  { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
]

// Demo user state (simulating authentication)
interface UserState {
  isAuthenticated: boolean
  name: string
  email: string
  avatar?: string
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Mock authenticated user state
  const [user] = useState<UserState>({
    isAuthenticated: false, // Set to true to see authenticated state
    name: "Abdulmalik",
    email: "abdulmalik@innovasci.com",
    avatar: undefined
  })

  // Handle mounting for theme to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <AcademyLogo className="h-7 sm:h-8 w-auto" />
          </Link>

          {/* Desktop Navigation - Hidden on mobile and tablet */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all rounded-lg",
                    isActive(item.href)
                      ? "text-[hsl(var(--brand-purple))] bg-[hsl(var(--brand-purple))/10]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Tablet Navigation - Shows on md but hides on xl */}
          <nav className="hidden md:flex xl:hidden items-center gap-0.5">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all rounded-lg",
                    isActive(item.href)
                      ? "text-[hsl(var(--brand-purple))] bg-[hsl(var(--brand-purple))/10]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Spacer for tablet navigation */}
          <div className="hidden md:block xl:hidden flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative w-9 h-9 sm:w-10 sm:h-10"
              >
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Auth Actions - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {user.isAuthenticated ? (
                /* User Avatar Dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-[hsl(var(--brand-purple))/20] transition-all">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform hidden sm:block",
                      userMenuOpen && "rotate-180"
                    )} />
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border bg-popover shadow-lg ring-1 ring-black/5 animate-scale-in"
                      >
                        <div className="p-3 border-b">
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="p-2">
                          {userMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              >
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            )
                          })}
                        </div>
                        <div className="p-2 border-t">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false)
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Login / Sign Up */
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="font-medium hidden sm:flex">
                      Log in
                    </Button>
                    <Button variant="ghost" size="icon" className="sm:hidden">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="bg-gradient-to-r from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] hover:opacity-90 font-medium shadow-md hover:shadow-lg transition-all">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button - Shows on md and below */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t"
            >
              <nav className="py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm sm:text-base font-medium rounded-lg transition-colors",
                        isActive(item.href)
                          ? "text-[hsl(var(--brand-purple))] bg-[hsl(var(--brand-purple))/10]"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
                
                {/* Auth Actions - Mobile */}
                <div className="pt-4 mt-4 border-t space-y-3">
                  {user.isAuthenticated ? (
                    <>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))] text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      {userMenuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </Link>
                        )
                      })}
                      <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="block px-4">
                        <Button variant="outline" className="w-full">Log in</Button>
                      </Link>
                      <Link href="/auth/signup" className="block px-4">
                        <Button className="w-full bg-gradient-to-r from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-blue))]">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
