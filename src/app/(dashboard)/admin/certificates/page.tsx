"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Award, BadgeCheck, Globe, LayoutTemplate, Shield, BarChart3,
  ChevronRight, Star, GraduationCap, TrendingUp, CheckCircle2,
  Lock, Unlock, FileBadge
} from "lucide-react"

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Certificate Management</h1>
        <p className="text-white/60 mt-1">Manage Category Professional Certificates and Domain Master Certificates</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Category Certificates</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <BadgeCheck className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Domain Certificates</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Issued</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active Templates</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <LayoutTemplate className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Category Certificates */}
        <Link href="/admin/certificates/categories">
          <Card className="bg-[#1a1a2e] border-white/10 hover:border-purple-500/50 transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <BadgeCheck className="h-6 w-6 text-purple-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-white/40" />
              </div>
              <CardTitle className="text-white mt-4">Category Certificates</CardTitle>
              <CardDescription className="text-white/60">
                Manage Professional Certificates for completing categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  Create & manage category certificates
                </li>
                <li className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-purple-400" />
                  Set eligibility requirements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  Track issued certificates
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Domain Certificates */}
        <Link href="/admin/certificates/domains">
          <Card className="bg-[#1a1a2e] border-white/10 hover:border-blue-500/50 transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-white/40" />
              </div>
              <CardTitle className="text-white mt-4">Domain Certificates</CardTitle>
              <CardDescription className="text-white/60">
                Manage Master Certificates for completing domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-400" />
                  Create & manage domain certificates
                </li>
                <li className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-400" />
                  Configure category requirements
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  Monitor issuance & progress
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Certificate Templates */}
        <Link href="/admin/certificates/templates">
          <Card className="bg-[#1a1a2e] border-white/10 hover:border-amber-500/50 transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <LayoutTemplate className="h-6 w-6 text-amber-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-white/40" />
              </div>
              <CardTitle className="text-white mt-4">Certificate Templates</CardTitle>
              <CardDescription className="text-white/60">
                Design & manage certificate layouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <FileBadge className="h-4 w-4 text-amber-400" />
                  Category & Domain templates
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  Signatures & official seals
                </li>
                <li className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-amber-400" />
                  Custom typography & design
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Certificate Verification */}
        <Link href="/admin/certificates/verification">
          <Card className="bg-[#1a1a2e] border-white/10 hover:border-green-500/50 transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-white/40" />
              </div>
              <CardTitle className="text-white mt-4">Certificate Verification</CardTitle>
              <CardDescription className="text-white/60">
                Verify and manage certificate authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  QR code verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Authenticity checks
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-400" />
                  Revocation management
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Certificate Analytics */}
        <Link href="/admin/certificates/analytics">
          <Card className="bg-[#1a1a2e] border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-cyan-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-white/40" />
              </div>
              <CardTitle className="text-white mt-4">Certificate Analytics</CardTitle>
              <CardDescription className="text-white/60">
                Track certificate issuance & trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                  Issuance statistics
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  Completion rates
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-cyan-400" />
                  Popular certificates
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Certificate Settings */}
        <Link href="/admin/certificates/settings">
          <Card className="bg-[#1a1a2e] border-white/10 hover:border-gray-500/50 transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-gray-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-white/40" />
              </div>
              <CardTitle className="text-white mt-4">Certificate Settings</CardTitle>
              <CardDescription className="text-white/60">
                Configure system-wide certificate settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  Security settings
                </li>
                <li className="flex items-center gap-2">
                  <FileBadge className="h-4 w-4 text-gray-400" />
                  Number format configuration
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  Access controls
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
