"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  DollarSign, 
  Calendar,
  Users,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Heart,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"

interface Scholarship {
  id: string
  name: string
  shortName: string
  slug: string
  description: string
  objectives: string
  eligibility: string
  benefits: string
  coverage: string
  scholarshipType: { name: string; color: string } | null
  awardAmount: number | null
  currency: string
  coverageType: string
  availableSlots: number | null
  openingDate: string | null
  closingDate: string | null
  selectionMethod: string
  isOpen: boolean
  statusMessage: string
  daysRemaining: number | null
  slotsRemaining: number | null
  sponsors: any[]
  requireInterview: boolean
  requiredDocuments: string[] | null
  customQuestions: any[] | null
}

export default function ScholarshipApplyPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    state: "",
    country: "",
    // Education
    highestDegree: "",
    institution: "",
    fieldOfStudy: "",
    graduationYear: "",
    gpa: "",
    // Employment
    employmentStatus: "",
    currentPosition: "",
    yearsExperience: "",
    // Social
    linkedin: "",
    github: "",
    googleScholar: "",
    orcid: "",
    // Statements
    statementOfPurpose: "",
    motivationLetter: "",
    financialNeedStatement: "",
    // Emergency
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    // Custom
    customResponses: {} as Record<string, string>,
    agreeTerms: false,
  })

  useEffect(() => {
    fetchScholarship()
  }, [slug])

  const fetchScholarship = async () => {
    try {
      const res = await fetch(`/api/public/scholarships/${slug}`)
      const data = await res.json()

      if (data.success) {
        setScholarship(data.data.scholarship)
      } else {
        toast.error("Scholarship not found")
        router.push("/scholarships")
      }
    } catch (error) {
      console.error("Error fetching scholarship:", error)
      toast.error("Failed to load scholarship")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.agreeTerms)
      case 2:
        return !!(formData.highestDegree && formData.institution)
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!scholarship) return

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/scholarship-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholarshipId: scholarship.id,
          ...formData,
        })
      })
      const data = await res.json()

      if (data.success) {
        toast.success("Application submitted successfully!")
        router.push(`/scholarships/apply/${slug}/success?applicationNumber=${data.data.application.applicationNumber}&trackingCode=${data.data.application.trackingCode}`)
      } else {
        toast.error(data.error || "Failed to submit application")
      }
    } catch (error) {
      toast.error("Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Scholarship Not Found</h1>
          <Link href="/scholarships">
            <Button className="bg-purple-600">Browse Scholarships</Button>
          </Link>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Education", icon: GraduationCap },
    { number: 3, title: "Employment", icon: Briefcase },
    { number: 4, title: "Documents", icon: FileText },
    { number: 5, title: "Statement", icon: Heart },
    { number: 6, title: "Review", icon: Check },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/scholarships" className="flex items-center gap-2 text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Scholarships
            </Link>
            {scholarship && (
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500">Open</Badge>
                {scholarship.daysRemaining !== null && (
                  <span className="text-sm text-white/60">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {scholarship.daysRemaining} days remaining
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  Apply for {scholarship.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              currentStep >= step.number 
                                ? "bg-purple-600 text-white" 
                                : "bg-white/10 text-white/40"
                            }`}
                          >
                            {currentStep > step.number ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <step.icon className="h-5 w-5" />
                            )}
                          </div>
                          <span className={`text-xs mt-2 hidden sm:block ${
                            currentStep >= step.number ? "text-white" : "text-white/40"
                          }`}>
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                            currentStep > step.number ? "bg-purple-600" : "bg-white/10"
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => updateFormData("firstName", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => updateFormData("lastName", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => updateFormData("phone", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          value={formData.gender}
                          onChange={(e) => updateFormData("gender", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white"
                        >
                          <option value="">Select</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) => updateFormData("nationality", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="Nigerian"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => updateFormData("country", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="Nigeria"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">State/Region</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => updateFormData("state", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="Lagos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => updateFormData("agreeTerms", checked)}
                      />
                      <label htmlFor="agreeTerms" className="text-sm text-white/70">
                        I agree to the terms and conditions and consent to the processing of my personal data *
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 2: Education */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Educational Background</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="highestDegree">Highest Degree *</Label>
                        <select
                          id="highestDegree"
                          value={formData.highestDegree}
                          onChange={(e) => updateFormData("highestDegree", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white"
                        >
                          <option value="">Select</option>
                          <option value="HIGH_SCHOOL">High School</option>
                          <option value="DIPLOMA">Diploma</option>
                          <option value="BACHELOR">Bachelor's Degree</option>
                          <option value="MASTER">Master's Degree</option>
                          <option value="DOCTORATE">Doctorate/PhD</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="institution">Institution *</Label>
                        <Input
                          id="institution"
                          value={formData.institution}
                          onChange={(e) => updateFormData("institution", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="University of Lagos"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="fieldOfStudy">Field of Study</Label>
                        <Input
                          id="fieldOfStudy"
                          value={formData.fieldOfStudy}
                          onChange={(e) => updateFormData("fieldOfStudy", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div>
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          value={formData.graduationYear}
                          onChange={(e) => updateFormData("graduationYear", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="2024"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gpa">GPA/Score</Label>
                        <Input
                          id="gpa"
                          value={formData.gpa}
                          onChange={(e) => updateFormData("gpa", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="3.8/4.0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Employment */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Employment Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employmentStatus">Employment Status</Label>
                        <select
                          id="employmentStatus"
                          value={formData.employmentStatus}
                          onChange={(e) => updateFormData("employmentStatus", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white"
                        >
                          <option value="">Select</option>
                          <option value="EMPLOYED">Employed</option>
                          <option value="UNEMPLOYED">Unemployed</option>
                          <option value="SELF_EMPLOYED">Self-employed</option>
                          <option value="STUDENT">Student</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="currentPosition">Current Position</Label>
                        <Input
                          id="currentPosition"
                          value={formData.currentPosition}
                          onChange={(e) => updateFormData("currentPosition", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          value={formData.yearsExperience}
                          onChange={(e) => updateFormData("yearsExperience", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn URL</Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={(e) => updateFormData("linkedin", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub URL</Label>
                        <Input
                          id="github"
                          value={formData.github}
                          onChange={(e) => updateFormData("github", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="github.com/johndoe"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Documents Info */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Required Documents</h3>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-blue-300 font-medium">Document Upload</p>
                          <p className="text-sm text-white/60 mt-1">
                            You will be able to upload your documents after submitting this application.
                            Please prepare the following documents:
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Curriculum Vitae (CV)</p>
                          <p className="text-sm text-white/60">PDF, max 5MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Academic Transcripts</p>
                          <p className="text-sm text-white/60">PDF, max 10MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Recommendation Letter</p>
                          <p className="text-sm text-white/60">PDF, max 5MB (optional)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">National ID / Passport</p>
                          <p className="text-sm text-white/60">PDF or image, max 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Statement */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Statement</h3>
                    <div>
                      <Label htmlFor="statementOfPurpose">Statement of Purpose *</Label>
                      <p className="text-sm text-white/60 mb-2">
                        Tell us about your academic goals, research interests, and how this scholarship will help you achieve them.
                      </p>
                      <Textarea
                        id="statementOfPurpose"
                        value={formData.statementOfPurpose}
                        onChange={(e) => updateFormData("statementOfPurpose", e.target.value)}
                        className="bg-white/5 border-white/20 text-white min-h-[150px]"
                        placeholder="Describe your academic and career goals..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="motivationLetter">Motivation Letter</Label>
                      <p className="text-sm text-white/60 mb-2">
                        Why are you applying for this scholarship? What makes you a strong candidate?
                      </p>
                      <Textarea
                        id="motivationLetter"
                        value={formData.motivationLetter}
                        onChange={(e) => updateFormData("motivationLetter", e.target.value)}
                        className="bg-white/5 border-white/20 text-white min-h-[150px]"
                        placeholder="Explain your motivation..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="financialNeedStatement">Financial Need Statement</Label>
                      <p className="text-sm text-white/60 mb-2">
                        If applying for need-based scholarship, explain your financial circumstances.
                      </p>
                      <Textarea
                        id="financialNeedStatement"
                        value={formData.financialNeedStatement}
                        onChange={(e) => updateFormData("financialNeedStatement", e.target.value)}
                        className="bg-white/5 border-white/20 text-white min-h-[100px]"
                        placeholder="Describe your financial need..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => updateFormData("emergencyContactName", e.target.value)}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                        <Input
                          id="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => updateFormData("emergencyContactPhone", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactRelation">Relationship</Label>
                        <Input
                          id="emergencyContactRelation"
                          value={formData.emergencyContactRelation}
                          onChange={(e) => updateFormData("emergencyContactRelation", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="Parent, Spouse, etc."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Review */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Review Your Application</h3>
                    <div className="p-4 rounded-lg bg-white/5 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/60">Name</p>
                          <p className="text-white font-medium">{formData.firstName} {formData.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Email</p>
                          <p className="text-white font-medium">{formData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Phone</p>
                          <p className="text-white font-medium">{formData.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Country</p>
                          <p className="text-white font-medium">{formData.country || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Education</p>
                          <p className="text-white font-medium">{formData.highestDegree} at {formData.institution || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Employment</p>
                          <p className="text-white font-medium">{formData.employmentStatus || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-yellow-300 font-medium">Before Submitting</p>
                          <ul className="text-sm text-white/60 mt-1 space-y-1">
                            <li>• Review all information for accuracy</li>
                            <li>• Ensure your email is correct for communications</li>
                            <li>• Be ready to upload required documents</li>
                            <li>• Keep your tracking code safe</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  {currentStep < 6 ? (
                    <Button
                      onClick={nextStep}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Next
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <Check className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scholarship Info */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{scholarship.name}</h3>
                {scholarship.scholarshipType && (
                  <Badge 
                    className="mb-4"
                    style={{ backgroundColor: scholarship.scholarshipType.color + "20", color: scholarship.scholarshipType.color }}
                  >
                    {scholarship.scholarshipType.name}
                  </Badge>
                )}
                <p className="text-white/70 text-sm mb-4">
                  {scholarship.description || "No description available"}
                </p>
                
                <div className="space-y-3">
                  {scholarship.awardAmount && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-xs text-white/40">Award Amount</p>
                        <p className="text-green-400 font-semibold">
                          {formatCurrency(scholarship.awardAmount, scholarship.currency)}
                        </p>
                      </div>
                    </div>
                  )}
                  {scholarship.closingDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-white/40" />
                      <div>
                        <p className="text-xs text-white/40">Deadline</p>
                        <p className="text-white">
                          {new Date(scholarship.closingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {scholarship.availableSlots && (
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-white/40">Available Slots</p>
                        <p className="text-white">{scholarship.availableSlots}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            {scholarship.benefits && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm whitespace-pre-line">
                    {scholarship.benefits}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Eligibility */}
            {scholarship.eligibility && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Eligibility Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm whitespace-pre-line">
                    {scholarship.eligibility}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Need Help */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h4 className="text-white font-medium mb-2">Need Help?</h4>
                <p className="text-white/60 text-sm mb-4">
                  Contact our support team if you have questions about this scholarship.
                </p>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
