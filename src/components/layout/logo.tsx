"use client"

import Image from "next/image"
import Link from "next/link"

// Academy Logo Component
export function AcademyLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={`${className} relative rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center`}>
      {/* Placeholder - Replace with actual logo */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="h-6 w-6 text-white"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    </div>
  )
}

// InnovaSci AI Labs Logo Component  
export function InnovaLabsLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      {/* Placeholder - Replace with actual logo */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="h-full w-full text-[#0D9488]"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8M12 8v8" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    </div>
  )
}

// Combined Header Logo
export function HeaderLogo() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <AcademyLogo />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white">InnovaSci</span>
        <span className="text-[10px] text-white/60">Open Academy</span>
      </div>
    </Link>
  )
}

// Footer Branding with InnovaSci AI Labs
export function FooterBranding() {
  return (
    <div className="p-4 border-t border-white/10">
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold text-white/90">InnovaSci Open Academy</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[10px] text-white/50">Powered by</span>
          <div className="w-4 h-4">
            <InnovaLabsLogo />
          </div>
          <span className="text-[10px] text-[#0D9488] font-medium">InnovaSci AI Labs</span>
        </div>
      </div>
    </div>
  )
}
