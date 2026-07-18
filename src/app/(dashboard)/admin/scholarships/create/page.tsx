"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ChevronLeft,
  Save,
  Eye,
  GraduationCap,
  Users,
  DollarSign,
  Calendar,
  Shield,
  Zap,
  Globe,
  Award,
  CheckCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const scholarshipTypes = [
  { value: "FORCEWORK", label: "Forcework Scholarships", description: "Skills-based workforce development scholarships" },
  { value: "MERIT", label: "Merit Scholarships", description: "Based on academic excellence and achievements" },
  { value: "NEED_BASED", label: "Need-Based Scholarships", description: "Based on financial circumstances" },
  { value: "RESEARCH_INNOVATION", label: "Research & Innovation Scholarships", description: "For research projects and innovations" },
  { value: "SPECIAL_NEED", label: "Special Need Scholarships", description: "For students with special requirements" },
  { value: "COMMUNITY_IMPACT", label: "Community Impact Scholarships", description: "For community service contributors" },
  { value: "FOUNDER", label: "Founder Scholarships", description: "Institutional founder scholarships" },
  { value: "SPONSORED", label: "Sponsored Scholarships", description: "Funded by external sponsors" },
  { value: "ZAKAT_WAQF", label: "Zakat & Waqf Scholarships", description: "Islamic charitable scholarships" },
  { value: "TUITION_WAIVER", label: "Tuition Waivers", description: "Partial or full tuition coverage" },
  { value: "PARTIAL", label: "Partial Scholarships", description: "Partial funding scholarships" },
  { value: "FULL", label: "Full Scholarships", description: "Complete funding scholarships" },
  { value: "FINANCIAL_AID", label: "Financial Aid", description: "General financial assistance" },
]

const difficultyLevels = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "EXPERT", label: "Expert" },
]

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "NGN", label: "NGN (₦)" },
  { value: "AED", label: "AED (د.إ)" },
]

export default function CreateScholarshipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    shortName: "",
    slug: "",
    type: "MERIT",
    description: "",
    objectives: "",
    
    // Eligibility & Benefits
    eligibility: "",
    benefits: "",
    coverage: "",
    
    // Award
    awardAmount: "",
    currency: "USD",
    availableSlots: "",
    
    // Dates
    openingDate: "",
    closingDate: "",
    applicationDeadline: "",
    
    // Selection
    selectionMethod: "COMMITTEE",
    
    // Status & Visibility
    status: "DRAFT",
    visibility: "PUBLIC",
    isFeatured: false,
    
    // Media
    bannerUrl: "",
    thumbnailUrl: "",
    color: "#7C3AED",
    icon: "🎓",
    
    // SEO
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    
    // Sponsor
    sponsorId: "",
    
    // Academic Relations
    domainIds: [] as string[],
    categoryIds: [] as string[],
    difficultyLevels: [] as string[],
    
    // Benefits Configuration
    autoEnroll: false,
    createAccount: true,
    assignMembership: false,
    assignDomain: false,
    assignCategory: false,
    assignCourse: false,
    waiverFees: false,
    requireInterview: false,
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from name
    if (field === "name" && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (asDraft: boolean = true) => {
    setLoading(true)
    try {
      const payload = {
        ...formData,
        awardAmount: formData.awardAmount ? parseFloat(formData.awardAmount) : null,
        availableSlots: formData.availableSlots ? parseInt(formData.availableSlots) : null,
        status: asDraft ? "DRAFT" : formData.status,
      }

      const response = await fetch("/api/admin/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create scholarship")
      }

      const scholarship = await response.json()
      
      toast({
        title: "Success",
        description: `Scholarship "${scholarship.name}" created successfully`,
      })
      
      router.push(`/admin/scholarships/${scholarship.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/scholarships">
            <Button variant="ghost" className="text-white">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              Create New Scholarship
            </h1>
            <p className="text-white/60 mt-1">Fill in the details to create a scholarship program</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="border-white/10 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {loading ? "Creating..." : "Create Scholarship"}
          </Button>
        </div>
      </div>

      {/* Scholarship Type Selection */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Select Scholarship Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scholarshipTypes.map((type) => (
              <motion.div
                key={type.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateField("type", type.value)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.type === type.value
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{type.label}</p>
                    <p className="text-white/50 text-sm mt-1">{type.description}</p>
                  </div>
                  {formData.type === type.value && (
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="basic" className="data-[state=active]:bg-purple-500">
            <Shield className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="data-[state=active]:bg-purple-500">
            <Users className="h-4 w-4 mr-2" />
            Eligibility & Benefits
          </TabsTrigger>
          <TabsTrigger value="award" className="data-[state=active]:bg-purple-500">
            <DollarSign className="h-4 w-4 mr-2" />
            Award Details
          </TabsTrigger>
          <TabsTrigger value="dates" className="data-[state=active]:bg-purple-500">
            <Calendar className="h-4 w-4 mr-2" />
            Dates & Deadlines
          </TabsTrigger>
          <TabsTrigger value="academic" className="data-[state=active]:bg-purple-500">
            <GraduationCap className="h-4 w-4 mr-2" />
            Academic Scope
          </TabsTrigger>
          <TabsTrigger value="autoenroll" className="data-[state=active]:bg-purple-500">
            <Zap className="h-4 w-4 mr-2" />
            Auto-Enrollment
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-purple-500">
            <Globe className="h-4 w-4 mr-2" />
            Media & SEO
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Scholarship Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="e.g., Future AI Scholars Program"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    value={formData.shortName}
                    onChange={(e) => updateField("shortName", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="e.g., FASP"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="future-ai-scholars"
                />
                <p className="text-white/40 text-sm">https://openscience-academy.com/scholarships/{formData.slug || "your-slug"}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[120px]"
                  placeholder="Describe the scholarship program..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Objectives</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => updateField("objectives", e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="List the main objectives of this scholarship..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={formData.visibility} onValueChange={(v) => updateField("visibility", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="FEATURED">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selectionMethod">Selection Method</Label>
                  <Select value={formData.selectionMethod} onValueChange={(v) => updateField("selectionMethod", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMMITTEE">Committee Review</SelectItem>
                      <SelectItem value="INTERVIEW">Interview Based</SelectItem>
                      <SelectItem value="EXAM">Examination</SelectItem>
                      <SelectItem value="PORTFOLIO">Portfolio Review</SelectItem>
                      <SelectItem value="MIXED">Mixed Process</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => updateField("isFeatured", checked)}
                  />
                  <Label htmlFor="isFeatured">Feature this scholarship</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eligibility & Benefits Tab */}
        <TabsContent value="eligibility" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Eligibility & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="eligibility">Eligibility Requirements</Label>
                <Textarea
                  id="eligibility"
                  value={formData.eligibility}
                  onChange={(e) => updateField("eligibility", e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[150px]"
                  placeholder="List all eligibility requirements..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Scholarship Benefits</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => updateField("benefits", e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[150px]"
                  placeholder="Describe what recipients will receive..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage">Coverage Details</Label>
                <Textarea
                  id="coverage"
                  value={formData.coverage}
                  onChange={(e) => updateField("coverage", e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="Detail what expenses are covered..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Award Details Tab */}
        <TabsContent value="award" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Award Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="awardAmount">Award Amount</Label>
                  <Input
                    id="awardAmount"
                    type="number"
                    value={formData.awardAmount}
                    onChange={(e) => updateField("awardAmount", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => updateField("currency", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableSlots">Available Slots</Label>
                  <Input
                    id="availableSlots"
                    type="number"
                    value={formData.availableSlots}
                    onChange={(e) => updateField("availableSlots", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireInterview"
                    checked={formData.requireInterview}
                    onCheckedChange={(checked) => updateField("requireInterview", checked)}
                  />
                  <Label htmlFor="requireInterview">Require Interview</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dates Tab */}
        <TabsContent value="dates" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Dates & Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="openingDate">Opening Date</Label>
                  <Input
                    id="openingDate"
                    type="datetime-local"
                    value={formData.openingDate}
                    onChange={(e) => updateField("openingDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closingDate">Closing Date</Label>
                  <Input
                    id="closingDate"
                    type="datetime-local"
                    value={formData.closingDate}
                    onChange={(e) => updateField("closingDate", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="datetime-local"
                    value={formData.applicationDeadline}
                    onChange={(e) => updateField("applicationDeadline", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Scope Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Academic Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Difficulty Levels (Leave empty for all)</Label>
                <div className="flex flex-wrap gap-2">
                  {difficultyLevels.map((level) => (
                    <Badge
                      key={level.value}
                      variant={formData.difficultyLevels.includes(level.value) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        formData.difficultyLevels.includes(level.value)
                          ? "bg-purple-500"
                          : "border-white/20 text-white/60"
                      }`}
                      onClick={() => {
                        const levels = formData.difficultyLevels.includes(level.value)
                          ? formData.difficultyLevels.filter((l) => l !== level.value)
                          : [...formData.difficultyLevels, level.value]
                        updateField("difficultyLevels", levels)
                      }}
                    >
                      {level.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm">
                  <strong>Note:</strong> You can select specific Domains, Categories, and Certificates 
                  after creating the scholarship. These will determine which students can apply based 
                  on their enrolled courses.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Enrollment Tab */}
        <TabsContent value="autoenroll" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Auto-Enrollment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-white/80 text-sm">
                  <strong>Auto-Enrollment:</strong> When enabled, approved applicants will automatically 
                  receive platform access based on the benefits configured below. This eliminates manual 
                  enrollment processes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Enable Auto-Enrollment</p>
                    <p className="text-white/60 text-sm">Automatically enroll approved applicants</p>
                  </div>
                  <Switch
                    checked={formData.autoEnroll}
                    onCheckedChange={(checked) => updateField("autoEnroll", checked)}
                  />
                </div>

                {formData.autoEnroll && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Create Platform Account</p>
                        <p className="text-white/60 text-sm">Automatically create an account for the applicant</p>
                      </div>
                      <Switch
                        checked={formData.createAccount}
                        onCheckedChange={(checked) => updateField("createAccount", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Assign Membership</p>
                        <p className="text-white/60 text-sm">Grant membership access based on scholarship</p>
                      </div>
                      <Switch
                        checked={formData.assignMembership}
                        onCheckedChange={(checked) => updateField("assignMembership", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Grant Domain Access</p>
                        <p className="text-white/60 text-sm">Provide access to specific academic domains</p>
                      </div>
                      <Switch
                        checked={formData.assignDomain}
                        onCheckedChange={(checked) => updateField("assignDomain", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Grant Category Access</p>
                        <p className="text-white/60 text-sm">Provide access to specific categories</p>
                      </div>
                      <Switch
                        checked={formData.assignCategory}
                        onCheckedChange={(checked) => updateField("assignCategory", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Grant Course Access</p>
                        <p className="text-white/60 text-sm">Provide access to specific courses</p>
                      </div>
                      <Switch
                        checked={formData.assignCourse}
                        onCheckedChange={(checked) => updateField("assignCourse", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Waive Fees</p>
                        <p className="text-white/60 text-sm">Waive applicable fees for scholarship recipients</p>
                      </div>
                      <Switch
                        checked={formData.waiverFees}
                        onCheckedChange={(checked) => updateField("waiverFees", checked)}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media & SEO Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Media & SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={(e) => updateField("bannerUrl", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={(e) => updateField("thumbnailUrl", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => updateField("color", e.target.value)}
                      className="w-16 h-10 bg-white/5 border-white/10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => updateField("color", e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="#7C3AED"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => updateField("icon", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="🎓"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Scholarship for..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => updateField("seoDescription", e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[80px]"
                  placeholder="Brief description for search engines..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={(e) => updateField("seoKeywords", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="scholarship, education, funding, ..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
