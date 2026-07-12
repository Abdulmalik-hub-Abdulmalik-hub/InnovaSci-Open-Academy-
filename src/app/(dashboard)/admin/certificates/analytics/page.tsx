"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Award, TrendingUp, Users, Calendar, BarChart3, 
  Globe, BadgeCheck, ArrowUp, ArrowDown
} from "lucide-react"
import Link from "next/link"

export default function CertificateAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Link href="/admin/certificates" className="text-white/60 hover:text-white">
            Certificates
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-white">Analytics</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-2">Certificate Analytics</h1>
        <p className="text-white/60 mt-1">Track certificate issuance, trends, and student progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Issued</p>
                <p className="text-3xl font-bold text-white mt-1">0</p>
                <p className="text-white/40 text-xs mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1 text-green-400" />
                  0% this month
                </p>
              </div>
              <Award className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Category Certs</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">0</p>
                <p className="text-white/40 text-xs mt-1">Professional</p>
              </div>
              <BadgeCheck className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Domain Certs</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">0</p>
                <p className="text-white/40 text-xs mt-1">Master</p>
              </div>
              <Globe className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">This Month</p>
                <p className="text-3xl font-bold text-green-400 mt-1">0</p>
                <p className="text-white/40 text-xs mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1 text-green-400" />
                  0% growth
                </p>
              </div>
              <Calendar className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issuance Trends */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Issuance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-white/40">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-white/20" />
                <p>Chart visualization coming soon</p>
                <p className="text-xs mt-1">Monthly certificate issuance data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Certificates */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Most Issued Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "No certificates yet", count: 0, type: "Category" },
              ].map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{cert.name}</p>
                      <p className="text-white/40 text-xs">{cert.type}</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {cert.count} issued
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-green-400" />
            Recent Certificate Issuances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/40">
            <Award className="h-12 w-12 mx-auto mb-2 text-white/20" />
            <p>No certificate issuances yet</p>
            <p className="text-xs mt-1">Recent certificate activity will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Domain/Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Certificates by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-white/40">
              <Globe className="h-12 w-12 mx-auto mb-2 text-white/20" />
              <p>No domain certificates issued</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Certificates by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-white/40">
              <BadgeCheck className="h-12 w-12 mx-auto mb-2 text-white/20" />
              <p>No category certificates issued</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
