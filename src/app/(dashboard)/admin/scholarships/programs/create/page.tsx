"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Settings,
  Eye,
  Shield
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"

interface ScholarshipType {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
}

interface Sponsor {
  id: string
  name: string
  logoUrl: string | null
}

export default function CreateScholarshipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [scholarshipTypes, setScholarshipTypes] = useState<ScholarshipType[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    scholarshipTypeId: "",
    description: "",
    objectives: "",
    eligibility: "",
    benefits: "",
    coverage: "",
    awardAmount: "",
    currency: "USD",
    coverageType: "PARTIAL",
    availableSlots: "",
    openingDate: "",
    closingDate: "",
    resultsDate: "",
    status: "DRAFT",
    visibility: "PUBLIC",
    applicationStatus: "OPEN",
    selectionMethod: "MERIT",
    requireInterview: false,
    bannerUrl: "",
    thumbnailUrl: "",
    icon: "",
    color: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    isFeatured: false,
    isHighlighted: false,
    totalBudget: "",
    perStudentAmount: "",
    sponsorIds: [] as string[],
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setFetchingData(true)
    try {
      const [typesRes, sponsorsRes] = await Promise.all([
        fetch("/api/admin/scholarship-types"),
        fetch("/api/admin/scholarship-sponsors"),
      ])

      const [typesData, sponsorsData] = await Promise.all([
        typesRes.json(),
        sponsorsRes.json(),
      ])

      if (typesData.success) setScholarshipTypes(typesData.data)
      if (sponsorsData.success) setSponsors(sponsorsData.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setFetchingData(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSponsorToggle = (sponsorId: string) => {
    setFormData(prev => ({
      ...prev,
      sponsorIds: prev.sponsorIds.includes(sponsorId)
        ? prev.sponsorIds.filter(id => id !== sponsorId)
        : [...prev.sponsorIds, sponsorId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent, status?: string) => {
    e.preventDefault()
    
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error("Scholarship name is required (minimum 2 characters)")
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        awardAmount: formData.awardAmount ? parseFloat(formData.awardAmount) : null,
        availableSlots: formData.availableSlots ? parseInt(formData.availableSlots) : null,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : null,
        perStudentAmount: formData.perStudentAmount ? parseFloat(formData.perStudentAmount) : null,
        status: status || formData.status,
      }

      const res = await fetch("/api/admin/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Scholarship created successfully!")
        router.push("/admin/scholarships/programs")
      } else {
        toast.error(data.error || "Failed to create scholarship")
      }
    } catch (error) {
      console.error("Error creating scholarship:", error)
      toast.error("Failed to create scholarship")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/scholarships/programs">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Scholarship</h1>
            <p className="text-white/60">Set up a new scholarship program</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={(e) => handleSubmit(e, "DRAFT")}
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            onClick={(e) => handleSubmit(e, "PUBLISHED")}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Create & Publish
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-white/60">
              Core details about the scholarship program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-white">Scholarship Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Innovation Excellence Award"
                  className="bg-white/5 border-white/10 text-white mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="shortName" className="text-white">Short Name</Label>
                <Input
                  id="shortName"
                  value={formData.shortName}
                  onChange={(e) => handleInputChange("shortName", e.target.value)}
                  placeholder="e.g., IEA"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="scholarshipType" className="text-white">Scholarship Type</Label>
                <Select 
                  value={formData.scholarshipTypeId} 
                  onValueChange={(val) => handleInputChange("scholarshipTypeId", val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {scholarshipTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <span className="flex items-center gap-2">
                          {type.color && (
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: type.color }}
                            />
                          )}
                          {type.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the scholarship program..."
                  className="bg-white/5 border-white/10 text-white mt-1 min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Award Details */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Award Details
            </CardTitle>
            <CardDescription className="text-white/60">
              Financial information and award structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="awardAmount" className="text-white">Award Amount</Label>
                <Input
                  id="awardAmount"
                  type="number"
                  value={formData.awardAmount}
                  onChange={(e) => handleInputChange("awardAmount", e.target.value)}
                  placeholder="e.g., 5000"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="currency" className="text-white">Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(val) => handleInputChange("currency", val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="coverageType" className="text-white">Coverage Type</Label>
                <Select 
                  value={formData.coverageType} 
                  onValueChange={(val) => handleInputChange("coverageType", val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="FULL">Full</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="FULL_TUITION">Full Tuition</SelectItem>
                    <SelectItem value="PARTIAL_TUITION">Partial Tuition</SelectItem>
                    <SelectItem value="MONTHLY_STIPEND">Monthly Stipend</SelectItem>
                    <SelectItem value="ONE_TIME">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="availableSlots" className="text-white">Available Slots</Label>
                <Input
                  id="availableSlots"
                  type="number"
                  value={formData.availableSlots}
                  onChange={(e) => handleInputChange("availableSlots", e.target.value)}
                  placeholder="Leave empty for unlimited"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Important Dates
            </CardTitle>
            <CardDescription className="text-white/60">
              Application period and decision timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="openingDate" className="text-white">Opening Date</Label>
                <Input
                  id="openingDate"
                  type="date"
                  value={formData.openingDate}
                  onChange={(e) => handleInputChange("openingDate", e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="closingDate" className="text-white">Closing Date</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => handleInputChange("closingDate", e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="resultsDate" className="text-white">Results Date</Label>
                <Input
                  id="resultsDate"
                  type="date"
                  value={formData.resultsDate}
                  onChange={(e) => handleInputChange("resultsDate", e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility & Content */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              Eligibility & Content
            </CardTitle>
            <CardDescription className="text-white/60">
              Requirements and detailed information for applicants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="eligibility" className="text-white">Eligibility Requirements</Label>
              <Textarea
                id="eligibility"
                value={formData.eligibility}
                onChange={(e) => handleInputChange("eligibility", e.target.value)}
                placeholder="List eligibility criteria..."
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="objectives" className="text-white">Objectives</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) => handleInputChange("objectives", e.target.value)}
                placeholder="What are the objectives of this scholarship?"
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[80px]"
              />
            </div>
            
            <div>
              <Label htmlFor="benefits" className="text-white">Benefits</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => handleInputChange("benefits", e.target.value)}
                placeholder="What benefits does this scholarship provide?"
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[80px]"
              />
            </div>
            
            <div>
              <Label htmlFor="coverage" className="text-white">Coverage Details</Label>
              <Textarea
                id="coverage"
                value={formData.coverage}
                onChange={(e) => handleInputChange("coverage", e.target.value)}
                placeholder="What expenses are covered?"
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sponsors */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Sponsors
            </CardTitle>
            <CardDescription className="text-white/60">
              Select sponsors for this scholarship
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sponsors.length === 0 ? (
              <p className="text-white/60 text-center py-4">No sponsors available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sponsors.map((sponsor) => (
                  <button
                    key={sponsor.id}
                    type="button"
                    onClick={() => handleSponsorToggle(sponsor.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.sponsorIds.includes(sponsor.id)
                        ? "bg-purple-600/20 border-purple-500 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {sponsor.name}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selection & Review */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Selection & Review
            </CardTitle>
            <CardDescription className="text-white/60">
              Configure how applications are reviewed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="selectionMethod" className="text-white">Selection Method</Label>
                <Select 
                  value={formData.selectionMethod} 
                  onValueChange={(val) => handleInputChange("selectionMethod", val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="MERIT">Merit-based</SelectItem>
                    <SelectItem value="NEED_BASED">Need-based</SelectItem>
                    <SelectItem value="COMBINED">Combined</SelectItem>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                    <SelectItem value="COMMITTEE">Committee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="requireInterview"
                  checked={formData.requireInterview}
                  onCheckedChange={(checked) => handleInputChange("requireInterview", checked)}
                />
                <Label htmlFor="requireInterview" className="text-white cursor-pointer">
                  Require Interview
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Visibility */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-400" />
              Status & Visibility
            </CardTitle>
            <CardDescription className="text-white/60">
              Control how the scholarship appears to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => handleInputChange("status", val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="visibility" className="text-white">Visibility</Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(val) => handleInputChange("visibility", val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="FEATURED">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="applicationStatus" className="text-white">Application Status</Label>
                <Select 
                  value={formData.applicationStatus} 
                  onValueChange={(val) => handleInputChange("applicationStatus", val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="BY_INVITATION">By Invitation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                />
                <Label htmlFor="isFeatured" className="text-white cursor-pointer">
                  Featured Scholarship
                </Label>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  id="isHighlighted"
                  checked={formData.isHighlighted}
                  onCheckedChange={(checked) => handleInputChange("isHighlighted", checked)}
                />
                <Label htmlFor="isHighlighted" className="text-white cursor-pointer">
                  Highlighted
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-pink-400" />
              Media & Branding
            </CardTitle>
            <CardDescription className="text-white/60">
              Images and visual elements for the scholarship
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="thumbnailUrl" className="text-white">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="bannerUrl" className="text-white">Banner URL</Label>
                <Input
                  id="bannerUrl"
                  value={formData.bannerUrl}
                  onChange={(e) => handleInputChange("bannerUrl", e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="icon" className="text-white">Icon (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange("icon", e.target.value)}
                  placeholder="🎓"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="color" className="text-white">Color (hex)</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  placeholder="#7C3AED"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Budget
            </CardTitle>
            <CardDescription className="text-white/60">
              Financial planning for the scholarship
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalBudget" className="text-white">Total Budget</Label>
                <Input
                  id="totalBudget"
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => handleInputChange("totalBudget", e.target.value)}
                  placeholder="Total scholarship budget"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="perStudentAmount" className="text-white">Per Student Amount</Label>
                <Input
                  id="perStudentAmount"
                  type="number"
                  value={formData.perStudentAmount}
                  onChange={(e) => handleInputChange("perStudentAmount", e.target.value)}
                  placeholder="Amount per student"
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pb-8">
          <Link href="/admin/scholarships/programs">
            <Button 
              variant="outline" 
              type="button"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </Link>
          <Button 
            variant="outline" 
            type="button"
            onClick={(e) => handleSubmit(e, "DRAFT")}
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            type="button"
            onClick={(e) => handleSubmit(e, "PUBLISHED")}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Create & Publish
          </Button>
        </div>
      </form>
    </div>
  )
}
