"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  GraduationCap,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Globe,
  Mail,
  Share2,
  Facebook,
  Linkedin,
  Twitter,
  MessageCircle,
  Send,
  ArrowLeft,
  CheckCircle,
  Star,
  Award,
  BookOpen,
  Shield,
  ExternalLink,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

const typeLabels: Record<string, string> = {
  FORCEWORK: "Forcework",
  MERIT: "Merit",
  NEED_BASED: "Need-Based",
  RESEARCH_INNOVATION: "Research & Innovation",
  SPECIAL_NEED: "Special Need",
  COMMUNITY_IMPACT: "Community Impact",
  FOUNDER: "Founder",
  SPONSORED: "Sponsored",
  ZAKAT_WAQF: "Zakat & Waqf",
  TUITION_WAIVER: "Tuition Waiver",
  PARTIAL: "Partial",
  FULL: "Full",
  FINANCIAL_AID: "Financial Aid",
}

const typeColors: Record<string, string> = {
  FORCEWORK: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MERIT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  NEED_BASED: "bg-green-500/20 text-green-400 border-green-500/30",
  RESEARCH_INNOVATION: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  SPECIAL_NEED: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  COMMUNITY_IMPACT: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  FOUNDER: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  SPONSORED: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  ZAKAT_WAQF: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  TUITION_WAIVER: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  PARTIAL: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  FULL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FINANCIAL_AID: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function ScholarshipDetailPage() {
  const params = useParams()
  const [scholarship, setScholarship] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const response = await fetch(`/api/public/scholarships/${params.slug}`)
        if (!response.ok) {
          throw new Error("Scholarship not found")
        }
        const data = await response.json()
        setScholarship(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchScholarship()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Scholarship Not Found</h1>
          <p className="text-white/60 mb-6">This scholarship may have been removed or is no longer available.</p>
          <Link href="/scholarships">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Scholarships
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative">
        {/* Banner */}
        <div className="h-64 md:h-80 relative overflow-hidden">
          {scholarship.bannerUrl ? (
            <img 
              src={scholarship.bannerUrl} 
              alt={scholarship.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ backgroundColor: scholarship.color || "#7C3AED" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="flex items-center justify-center h-full">
                <span className="text-9xl opacity-20">{scholarship.icon || "🎓"}</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>

        {/* Back Button & Badges */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <Link href="/scholarships">
              <Button variant="ghost" className="text-white bg-black/30 backdrop-blur-sm hover:bg-black/40">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scholarships
              </Button>
            </Link>
            <div className="flex gap-2">
              {scholarship.isFeatured && (
                <Badge className="bg-amber-500 text-white">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
              <Badge className={typeColors[scholarship.type] || "bg-gray-500/20 text-gray-400"}>
                {typeLabels[scholarship.type] || scholarship.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {scholarship.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                {scholarship.sponsor && (
                  <div className="flex items-center gap-2">
                    {scholarship.sponsor.logo ? (
                      <img src={scholarship.sponsor.logo} alt={scholarship.sponsor.name} className="h-6 w-6 rounded" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-green-400" />
                    )}
                    <span>By {scholarship.sponsor.name}</span>
                  </div>
                )}
                {scholarship.applicationCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{scholarship.applicationCount} applicants</span>
                  </div>
                )}
                {scholarship.closingDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <span>Closes {formatDistanceToNow(new Date(scholarship.closingDate), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {scholarship.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-400" />
                        About This Scholarship
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                        {scholarship.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Objectives */}
              {scholarship.objectives && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-400" />
                        Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                        {scholarship.objectives}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Eligibility */}
              {scholarship.eligibility && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-400" />
                        Eligibility Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                        {scholarship.eligibility}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Benefits */}
              {scholarship.benefits && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="h-5 w-5 text-purple-400" />
                        Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                        {scholarship.benefits}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Coverage */}
              {scholarship.coverage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        What&apos;s Covered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                        {scholarship.coverage}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Academic Domains */}
              {scholarship.domains && scholarship.domains.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Academic Domains</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.domains.map((d: any) => (
                          <Badge key={d.domain.id} variant="outline" className="border-white/20 text-white/80 px-3 py-1">
                            {d.domain.icon && <span className="mr-1">{d.domain.icon}</span>}
                            {d.domain.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Categories */}
              {scholarship.categories && scholarship.categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Applicable Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.categories.map((c: any) => (
                          <Badge key={c.category.id} variant="outline" className="border-white/20 text-white/80 px-3 py-1">
                            {c.category.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Membership Plans */}
              {scholarship.plans && scholarship.plans.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Included Membership Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {scholarship.plans.map((p: any) => (
                          <div key={p.plan.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                            <Award className="h-5 w-5 text-purple-400 mt-0.5" />
                            <div>
                              <p className="text-white font-medium">{p.plan.name}</p>
                              {p.plan.description && (
                                <p className="text-white/60 text-sm">{p.plan.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 sticky top-6">
                  <CardContent className="p-6 space-y-6">
                    {/* Status */}
                    {!scholarship.isOpen ? (
                      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
                        <p className="text-red-400 font-medium">Applications Closed</p>
                        <p className="text-white/60 text-sm mt-1">This scholarship is no longer accepting applications</p>
                      </div>
                    ) : (
                      <>
                        <Link href={`/scholarships/apply/${scholarship.slug}`} className="block">
                          <Button className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                            Apply Now
                          </Button>
                        </Link>
                        <p className="text-center text-white/60 text-sm">
                          Application deadline: {scholarship.closingDate 
                            ? format(new Date(scholarship.closingDate), "MMMM d, yyyy")
                            : "No deadline"
                          }
                        </p>
                      </>
                    )}

                    <Separator className="bg-white/10" />

                    {/* Quick Info */}
                    <div className="space-y-4">
                      {scholarship.awardAmount && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            Award Amount
                          </span>
                          <span className="text-white font-medium">
                            {scholarship.currency || "USD"} {Number(scholarship.awardAmount).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {scholarship.availableSlots && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-400" />
                            Available Slots
                          </span>
                          <span className="text-white font-medium">{scholarship.availableSlots}</span>
                        </div>
                      )}

                      {scholarship.openingDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            Opens
                          </span>
                          <span className="text-white font-medium">
                            {format(new Date(scholarship.openingDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}

                      {scholarship.closingDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-400" />
                            Closes
                          </span>
                          <span className="text-white font-medium">
                            {format(new Date(scholarship.closingDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-white/60 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-cyan-400" />
                          Applications
                        </span>
                        <span className="text-white font-medium">
                          {scholarship.applicationCount || 0}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Sponsor */}
                    {scholarship.sponsor && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">Sponsored by</p>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          {scholarship.sponsor.logo ? (
                            <img src={scholarship.sponsor.logo} alt={scholarship.sponsor.name} className="h-10 w-10 rounded" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-purple-500/20 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-purple-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{scholarship.sponsor.name}</p>
                            {scholarship.sponsor.website && (
                              <a 
                                href={scholarship.sponsor.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-400 text-sm flex items-center gap-1 hover:underline"
                              >
                                Visit website <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator className="bg-white/10" />

                    {/* Share */}
                    <div>
                      <p className="text-white/60 text-sm mb-3 flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share this scholarship
                      </p>
                      <div className="flex gap-2">
                        <a 
                          href={scholarship.shareUrls?.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center"
                        >
                          <Facebook className="h-5 w-5 text-white/60 mx-auto" />
                        </a>
                        <a 
                          href={scholarship.shareUrls?.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center"
                        >
                          <Twitter className="h-5 w-5 text-white/60 mx-auto" />
                        </a>
                        <a 
                          href={scholarship.shareUrls?.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center"
                        >
                          <Linkedin className="h-5 w-5 text-white/60 mx-auto" />
                        </a>
                        <a 
                          href={scholarship.shareUrls?.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center"
                        >
                          <MessageCircle className="h-5 w-5 text-white/60 mx-auto" />
                        </a>
                      </div>
                    </div>

                    {/* Track Link */}
                    <Link href="/scholarships/track" className="block">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Track Your Application
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Need Help */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-white font-medium mb-2">Need Help?</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Contact us if you have any questions about this scholarship.
                    </p>
                    <a href="/contact">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
