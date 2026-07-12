"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, RefreshCw, Plus, Loader2, Edit2, Trash2, 
  Globe, CheckCircle, Eye, Settings, Award
} from "lucide-react"
import Link from "next/link"

interface DomainCertificate {
  id: string
  certificateName: string
  description: string | null
  domain: {
    id: string
    name: string
    slug: string
    icon: string | null
    color: string | null
  }
  categoryCount: number
  issuedCount: number
  isActive: boolean
  orderIndex: number
  createdAt: string
}

export default function DomainCertificatesPage() {
  const [certificates, setCertificates] = useState<DomainCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState({ totalCertificates: 0, totalIssued: 0 })

  const fetchCertificates = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      
      const response = await fetch(`/api/admin/certificates/domains?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setCertificates(result.data.certificates)
        setStats(result.data.stats)
      } else {
        setError(result.error || "Failed to load certificates")
      }
    } catch (err) {
      setError("Failed to load certificates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/certificates" className="text-white/60 hover:text-white">
              Certificates
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white">Domain Certificates</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Domain Certificates</h1>
          <p className="text-white/60 mt-1">Manage Master Certificates for completing domains</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
          <Plus className="h-4 w-4 mr-2" />
          Create Domain Certificate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Certificates</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalCertificates}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Issued</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalIssued}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active Certificates</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {certificates.filter(c => c.isActive).length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
                placeholder="Search certificates..."
              />
            </div>
            <Button onClick={fetchCertificates} variant="outline" className="border-white/20 text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : certificates.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 mb-4">No domain certificates found</p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
              <Plus className="h-4 w-4 mr-2" />
              Create First Certificate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className="bg-[#1a1a2e] border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${cert.domain.color || "#3b82f6"}20` }}
                    >
                      <Globe className="h-6 w-6" style={{ color: cert.domain.color || "#3b82f6" }} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">
                        {cert.certificateName}
                      </CardTitle>
                      <p className="text-white/60 text-sm">{cert.domain.name}</p>
                    </div>
                  </div>
                  <Badge className={cert.isActive 
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                  }>
                    {cert.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {cert.description && (
                  <p className="text-white/60 text-sm mb-4">{cert.description}</p>
                )}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-white">{cert.categoryCount}</p>
                    <p className="text-xs text-white/60">Categories</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-blue-400">{cert.issuedCount}</p>
                    <p className="text-xs text-white/60">Issued</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/60">#{cert.orderIndex}</p>
                    <p className="text-xs text-white/60">Order</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    Created {formatDate(cert.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
