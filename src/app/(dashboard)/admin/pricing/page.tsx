"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { usePlans, Plan } from "@/hooks/usePlans"
import { 
  CreditCard, Plus, Edit, Trash2, Check, 
  Loader2, Star, ToggleLeft, ToggleRight, DollarSign
} from "lucide-react"

const billingCycleLabels: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  lifetime: "Lifetime",
}

const planTypeLabels: Record<string, string> = {
  subscription: "Subscription",
  one_time: "One-time",
}

function PlanModal({ 
  plan,
  onClose,
  onSave,
}: { 
  plan?: Plan | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    planType: plan?.planType || "subscription",
    billingCycle: plan?.billingCycle || "monthly",
    price: plan?.price || 0,
    currency: plan?.currency || "USD",
    features: plan?.features?.join("\n") || "",
    isActive: plan?.isActive ?? true,
    isFeatured: plan?.isFeatured ?? false,
    discountPercentage: plan?.discountPercentage || 0,
    maxCourses: plan?.maxCourses ?? -1,
    maxCertificates: plan?.maxCertificates ?? -1,
    trialDays: plan?.trialDays || 0,
    sortOrder: plan?.sortOrder || 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { createPlan, updatePlan } = usePlans()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const data: Partial<Plan> = {
      ...formData,
      features: formData.features.split("\n").filter(f => f.trim()),
    }

    let result
    if (plan) {
      result = await updatePlan(plan.id, data)
    } else {
      result = await createPlan(data)
    }

    setSaving(false)

    if (result.success) {
      onSave()
      onClose()
    } else {
      setError(result.error || "Failed to save plan")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-white">
            {plan ? "Edit Plan" : "Create New Plan"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Plan Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Pro Plan"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm text-white/70 mb-1 block">Price (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="pl-9 bg-white/5 border-white/10 text-white"
                    placeholder="29.99"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none"
                rows={2}
                placeholder="Full access to all courses and features"
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
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Features (one per line)</label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none font-mono text-sm"
                rows={4}
                placeholder="Unlimited course access&#10;Priority support&#10;Download certificates&#10;Mobile app access"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Trial Days</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-white/70 mb-1 block">Max Courses (-1=unlimited)</label>
                <Input
                  type="number"
                  value={formData.maxCourses}
                  onChange={(e) => setFormData({ ...formData, maxCourses: parseInt(e.target.value) || -1 })}
                  className="bg-white/5 border-white/10 text-white"
                />
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

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className="text-white"
                >
                  {formData.isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-400" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-white/40" />
                  )}
                </button>
                <span className="text-white/70">Active</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                  className="text-white"
                >
                  {formData.isFeatured ? (
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ) : (
                    <Star className="h-5 w-5 text-white/40" />
                  )}
                </button>
                <span className="text-white/70">Featured</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
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

export default function AdminPricingPage() {
  const { plans, loading, error, fetchPlans, deletePlan } = usePlans()
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setShowModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    
    await deletePlan(deleteConfirm)
    setDeleteConfirm(null)
    fetchPlans()
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pricing & Plans</h1>
          <p className="text-white/60">Manage subscription plans and pricing</p>
        </div>
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

      {/* Plans Grid */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>All Plans ({plans.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && plans.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50">No plans created yet</p>
              <Button 
                onClick={() => setShowModal(true)} 
                className="mt-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`bg-white/5 rounded-lg border ${
                    plan.isFeatured ? "border-yellow-500/50" : "border-white/10"
                  } p-5 hover:border-white/20 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{plan.name}</h3>
                        {plan.isFeatured && (
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-white/10 text-white/60 text-xs">
                          {planTypeLabels[plan.planType]}
                        </Badge>
                        <Badge className="bg-white/10 text-white/60 text-xs">
                          {billingCycleLabels[plan.billingCycle]}
                        </Badge>
                      </div>
                    </div>
                    {!plan.isActive && (
                      <Badge className="bg-red-500/20 text-red-400">Inactive</Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(plan.price, plan.currency)}
                    </span>
                    {plan.billingCycle !== "lifetime" && (
                      <span className="text-white/50 text-sm">/{plan.billingCycle === "yearly" ? "year" : "month"}</span>
                    )}
                    {plan.discountPercentage && plan.discountPercentage > 0 && (
                      <Badge className="ml-2 bg-green-500/20 text-green-400">
                        {plan.discountPercentage}% OFF
                      </Badge>
                    )}
                  </div>

                  {plan.description && (
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-white/70 text-sm">
                          <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-white/40 text-sm">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
                    <CreditCard className="h-3 w-3" />
                    <span>{plan.subscriptionCount || 0} subscribers</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(plan.id)}
                      className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Modal */}
      {showModal && (
        <PlanModal
          plan={editingPlan}
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
                Are you sure you want to delete this plan? This will not affect existing subscribers.
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