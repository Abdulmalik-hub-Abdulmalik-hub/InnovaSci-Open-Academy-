"use client"

import { useState } from "react"
import { useStudentProfile } from "@/hooks/useStudentProfile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Lock, Loader2, Eye, EyeOff, Check, X } from "lucide-react"

export default function SecuritySettingsPage() {
  const { updatePassword } = useStudentProfile()
  const { toast } = useToast()
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Password validation
  const passwordErrors = {
    length: newPassword.length >= 8,
    match: newPassword === confirmPassword && newPassword.length > 0
  }

  const isPasswordValid = passwordErrors.length && passwordErrors.match

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      toast({
        title: "Invalid password",
        description: "Please ensure your password meets the requirements",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    const result = await updatePassword(currentPassword, newPassword, confirmPassword)
    setSaving(false)

    if (result.success) {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully"
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      toast({
        title: "Update failed",
        description: result.error || "Failed to update password",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <div className="relative mt-1">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium">New Password</label>
              <div className="relative mt-1">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Password Requirements
              </p>
              <div className="flex items-center gap-2 text-sm">
                {passwordErrors.length ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" />
                )}
                <span className={passwordErrors.length ? "text-green-600" : "text-gray-500"}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {passwordErrors.match ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" />
                )}
                <span className={passwordErrors.match ? "text-green-600" : "text-gray-500"}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium">Confirm New Password</label>
              <div className="relative mt-1">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || !isPasswordValid || !currentPassword}
                className="bg-brand-purple hover:bg-brand-purple/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Security Tips
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use a strong, unique password that you don't use elsewhere</li>
            <li>• Include a mix of letters, numbers, and special characters</li>
            <li>• Consider using a password manager to generate and store passwords</li>
            <li>• Never share your password with anyone</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}