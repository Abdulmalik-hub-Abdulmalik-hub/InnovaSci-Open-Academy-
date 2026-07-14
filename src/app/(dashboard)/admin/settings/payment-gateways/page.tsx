"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CreditCard, Plus, Edit, Trash2, ToggleLeft, ToggleRight,
  Copy, MoreVertical, Search, Settings, Eye, EyeOff,
  Check, X, AlertCircle, RefreshCw, DollarSign,
  Globe, Building, Bitcoin, Smartphone, Wallet, Link2Off
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentGateway {
  id: string
  name: string
  provider: string
  slug: string
  isEnabled: boolean
  isDefault: boolean
  environment: string
  iconName: string | null
  color: string | null
  supportedCurrencies: string[]
  supportedCountries: string[]
  supportedMethods: string[]
  transactionFeePercent: number
  transactionFeeFixed: number
  currency: string
  priority: number
  healthStatus: string
  healthMessage: string | null
  notes: string | null
  _count: {
    transactions: number
    configurations: number
  }
}

interface GatewayStats {
  total: number
  enabled: number
  disabled: number
  totalTransactions: number
}

const PROVIDER_ICONS: Record<string, React.ElementType> = {
  paystack: DollarSign,
  stripe: CreditCard,
  flutterwave: Smartphone,
  paypal: Wallet,
  razorpay: Smartphone,
  bank_transfer: Building,
  manual: Settings,
  crypto: Bitcoin,
}

const METHOD_ICONS: Record<string, React.ElementType> = {
  card: CreditCard,
  bank_transfer: Building,
  ussd: Smartphone,
  mobile_money: Smartphone,
  apple_pay: Wallet,
  google_pay: Wallet,
  paypal: Wallet,
  crypto: Bitcoin,
}

const COLOR_OPTIONS = [
  { name: "Teal", value: "#00C4B4" },
  { name: "Indigo", value: "#635BFF" },
  { name: "Amber", value: "#F5A623" },
  { name: "Blue", value: "#003087" },
  { name: "Green", value: "#10B981" },
  { name: "Gray", value: "#6B7280" },
  { name: "Orange", value: "#F7931A" },
]

export default function PaymentGatewaysPage() {
  const { toast } = useToast()
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [stats, setStats] = useState<GatewayStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showDisabled, setShowDisabled] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    provider: string;
    slug: string;
    isEnabled: boolean;
    isDefault: boolean;
    environment: "sandbox" | "production";
    iconName: string;
    color: string;
    supportedCurrencies: string[];
    supportedCountries: string[];
    supportedMethods: string[];
    transactionFeePercent: number;
    transactionFeeFixed: number;
    currency: string;
    priority: number;
    notes: string;
  }>({
    name: "",
    provider: "paystack",
    slug: "",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "CreditCard",
    color: "#00C4B4",
    supportedCurrencies: ["NGN", "USD"],
    supportedCountries: ["NG", "US"],
    supportedMethods: ["card"],
    transactionFeePercent: 1.5,
    transactionFeeFixed: 0,
    currency: "USD",
    priority: 100,
    notes: "",
  })

  const fetchGateways = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/payment-gateways?includeDisabled=${showDisabled}`)
      const data = await response.json()
      
      if (data.success) {
        setGateways(data.data.gateways)
        setStats(data.data.stats)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch payment gateways",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [showDisabled, toast])

  useEffect(() => {
    fetchGateways()
  }, [fetchGateways])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingGateway ? formData.slug : generateSlug(name),
    })
  }

  const handleOpenModal = (gateway?: PaymentGateway) => {
    if (gateway) {
      setEditingGateway(gateway)
      setFormData({
        name: gateway.name,
        provider: gateway.provider,
        slug: gateway.slug,
        isEnabled: gateway.isEnabled,
        isDefault: gateway.isDefault,
        environment: (gateway.environment === "sandbox" ? "sandbox" : "production") as "sandbox" | "production",
        iconName: gateway.iconName || "CreditCard",
        color: gateway.color || "#00C4B4",
        supportedCurrencies: gateway.supportedCurrencies,
        supportedCountries: gateway.supportedCountries,
        supportedMethods: gateway.supportedMethods,
        transactionFeePercent: gateway.transactionFeePercent,
        transactionFeeFixed: gateway.transactionFeeFixed,
        currency: gateway.currency,
        priority: gateway.priority,
        notes: gateway.notes || "",
      })
    } else {
      setEditingGateway(null)
      setFormData({
        name: "",
        provider: "paystack",
        slug: "",
        isEnabled: false,
        isDefault: false,
        environment: "production",
        iconName: "CreditCard",
        color: "#00C4B4",
        supportedCurrencies: ["NGN", "USD"],
        supportedCountries: ["NG", "US"],
        supportedMethods: ["card"],
        transactionFeePercent: 1.5,
        transactionFeeFixed: 0,
        currency: "USD",
        priority: 100,
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" })
      return
    }
    if (!formData.slug.trim()) {
      toast({ title: "Error", description: "Slug is required", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingGateway
        ? `/api/admin/payment-gateways/${editingGateway.id}`
        : "/api/admin/payment-gateways"
      
      const response = await fetch(url, {
        method: editingGateway ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingGateway
            ? "Payment gateway updated successfully"
            : "Payment gateway created successfully",
        })
        setIsModalOpen(false)
        fetchGateways()
      } else {
        toast({ title: "Error", description: data.error || "Failed to save gateway", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleEnabled = async (gateway: PaymentGateway) => {
    try {
      const response = await fetch(`/api/admin/payment-gateways/${gateway.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !gateway.isEnabled }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: gateway.isEnabled ? "Gateway disabled" : "Gateway enabled",
        })
        fetchGateways()
      } else {
        toast({ title: "Error", description: data.error || "Failed to update gateway", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" })
    }
  }

  const handleToggleDefault = async (gateway: PaymentGateway) => {
    try {
      const response = await fetch(`/api/admin/payment-gateways/${gateway.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: !gateway.isDefault }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: gateway.isDefault ? "Default gateway removed" : "Gateway set as default",
        })
        fetchGateways()
      } else {
        toast({ title: "Error", description: data.error || "Failed to update gateway", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" })
    }
  }

  const handleDelete = async (gateway: PaymentGateway) => {
    if (gateway._count.transactions > 0) {
      toast({
        title: "Cannot Delete",
        description: `Gateway has ${gateway._count.transactions} transactions. Consider disabling instead.`,
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Are you sure you want to delete "${gateway.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/payment-gateways/${gateway.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({ title: "Success", description: "Payment gateway deleted" })
        fetchGateways()
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete gateway", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" })
    }
  }

  const filteredGateways = gateways.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.provider.toLowerCase().includes(search.toLowerCase())
  )

  const getIcon = (provider: string) => PROVIDER_ICONS[provider] || CreditCard

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Gateway Manager</h1>
          <p className="text-white/60 mt-1">
            Manage payment providers and gateway configuration
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Gateway
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/60">Total Gateways</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{stats.enabled}</div>
              <div className="text-sm text-white/60">Enabled</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-400">{stats.disabled}</div>
              <div className="text-sm text-white/60">Disabled</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.totalTransactions}</div>
              <div className="text-sm text-white/60">Transactions</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search gateways..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Button
          variant={showDisabled ? "default" : "outline"}
          onClick={() => setShowDisabled(!showDisabled)}
          className={showDisabled ? "bg-purple-500" : "border-white/20 text-white hover:bg-white/10"}
        >
          {showDisabled ? "Showing All" : "Show Disabled"}
        </Button>
        <Button
          variant="outline"
          onClick={fetchGateways}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Gateways Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGateways.length === 0 ? (
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/80 mb-2">No gateways found</h3>
            <p className="text-white/50 mb-4">
              {search ? "Try adjusting your search" : "Add your first payment gateway"}
            </p>
            {!search && (
              <Button
                onClick={() => handleOpenModal()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Gateway
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGateways.map((gateway, index) => {
            const Icon = getIcon(gateway.provider)
            return (
              <motion.div
                key={gateway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`bg-[#1a1a2e] border-white/10 hover:border-white/20 transition-all ${
                    !gateway.isEnabled ? "opacity-60" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${gateway.color || "#6366F1"}20` }}
                        >
                          <Icon
                            className="h-6 w-6"
                            style={{ color: gateway.color || "#6366F1" }}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-white text-base flex items-center gap-2">
                            {gateway.name}
                            {gateway.isDefault && (
                              <Badge className="bg-purple-500 text-xs">Default</Badge>
                            )}
                          </CardTitle>
                          <p className="text-xs text-white/40">{gateway.provider}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white/60">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1a1a2e] border-white/10">
                          <DropdownMenuItem
                            onClick={() => handleOpenModal(gateway)}
                            className="text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleEnabled(gateway)}
                            className="text-white hover:bg-white/10"
                          >
                            {gateway.isEnabled ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleDefault(gateway)}
                            className="text-white hover:bg-white/10"
                          >
                            {gateway.isDefault ? (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Remove Default
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Set as Default
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(gateway)}
                            className="text-red-400 hover:bg-red-500/10"
                            disabled={gateway._count.transactions > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className={
                          gateway.isEnabled
                            ? "border-green-500/50 text-green-400"
                            : "border-amber-500/50 text-amber-400"
                        }
                      >
                        {gateway.isEnabled ? (
                          <><ToggleRight className="h-3 w-3 mr-1" /> Enabled</>
                        ) : (
                          <><ToggleLeft className="h-3 w-3 mr-1" /> Disabled</>
                        )}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white/60">
                        {gateway.environment}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white/60">
                        <span>Priority</span>
                        <span className="text-white">{gateway.priority}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Fees</span>
                        <span className="text-white">
                          {gateway.transactionFeePercent}% + {gateway.currency} {gateway.transactionFeeFixed}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Transactions</span>
                        <span className="text-white">{gateway._count.transactions}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs text-white/40 mb-2">Supported Currencies</div>
                      <div className="flex flex-wrap gap-1">
                        {gateway.supportedCurrencies.slice(0, 4).map((c) => (
                          <Badge key={c} variant="outline" className="text-xs border-white/20">
                            {c}
                          </Badge>
                        ))}
                        {gateway.supportedCurrencies.length > 4 && (
                          <Badge variant="outline" className="text-xs border-white/20">
                            +{gateway.supportedCurrencies.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingGateway ? "Edit Payment Gateway" : "Create Payment Gateway"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Paystack"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-2 block">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                  }
                  placeholder="e.g., paystack"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="paystack">Paystack</option>
                  <option value="stripe">Stripe</option>
                  <option value="flutterwave">Flutterwave</option>
                  <option value="paypal">PayPal</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="manual">Manual Payment</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white/70 mb-2 block">Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as "sandbox" | "production" })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20"
                />
                <span className="text-white">Enabled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20"
                />
                <span className="text-white">Default Gateway</span>
              </label>
            </div>

            {/* Fees */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Fee %</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.transactionFeePercent}
                  onChange={(e) => setFormData({ ...formData, transactionFeePercent: parseFloat(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-2 block">Fixed Fee</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.transactionFeeFixed}
                  onChange={(e) => setFormData({ ...formData, transactionFeeFixed: parseFloat(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-2 block">Priority</label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 100 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Color</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      formData.color === color.value
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]"
                        : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Supported Currencies */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Supported Currencies</label>
              <div className="flex flex-wrap gap-2">
                {["NGN", "USD", "EUR", "GBP", "GHS", "KES", "ZAR", "INR", "JPY", "AUD", "CAD"].map((currency) => (
                  <label
                    key={currency}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-white/10 cursor-pointer hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={formData.supportedCurrencies.includes(currency)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            supportedCurrencies: [...formData.supportedCurrencies, currency],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            supportedCurrencies: formData.supportedCurrencies.filter((c) => c !== currency),
                          })
                        }
                      }}
                      className="w-3 h-3"
                    />
                    <span className="text-xs text-white">{currency}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Supported Methods */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Payment Methods</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "card", label: "Card" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "ussd", label: "USSD" },
                  { value: "mobile_money", label: "Mobile Money" },
                  { value: "apple_pay", label: "Apple Pay" },
                  { value: "google_pay", label: "Google Pay" },
                  { value: "paypal", label: "PayPal" },
                  { value: "crypto", label: "Crypto" },
                ].map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-white/10 cursor-pointer hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={formData.supportedMethods.includes(method.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            supportedMethods: [...formData.supportedMethods, method.value],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            supportedMethods: formData.supportedMethods.filter((m) => m !== method.value),
                          })
                        }
                      }}
                      className="w-3 h-3"
                    />
                    <span className="text-xs text-white">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this gateway..."
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isSubmitting ? "Saving..." : editingGateway ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
