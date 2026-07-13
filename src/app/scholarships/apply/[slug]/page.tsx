"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Award, ArrowLeft, Calendar, DollarSign, Users, Check, Loader2,
  AlertCircle, FileText, Share2, Clock, Globe, Heart
} from "lucide-react"
import toast from "react-hot-toast"

interface Scholarship {
  id: string
  name: string
  shortName: string | null
  slug: string
  description: string | null
  objectives: string | null
  eligibility: string | null
  benefits: string | null
  type: { id: string; name: string; color: string | null }
  awardAmount: number | null
  currency: string
  coverageType: string
  maxRecipients: number | null
  currentRecipients: number
  openingDate: string | null
  closingDate: string | null
  isFeatured: boolean
  thumbnailUrl: string | null
  bannerUrl: string | null
  icon: string | null
  color: string | null
  requireInterview: boolean
  requiredDocuments: string[]
  isOpen: boolean
  statusMessage: string
}

const educationLevels = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree (PhD)",
  "Professional Degree",
  "Postdoctoral",
]

const employmentStatuses = [
  "Employed Full-time",
  "Employed Part-time",
  "Self-employed",
  "Unemployed",
  "Student",
  "Freelancer",
  "Contractor",
]

export default function ApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [applicationResult, setApplicationResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    country: "",
    state: "",
    city: "",
    gender: "",
    
    // Education
    educationLevel: "",
    institution: "",
    fieldOfStudy: "",
    graduationYear: "",
    gpa: "",
    
    // Professional
    employmentStatus: "",
    currentEmployer: "",
    jobTitle: "",
    
    // Additional Info
    researchInterests: "",
    linkedIn: "",
    github: "",
    
    // Essays
    statementOfPurpose: "",
    motivationLetter: "",
    communityImpactStatement: "",
    
    // Financial Need
    financialNeedStatement: "",
    
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    
    // Agreement
    agreeToTerms: false,
  })

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const response = await fetch(`/api/public/scholarships/${slug}`)
        const data = await response.json()
        if (data.success) {
          setScholarship(data.data)
        } else {
          toast.error("Scholarship not found")
          router.push("/scholarships")
        }
      } catch (error) {
        toast.error("Failed to load scholarship")
        router.push("/scholarships")
      } finally {
        setLoading(false)
      }
    }

    fetchScholarship()
  }, [slug, router])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    
    // Add more validation as needed

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    if (!formData.agreeToTerms) {
      toast.error("You must agree to the terms and conditions")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/scholarships/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholarshipSlug: slug,
          ...formData,
          graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
          gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        setApplicationResult(data.data)
        toast.success("Application submitted successfully!")
      } else {
        toast.error(data.error || "Failed to submit application")
      }
    } catch (error) {
      toast.error("Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return "Varies"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const shareOnSocial = (platform: string) => {
    const text = `Apply for ${scholarship?.name} - ${scholarship?.description?.substring(0, 100)}...`
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    }
    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!scholarship) {
    return null
  }

  if (submitted && applicationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Application Submitted!</h1>
              <p className="text-white/60 mb-6">
                Your application for {applicationResult.scholarshipName} has been received.
              </p>

              <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                <div className="mb-3">
                  <p className="text-xs text-white/50 uppercase tracking-wider">Application Number</p>
                  <p className="text-white font-mono font-medium">{applicationResult.applicationNumber}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-white/50 uppercase tracking-wider">Tracking Number</p>
                  <p className="text-white font-mono font-medium">{applicationResult.trackingNumber}</p>
                </div>
              </div>

              <p className="text-sm text-white/60 mb-6">
                Save your tracking number to check your application status. You will also receive a confirmation email.
              </p>

              <div className="flex flex-col gap-3">
                <Link href="/scholarships/track">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                    Track Your Application
                  </Button>
                </Link>
                <Link href="/scholarships">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Browse More Scholarships
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/scholarships" className="flex items-center gap-2 text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Scholarships
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareOnSocial("twitter")}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: scholarship.type.color ? `${scholarship.type.color}20` : "rgba(139, 92, 246, 0.2)" }}
                  >
                    <Award className="h-6 w-6" style={{ color: scholarship.type.color || "#8B5CF6" }} />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">Apply for {scholarship.name}</CardTitle>
                    <p className="text-white/50 text-sm">Fill out the application form below</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-white/70">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-white/70">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white/70">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="your.email@example.com"
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white/70">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth" className="text-white/70">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender" className="text-white/70">Gender</Label>
                        <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a2e] border-white/10">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </section>

                  {/* Location */}
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      Location
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nationality" className="text-white/70">Nationality</Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) => handleInputChange("nationality", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="e.g., Nigerian"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-white/70">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="e.g., Nigeria"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-white/70">State/Province</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="e.g., Lagos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-white/70">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="e.g., Lagos"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Education */}
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-400" />
                      Educational Background
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="educationLevel" className="text-white/70">Education Level</Label>
                        <Select value={formData.educationLevel} onValueChange={(v) => handleInputChange("educationLevel", v)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a2e] border-white/10">
                            {educationLevels.map((level) => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="institution" className="text-white/70">Institution</Label>
                        <Input
                          id="institution"
                          value={formData.institution}
                          onChange={(e) => handleInputChange("institution", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="University/School name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fieldOfStudy" className="text-white/70">Field of Study</Label>
                        <Input
                          id="fieldOfStudy"
                          value={formData.fieldOfStudy}
                          onChange={(e) => handleInputChange("fieldOfStudy", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <Label htmlFor="graduationYear" className="text-white/70">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          value={formData.graduationYear}
                          onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="2024"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gpa" className="text-white/70">GPA / Grade Average</Label>
                        <Input
                          id="gpa"
                          type="number"
                          step="0.01"
                          value={formData.gpa}
                          onChange={(e) => handleInputChange("gpa", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="e.g., 3.5"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Essays */}
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-400" />
                      Essays & Statements
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="statementOfPurpose" className="text-white/70">
                          Statement of Purpose *
                        </Label>
                        <Textarea
                          id="statementOfPurpose"
                          value={formData.statementOfPurpose}
                          onChange={(e) => handleInputChange("statementOfPurpose", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1 min-h-[150px]"
                          placeholder="Describe your academic and career goals, and how this scholarship will help you achieve them..."
                        />
                        <p className="text-xs text-white/40 mt-1">Minimum 500 words recommended</p>
                      </div>
                      <div>
                        <Label htmlFor="motivationLetter" className="text-white/70">
                          Motivation Letter *
                        </Label>
                        <Textarea
                          id="motivationLetter"
                          value={formData.motivationLetter}
                          onChange={(e) => handleInputChange("motivationLetter", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1 min-h-[150px]"
                          placeholder="Why are you applying for this scholarship? What makes you a strong candidate?"
                        />
                      </div>
                      {scholarship.eligibility?.toLowerCase().includes("community") && (
                        <div>
                          <Label htmlFor="communityImpactStatement" className="text-white/70">
                            Community Impact Statement
                          </Label>
                          <Textarea
                            id="communityImpactStatement"
                            value={formData.communityImpactStatement}
                            onChange={(e) => handleInputChange("communityImpactStatement", e.target.value)}
                            className="bg-white/5 border-white/10 text-white mt-1 min-h-[120px]"
                            placeholder="Describe your contributions to your community..."
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Additional Links */}
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-4">Professional Links (Optional)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedIn" className="text-white/70">LinkedIn Profile</Label>
                        <Input
                          id="linkedIn"
                          type="url"
                          value={formData.linkedIn}
                          onChange={(e) => handleInputChange("linkedIn", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github" className="text-white/70">GitHub Profile</Label>
                        <Input
                          id="github"
                          type="url"
                          value={formData.github}
                          onChange={(e) => handleInputChange("github", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Financial Need */}
                  {scholarship.coverageType === "FINANCIAL_AID" || scholarship.coverageType === "PARTIAL" ? (
                    <section>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-400" />
                        Financial Need (Optional)
                      </h3>
                      <div>
                        <Label htmlFor="financialNeedStatement" className="text-white/70">
                          Financial Need Statement
                        </Label>
                        <Textarea
                          id="financialNeedStatement"
                          value={formData.financialNeedStatement}
                          onChange={(e) => handleInputChange("financialNeedStatement", e.target.value)}
                          className="bg-white/5 border-white/10 text-white mt-1 min-h-[120px]"
                          placeholder="Explain your financial circumstances and why you need this scholarship..."
                        />
                      </div>
                    </section>
                  ) : null}

                  {/* Terms */}
                  <section className="pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                        className="mt-1"
                      />
                      <Label htmlFor="agreeToTerms" className="text-white/60 text-sm cursor-pointer">
                        I confirm that all information provided is accurate and complete. I agree to the{" "}
                        <Link href="/terms" className="text-purple-400 hover:underline">Terms and Conditions</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>.
                      </Label>
                    </div>
                  </section>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={submitting || !scholarship.isOpen}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-12 text-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : !scholarship.isOpen ? (
                      <>
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Applications Closed
                      </>
                    ) : (
                      <>
                        Submit Application
                        <Check className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {!scholarship.isOpen && (
                    <p className="text-center text-amber-400 text-sm">
                      {scholarship.statusMessage}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scholarship Info */}
            <Card className="bg-white/5 border-white/10 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white text-lg">Scholarship Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Award Amount</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(scholarship.awardAmount, scholarship.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Coverage</span>
                  <Badge className="bg-purple-500/20 text-purple-300 border-0">
                    {scholarship.coverageType.replace("_", " ")}
                  </Badge>
                </div>
                {scholarship.maxRecipients && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Available Slots</span>
                    <span className="text-white">
                      {scholarship.maxRecipients - scholarship.currentRecipients} / {scholarship.maxRecipients}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Deadline</span>
                  <span className="text-white flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {scholarship.closingDate
                      ? new Date(scholarship.closingDate).toLocaleDateString()
                      : "Rolling"}
                  </span>
                </div>
                {scholarship.requireInterview && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <Clock className="h-4 w-4" />
                    Interview may be required
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Required Documents */}
            {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Required Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scholarship.requiredDocuments.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2 text-white/70 text-sm">
                        <FileText className="h-4 w-4 text-purple-400" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Share */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Share This Scholarship</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial("twitter")}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    X (Twitter)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial("facebook")}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial("linkedin")}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
