"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Globe, Settings, Shield, Award, Loader2, Plus, X, Info
} from "lucide-react"
import toast from "react-hot-toast"

interface ScholarshipType {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
}

interface Sponsor {
  id: string
  name: string
  logo?: string
}

export default function NewScholarshipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [typesLoading, setTypesLoading] = useState(true)
  const [scholarshipTypes, setScholarshipTypes] = useState<ScholarshipType[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [activeTab, setActiveTab] = useState("basic")

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
    
    // JSON arrays (stored as comma-separated strings for simplicity)
    requiredDocuments: "",
    applicableDomains: "",
    applicableCategories: "",
    applicableDifficulties: "",
  })

  // Fetch scholarship types and sponsors
  useEffect(() => {
    const fetchData = async () => {
      setTypesLoading(true)
      try {
        // Fetch scholarship types
        const typesResponse = await fetch("/api/admin/scholarships/types")
        const typesData = await typesResponse.json()
        if (typesData.success) {
          setScholarshipTypes(typesData.data)
        }
        
        // Fetch sponsors
        const sponsorsResponse = await fetch("/api/admin/scholarships/sponsors?limit=100")
        const sponsorsData = await sponsorsResponse.json()
        if (sponsorsData.success) {
          setSponsors(sponsorsData.data?.sponsors || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load form data")
      } finally {
        setTypesLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 50)
      setFormData((prev) => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.name])

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (publish: boolean = false) => {
    // Validate required fields
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
      // Prepare data
      const data: any = {
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || undefined,
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        typeId: formData.typeId,
        
        // Financial
        awardAmount: formData.awardAmount ? parseFloat(formData.awardAmount) : undefined,
        currency: formData.currency,
        coverageType: formData.coverageType,
        maxRecipients: formData.maxRecipients ? parseInt(formData.maxRecipients) : undefined,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
        
        // Dates
        openingDate: formData.openingDate || undefined,
        closingDate: formData.closingDate || undefined,
        announcementDate: formData.announcementDate || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        
        // Status
        status: publish ? "PUBLISHED" : formData.status,
        visibility: formData.visibility,
        isFeatured: formData.isFeatured,
        allowLateApplications: formData.allowLateApplications,
        
        // Selection
        selectionMethod: formData.selectionMethod,
        requireInterview: formData.requireInterview,
        interviewDate: formData.interviewDate || undefined,
        interviewLocation: formData.interviewLocation || undefined,
        
        // Sponsor
        sponsorId: formData.sponsorId || undefined,
        
        // SEO
        seoTitle: formData.seoTitle.trim() || undefined,
        seoDescription: formData.seoDescription.trim() || undefined,
        seoKeywords: formData.seoKeywords.trim() || undefined,
        
        // Media
        bannerUrl: formData.bannerUrl.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        icon: formData.icon.trim() || undefined,
        color: formData.color.trim() || undefined,
        
        // Requirements
        requiredDocumentsList: formData.requiredDocumentsList.trim() || undefined,
        minGPA: formData.minGPA ? parseFloat(formData.minGPA) : undefined,
        nationality: formData.nationality.trim() || undefined,
        eligibleCountries: formData.eligibleCountries.trim() || undefined,
        gender: formData.gender.trim() || undefined,
        minAge: formData.minAge ? parseInt(formData.minAge) : undefined,
        maxAge: formData.maxAge ? parseInt(formData.maxAge) : undefined,
        educationLevel: formData.educationLevel.trim() || undefined,
        requiredCertifications: formData.requiredCertifications.trim() || undefined,
        
        // Eligibility Details
        objectives: formData.objectives.trim() || undefined,
        eligibility: formData.eligibility.trim() || undefined,
        benefits: formData.benefits.trim() || undefined,
        
        // Auto-enrollment
        autoEnroll: formData.autoEnroll,
        autoGrantMembership: formData.autoGrantMembership,
        membershipPlan: formData.membershipPlan.trim() || undefined,
        autoGrantDomainAccess: formData.autoGrantDomainAccess,
        autoGrantCategoryAccess: formData.autoGrantCategoryAccess,
        
        // JSON arrays (convert comma-separated to array)
        requiredDocuments: formData.requiredDocuments ? formData.requiredDocuments.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        applicableDomains: formData.applicableDomains ? formData.applicableDomains.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        applicableCategories: formData.applicableCategories ? formData.applicableCategories.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        applicableDifficulties: formData.applicableDifficulties ? formData.applicableDifficulties.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      }

      const response = await fetch("/api/admin/scholarships/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(publish ? "Scholarship published successfully!" : "Scholarship created successfully!")
        router.push(`/admin/scholarships/programs/${result.data.id}`)
      } else {
        toast.error(result.error || "Failed to create scholarship")
      }
    } catch (error) {
      console.error("Error creating scholarship:", error)
      toast.error("An error occurred while creating the scholarship")
    } finally {
      setLoading(false)
    }
  }

  const FormField = ({ label, required, children, description }: { label: string; required?: boolean; children: React.ReactNode; description?: string }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={label.toLowerCase().replace(/\s/g, "-")} className="text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {description && <p className="text-xs text-white/50">{description}</p>}
      {children}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/scholarships/programs">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Scholarship</h1>
            <p className="text-white/60 mt-1">
              Set up a new scholarship program
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save as Draft"}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#1a1a2e] border border-white/10">
          <TabsTrigger value="basic" className="data-[state=active]:bg-white/10">
            <Award className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-white/10">
            <DollarSign className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="dates" className="data-[state=active]:bg-white/10">
            <Calendar className="h-4 w-4 mr-2" />
            Dates
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="data-[state=active]:bg-white/10">
            <Users className="h-4 w-4 mr-2" />
            Eligibility
          </TabsTrigger>
          <TabsTrigger value="requirements" className="data-[state=active]:bg-white/10">
            <FileText className="h-4 w-4 mr-2" />
            Requirements
          </TabsTrigger>
          <TabsTrigger value="visibility" className="data-[state=active]:bg-white/10">
            <Globe className="h-4 w-4 mr-2" />
            Visibility
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-white/10">
            <Settings className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
              <CardDescription className="text-white/60">
                Essential details about the scholarship program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Scholarship Name" required>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., STEM Excellence Scholarship"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Short Name">
                  <Input
                    id="short-name"
                    value={formData.shortName}
                    onChange={(e) => handleChange("shortName", e.target.value)}
                    placeholder="e.g., STEM Excellence"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="URL Slug" required description="Used in the URL (e.g., /scholarships/apply/[slug])">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm">/scholarships/apply/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      placeholder="stem-excellence-scholarship"
                      className="bg-white/5 border-white/10 text-white flex-1"
                    />
                  </div>
                </FormField>

                <FormField label="Scholarship Type" required>
                  {typesLoading ? (
                    <Skeleton className="h-10 w-full bg-white/5" />
                  ) : (
                    <Select value={formData.typeId} onValueChange={(v) => handleChange("typeId", v)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-white/10">
                        {scholarshipTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              {type.color && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: type.color }}
                                />
                              )}
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              </div>

              <FormField label="Description">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="A brief description of the scholarship..."
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </FormField>

              <FormField label="Objectives">
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleChange("objectives", e.target.value)}
                  placeholder="What are the goals and objectives of this scholarship?"
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </FormField>

              <FormField label="Eligibility Criteria">
                <Textarea
                  id="eligibility"
                  value={formData.eligibility}
                  onChange={(e) => handleChange("eligibility", e.target.value)}
                  placeholder="Who is eligible for this scholarship?"
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </FormField>

              <FormField label="Benefits">
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleChange("benefits", e.target.value)}
                  placeholder="What benefits does this scholarship provide?"
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </FormField>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Financial Details</CardTitle>
              <CardDescription className="text-white/60">
                Award amounts and budget information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField label="Award Amount">
                  <Input
                    id="award-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.awardAmount}
                    onChange={(e) => handleChange("awardAmount", e.target.value)}
                    placeholder="5000.00"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Currency">
                  <Select value={formData.currency} onValueChange={(v) => handleChange("currency", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Coverage Type">
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
                </FormField>

                <FormField label="Maximum Recipients">
                  <Input
                    id="max-recipients"
                    type="number"
                    min="1"
                    value={formData.maxRecipients}
                    onChange={(e) => handleChange("maxRecipients", e.target.value)}
                    placeholder="10"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Total Budget">
                  <Input
                    id="total-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalBudget}
                    onChange={(e) => handleChange("totalBudget", e.target.value)}
                    placeholder="50000.00"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Sponsor">
                  {typesLoading ? (
                    <Skeleton className="h-10 w-full bg-white/5" />
                  ) : (
                    <Select value={formData.sponsorId} onValueChange={(v) => handleChange("sponsorId", v)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select a sponsor (optional)" />
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
                  )}
                </FormField>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dates Tab */}
        <TabsContent value="dates" className="space-y-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Important Dates</CardTitle>
              <CardDescription className="text-white/60">
                Application periods and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField label="Application Opening Date">
                  <Input
                    id="opening-date"
                    type="datetime-local"
                    value={formData.openingDate}
                    onChange={(e) => handleChange("openingDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Application Closing Date">
                  <Input
                    id="closing-date"
                    type="datetime-local"
                    value={formData.closingDate}
                    onChange={(e) => handleChange("closingDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Announcement Date">
                  <Input
                    id="announcement-date"
                    type="datetime-local"
                    value={formData.announcementDate}
                    onChange={(e) => handleChange("announcementDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Program Start Date">
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Program End Date">
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eligibility Tab */}
        <TabsContent value="eligibility" className="space-y-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Eligibility Requirements</CardTitle>
              <CardDescription className="text-white/60">
                Define who can apply for this scholarship
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nationality">
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    placeholder="e.g., Nigerian, Any"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Eligible Countries">
                  <Input
                    id="eligible-countries"
                    value={formData.eligibleCountries}
                    onChange={(e) => handleChange("eligibleCountries", e.target.value)}
                    placeholder="Nigeria, Ghana, Kenya (comma-separated)"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Gender">
                  <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Any gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="">Any Gender</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Education Level">
                  <Input
                    id="education-level"
                    value={formData.educationLevel}
                    onChange={(e) => handleChange("educationLevel", e.target.value)}
                    placeholder="e.g., Undergraduate, Graduate"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Minimum Age">
                  <Input
                    id="min-age"
                    type="number"
                    min="0"
                    value={formData.minAge}
                    onChange={(e) => handleChange("minAge", e.target.value)}
                    placeholder="18"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Maximum Age">
                  <Input
                    id="max-age"
                    type="number"
                    min="0"
                    value={formData.maxAge}
                    onChange={(e) => handleChange("maxAge", e.target.value)}
                    placeholder="35"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Minimum GPA">
                  <Input
                    id="min-gpa"
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={formData.minGPA}
                    onChange={(e) => handleChange("minGPA", e.target.value)}
                    placeholder="3.0"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Required Certifications">
                  <Input
                    id="required-certifications"
                    value={formData.requiredCertifications}
                    onChange={(e) => handleChange("requiredCertifications", e.target.value)}
                    placeholder="Certification names (comma-separated)"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>
              </div>

              <FormField label="Required Documents (comma-separated)">
                <Input
                  id="required-documents"
                  value={formData.requiredDocuments}
                  onChange={(e) => handleChange("requiredDocuments", e.target.value)}
                  placeholder="Transcript, ID Card, Passport Photo, Recommendation Letter"
                  className="bg-white/5 border-white/10 text-white"
                />
              </FormField>

              <FormField label="Required Documents List (detailed)">
                <Textarea
                  id="required-documents-list"
                  value={formData.requiredDocumentsList}
                  onChange={(e) => handleChange("requiredDocumentsList", e.target.value)}
                  placeholder="Detailed list of required documents with specifications..."
                  className="bg-white/5 border-white/10 text-white min-h-[80px]"
                />
              </FormField>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Course Requirements</CardTitle>
              <CardDescription className="text-white/60">
                Specify which courses/domains this scholarship applies to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField label="Applicable Domains (comma-separated IDs)">
                <Input
                  id="applicable-domains"
                  value={formData.applicableDomains}
                  onChange={(e) => handleChange("applicableDomains", e.target.value)}
                  placeholder="domain-id-1, domain-id-2"
                  className="bg-white/5 border-white/10 text-white"
                />
              </FormField>

              <FormField label="Applicable Categories (comma-separated IDs)">
                <Input
                  id="applicable-categories"
                  value={formData.applicableCategories}
                  onChange={(e) => handleChange("applicableCategories", e.target.value)}
                  placeholder="category-id-1, category-id-2"
                  className="bg-white/5 border-white/10 text-white"
                />
              </FormField>

              <FormField label="Applicable Difficulty Levels (comma-separated)">
                <Input
                  id="applicable-difficulties"
                  value={formData.applicableDifficulties}
                  onChange={(e) => handleChange("applicableDifficulties", e.target.value)}
                  placeholder="BEGINNER, INTERMEDIATE, ADVANCED"
                  className="bg-white/5 border-white/10 text-white"
                />
              </FormField>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visibility Tab */}
        <TabsContent value="visibility" className="space-y-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Visibility & Status</CardTitle>
              <CardDescription className="text-white/60">
                Control who can see and access this scholarship
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Status">
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="DRAFT">Draft - Only admins can see</SelectItem>
                      <SelectItem value="PUBLISHED">Published - Visible to public</SelectItem>
                      <SelectItem value="CLOSED">Closed - No new applications</SelectItem>
                      <SelectItem value="ARCHIVED">Archived - Hidden from lists</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Visibility">
                  <Select value={formData.visibility} onValueChange={(v) => handleChange("visibility", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="PUBLIC">Public - Visible to everyone</SelectItem>
                      <SelectItem value="PRIVATE">Private - By invitation only</SelectItem>
                      <SelectItem value="FEATURED">Featured - Highlighted on homepage</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="space-y-0.5">
                    <Label className="text-white">Featured Scholarship</Label>
                    <p className="text-sm text-white/60">Display prominently on the scholarships page</p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleChange("isFeatured", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="space-y-0.5">
                    <Label className="text-white">Allow Late Applications</Label>
                    <p className="text-sm text-white/60">Accept applications after the closing date</p>
                  </div>
                  <Switch
                    checked={formData.allowLateApplications}
                    onCheckedChange={(checked) => handleChange("allowLateApplications", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Selection & Interview</CardTitle>
              <CardDescription className="text-white/60">
                Configure selection process and interview settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Selection Method">
                  <Select value={formData.selectionMethod} onValueChange={(v) => handleChange("selectionMethod", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="COMMITTEE">Committee Review</SelectItem>
                      <SelectItem value="AUTOMATIC">Automatic (Merit-based)</SelectItem>
                      <SelectItem value="INTERVIEW">Interview Required</SelectItem>
                      <SelectItem value="COMBINED">Combined Process</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="space-y-0.5">
                    <Label className="text-white">Require Interview</Label>
                    <p className="text-sm text-white/60">Shortlist candidates for interview</p>
                  </div>
                  <Switch
                    checked={formData.requireInterview}
                    onCheckedChange={(checked) => handleChange("requireInterview", checked)}
                  />
                </div>
              </div>

              {formData.requireInterview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Interview Date">
                    <Input
                      id="interview-date"
                      type="datetime-local"
                      value={formData.interviewDate}
                      onChange={(e) => handleChange("interviewDate", e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </FormField>

                  <FormField label="Interview Location">
                    <Input
                      id="interview-location"
                      value={formData.interviewLocation}
                      onChange={(e) => handleChange("interviewLocation", e.target.value)}
                      placeholder="Online / Physical address"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </FormField>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">SEO Settings</CardTitle>
              <CardDescription className="text-white/60">
                Optimize for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="SEO Title">
                  <Input
                    id="seo-title"
                    value={formData.seoTitle}
                    onChange={(e) => handleChange("seoTitle", e.target.value)}
                    placeholder="Custom title for search engines"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="SEO Keywords">
                  <Input
                    id="seo-keywords"
                    value={formData.seoKeywords}
                    onChange={(e) => handleChange("seoKeywords", e.target.value)}
                    placeholder="scholarship, education, funding (comma-separated)"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>
              </div>

              <FormField label="SEO Description">
                <Textarea
                  id="seo-description"
                  value={formData.seoDescription}
                  onChange={(e) => handleChange("seoDescription", e.target.value)}
                  placeholder="A concise description for search engine results..."
                  className="bg-white/5 border-white/10 text-white min-h-[80px]"
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Media</CardTitle>
              <CardDescription className="text-white/60">
                Banner and thumbnail images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Banner URL">
                  <Input
                    id="banner-url"
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => handleChange("bannerUrl", e.target.value)}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Thumbnail URL">
                  <Input
                    id="thumbnail-url"
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Icon">
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => handleChange("icon", e.target.value)}
                    placeholder="Award icon name"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>

                <FormField label="Color">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color || "#6366f1"}
                    onChange={(e) => handleChange("color", e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-10"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Auto-Enrollment Settings</CardTitle>
              <CardDescription className="text-white/60">
                Automatically enroll award recipients in courses
              </CardDescription>
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

              {formData.autoGrantMembership && (
                <FormField label="Membership Plan">
                  <Input
                    id="membership-plan"
                    value={formData.membershipPlan}
                    onChange={(e) => handleChange("membershipPlan", e.target.value)}
                    placeholder="e.g., premium, gold, enterprise"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </FormField>
              )}

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
          Auto-generated slug will be used if not provided
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
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            {loading ? "Publishing..." : "Publish Scholarship"}
          </Button>
        </div>
      </div>
    </div>
  )
}
