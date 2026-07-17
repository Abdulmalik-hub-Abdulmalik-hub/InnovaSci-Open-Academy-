"use client"

import { useState } from "react"
import { 
  Settings, 
  Bell,
  Mail,
  Shield,
  FileText,
  Database,
  Save,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"

export default function ScholarshipsSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    // General
    autoApproval: false,
    requireDocuments: true,
    maxApplicationsPerUser: 3,
    applicationDeadlineWarning: 7,
    
    // Notifications
    emailOnSubmit: true,
    emailOnStatusChange: true,
    emailOnApproval: true,
    emailOnRejection: true,
    inAppNotifications: true,
    
    // Review
    requireMultipleReviewers: true,
    minReviewers: 2,
    allowSelfAssignment: false,
    autoAssignReviewers: false,
    
    // Auto-enrollment
    autoEnrollApproved: false,
    autoCreateAccount: true,
    sendWelcomeEmail: true,
    
    // Security
    enableCaptcha: true,
    rateLimitPerHour: 10,
    requireEmailVerification: true,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scholarship Settings</h1>
          <p className="text-white/60">Configure scholarship system behavior</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-white/60" />
            <CardTitle className="text-white">General Settings</CardTitle>
          </div>
          <CardDescription className="text-white/60">
            Basic scholarship application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-approval Mode</Label>
              <p className="text-sm text-white/60">Automatically approve eligible applications</p>
            </div>
            <Switch 
              checked={settings.autoApproval}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoApproval: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Require Document Upload</Label>
              <p className="text-sm text-white/60">Make document uploads mandatory for submission</p>
            </div>
            <Switch 
              checked={settings.requireDocuments}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireDocuments: checked }))}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="maxApplications" className="text-white">Max Applications Per User</Label>
              <Input
                id="maxApplications"
                type="number"
                value={settings.maxApplicationsPerUser}
                onChange={(e) => setSettings(prev => ({ ...prev, maxApplicationsPerUser: parseInt(e.target.value) || 1 }))}
                className="bg-white/5 border-white/20 text-white mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deadlineWarning" className="text-white">Deadline Warning (days)</Label>
              <Input
                id="deadlineWarning"
                type="number"
                value={settings.applicationDeadlineWarning}
                onChange={(e) => setSettings(prev => ({ ...prev, applicationDeadlineWarning: parseInt(e.target.value) || 1 }))}
                className="bg-white/5 border-white/20 text-white mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-white/60" />
            <CardTitle className="text-white">Notification Settings</CardTitle>
          </div>
          <CardDescription className="text-white/60">
            Configure when and how notifications are sent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email on Submission</Label>
              <p className="text-sm text-white/60">Send email when application is submitted</p>
            </div>
            <Switch 
              checked={settings.emailOnSubmit}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailOnSubmit: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email on Status Change</Label>
              <p className="text-sm text-white/60">Send email when application status changes</p>
            </div>
            <Switch 
              checked={settings.emailOnStatusChange}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailOnStatusChange: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email on Approval</Label>
              <p className="text-sm text-white/60">Send congratulations email on approval</p>
            </div>
            <Switch 
              checked={settings.emailOnApproval}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailOnApproval: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email on Rejection</Label>
              <p className="text-sm text-white/60">Send notification on application rejection</p>
            </div>
            <Switch 
              checked={settings.emailOnRejection}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailOnRejection: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">In-App Notifications</Label>
              <p className="text-sm text-white/60">Show in-app notifications for status updates</p>
            </div>
            <Switch 
              checked={settings.inAppNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, inAppNotifications: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Review Settings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-white/60" />
            <CardTitle className="text-white">Review Settings</CardTitle>
          </div>
          <CardDescription className="text-white/60">
            Configure application review workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Require Multiple Reviewers</Label>
              <p className="text-sm text-white/60">Require at least 2 reviewers per application</p>
            </div>
            <Switch 
              checked={settings.requireMultipleReviewers}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireMultipleReviewers: checked }))}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="minReviewers" className="text-white">Minimum Reviewers</Label>
              <Input
                id="minReviewers"
                type="number"
                value={settings.minReviewers}
                onChange={(e) => setSettings(prev => ({ ...prev, minReviewers: parseInt(e.target.value) || 1 }))}
                className="bg-white/5 border-white/20 text-white mt-1"
                disabled={!settings.requireMultipleReviewers}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Allow Self-Assignment</Label>
              <p className="text-sm text-white/60">Allow reviewers to assign themselves to applications</p>
            </div>
            <Switch 
              checked={settings.allowSelfAssignment}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowSelfAssignment: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-Assign Reviewers</Label>
              <p className="text-sm text-white/60">Automatically assign reviewers to new applications</p>
            </div>
            <Switch 
              checked={settings.autoAssignReviewers}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAssignReviewers: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Enrollment Settings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-white/60" />
            <CardTitle className="text-white">Auto-Enrollment Settings</CardTitle>
          </div>
          <CardDescription className="text-white/60">
            Configure automatic enrollment for approved applicants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-Enroll Approved Applicants</Label>
              <p className="text-sm text-white/60">Automatically enroll approved applicants in courses</p>
            </div>
            <Switch 
              checked={settings.autoEnrollApproved}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoEnrollApproved: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Create Platform Account</Label>
              <p className="text-sm text-white/60">Automatically create account for approved applicants</p>
            </div>
            <Switch 
              checked={settings.autoCreateAccount}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCreateAccount: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Send Welcome Email</Label>
              <p className="text-sm text-white/60">Send welcome email with login credentials</p>
            </div>
            <Switch 
              checked={settings.sendWelcomeEmail}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sendWelcomeEmail: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-white/60" />
            <CardTitle className="text-white">Security Settings</CardTitle>
          </div>
          <CardDescription className="text-white/60">
            Protect against spam and abuse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Enable CAPTCHA</Label>
              <p className="text-sm text-white/60">Show CAPTCHA on application form</p>
            </div>
            <Switch 
              checked={settings.enableCaptcha}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableCaptcha: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Require Email Verification</Label>
              <p className="text-sm text-white/60">Verify email before allowing application</p>
            </div>
            <Switch 
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
            />
          </div>

          <div>
            <Label htmlFor="rateLimit" className="text-white">Rate Limit (per hour)</Label>
            <Input
              id="rateLimit"
              type="number"
              value={settings.rateLimitPerHour}
              onChange={(e) => setSettings(prev => ({ ...prev, rateLimitPerHour: parseInt(e.target.value) || 1 }))}
              className="bg-white/5 border-white/20 text-white mt-1"
            />
            <p className="text-sm text-white/60 mt-1">Maximum applications per IP address per hour</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
