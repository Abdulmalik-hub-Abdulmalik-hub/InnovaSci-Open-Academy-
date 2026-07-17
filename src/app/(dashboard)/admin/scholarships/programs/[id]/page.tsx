"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft, Save, Eye, Calendar, DollarSign, Users, FileText,
  Globe, Settings, Shield, Award, Loader2, Plus, X, Info, Trash2
} from "lucide-react"
import toast from "react-hot-toast"

interface ScholarshipType {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
}

interface Scholarship {
  id: string
  name: string
  shortName: string | null
  slug: string
  description: string | null
  objectives: string | null
  eligibility: string | null
  benefits: string | null
  typeId: string
  type: ScholarshipType
  awardAmount: number | null
  currency: string
  coverageType: string
  maxRecipients: number | null
  currentRecipients: number
  totalBudget: number | null
  budgetUsed: number | null
  openingDate: string | null
  closingDate: string | null
  announcementDate: string | null
  startDate: string | null
  endDate: string | null
  status: string
  visibility: string
  isFeatured: boolean
  allowLateApplications: boolean
  selectionMethod: string
  requireInterview: boolean
  interviewDate: string | null
  interviewLocation: string | null
  sponsorId: string | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  bannerUrl: string | null
  thumbnailUrl: string | null
  icon: string | null
  color: string | null
  requiredDocumentsList: string | null
  minGPA: number | null
  nationality: string | null
  eligibleCountries: string | null
  gender: string | null
  minAge: number | null
  maxAge: number | null
  educationLevel: string | null
  requiredCertifications: string | null
  autoEnroll: boolean
  autoGrantMembership: boolean
  membershipPlan: string | null
  autoGrantDomainAccess: boolean
  autoGrantCategoryAccess: boolean
  applicationCount: number
  awardCount: number
}

interface Sponsor {
  id: string
  name: string
  logo?: string
}

export default function EditScholarshipPage() {
  const router = useRouter()
  const params = useParams()
  const scholarshipId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [fetchingScholarship, setFetchingScholarship] = useState(true)
  const [typesLoading, setTypesLoading] = useState(true)
  const [scholarshipTypes, setScholarshipTypes] = useState<ScholarshipType[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [activeTab, setActiveTab] = useState("basic")
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    shortName: "",
    slug: "",
    description: "",
    typeId: "",
    
    // Financial
    awardAmount: "",
    currency: "USD",
    coverageType: "PARTIAL",
    maxRecipients: "",
    totalBudget: "",
    
    // Dates
    openingDate: "",
    closingDate: "",
    announcementDate: "",
    startDate: "",
    endDate: "",
    
    // Status
    status: "DRAFT",
    visibility: "PUBLIC",
    isFeatured: false,
    allowLateApplications: false,
    
    // Selection
    selectionMethod: "COMMITTEE",
    requireInterview: false,
    interviewDate: "",
    interviewLocation: "",
    
    // Sponsor
    sponsorId: "",
    
    // SEO
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    
    // Media
    bannerUrl: "",
    thumbnailUrl: "",
    icon: "",
    color: "",
    
    // Requirements
    requiredDocumentsList: "",
    minGPA: "",
    nationality: "",
    eligibleCountries: "",
    gender: "",
    minAge: "",
    maxAge: "",
    educationLevel: "",
    requiredCertifications: "",
    
    // Eligibility Details
    objectives: "",
    eligibility: "",
    benefits: "",
    
    // Auto-enrollment
    autoEnroll: false,
    autoGrantMembership: false,
    membershipPlan: "",
    autoGrantDomainAccess: false,
    autoGrantCategoryAccess: false,
  })

  // Fetch scholarship and data
  useEffect(() => {
    const fetchData = async () => {
      setFetchingScholarship(true)
      setTypesLoading(true)
      try {
        // Fetch scholarship
        const scholarshipResponse = await fetch(`/api/admin/scholarships/programs/${scholarshipId}`)
        const scholarshipData = await scholarshipResponse.json()
        
        if (scholarshipData.success && scholarshipData.data) {
          const s = scholarshipData.data
          setScholarship(s)
          
          // Populate form
          setFormData({
            name: s.name || "",
            shortName: s.shortName || "",
            slug: s.slug || "",
            description: s.description || "",
            typeId: s.typeId || "",
            awardAmount: s.awardAmount?.toString() || "",
            currency: s.currency || "USD",
            coverageType: s.coverageType || "PARTIAL",
            maxRecipients: s.maxRecipients?.toString() || "",
            totalBudget: s.totalBudget?.toString() || "",
            openingDate: s.openingDate ? s.openingDate.split("T")[0] : "",
            closingDate: s.closingDate ? s.closingDate.split("T")[0] : "",
            announcementDate: s.announcementDate ? s.announcementDate.split("T")[0] : "",
            startDate: s.startDate ? s.startDate.split("T")[0] : "",
            endDate: s.endDate ? s.endDate.split("T")[0] : "",
            status: s.status || "DRAFT",
            visibility: s.visibility || "PUBLIC",
            isFeatured: s.isFeatured || false,
            allowLateApplications: s.allowLateApplications || false,
            selectionMethod: s.selectionMethod || "COMMITTEE",
            requireInterview: s.requireInterview || false,
            interviewDate: s.interviewDate ? s.interviewDate.split("T")[0] : "",
            interviewLocation: s.interviewLocation || "",
            sponsorId: s.sponsorId || "",
            seoTitle: s.seoTitle || "",
            seoDescription: s.seoDescription || "",
            seoKeywords: s.seoKeywords || "",
            bannerUrl: s.bannerUrl || "",
            thumbnailUrl: s.thumbnailUrl || "",
            icon: s.icon || "",
            color: s.color || "",
            requiredDocumentsList: s.requiredDocumentsList || "",
            minGPA: s.minGPA?.toString() || "",
            nationality: s.nationality || "",
            eligibleCountries: s.eligibleCountries || "",
            gender: s.gender || "",
            minAge: s.minAge?.toString() || "",
            maxAge: s.maxAge?.toString() || "",
            educationLevel: s.educationLevel || "",
            requiredCertifications: s.requiredCertifications || "",
            objectives: s.objectives || "",
            eligibility: s.eligibility || "",
            benefits: s.benefits || "",
            autoEnroll: s.autoEnroll || false,
            autoGrantMembership: s.autoGrantMembership || false,
            membershipPlan: s.membershipPlan || "",
            autoGrantDomainAccess: s.autoGrantDomainAccess || false,
            autoGrantCategoryAccess: s.autoGrantCategoryAccess || false,
          })
        } else {
          toast.error("Scholarship not found")
          router.push("/admin/scholarships/programs")
        }
        
        // Fetch scholarship types
        const typesResponse = await fetch("/api/public/scholarships/types")
        const typesData = await typesResponse.json()
        if (typesData.success && typesData.data) {
          setScholarshipTypes(typesData.data.filter((t: any) => t.isActive !== false))
        }
        
        // Fetch sponsors
        try {
          const sponsorsResponse = await fetch("/api/admin/scholarships/sponsors?limit=100")
          const sponsorsData = await sponsorsResponse.json()
          if (sponsorsData.success) {
            setSponsors(sponsorsData.data?.sponsors || [])
          }
        } catch (e) {
          console.log("Sponsors not available")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load scholarship data")
      } finally {
        setFetchingScholarship(false)
        setTypesLoading(false)
      }
    }
    
    fetchData()
  }, [scholarshipId, router])

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.name.trim()) {
      toast.error("Scholarship name is required")
      setActiveTab("basic")
      return
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required")
      setActiveTab("basic")
      return
    }
    if (!formData.typeId) {
      toast.error("Scholarship type is required")
      setActiveTab("basic")
      return
    }

    setLoading(true)
    try {
      const data: any = {
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || undefined,
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        typeId: formData.typeId,
        
        awardAmount: formData.awardAmount ? parseFloat(formData.awardAmount) : undefined,
        currency: formData.currency,
        coverageType: formData.coverageType,
        maxRecipients: formData.maxRecipients ? parseInt(formData.maxRecipients) : undefined,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
        
        openingDate: formData.openingDate || undefined,
        closingDate: formData.closingDate || undefined,
        announcementDate: formData.announcementDate || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        
        status: publish ? "PUBLISHED" : formData.status,
        visibility: formData.visibility,
        isFeatured: formData.isFeatured,
        allowLateApplications: formData.allowLateApplications,
        
        selectionMethod: formData.selectionMethod,
        requireInterview: formData.requireInterview,
        interviewDate: formData.interviewDate || undefined,
        interviewLocation: formData.interviewLocation || undefined,
        
        sponsorId: formData.sponsorId || undefined,
        
        seoTitle: formData.seoTitle.trim() || undefined,
        seoDescription: formData.seoDescription.trim() || undefined,
        seoKeywords: formData.seoKeywords.trim() || undefined,
        
        bannerUrl: formData.bannerUrl.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        icon: formData.icon.trim() || undefined,
        color: formData.color.trim() || undefined,
        
        requiredDocumentsList: formData.requiredDocumentsList.trim() || undefined,
        minGPA: formData.minGPA ? parseFloat(formData.minGPA) : undefined,
        nationality: formData.nationality.trim() || undefined,
        eligibleCountries: formData.eligibleCountries.trim() || undefined,
        gender: formData.gender.trim() || undefined,
        minAge: formData.minAge ? parseInt(formData.minAge) : undefined,
        maxAge: formData.maxAge ? parseInt(formData.maxAge) : undefined,
        educationLevel: formData.educationLevel.trim() || undefined,
        requiredCertifications: formData.requiredCertifications.trim() || undefined,
        
        objectives: formData.objectives.trim() || undefined,
        eligibility: formData.eligibility.trim() || undefined,
        benefits: formData.benefits.trim() || undefined,
        
        autoEnroll: formData.autoEnroll,
        autoGrantMembership: formData.autoGrantMembership,
        membershipPlan: formData.membershipPlan.trim() || undefined,
        autoGrantDomainAccess: formData.autoGrantDomainAccess,
        autoGrantCategoryAccess: formData.autoGrantCategoryAccess,
      }

      const response = await fetch(`/api/admin/scholarships/programs/${scholarshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(publish ? "Scholarship published successfully" : "Scholarship updated successfully")
        router.push("/admin/scholarships/programs")
      } else {
        toast.error(result.error || "Failed to update scholarship")
      }
    } catch (error) {
      console.error("Error saving scholarship:", error)
      toast.error("Failed to save scholarship")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    return dateStr.split("T")[0]
  }

  if (fetchingScholarship) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (!scholarship) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/scholarships/programs">
            <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Scholarship</h1>
            <p className="text-white/60 mt-1">
              Update scholarship program details
            </p>
          </div>
        </div>
        <Badge className={`
          ${scholarship.status === "PUBLISHED" ? "bg-green-500/20 text-green-400" : ""}
          ${scholarship.status === "DRAFT" ? "bg-gray-500/20 text-gray-400" : ""}
          ${scholarship.status === "CLOSED" ? "bg-yellow-500/20 text-yellow-400" : ""}
          ${scholarship.status === "ARCHIVED" ? "bg-red-500/20 text-red-400" : ""}
        `}>
          {scholarship.status}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{scholarship.applicationCount}</div>
            <div className="text-sm text-white/60">Applications</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{scholarship.awardCount}</div>
            <div className="text-sm text-white/60">Awarded</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{scholarship.currentRecipients}</div>
            <div className="text-sm text-white/60">Recipients</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{scholarship.maxRecipients || "∞"}</div>
            <div className="text-sm text-white/60">Max Recipients</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="basic" className="data-[state=active]:bg-white/10">Basic Info</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-white/10">Details</TabsTrigger>
          <TabsTrigger value="eligibility" className="data-[state=active]:bg-white/10">Eligibility</TabsTrigger>
          <TabsTrigger value="dates" className="data-[state=active]:bg-white/10">Dates & Status</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/10">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
              <CardDescription className="text-white/60">
                Core scholarship details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Scholarship Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Global Excellence Scholarship"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-white">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    placeholder="global-excellence-scholarship"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortName" className="text-white">Short Name</Label>
                <Input
                  id="shortName"
                  value={formData.shortName}
                  onChange={(e) => handleChange("shortName", e.target.value)}
                  placeholder="e.g., GES"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Detailed description of the scholarship..."
                  className="bg-white/5 border-white/10 text-white min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Scholarship Type *</Label>
                  <Select value={formData.typeId} onValueChange={(v) => handleChange("typeId", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      {scholarshipTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Sponsor</Label>
                  <Select value={formData.sponsorId} onValueChange={(v) => handleChange("sponsorId", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select sponsor (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="">No Sponsor</SelectItem>
                      {sponsors.map((sponsor) => (
                        <SelectItem key={sponsor.id} value={sponsor.id}>
                          {sponsor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Financial Details</CardTitle>
              <CardDescription className="text-white/60">
                Award amount and budget information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="awardAmount" className="text-white">Award Amount</Label>
                  <Input
                    id="awardAmount"
                    type="number"
                    value={formData.awardAmount}
                    onChange={(e) => handleChange("awardAmount", e.target.value)}
                    placeholder="5000"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => handleChange("currency", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="NGN">NGN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Coverage Type</Label>
                  <Select value={formData.coverageType} onValueChange={(v) => handleChange("coverageType", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="FULL">Full Scholarship</SelectItem>
                      <SelectItem value="PARTIAL">Partial Scholarship</SelectItem>
                      <SelectItem value="TUITION_WAIVER">Tuition Waiver</SelectItem>
                      <SelectItem value="FINANCIAL_AID">Financial Aid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalBudget" className="text-white">Total Budget</Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => handleChange("totalBudget", e.target.value)}
                    placeholder="50000"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRecipients" className="text-white">Max Recipients</Label>
                  <Input
                    id="maxRecipients"
                    type="number"
                    value={formData.maxRecipients}
                    onChange={(e) => handleChange("maxRecipients", e.target.value)}
                    placeholder="10"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="objectives" className="text-white">Objectives</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleChange("objectives", e.target.value)}
                  placeholder="What are the main objectives of this scholarship?"
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eligibility" className="text-white">Eligibility Criteria</Label>
                <Textarea
                  id="eligibility"
                  value={formData.eligibility}
                  onChange={(e) => handleChange("eligibility", e.target.value)}
                  placeholder="Who is eligible to apply?"
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits" className="text-white">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleChange("benefits", e.target.value)}
                  placeholder="What benefits does this scholarship provide?"
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Eligibility Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minGPA" className="text-white">Minimum GPA</Label>
                  <Input
                    id="minGPA"
                    type="number"
                    step="0.1"
                    value={formData.minGPA}
                    onChange={(e) => handleChange("minGPA", e.target.value)}
                    placeholder="3.0"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationLevel" className="text-white">Education Level</Label>
                  <Input
                    id="educationLevel"
                    value={formData.educationLevel}
                    onChange={(e) => handleChange("educationLevel", e.target.value)}
                    placeholder="e.g., Undergraduate, Graduate"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eligibleCountries" className="text-white">Eligible Countries</Label>
                <Input
                  id="eligibleCountries"
                  value={formData.eligibleCountries}
                  onChange={(e) => handleChange("eligibleCountries", e.target.value)}
                  placeholder="e.g., USA, Canada, UK (comma-separated)"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minAge" className="text-white">Minimum Age</Label>
                  <Input
                    id="minAge"
                    type="number"
                    value={formData.minAge}
                    onChange={(e) => handleChange("minAge", e.target.value)}
                    placeholder="18"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAge" className="text-white">Maximum Age</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    value={formData.maxAge}
                    onChange={(e) => handleChange("maxAge", e.target.value)}
                    placeholder="35"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredDocumentsList" className="text-white">Required Documents</Label>
                <Textarea
                  id="requiredDocumentsList"
                  value={formData.requiredDocumentsList}
                  onChange={(e) => handleChange("requiredDocumentsList", e.target.value)}
                  placeholder="List required documents..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dates" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Dates & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="openingDate" className="text-white">Application Opening Date</Label>
                  <Input
                    id="openingDate"
                    type="date"
                    value={formData.openingDate}
                    onChange={(e) => handleChange("openingDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closingDate" className="text-white">Application Closing Date</Label>
                  <Input
                    id="closingDate"
                    type="date"
                    value={formData.closingDate}
                    onChange={(e) => handleChange("closingDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="announcementDate" className="text-white">Announcement Date</Label>
                  <Input
                    id="announcementDate"
                    type="date"
                    value={formData.announcementDate}
                    onChange={(e) => handleChange("announcementDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-white">Program Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="space-y-0.5">
                    <Label className="text-white">Allow Late Applications</Label>
                    <p className="text-sm text-white/60">Allow applications after the deadline</p>
                  </div>
                  <Switch
                    checked={formData.allowLateApplications}
                    onCheckedChange={(checked) => handleChange("allowLateApplications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="space-y-0.5">
                    <Label className="text-white">Require Interview</Label>
                    <p className="text-sm text-white/60">Schedule interviews for applicants</p>
                  </div>
                  <Switch
                    checked={formData.requireInterview}
                    onCheckedChange={(checked) => handleChange("requireInterview", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Publication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Visibility</Label>
                  <Select value={formData.visibility} onValueChange={(v) => handleChange("visibility", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="FEATURED">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-0.5">
                  <Label className="text-white">Featured Scholarship</Label>
                  <p className="text-sm text-white/60">Show prominently on the scholarships page</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleChange("isFeatured", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seoTitle" className="text-white">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleChange("seoTitle", e.target.value)}
                  placeholder="Custom title for search engines"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords" className="text-white">SEO Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={(e) => handleChange("seoKeywords", e.target.value)}
                  placeholder="scholarship, education, funding"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription" className="text-white">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleChange("seoDescription", e.target.value)}
                  placeholder="Meta description for search engines"
                  className="bg-white/5 border-white/10 text-white min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bannerUrl" className="text-white">Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => handleChange("bannerUrl", e.target.value)}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl" className="text-white">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Auto-Enrollment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-0.5">
                  <Label className="text-white">Auto-Enroll Recipients</Label>
                  <p className="text-sm text-white/60">Automatically enroll award recipients in courses</p>
                </div>
                <Switch
                  checked={formData.autoEnroll}
                  onCheckedChange={(checked) => handleChange("autoEnroll", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-0.5">
                  <Label className="text-white">Auto-Grant Membership</Label>
                  <p className="text-sm text-white/60">Give recipients premium membership access</p>
                </div>
                <Switch
                  checked={formData.autoGrantMembership}
                  onCheckedChange={(checked) => handleChange("autoGrantMembership", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-0.5">
                  <Label className="text-white">Auto-Grant Domain Access</Label>
                  <p className="text-sm text-white/60">Unlock specific learning domains</p>
                </div>
                <Switch
                  checked={formData.autoGrantDomainAccess}
                  onCheckedChange={(checked) => handleChange("autoGrantDomainAccess", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-0.5">
                  <Label className="text-white">Auto-Grant Category Access</Label>
                  <p className="text-sm text-white/60">Unlock specific course categories</p>
                </div>
                <Switch
                  checked={formData.autoGrantCategoryAccess}
                  onCheckedChange={(checked) => handleChange("autoGrantCategoryAccess", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-4 flex items-center justify-between p-4 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-lg">
        <div className="text-sm text-white/60">
          <Info className="h-4 w-4 inline mr-2" />
          Last updated: {scholarship ? new Date().toLocaleDateString() : ""}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/scholarships/programs">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  )
}
