"use client"

import { useState } from "react"
import Image from "next/image"
import { useStudentProfile } from "@/hooks/useStudentProfile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  User, BookOpen, Clock, Calendar, Upload, Loader2, 
  CheckCircle2, XCircle
} from "lucide-react"

export default function ProfileSettingsPage() {
  const { user, profile, stats, loading, updateProfile, uploadAvatar } = useStudentProfile()
  const { toast } = useToast()
  
  const [fullName, setFullName] = useState(profile?.fullName || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Update local state when profile loads
  useState(() => {
    if (profile) {
      setFullName(profile.fullName || "")
      setBio(profile.bio || "")
    }
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (500KB)
    if (file.size > 500 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be under 500KB",
        variant: "destructive"
      })
      return
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, GIF, and WebP images are allowed",
        variant: "destructive"
      })
      return
    }

    setUploadingAvatar(true)
    const result = await uploadAvatar(file)
    setUploadingAvatar(false)

    if (result.success) {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated"
      })
    } else {
      toast({
        title: "Upload failed",
        description: result.error || "Failed to upload image",
        variant: "destructive"
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await updateProfile({ fullName, bio })
    setSaving(false)

    if (result.success) {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved"
      })
    } else {
      toast({
        title: "Update failed",
        description: result.error || "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.coursesCompleted || 0}</p>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-full bg-brand-purple/10 dark:bg-brand-purple/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-brand-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalHoursLearned || 0}h</p>
              <p className="text-sm text-muted-foreground">Total Hours Learned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats?.memberSince 
                  ? new Date(stats.memberSince).toLocaleDateString("en-US", { 
                      month: "short", 
                      year: "numeric" 
                    })
                  : "-"
                }
              </p>
              <p className="text-sm text-muted-foreground">Member Since</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-brand-purple hover:bg-brand-purple/90 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 text-white" />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <div>
              <p className="font-medium">Profile Picture</p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, GIF, or WebP. Max 500KB.
              </p>
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input
              value={user?.email || ""}
              disabled
              className="mt-1 bg-gray-50 dark:bg-gray-800"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your display name"
              className="mt-1"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {fullName.length}/100 characters
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="mt-1 resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {bio.length}/500 characters
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}