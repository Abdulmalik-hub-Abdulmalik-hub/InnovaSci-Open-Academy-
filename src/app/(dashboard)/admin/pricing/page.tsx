"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, Plus, Edit, Trash2, Check, 
  Loader2, Star, DollarSign, Crown,
  Layers, Grid3X3, Zap, Settings, BarChart3,
  Percent, Clock, Eye, EyeOff, Archive,
  XCircle
} from "lucide-react"

// Types
interface Domain {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  domainId: string | null
  domain?: Domain | null
}

interface Plan {
  id: string
  name: string
  description: string | null
  planType: string
  billingCycle: string
  purchaseScope: 'ACADEMY' | 'DOMAIN' | 'CATEGORY'
  allowedDomainIds: string[]
  allowedCategoryIds: string[]
  price: number
  currency: string
  pricing: any
  features: string[]
  isActive: boolean
  isFeatured: boolean
  isPopular: boolean
  isRecommended: boolean
  status: string
  visibility: string
  discountPercentage: number | null
  sortOrder: number
  icon: string | null
  bannerUrl: string | null
  themeColor: string | null
  seoTitle: string | null
  seoDescription: string | null
  subscriptionCount?: number
  createdAt: string
  updatedAt: string
}

const billingCycleLabels: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  lifetime: "Lifetime",
}

const purchaseScopeLabels: Record<string, { label: string; description: string; icon: any }> = {
  ACADEMY: { 
    label: "Entire Academy", 
    description: "Full platform access - all domains, categories, and courses",
    icon: Crown 
  },
  DOMAIN: { 
    label: "Domain", 
    description: "Access to all categories within selected domain(s)",
    icon: Grid3X3 
  },
  CATEGORY: { 
    label: "Category", 
    description: "Access to all courses within selected category(ies)",
    icon: Layers 
  },
}

const scopeColors: Record<string, string> = {
  ACADEMY: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
  DOMAIN: "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30",
  CATEGORY: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
}

const scopeBadgeColors: Record<string, string> = {
  ACADEMY: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DOMAIN: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CATEGORY: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
}

// Format price helper
function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("plans")

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/plans?includeSubscriptions=true")
      const result = await response.json()
      
      if (result.success && result.data?.plans) {
        setPlans(result.data.plans)
      } else {
        setPlans([])
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err)
      setError("Failed to load plans")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch domains and categories for selection
  const fetchFilters = useCallback(async () => {
    try {
      const [domainsRes, categoriesRes] = await Promise.all([
        fetch("/api/public/domains"),
        fetch("/api/admin/categories?includeInactive=true")
      ])
      
      const domainsData = await domainsRes.json()
      if (domainsData.success && domainsData.data?.domains) {
        setDomains(domainsData.data.domains)
      }
      
      const categoriesData = await categoriesRes.json()
      if (categoriesData.success && categoriesData.data?.categories) {
        setCategories(categoriesData.data.categories)
      }
    } catch (err) {
      console.error("Failed to fetch filters:", err)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
    fetchFilters()
  }, [fetchPlans, fetchFilters])

  // Delete plan
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    
    try {
      const response = await fetch(`/api/admin/plans/${deleteConfirm}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        setPlans(plans.filter(p => p.id !== deleteConfirm))
        setDeleteConfirm(null)
      }
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  // Edit plan
  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setShowModal(true)
  }

  // Get domain names for a plan
  const getDomainNames = (domainIds: string[]): string => {
    if (domainIds.length === 0) return "All Domains"
    return domainIds
      .map(id => domains.find(d => d.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "Unknown"
  }

  // Get category names for a plan
  const getCategoryNames = (categoryIds: string[]): string => {
    if (categoryIds.length === 0) return "All Categories"
    return categoryIds
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "Unknown"
  }

  // Group plans by scope
  const groupedPlans = {
    ACADEMY: plans.filter(p => p.purchaseScope === 'ACADEMY'),
    DOMAIN: plans.filter(p => p.purchaseScope === 'DOMAIN'),
    CATEGORY: plans.filter(p => p.purchaseScope === 'CATEGORY'),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-purple-400" />
            Pricing & Plans
          </h1>
          <p className="text-white/60 mt-1">
            Manage Academy, Domain, and Category purchase plans
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchPlans()}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            <Check className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => {
              setEditingPlan(null)
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Academy Plans</p>
                <p className="text-3xl font-bold text-white">{groupedPlans.ACADEMY.length}</p>
              </div>
              <Crown className="h-10 w-10 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Domain Plans</p>
                <p className="text-3xl font-bold text-white">{groupedPlans.DOMAIN.length}</p>
              </div>
              <Grid3X3 className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Category Plans</p>
                <p className="text-3xl font-bold text-white">{groupedPlans.CATEGORY.length}</p>
              </div>
              <Layers className="h-10 w-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Purchases</p>
                <p className="text-3xl font-bold text-white">
                  {plans.reduce((sum, p) => sum + (p.subscriptionCount || 0), 0)}
                </p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchPlans()} className="border-red-500/20 text-red-400">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="plans" className="data-[state=active]:bg-white/10">
            <CreditCard className="h-4 w-4 mr-2" />
            All Plans
          </TabsTrigger>
          <TabsTrigger value="academy" className="data-[state=active]:bg-yellow-500/10">
            <Crown className="h-4 w-4 mr-2 text-yellow-400" />
            Academy Plans
          </TabsTrigger>
          <TabsTrigger value="domains" className="data-[state=active]:bg-purple-500/10">
            <Grid3X3 className="h-4 w-4 mr-2 text-purple-400" />
            Domain Plans
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-emerald-500/10">
            <Layers className="h-4 w-4 mr-2 text-emerald-400" />
            Category Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <PlanGrid 
            plans={plans} 
            domains={domains} 
            categories={categories}
            onEdit={handleEditPlan}
            onDelete={setDeleteConfirm}
            getDomainNames={getDomainNames}
            getCategoryNames={getCategoryNames}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="academy" className="space-y-6">
          <PlanGrid 
            plans={groupedPlans.ACADEMY} 
            domains={domains} 
            categories={categories}
            onEdit={handleEditPlan}
            onDelete={setDeleteConfirm}
            getDomainNames={getDomainNames}
            getCategoryNames={getCategoryNames}
            loading={loading}
            scopeFilter="ACADEMY"
          />
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <PlanGrid 
            plans={groupedPlans.DOMAIN} 
            domains={domains} 
            categories={categories}
            onEdit={handleEditPlan}
            onDelete={setDeleteConfirm}
            getDomainNames={getDomainNames}
            getCategoryNames={getCategoryNames}
            loading={loading}
            scopeFilter="DOMAIN"
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <PlanGrid 
            plans={groupedPlans.CATEGORY} 
            domains={domains} 
            categories={categories}
            onEdit={handleEditPlan}
            onDelete={setDeleteConfirm}
            getDomainNames={getDomainNames}
            getCategoryNames={getCategoryNames}
            loading={loading}
            scopeFilter="CATEGORY"
          />
        </TabsContent>
      </Tabs>

      {/* Plan Modal */}
      {showModal && (
        <PlanModal
          plan={editingPlan}
          domains={domains}
          categories={categories}
          onClose={() => {
            setShowModal(false)
            setEditingPlan(null)
          }}
          onSave={() => {
            fetchPlans()
            setShowModal(false)
            setEditingPlan(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white">Delete Plan?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 mb-4">
                Are you sure you want to delete this plan? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Plan Grid Component
function PlanGrid({ 
  plans, 
  domains, 
  categories,
  onEdit, 
  onDelete,
  getDomainNames,
  getCategoryNames,
  loading,
  scopeFilter
}: { 
  plans: Plan[]
  domains: Domain[]
  categories: Category[]
  onEdit: (plan: Plan) => void
  onDelete: (id: string) => void
  getDomainNames: (ids: string[]) => string
  getCategoryNames: (ids: string[]) => string
  loading: boolean
  scopeFilter?: string
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="py-16 text-center">
          <CreditCard className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/50">
            {scopeFilter ? `No ${scopeFilter.toLowerCase()} plans created yet` : "No plans created yet"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const scopeInfo = purchaseScopeLabels[plan.purchaseScope]
        const ScopeIcon = scopeInfo?.icon || Layers
        
        return (
          <div 
            key={plan.id}
            className={`rounded-xl border ${scopeColors[plan.purchaseScope] || 'border-white/10'} overflow-hidden transition-all hover:scale-[1.02]`}
          >
            {/* Header with gradient based on scope */}
            <div className={`p-6 ${
              plan.purchaseScope === 'ACADEMY' ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20' :
              plan.purchaseScope === 'DOMAIN' ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20' :
              'bg-gradient-to-r from-emerald-500/20 to-teal-500/20'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {plan.icon ? (
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                      {plan.icon}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <ScopeIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                    <Badge className={`${scopeBadgeColors[plan.purchaseScope]} border mt-1`}>
                      {scopeInfo?.label || plan.purchaseScope}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {plan.isPopular && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      <Zap className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {plan.isRecommended && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Star className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {formatPrice(plan.price, plan.currency)}
                  </span>
                  {plan.billingCycle !== "lifetime" && (
                    <span className="text-white/50 text-sm">
                      /{plan.billingCycle === "yearly" ? "year" : plan.billingCycle === "quarterly" ? "quarter" : "month"}
                    </span>
                  )}
                </div>
                {plan.discountPercentage && plan.discountPercentage > 0 && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-2">
                    <Percent className="h-3 w-3 mr-1" />
                    {plan.discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Scope Details */}
              <div className="text-sm text-white/70 space-y-1 mb-4">
                {plan.purchaseScope === 'ACADEMY' && (
                  <p>Full platform access</p>
                )}
                {plan.purchaseScope === 'DOMAIN' && (
                  <p>Domains: {getDomainNames(plan.allowedDomainIds)}</p>
                )}
                {plan.purchaseScope === 'CATEGORY' && (
                  <p>Categories: {getCategoryNames(plan.allowedCategoryIds)}</p>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                {plan.status === 'PUBLISHED' ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Published
                  </Badge>
                ) : plan.status === 'ARCHIVED' ? (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                )}
                {plan.visibility === 'PRIVATE' && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>

              {/* Description */}
              {plan.description && (
                <p className="text-white/60 text-sm line-clamp-2 mb-4">
                  {plan.description}
                </p>
              )}

              {/* Features preview */}
              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                      <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-white/40 text-sm">
                      +{plan.features.length - 3} more features
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <BarChart3 className="h-4 w-4" />
                <span>{plan.subscriptionCount || 0} purchases</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(plan)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(plan.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Plan Modal Component
function PlanModal({ 
  plan,
  domains,
  categories,
  onClose,
  onSave,
}: { 
  plan?: Plan | null
  domains: Domain[]
  categories: Category[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    planType: plan?.planType || "one_time",
    billingCycle: plan?.billingCycle || "lifetime",
    purchaseScope: plan?.purchaseScope || "CATEGORY",
    allowedDomainIds: plan?.allowedDomainIds || [],
    allowedCategoryIds: plan?.allowedCategoryIds || [],
    price: plan?.price || 0,
    currency: plan?.currency || "USD",
    features: plan?.features?.join("\n") || "",
    isActive: plan?.isActive ?? true,
    isFeatured: plan?.isFeatured ?? false,
    isPopular: plan?.isPopular ?? false,
    isRecommended: plan?.isRecommended ?? false,
    discountPercentage: plan?.discountPercentage || 0,
    sortOrder: plan?.sortOrder || 0,
    icon: plan?.icon || "",
    themeColor: plan?.themeColor || "#7C3AED",
    status: plan?.status || "PUBLISHED",
    visibility: plan?.visibility || "PUBLIC",
  })
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeSection, setActiveSection] = useState("basic")

  // Pricing tiers
  const [pricingTiers, setPricingTiers] = useState<{currency: string, monthly: number, quarterly: number, yearly: number, lifetime: number}[]>([
    { currency: "USD", monthly: 0, quarterly: 0, yearly: 0, lifetime: 0 },
    { currency: "NGN", monthly: 0, quarterly: 0, yearly: 0, lifetime: 0 },
  ])

  // Initialize pricing from existing plan
  useEffect(() => {
    if (plan?.pricing) {
      const tiers = Object.entries(plan.pricing).map(([currency, data]: [string, any]) => ({
        currency,
        monthly: data.monthly || 0,
        quarterly: data.quarterly || 0,
        yearly: data.yearly || 0,
        lifetime: data.lifetime || data.amount || 0,
      }))
      if (tiers.length > 0) setPricingTiers(tiers)
    }
  }, [plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    // Build pricing object from tiers
    const pricing: Record<string, any> = {}
    pricingTiers.forEach(tier => {
      pricing[tier.currency] = {
        monthly: tier.monthly,
        quarterly: tier.quarterly,
        yearly: tier.yearly,
        lifetime: tier.lifetime,
      }
    })

    const data = {
      ...formData,
      features: formData.features.split("\n").filter(f => f.trim()),
      pricing: Object.keys(pricing).length > 0 || formData.price > 0 ? pricing : null,
    }

    try {
      const url = plan ? `/api/admin/plans/${plan.id}` : "/api/admin/plans"
      const method = plan ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (result.success) {
        onSave()
      } else {
        setError(result.error || "Failed to save plan")
      }
    } catch (err) {
      setError("Failed to save plan")
    } finally {
      setSaving(false)
    }
  }

  // Filter categories by selected domain for Domain scope plans
  const filteredCategories = formData.purchaseScope === 'DOMAIN' && formData.allowedDomainIds.length > 0
    ? categories.filter(c => formData.allowedDomainIds.includes(c.domainId || ''))
    : categories

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">
              {plan ? "Edit Plan" : "Create New Plan"}
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-white/60 hover:text-white">
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Section Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: "basic", label: "Basic Info", icon: Settings },
              { id: "scope", label: "Purchase Scope", icon: Layers },
              { id: "pricing", label: "Pricing", icon: DollarSign },
              { id: "display", label: "Display Settings", icon: Eye },
              { id: "features", label: "Features", icon: Check },
            ].map(section => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className={activeSection === section.id ? "bg-white/20 text-white" : "text-white/60"}
              >
                <section.icon className="h-4 w-4 mr-1" />
                {section.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Basic Info Section */}
            {activeSection === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Plan Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Professional Data Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Icon (emoji)</label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="📊"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-1 block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none"
                    rows={3}
                    placeholder="Full access to all Data Science courses and certifications"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Plan Type</label>
                    <select
                      value={formData.planType}
                      onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    >
                      <option value="subscription">Subscription</option>
                      <option value="one_time">One-time Purchase</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Billing Cycle</label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Visibility</label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Sort Order</label>
                    <Input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white/70">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white/70">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white/70">Popular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecommended}
                      onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white/70">Recommended</span>
                  </label>
                </div>
              </div>
            )}

            {/* Purchase Scope Section */}
            {activeSection === "scope" && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-white/70 mb-3 block">Purchase Scope *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(purchaseScopeLabels).map(([scope, info]) => {
                      const Icon = info.icon
                      return (
                        <div
                          key={scope}
                          onClick={() => setFormData({ ...formData, purchaseScope: scope })}
                          className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                            formData.purchaseScope === scope 
                              ? scopeColors[scope] + ' border-current' 
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className={`h-6 w-6 ${
                              scope === 'ACADEMY' ? 'text-yellow-400' :
                              scope === 'DOMAIN' ? 'text-purple-400' : 'text-emerald-400'
                            }`} />
                            <span className="font-semibold text-white">{info.label}</span>
                          </div>
                          <p className="text-white/60 text-sm">{info.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Domain Selection for Domain Scope */}
                {formData.purchaseScope === 'DOMAIN' && (
                  <div>
                    <label className="text-sm text-white/70 mb-3 block">
                      Select Domains *
                    </label>
                    <p className="text-white/50 text-sm mb-3">
                      Students will have access to all categories within the selected domains.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 bg-white/5 rounded-lg border border-white/10">
                      {domains.map(domain => (
                        <label
                          key={domain.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.allowedDomainIds.includes(domain.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  allowedDomainIds: [...formData.allowedDomainIds, domain.id] 
                                })
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  allowedDomainIds: formData.allowedDomainIds.filter(id => id !== domain.id)
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-white/70 text-sm">
                            {domain.icon ? `${domain.icon} ` : ''}{domain.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Selection for Category Scope */}
                {formData.purchaseScope === 'CATEGORY' && (
                  <div>
                    <label className="text-sm text-white/70 mb-3 block">
                      Select Categories *
                    </label>
                    <p className="text-white/50 text-sm mb-3">
                      Students will have access to all courses within the selected categories.
                    </p>
                    
                    {/* Filter by domain if needed */}
                    {domains.length > 0 && (
                      <div className="mb-3">
                        <select
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                          onChange={(e) => {
                            const domainId = e.target.value
                            if (domainId === "all") {
                              setFormData({ ...formData, allowedCategoryIds: [] })
                            } else {
                              const domainCategories = categories.filter(c => c.domainId === domainId)
                              setFormData({ 
                                ...formData, 
                                allowedCategoryIds: domainCategories.map(c => c.id)
                              })
                            }
                          }}
                        >
                          <option value="all">All Domains</option>
                          {domains.map(domain => (
                            <option key={domain.id} value={domain.id}>
                              {domain.icon ? `${domain.icon} ` : ''}{domain.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 bg-white/5 rounded-lg border border-white/10">
                      {filteredCategories.map(category => (
                        <label
                          key={category.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.allowedCategoryIds.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  allowedCategoryIds: [...formData.allowedCategoryIds, category.id] 
                                })
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  allowedCategoryIds: formData.allowedCategoryIds.filter(id => id !== category.id)
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-white/70 text-sm">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Section */}
            {activeSection === "pricing" && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-white/70 mb-3 block">Multi-Currency Pricing</label>
                  <p className="text-white/50 text-sm mb-4">
                    Set prices for different billing cycles. Leave as 0 if not applicable.
                  </p>

                  {/* Pricing Table */}
                  <div className="space-y-4">
                    {pricingTiers.map((tier, index) => (
                      <div key={tier.currency} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-medium">{tier.currency}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-white/50 mb-1 block">Monthly</label>
                            <Input
                              type="number"
                              value={tier.monthly}
                              onChange={(e) => {
                                const newTiers = [...pricingTiers]
                                newTiers[index].monthly = parseFloat(e.target.value) || 0
                                setPricingTiers(newTiers)
                              }}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/50 mb-1 block">Quarterly</label>
                            <Input
                              type="number"
                              value={tier.quarterly}
                              onChange={(e) => {
                                const newTiers = [...pricingTiers]
                                newTiers[index].quarterly = parseFloat(e.target.value) || 0
                                setPricingTiers(newTiers)
                              }}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/50 mb-1 block">Yearly</label>
                            <Input
                              type="number"
                              value={tier.yearly}
                              onChange={(e) => {
                                const newTiers = [...pricingTiers]
                                newTiers[index].yearly = parseFloat(e.target.value) || 0
                                setPricingTiers(newTiers)
                              }}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/50 mb-1 block">Lifetime</label>
                            <Input
                              type="number"
                              value={tier.lifetime}
                              onChange={(e) => {
                                const newTiers = [...pricingTiers]
                                newTiers[index].lifetime = parseFloat(e.target.value) || 0
                                setPricingTiers(newTiers)
                              }}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Discount Percentage (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Display Settings Section */}
            {activeSection === "display" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.themeColor || "#7C3AED"}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                      className="w-12 h-12 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={formData.themeColor}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="#7C3AED"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-1 block">SEO Title</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Professional Data Science Certificate"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-1 block">SEO Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none"
                    rows={3}
                    placeholder="Get certified in Data Science with our comprehensive professional program"
                  />
                </div>

                {/* Preview */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/50 text-sm mb-3">Preview</p>
                  <div 
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: `${formData.themeColor}20` }}
                  >
                    <div className="flex items-center gap-3">
                      {formData.icon ? (
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                          {formData.icon}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <Layers className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-bold">{formData.name || "Plan Name"}</h3>
                        <Badge className="bg-white/20 text-white mt-1">
                          {purchaseScopeLabels[formData.purchaseScope]?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Section */}
            {activeSection === "features" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Features (one per line)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none font-mono text-sm"
                    rows={10}
                    placeholder="All courses in this category&#10;Professional certificate&#10;Lifetime access&#10;Priority support&#10;Downloadable resources"
                  />
                </div>

                {/* Feature Preview */}
                {formData.features && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/50 text-sm mb-3">Feature Preview</p>
                    <ul className="space-y-2">
                      {formData.features.split("\n").filter(f => f.trim()).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-white/70">
                          <Check className="h-4 w-4 text-green-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {plan ? "Update Plan" : "Create Plan"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
