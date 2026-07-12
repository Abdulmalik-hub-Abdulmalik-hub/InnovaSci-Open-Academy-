"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, Settings, FileBadge, Lock, CheckCircle, Save
} from "lucide-react"
import Link from "next/link"

export default function CertificateSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Link href="/admin/certificates" className="text-white/60 hover:text-white">
            Certificates
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-white">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-2">Certificate Settings</h1>
        <p className="text-white/60 mt-1">Configure system-wide certificate settings</p>
      </div>

      {/* General Settings */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-400" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Category Certificate Prefix</label>
              <Input 
                defaultValue="CAT-CERT"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-white/40 text-xs">Prefix for category certificate codes (e.g., CAT-CERT-2026-0001)</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Domain Certificate Prefix</label>
              <Input 
                defaultValue="DOM-CERT"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-white/40 text-xs">Prefix for domain certificate codes (e.g., DOM-CERT-2026-0001)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Verification URL Format</label>
              <Input 
                defaultValue="/verify/{code}"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-white/40 text-xs">URL pattern for certificate verification</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Auto-Issue on Completion</label>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <p className="text-white/40 text-xs">Automatically issue certificates when eligibility is met</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Require Identity Verification</label>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  Optional
                </Badge>
              </div>
              <p className="text-white/40 text-xs">Require ID verification before certificate issuance</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Revocation Reason Required</label>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <p className="text-white/40 text-xs">Require reason when revoking certificates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Allow Re-issuance</label>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                  Disabled
                </Badge>
              </div>
              <p className="text-white/40 text-xs">Allow re-issuing revoked certificates</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">QR Code Verification</label>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <p className="text-white/40 text-xs">Include QR codes for easy verification</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Settings */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileBadge className="h-5 w-5 text-amber-400" />
            Template Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Default Category Template</label>
              <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                <option value="">Select a template</option>
              </select>
              <p className="text-white/40 text-xs">Template used for category certificates by default</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Default Domain Template</label>
              <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                <option value="">Select a template</option>
              </select>
              <p className="text-white/40 text-xs">Template used for domain certificates by default</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">CEO Signature Image URL</label>
              <Input 
                placeholder="https://example.com/signatures/ceo.png"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-white/40 text-xs">URL to CEO signature image for certificates</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Academic Director Signature URL</label>
              <Input 
                placeholder="https://example.com/signatures/director.png"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-white/40 text-xs">URL to Academic Director signature image</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Official Seal Image URL</label>
            <Input 
              placeholder="https://example.com/seals/official.png"
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-white/40 text-xs">URL to official academy seal image</p>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-400" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Manual Issuance Allowed</label>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <p className="text-white/40 text-xs">Allow admins to manually issue certificates</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Bulk Issuance Allowed</label>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <p className="text-white/40 text-xs">Allow bulk certificate issuance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" className="border-white/20 text-white">
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-gradient-to-r from-purple-500 to-blue-500"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
