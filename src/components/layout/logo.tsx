"use client"

import Image from "next/image"
import Link from "next/link"

// Official InnovaSci Open Academy Logo Component
export function AcademyLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <Image 
      src="/logo.png" 
      alt="InnovaSci Open Academy"
      width={180}
      height={50}
      className={className}
      priority
    />
  )
}

// InnovaSci AI Labs Logo Component  
export function InnovaLabsLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <Image 
      src="/logo.png" 
      alt="InnovaSci"
      width={24}
      height={24}
      className={className}
    />
  )
}

// Combined Header Logo for Admin
export function HeaderLogo() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <Image 
        src="/logo.png" 
        alt="InnovaSci Open Academy"
        width={140}
        height={40}
        className="h-8 w-auto"
        priority
      />
    </Link>
  )
}

// Footer Branding with InnovaSci AI Labs
export function FooterBranding() {
  return (
    <div className="p-4 border-t border-white/10">
      <div className="text-center space-y-2">
        <Image 
          src="/logo.png" 
          alt="InnovaSci Open Academy"
          width={120}
          height={34}
          className="h-7 w-auto mx-auto"
        />
        <p className="text-[10px] text-white/50">© 2024 InnovaSci Open Academy. All rights reserved.</p>
      </div>
    </div>
  )
}

// Landing Page Logo (Full Logo with Text)
export function LandingLogo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <Image 
      src="/logo.png" 
      alt="InnovaSci Open Academy"
      width={200}
      height={56}
      className={className}
      priority
    />
  )
}
