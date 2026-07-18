"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  ChevronRight,
  GraduationCap,
  User,
  BookOpen,
  FileText,
  Heart,
  Briefcase,
  Globe,
  Send,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

// Form validation schema
const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  
  // Educational Background
  highestDegree: z.string().optional(),
  institution: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.number().optional(),
  gpa: z.string().optional(),
  
  // Professional
  employmentStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  yearsExperience: z.number().optional(),
  
  // Online Presence
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  googleScholar: z.string().optional(),
  orcid: z.string().optional(),
  website: z.string().optional(),
  
  // Emergency Contact
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  
  // Motivation
  statementOfPurpose: z.string().optional(),
  motivationLetter: z.string().optional(),
  financialNeedStatement: z.string().optional(),
  
  // Custom responses
  customResponses: z.record(z.any()).optional(),
})

const countries = [
  { value: "NG", label: "Nigeria" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IN", label: "India" },
  { value: "CN", label: "China" },
  { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" },
  { value: "OTHER", label: "Other" },
]

const degrees = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "ASSOCIATE", label: "Associate Degree" },
  { value: "BACHELOR", label: "Bachelor's Degree" },
  { value: "MASTER", label: "Master's Degree" },
  { value: "PHD", label: "PhD" },
  { value: "OTHER", label: "Other" },
]

export default function ApplyScholarshipPage() {
  const params = useParams()
  const router = useRouter()
  const [scholarship, setScholarship] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [draftSaved, setDraftSaved] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
    trigger,
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nationality: "",
      state: "",
      country: "",
      gender: "",
      dateOfBirth: "",
      highestDegree: "",
      institution: "",
      fieldOfStudy: "",
      graduationYear: undefined,
      gpa: "",
      employmentStatus: "",
      currentEmployer: "",
      yearsExperience: undefined,
      linkedIn: "",
      github: "",
      googleScholar: "",
      orcid: "",
      website: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelation: "",
      statementOfPurpose: "",
      motivationLetter: "",
      financialNeedStatement: "",
    },
  })

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        const response = await fetch(`/api/public/scholarships/${params.slug}`)
        if (!response.ok) {
          throw new Error("Scholarship not found")
        }
        const data = await response.json()
        setScholarship(data)
      } catch (error) {
        console.error("Error fetching scholarship:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchScholarship()
    }
  }, [params.slug])

  const onSubmit = async (data: any, asDraft: boolean = false) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        scholarshipSlug: params.slug,
        isDraft: asDraft,
        customResponses: scholarship?.customQuestions?.reduce((acc: any, q: any) => {
          acc[q.id] = data[`custom_${q.id}`]
          return acc
        }, {}),
      }

      const response = await fetch("/api/public/scholarships/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit application")
      }

      const result = await response.json()

      toast({
        title: asDraft ? "Draft Saved" : "Application Submitted",
        description: asDraft
          ? "Your application has been saved as a draft"
          : `Application ${result.application.applicationNumber} submitted successfully. Your tracking number is ${result.application.trackingNumber}`,
      })

      if (!asDraft) {
        router.push(`/scholarships/track?tracking=${result.application.trackingNumber}`)
      } else {
        setDraftSaved(true)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    handleSubmit((data) => onSubmit(data, true))()
  }

  const handleNextTab = async () => {
    const tabs = ["personal", "education", "professional", "motivation", "documents"]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      // Validate current tab fields
      let fieldsToValidate: string[] = []
      switch (activeTab) {
        case "personal":
          fieldsToValidate = ["firstName", "lastName", "email"]
          break
      }
      
      const isValid = await trigger(fieldsToValidate)
      if (isValid) {
        setActiveTab(tabs[currentIndex + 1])
      }
    }
  }

  const handlePrevTab = () => {
    const tabs = ["personal", "education", "professional", "motivation", "documents"]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Scholarship Not Found</h1>
          <p className="text-white/60 mb-6">This scholarship may have been removed or is no longer available.</p>
          <Link href="/scholarships">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
              Browse Scholarships
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!scholarship.isOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Applications Closed</h1>
          <p className="text-white/60 mb-6">This scholarship is no longer accepting applications.</p>
          <Link href="/scholarships">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
              Browse Other Scholarships
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href={`/scholarships/${scholarship.slug}`} className="inline-flex items-center text-white/60 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {scholarship.name}
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Application Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
            Application Form
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">{scholarship.name}</h1>
          <p className="text-white/60">
            Submit your application before {scholarship.closingDate 
              ? format(new Date(scholarship.closingDate), "MMMM d, yyyy")
              : "the deadline"
            }
          </p>
          {draftSaved && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              Draft saved successfully
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="border-b border-white/10">
                <TabsList className="w-full justify-start bg-white/5 h-auto p-0">
                  <TabsTrigger 
                    value="personal" 
                    className="data-[state=active]:bg-purple-500 rounded-t-lg px-4 py-3"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="education" 
                    className="data-[state=active]:bg-purple-500 rounded-t-lg px-4 py-3"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Education
                  </TabsTrigger>
                  <TabsTrigger 
                    value="professional" 
                    className="data-[state=active]:bg-purple-500 rounded-t-lg px-4 py-3"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Professional
                  </TabsTrigger>
                  <TabsTrigger 
                    value="motivation" 
                    className="data-[state=active]:bg-purple-500 rounded-t-lg px-4 py-3"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Motivation
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documents" 
                    className="data-[state=active]:bg-purple-500 rounded-t-lg px-4 py-3"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="text-red-400 text-sm">{errors.firstName.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-sm">{errors.lastName.message as string}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm">{errors.email.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Region</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="California"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        {...register("nationality")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="American"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                              <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...register("dateOfBirth")}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input
                          id="emergencyName"
                          {...register("emergencyName")}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Contact Phone</Label>
                        <Input
                          id="emergencyPhone"
                          {...register("emergencyPhone")}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyRelation">Relationship</Label>
                        <Input
                          id="emergencyRelation"
                          {...register("emergencyRelation")}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="Parent"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="highestDegree">Highest Degree</Label>
                      <Controller
                        name="highestDegree"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Select degree" />
                            </SelectTrigger>
                            <SelectContent>
                              {degrees.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                  {d.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        {...register("institution")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Harvard University"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fieldOfStudy">Field of Study</Label>
                      <Input
                        id="fieldOfStudy"
                        {...register("fieldOfStudy")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        {...register("graduationYear", { valueAsNumber: true })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA / Grade</Label>
                    <Input
                      id="gpa"
                      {...register("gpa")}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="3.8/4.0 or A"
                    />
                  </div>
                </TabsContent>

                {/* Professional Tab */}
                <TabsContent value="professional" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="employmentStatus">Employment Status</Label>
                      <Controller
                        name="employmentStatus"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMPLOYED">Employed</SelectItem>
                              <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                              <SelectItem value="SELF_EMPLOYED">Self-Employed</SelectItem>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="FREELANCER">Freelancer</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentEmployer">Current Employer</Label>
                      <Input
                        id="currentEmployer"
                        {...register("currentEmployer")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Company Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      {...register("yearsExperience", { valueAsNumber: true })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="5"
                    />
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-purple-400" />
                      Online Presence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                        <Input
                          id="linkedIn"
                          {...register("linkedIn")}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub Profile</Label>
                        <Input
                          id="github"
                          {...register("github")}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="googleScholar">Google Scholar</Label>
                        <Input
                          id="googleScholar"
                          {...register("googleScholar")}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="https://scholar.google.com/citations?user=..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orcid">ORCID</Label>
                        <Input
                          id="orcid"
                          {...register("orcid")}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="0000-0002-1825-0097"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="website">Personal Website</Label>
                      <Input
                        id="website"
                        {...register("website")}
                        className="bg-white/5 border-white/10 text-white mt-2"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Motivation Tab */}
                <TabsContent value="motivation" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="statementOfPurpose">Statement of Purpose *</Label>
                    <p className="text-white/60 text-sm mb-2">
                      Tell us about your goals, motivations, and why you deserve this scholarship.
                    </p>
                    <Textarea
                      id="statementOfPurpose"
                      {...register("statementOfPurpose")}
                      className="bg-white/5 border-white/10 text-white min-h-[200px]"
                      placeholder="Share your story, aspirations, and what drives you..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivationLetter">Motivation Letter</Label>
                    <p className="text-white/60 text-sm mb-2">
                      Explain your interest in this specific scholarship and how it aligns with your goals.
                    </p>
                    <Textarea
                      id="motivationLetter"
                      {...register("motivationLetter")}
                      className="bg-white/5 border-white/10 text-white min-h-[200px]"
                      placeholder="What motivates you to apply for this scholarship..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financialNeedStatement">Financial Need Statement</Label>
                    <p className="text-white/60 text-sm mb-2">
                      If applying for a need-based scholarship, explain your financial circumstances.
                    </p>
                    <Textarea
                      id="financialNeedStatement"
                      {...register("financialNeedStatement")}
                      className="bg-white/5 border-white/10 text-white min-h-[150px]"
                      placeholder="Describe your financial situation and why you need this support..."
                    />
                  </div>

                  {/* Custom Questions */}
                  {scholarship.customQuestions && scholarship.customQuestions.length > 0 && (
                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-lg font-medium text-white mb-4">Additional Questions</h3>
                      {scholarship.customQuestions.map((question: any) => (
                        <div key={question.id} className="mb-4">
                          <Label htmlFor={`custom_${question.id}`}>
                            {question.question}
                            {question.isRequired && <span className="text-red-400 ml-1">*</span>}
                          </Label>
                          {question.helpText && (
                            <p className="text-white/60 text-sm mb-2">{question.helpText}</p>
                          )}
                          {question.questionType === "TEXTAREA" ? (
                            <Textarea
                              id={`custom_${question.id}`}
                              {...register(`custom_${question.id}` as any)}
                              className="bg-white/5 border-white/10 text-white mt-2"
                              placeholder={question.placeholder || ""}
                            />
                          ) : question.questionType === "SELECT" ? (
                            <Controller
                              name={`custom_${question.id}` as any}
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                                    <SelectValue placeholder={question.placeholder || "Select"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(question.options as string[])?.map((opt: string) => (
                                      <SelectItem key={opt} value={opt}>
                                        {opt}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          ) : (
                            <Input
                              id={`custom_${question.id}`}
                              {...register(`custom_${question.id}` as any)}
                              className="bg-white/5 border-white/10 text-white mt-2"
                              placeholder={question.placeholder || ""}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6 mt-0">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-amber-400 text-sm">
                      <strong>Note:</strong> Document upload is optional at this stage. You can upload documents 
                      after submitting your application or email them to the scholarship coordinator.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* CV Upload */}
                    <div className="p-6 bg-white/5 rounded-lg border-2 border-dashed border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Curriculum Vitae (CV)</h4>
                          <p className="text-white/60 text-sm">PDF, DOC, or DOCX (max 5MB)</p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>

                    {/* Transcript Upload */}
                    <div className="p-6 bg-white/5 rounded-lg border-2 border-dashed border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Academic Transcript</h4>
                          <p className="text-white/60 text-sm">PDF (max 10MB)</p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>

                    {/* National ID Upload */}
                    <div className="p-6 bg-white/5 rounded-lg border-2 border-dashed border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">National ID / Passport</h4>
                          <p className="text-white/60 text-sm">PDF, JPG, or PNG (max 5MB)</p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>

                    {/* Recommendation Letters */}
                    <div className="p-6 bg-white/5 rounded-lg border-2 border-dashed border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Recommendation Letters</h4>
                          <p className="text-white/60 text-sm">Optional - Up to 3 letters (PDF, max 5MB each)</p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Agreement */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <Checkbox id="agreement" required />
                      <Label htmlFor="agreement" className="text-white/80 text-sm leading-relaxed">
                        I certify that all information provided in this application is accurate and complete. 
                        I understand that providing false information may result in disqualification. 
                        I consent to the processing of my personal data for the purpose of this scholarship application.
                      </Label>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>

            {/* Form Actions */}
            <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={submitting}
                className="border-white/20 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              <div className="flex gap-3">
                {activeTab !== "personal" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="border-white/20 text-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                {activeTab !== "documents" ? (
                  <Button
                    type="button"
                    onClick={handleNextTab}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
