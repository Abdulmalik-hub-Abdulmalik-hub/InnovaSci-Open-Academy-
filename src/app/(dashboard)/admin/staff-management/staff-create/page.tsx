"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, ArrowRight, Check, User, Shield, BookOpen, Key, Loader2,
  Plus, X, Upload, Mail, Phone, Building, Briefcase, ChevronDown,
  Users, DollarSign, UserPlus, Heart, BadgeCheck, UserCheck,
  Microscope, Headphones
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import toast from "react-hot-toast"

const PORTALS = [
  { name: "SUPER_ADMIN", displayName: "Super Administrator", icon: Shield, color: "#7C3AED" },
  { name: "ADMIN", displayName: "Super Administrator", icon: Building, color: "#2563EB" },
  { name: "ACADEMIC_DIRECTOR", displayName: "Academic Director", icon: BookOpen, color: "#059669" },
  { name: "INSTRUCTOR", displayName: "Instructor", icon: BookOpen, color: "#0891B2" },
  { name: "REVIEWER", displayName: "Reviewer", icon: BookOpen, color: "#D97706" },
  { name: "PROJECT_SUPERVISOR", displayName: "Project Supervisor", icon: Users, color: "#6366F1" },
  { name: "FINANCE_OFFICER", displayName: "Finance Officer", icon: DollarSign, color: "#10B981" },
  { name: "ADMISSION_OFFICER", displayName: "Admission Officer", icon: UserPlus, color: "#EC4899" },
  { name: "STUDENT_AFFAIRS", displayName: "Student Affairs", icon: Heart, color: "#F43F5E" },
  { name: "QUALITY_ASSURANCE", displayName: "Quality Assurance", icon: BadgeCheck, color: "#8B5CF6" },
  { name: "RESEARCH_COORDINATOR", displayName: "Research Coordinator", icon: Microscope, color: "#0EA5E9" },
  { name: "SUPPORT_STAFF", displayName: "Support Staff", icon: Headphones, color: "#64748B" },
]

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Administrator" },
  { value: "ADMIN", label: "Super Administrator" },
  { value: "ACADEMIC_DIRECTOR", label: "Academic Director" },
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "REVIEWER", label: "Reviewer" },
  { value: "PROJECT_SUPERVISOR", label: "Project Supervisor" },
  { value: "FINANCE_OFFICER", label: "Finance Officer" },
  { value: "ADMISSION_OFFICER", label: "Admission Officer" },
  { value: "STUDENT_AFFAIRS", label: "Student Affairs Officer" },
  { value: "QUALITY_ASSURANCE", label: "Quality Assurance Officer" },
  { value: "RESEARCH_COORDINATOR", label: "Research Coordinator" },
  { value: "SUPPORT_STAFF", label: "Support Staff" },
]

const EMPLOYEE_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACTOR", label: "Contractor" },
  { value: "CONSULTANT", label: "Consultant" },
]

const DIFFICULTY_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]

// Step indicator component
function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                index < currentStep
                  ? "bg-green-500 text-white"
                  : index === currentStep
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <span className={`text-xs mt-2 ${index === currentStep ? "text-white" : "text-white/50"}`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-2 ${
                index < currentStep ? "bg-green-500" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Step 1: Personal Information
function PersonalInfoStep({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 mx-auto mb-3 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Personal Information</h2>
        <p className="text-white/60">Enter the staff member&apos;s basic details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-white">Full Name *</Label>
          <Input
            id="fullName"
            value={data.fullName || ""}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            placeholder="John Doe"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="staffId" className="text-white">Staff ID</Label>
          <Input
            id="staffId"
            value={data.staffId || ""}
            onChange={(e) => onChange({ ...data, staffId: e.target.value })}
            placeholder="STAFF-001"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="john.doe@example.com"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">Phone Number</Label>
          <Input
            id="phone"
            value={data.phone || ""}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+1 234 567 8900"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-white">Gender</Label>
          <select
            id="gender"
            value={data.gender || ""}
            onChange={(e) => onChange({ ...data, gender: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-white">Department</Label>
          <Input
            id="department"
            value={data.department || ""}
            onChange={(e) => onChange({ ...data, department: e.target.value })}
            placeholder="e.g., Computer Science"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-white">Job Title</Label>
          <Input
            id="title"
            value={data.title || ""}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="e.g., Senior Instructor"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeType" className="text-white">Employee Type</Label>
          <select
            id="employeeType"
            value={data.employeeType || ""}
            onChange={(e) => onChange({ ...data, employeeType: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="">Select type</option>
            {EMPLOYEE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

// Step 2: Portal Assignment
function PortalAssignmentStep({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 mx-auto mb-3 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Portal Assignment</h2>
        <p className="text-white/60">Select the portal this staff member will access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PORTALS.map((portal) => {
          const Icon = portal.icon
          const isSelected = data.portal === portal.name
          
          return (
            <button
              key={portal.name}
              onClick={() => onChange({ ...data, portal: portal.name })}
              className={`p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${portal.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: portal.color }} />
                </div>
                <div>
                  <p className="font-medium text-white">{portal.displayName}</p>
                </div>
              </div>
              {isSelected && (
                <Badge className="bg-purple-500 text-white mt-2">
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Step 3: Academic Assignment
function AcademicAssignmentStep({ data, onChange, domains, categories }: { 
  data: any; 
  onChange: (data: any) => void 
  domains: any[]
  categories: any[]
}) {
  const handleDomainToggle = (domainId: string) => {
    const current: string[] = data.domainIds || []
    const updated = current.includes(domainId)
      ? current.filter((id: string) => id !== domainId)
      : [...current, domainId]
    onChange({ ...data, domainIds: updated })
  }

  const handleCategoryToggle = (categoryId: string) => {
    const current: string[] = data.categoryIds || []
    const updated = current.includes(categoryId)
      ? current.filter((id: string) => id !== categoryId)
      : [...current, categoryId]
    onChange({ ...data, categoryIds: updated })
  }

  const handleDifficultyToggle = (level: string) => {
    const current: string[] = data.difficultyLevels || []
    const updated = current.includes(level)
      ? current.filter((l: string) => l !== level)
      : [...current, level]
    onChange({ ...data, difficultyLevels: updated })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <BookOpen className="h-12 w-12 mx-auto mb-3 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Academic Assignment</h2>
        <p className="text-white/60">Assign domains, categories, and difficulty levels</p>
      </div>

      {/* Domains */}
      <div className="space-y-3">
        <h3 className="font-medium text-white">Domains</h3>
        {domains.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => handleDomainToggle(domain.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  (data.domainIds || []).includes(domain.id)
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <p className="text-sm font-medium text-white truncate">
                  {domain.icon && <span className="mr-1">{domain.icon}</span>}
                  {domain.name}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-sm">No domains available</p>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-medium text-white">Categories</h3>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  (data.categoryIds || []).includes(category.id)
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <p className="text-sm font-medium text-white truncate">{category.name}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-sm">No categories available</p>
        )}
      </div>

      {/* Difficulty Levels */}
      <div className="space-y-3">
        <h3 className="font-medium text-white">Difficulty Levels</h3>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyToggle(level)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                (data.difficultyLevels || []).includes(level)
                  ? "border-purple-500 bg-purple-500/20 text-white"
                  : "border-white/10 bg-white/5 hover:border-white/20 text-white/70"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Summary */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <h4 className="font-medium text-white mb-2">Assignment Summary</h4>
        <p className="text-sm text-white/60">
          {(data.domainIds || []).length} domains, 
          {(data.categoryIds || []).length} categories, 
          {(data.difficultyLevels || []).length} difficulty levels selected
        </p>
      </div>
    </div>
  )
}

// Step 4: Credentials
function CredentialsStep({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Key className="h-12 w-12 mx-auto mb-3 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Login Credentials</h2>
        <p className="text-white/60">Set up the staff member&apos;s login credentials</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <Checkbox
            id="generatePassword"
            checked={data.generatePassword !== false}
            onCheckedChange={(checked) => onChange({ ...data, generatePassword: checked === true })}
            className="border-white/20"
          />
          <div className="flex-1">
            <Label htmlFor="generatePassword" className="text-white cursor-pointer">
              Generate temporary password automatically
            </Label>
            <p className="text-xs text-white/50">A secure password will be created for you</p>
          </div>
        </div>

        {!data.generatePassword && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={data.password || ""}
                onChange={(e) => onChange({ ...data, password: e.target.value })}
                placeholder="Enter password"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={data.confirmPassword || ""}
                onChange={(e) => onChange({ ...data, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className="bg-white/5 border-white/10 text-white"
              />
              {data.password && data.confirmPassword && data.password !== data.confirmPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>
          </div>
        )}

        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm text-purple-200">
            <strong>Note:</strong> The staff member will be required to change their password on first login.
          </p>
        </div>
      </div>
    </div>
  )
}

// Review Step
function ReviewStep({ data, domains, categories }: { data: any; domains: any[]; categories: any[] }) {
  const selectedDomains = domains.filter(d => (data.domainIds || []).includes(d.id))
  const selectedCategories = categories.filter(c => (data.categoryIds || []).includes(c.id))
  const selectedPortal = PORTALS.find(p => p.name === data.portal)

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Check className="h-12 w-12 mx-auto mb-3 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Review & Create</h2>
        <p className="text-white/60">Review the information before creating the account</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Personal Info */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/40">Full Name</p>
              <p className="text-white">{data.fullName || "N/A"}</p>
            </div>
            <div>
              <p className="text-white/40">Email</p>
              <p className="text-white">{data.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-white/40">Phone</p>
              <p className="text-white">{data.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-white/40">Department</p>
              <p className="text-white">{data.department || "N/A"}</p>
            </div>
            <div>
              <p className="text-white/40">Staff ID</p>
              <p className="text-white">{data.staffId || "Auto-generated"}</p>
            </div>
            <div>
              <p className="text-white/40">Title</p>
              <p className="text-white">{data.title || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Portal */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Portal Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPortal ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${selectedPortal.color}20` }}
                >
                  <selectedPortal.icon className="h-5 w-5" style={{ color: selectedPortal.color }} />
                </div>
                <p className="text-white">{selectedPortal.displayName}</p>
              </div>
            ) : (
              <p className="text-white/50">No portal selected</p>
            )}
          </CardContent>
        </Card>

        {/* Academic Assignments */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Academic Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-white/40 mb-1">Domains</p>
              <div className="flex flex-wrap gap-1">
                {selectedDomains.length > 0 ? (
                  selectedDomains.map(d => (
                    <Badge key={d.id} className="bg-white/10 text-white">{d.name}</Badge>
                  ))
                ) : (
                  <p className="text-white/50 text-sm">None selected</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Categories</p>
              <div className="flex flex-wrap gap-1">
                {selectedCategories.length > 0 ? (
                  selectedCategories.map(c => (
                    <Badge key={c.id} className="bg-white/10 text-white">{c.name}</Badge>
                  ))
                ) : (
                  <p className="text-white/50 text-sm">None selected</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Difficulty Levels</p>
              <div className="flex flex-wrap gap-1">
                {(data.difficultyLevels || []).length > 0 ? (
                  (data.difficultyLevels as string[]).map((level: string) => (
                    <Badge key={level} className="bg-white/10 text-white">{level}</Badge>
                  ))
                ) : (
                  <p className="text-white/50 text-sm">None selected</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credentials */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white">
              {data.generatePassword ? (
                <span className="text-green-400">Temporary password will be generated automatically</span>
              ) : (
                <span>Manual password set</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StaffCreatePage() {
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [domains, setDomains] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    staffId: "",
    department: "",
    title: "",
    employeeType: "",
    // Step 2
    portal: "",
    role: "",
    // Step 3
    domainIds: [],
    categoryIds: [],
    difficultyLevels: [],
    courseIds: [],
    // Step 4
    generatePassword: true,
    password: "",
    confirmPassword: "",
  })

  const steps = ["Personal Info", "Portal", "Assignments", "Credentials", "Review"]

  // Fetch domains and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [domainsRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/domains"),
          fetch("/api/admin/categories"),
        ])
        const domainsData = await domainsRes.json()
        const categoriesData = await categoriesRes.json()
        
        if (domainsData.success) setDomains(domainsData.data)
        if (categoriesData.success) setCategories(categoriesData.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  const handleNext = () => {
    // Validation
    if (currentStep === 0) {
      if (!formData.fullName || !formData.email) {
        toast.error("Please fill in all required fields")
        return
      }
      if (!formData.email.includes("@")) {
        toast.error("Please enter a valid email address")
        return
      }
    }
    
    if (currentStep === 1 && !formData.portal) {
      toast.error("Please select a portal")
      return
    }

    if (currentStep === steps.length - 1) {
      handleSubmit()
    } else {
      setCurrentStep(c => c + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(c => c - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/portal-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          staffId: formData.staffId,
          department: formData.department,
          title: formData.title,
          employeeType: formData.employeeType,
          portal: formData.portal,
          role: formData.role,
          domainIds: formData.domainIds,
          categoryIds: formData.categoryIds,
          difficultyLevels: formData.difficultyLevels,
          courseIds: formData.courseIds,
          generatePassword: formData.generatePassword,
          password: formData.password,
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success("Staff account created successfully!")
        if (data.temporaryPassword) {
          // Show temporary password in a toast
          toast.success(`Temporary password: ${data.temporaryPassword}`, { duration: 10000 })
        }
        router.push("/admin/staff-management/staff-directory")
      } else {
        toast.error(data.error || "Failed to create staff account")
      }
    } catch (error) {
      toast.error("Failed to create staff account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Staff Account</h1>
            <p className="text-white/60">Add a new staff member to the platform</p>
          </div>
        </div>

        {/* Progress Steps */}
        <StepIndicator currentStep={currentStep} steps={steps} />

        {/* Step Content */}
        <Card className="bg-[#1a1a2e] border-white/10 mb-6">
          <CardContent className="p-6">
            {currentStep === 0 && (
              <PersonalInfoStep data={formData} onChange={setFormData} />
            )}
            {currentStep === 1 && (
              <PortalAssignmentStep data={formData} onChange={setFormData} />
            )}
            {currentStep === 2 && (
              <AcademicAssignmentStep 
                data={formData} 
                onChange={setFormData}
                domains={domains}
                categories={categories}
              />
            )}
            {currentStep === 3 && (
              <CredentialsStep data={formData} onChange={setFormData} />
            )}
            {currentStep === 4 && (
              <ReviewStep data={formData} domains={domains} categories={categories} />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : currentStep === steps.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Account
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
