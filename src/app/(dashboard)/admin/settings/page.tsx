"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSettings, Setting } from "@/hooks/useSettings"
import {
  Settings as SettingsIcon, Globe, Palette, Link2, Shield, Mail,
  CreditCard, HardDrive, Save, RefreshCw, Loader2, Check,
  AlertTriangle, Eye, EyeOff, Server
} from "lucide-react"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  general: <Globe className="h-4 w-4" />,
  appearance: <Palette className="h-4 w-4" />,
  integrations: <Link2 className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  storage: <HardDrive className="h-4 w-4" />,
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  appearance: "Appearance",
  integrations: "Integrations",
  security: "Security",
  email: "Email",
  payments: "Payments",
  storage: "Storage",
}

function SettingField({ 
  setting, 
  onChange,
  disabled 
}: { 
  setting: Setting
  onChange: (key: string, value: string) => void
  disabled: boolean
}) {
  const [showValue, setShowValue] = useState(false)
  const [localValue, setLocalValue] = useState(setting.value)

  useEffect(() => {
    setLocalValue(setting.value)
  }, [setting.value])

  const handleBlur = () => {
    if (localValue !== setting.value) {
      onChange(setting.key, localValue)
    }
  }

  if (setting.isEncrypted && !showValue) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-white/60">{setting.key}</label>
          {setting.description && (
            <span className="text-xs text-white/40">{setting.description}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value="••••••••••••"
            disabled
            className="bg-white/5 border-white/10 text-white/40"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowValue(true)}
            className="border-white/20 text-white/60 hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (setting.type === "boolean") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-white/60">{setting.key}</label>
          {setting.description && (
            <span className="text-xs text-white/40">{setting.description}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const newValue = localValue === "true" ? "false" : "true"
              setLocalValue(newValue)
              onChange(setting.key, newValue)
            }}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localValue === "true" ? "bg-green-500" : "bg-white/20"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localValue === "true" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-white/60">
            {localValue === "true" ? "Enabled" : "Disabled"}
          </span>
          {setting.isEncrypted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowValue(false)}
              className="text-white/40 hover:text-white"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (setting.type === "number") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-white/60">{setting.key}</label>
          {setting.description && (
            <span className="text-xs text-white/40">{setting.description}</span>
          )}
        </div>
        <Input
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/60">{setting.key}</label>
        {setting.description && (
          <span className="text-xs text-white/40">{setting.description}</span>
        )}
      </div>
      <div className="relative">
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className="bg-white/5 border-white/10 text-white pr-10"
          type={setting.isEncrypted && !showValue ? "password" : "text"}
        />
        {setting.isEncrypted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowValue(!showValue)}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const { settings, loading, saving, error, categories, fetchSettings, bulkUpdate, initializeSettings, clearError } = useSettings()
  const [activeTab, setActiveTab] = useState("general")
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [initializing, setInitializing] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSettingChange = (key: string, value: string) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) return

    const settingsToUpdate = Object.entries(pendingChanges).map(([key, value]) => ({
      key,
      value
    }))

    const result = await bulkUpdate(settingsToUpdate)
    
    if (result.success) {
      setPendingChanges({})
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleInitialize = async () => {
    setInitializing(true)
    await initializeSettings()
    setInitializing(false)
  }

  const filteredCategories = categories.length > 0 
    ? categories 
    : Object.keys(CATEGORY_LABELS)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
            <p className="text-white/60">Configure your platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {categories.length === 0 && (
            <Button
              variant="outline"
              onClick={handleInitialize}
              disabled={initializing}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {initializing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Server className="h-4 w-4 mr-2" />
              )}
              Initialize Defaults
            </Button>
          )}
          <Button
            onClick={() => fetchSettings()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError} className="text-red-400">
              <EyeOff className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {saved && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-400" />
            <p className="text-green-400">Settings saved successfully!</p>
          </CardContent>
        </Card>
      )}

      {/* Pending Changes Warning */}
      {Object.keys(pendingChanges).length > 0 && (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-400">
                You have {Object.keys(pendingChanges).length} unsaved change{Object.keys(pendingChanges).length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingChanges({})}
                className="text-white/60"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6">
        {/* Tabs Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Card className="bg-[#1a1a2e] border-white/10 sticky top-6">
            <CardContent className="p-2">
              {filteredCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === category
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {CATEGORY_ICONS[category] || <SettingsIcon className="h-4 w-4" />}
                  <span>{CATEGORY_LABELS[category] || category}</span>
                  {category === "general" && settings.general?.find(s => s.key === "maintenance_mode")?.value === "true" && (
                    <Badge className="ml-auto bg-red-500/20 text-red-400 text-xs">
                      OFF
                    </Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {loading && Object.keys(settings).length === 0 ? (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </CardContent>
            </Card>
          ) : settings[activeTab] ? (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {CATEGORY_ICONS[activeTab] || <SettingsIcon className="h-5 w-5" />}
                  {CATEGORY_LABELS[activeTab] || activeTab} Settings
                </CardTitle>
                <CardDescription className="text-white/40">
                  Configure your {CATEGORY_LABELS[activeTab]?.toLowerCase() || activeTab} settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings[activeTab].map((setting) => (
                  <SettingField
                    key={setting.key}
                    setting={setting}
                    onChange={handleSettingChange}
                    disabled={saving}
                  />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardContent className="p-8 text-center">
                <SettingsIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/50">No settings in this category</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}