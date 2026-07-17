"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

const footerLinks = {
  platform: [
    { label: "About Us", href: "/about" },
    { label: "Courses", href: "/courses" },
    { label: "Membership", href: "/membership" },
    { label: "Learning Paths", href: "/learning-paths" },
    { label: "Forum", href: "/forum" },
  ],
  resources: [
    { label: "Help Center", href: "/dashboard/support" },
    { label: "Knowledge Base", href: "/knowledge-base" },
    { label: "Contact", href: "/contact" },
    { label: "Community", href: "/forum" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        {/* Responsive grid: stacked mobile, 2 cols tablet, 5 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand - Full width on mobile, 2 cols on tablet */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image 
                src="/logo.png" 
                alt="InnovaSci Open Academy"
                width={120}
                height={34}
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm sm:text-base">
              Democratizing high-quality scientific and technological education for learners worldwide.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--brand-purple))] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--brand-purple))] transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--brand-purple))] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:info@innovasci.com" className="text-muted-foreground hover:text-[hsl(var(--brand-purple))] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links - Stack on mobile, inline on tablet */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-[hsl(var(--brand-purple))] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-[hsl(var(--brand-purple))] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-[hsl(var(--brand-purple))] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer bottom - Responsive */}
        <div className="border-t mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} InnovaSci Open Academy. Powered by InnovaSci AI Labs.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Making science accessible to everyone, everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
