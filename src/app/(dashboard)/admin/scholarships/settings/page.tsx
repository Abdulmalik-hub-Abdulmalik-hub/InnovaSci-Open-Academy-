"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  Bell,
  Mail,
  Shield,
  FileText,
  Clock,
  Users,
  Award,
  Globe,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function ScholarshipSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Application Settings
    allowDraftApplications: true,
    requireAccountForApplication: false,
    maxApplicationsPerUser: 3,
    applicationDeadlineWarning: 7, // days
    
    // Notification Settings
    sendConfirmationEmail: true,
    sendStatusUpdateEmail: true,
    sendReminderEmails: true,
    reminderDaysBeforeDeadline: 3,
    
    // Review Settings
    defaultScoringRubric: "",
    requireMultipleReviews: true,
    minReviewsRequired: 2,
    autoAssignReviewers: false,
    
    // Award Settings
    autoEnrollEnabled: false,
    createAccountOnAward: true,
    awardAcceptanceDays: 14,
    
    // Security Settings
    enableRateLimiting: true,
    enableSpamProtection: true,
    requireStrongPassword: false,
    
    // General
    defaultCurrency: "USD",
    defaultPageSize: 20,
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "scholarship",
          settings: settings
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to save settings")
      }
      
      toast({
        title: "Settings Saved",
        description: "Scholarship settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            Scholarship Settings
          </h1>
          <p className="text-white/60 mt-1">Configure scholarship system preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Application Settings */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Application Settings
            </CardTitle>
            <CardDescription className="text-white/60">
              Configure how applications are submitted and processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Allow Draft Applications</Label>
                <p className="text-white/50 text-sm">Let users save applications as drafts before submitting</p>
              </div>
              <Switch
                checked={settings.allowDraftApplications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowDraftApplications: checked }))}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Require Account for Application</Label>
                <p className="text-white/50 text-sm">Users must create an account before applying</p>
              </div>
              <Switch
                checked={settings.requireAccountForApplication}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireAccountForApplication: checked }))}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Max Applications Per User</Label>
                <p className="text-white/50 text-sm">Maximum number of applications a user can submit</p>
              </div>
              <Input
                type="number"
                value={settings.maxApplicationsPerUser}
                onChange={(e) => setSettings(prev => ({ ...prev, maxApplicationsPerUser: parseInt(e.target.value) || 1 }))}
                className="w-24 bg-white/5 border-white/10 text-white text-center"
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Deadline Warning (days)</Label>
                <p className="text-white/50 text-sm">Show warning banner before application deadline</p>
              </div>
              <Input
                type="number"
                value={settings.applicationDeadlineWarning}
                onChange={(e) => setSettings(prev => ({ ...prev, applicationDeadlineWarning: parseInt(e.target.value) || 7 }))}
                className="w-24 bg-white/5 border-white/10 text-white text-center"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              Notification Settings
            </CardTitle>
            <CardDescription className="text-white/60">
              Configure email and in-app notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Send Confirmation Email</Label>
                <p className="text-white/50 text-sm">Send confirmation when application is submitted</p>
              </div>
              <Switch
                checked={settings.sendConfirmationEmail}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sendConfirmationEmail: checked }))}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Send Status Update Emails</Label>
                <p className="text-white/50 text-sm">Notify applicants when their status changes</p>
              </div>
              <Switch
                checked={settings.sendStatusUpdateEmail}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sendStatusUpdateEmail: checked }))}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Send Deadline Reminders</Label>
                <p className="text-white/50 text-sm">Remind applicants about upcoming deadlines</p>
              </div>
              <Switch
                checked={settings.sendReminderEmails}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sendReminderEmails: checked }))}
              />
            </div>

            {settings.sendReminderEmails && (
              <>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Reminder Days Before Deadline</Label>
                    <p className="text-white/50 text-sm">When to send the reminder</p>
                  </div>
                  <Input
                    type="number"
                    value={settings.reminderDaysBeforeDeadline}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminderDaysBeforeDeadline: parseInt(e.target.value) || 3 }))}
                    className="w-24 bg-white/5 border-white/10 text-white text-center"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Review Settings */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Review Settings
            </CardTitle>
            <CardDescription className="text-white/60">
              Configure application review and scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Require Multiple Reviews</Label>
                <p className="text-white/50 text-sm">Require at least 2 reviewers to evaluate each application</p>
              </div>
              <Switch
                checked={settings.requireMultipleReviews}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireMultipleReviews: checked }))}
              />
            </div>

            {settings.requireMultipleReviews && (
              <>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Minimum Reviews Required</Label>
                    <p className="text-white/50 text-sm">Minimum number of reviews before final decision</p>
                  </div>
                  <Input
                    type="number"
                    value={settings.minReviewsRequired}
                    onChange={(e) => setSettings(prev => ({ ...prev, minReviewsRequired: parseInt(e.target.value) || 2 }))}
                    className="w-24 bg-white/5 border-white/10 text-white text-center"
                  />
                </div>
              </>
            )}

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto-Assign Reviewers</Label>
                <p className="text-white/50 text-sm">Automatically assign reviewers to applications</p>
              </div>
              <Switch
                checked={settings.autoAssignReviewers}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAssignReviewers: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Award Settings */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Award Settings
            </CardTitle>
            <CardDescription className="text-white/60">
              Configure award issuance and enrollment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Enable Auto-Enrollment</Label>
                <p className="text-white/50 text-sm">Automatically enroll award recipients</p>
              </div>
              <Switch
                checked={settings.autoEnrollEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoEnrollEnabled: checked }))}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Create Account on Award</Label>
                <p className="text-white/50 text-sm">Automatically create platform account for award recipients</p>
              </div>
              <Switch
                checked={settings.createAccountOnAward}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, createAccountOnAward: checked }))}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Award Acceptance Deadline (days)</Label>
                <p className="text-white/50 text-sm">Days awarded recipients have to accept their award</p>
              </div>
              <Input
                type="number"
                value={settings.awardAcceptanceDays}
                onChange={(e) => setSettings(prev => ({ ...prev, awardAcceptanceDays: parseInt(e.target.value) || 14 }))}
                className="w-24 bg-white/5 border-white/10 text-white text-center"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              Security Settings
            </CardTitle>
            <CardDescription className="text-white/60">
              Configure security and spam protection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Enable Rate Limiting</Label>
                <p className="text-white/50 text-sm">Limit the number of applications per IP address</p>
              </div>
              <Switch
                checked={settings.enableRateLimiting}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableRateLimiting: checked }))}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Enable Spam Protection</Label>
                <p className="text-white/50 text-sm">Detect and block suspicious applications</p>
              </div>
              <Switch
                checked={settings.enableSpamProtection}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSpamProtection: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              General Settings
            </CardTitle>
            <CardDescription className="text-white/60">
              General platform preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Default Currency</Label>
                <p className="text-white/50 text-sm">Default currency for scholarships</p>
              </div>
              <Select
                value={settings.defaultCurrency}
                onValueChange={(value) => setSettings(prev => ({ ...prev, defaultCurrency: value }))}
              >
                <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Default Page Size</Label>
                <p className="text-white/50 text-sm">Number of items per page in lists</p>
              </div>
              <Select
                value={settings.defaultPageSize.toString()}
                onValueChange={(value) => setSettings(prev => ({ ...prev, defaultPageSize: parseInt(value) }))}
              >
                <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
