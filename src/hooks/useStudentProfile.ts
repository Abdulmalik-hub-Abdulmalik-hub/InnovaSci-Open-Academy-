"use client"

import { useState, useEffect, useCallback } from "react"

export interface ProfileStats {
  coursesCompleted: number
  totalHoursLearned: number
  memberSince: string
}

export interface UserProfile {
  id: string
  fullName: string | null
  username: string | null
  bio: string | null
  avatarUrl: string | null
  phone: string | null
  country: string | null
  city: string | null
  gender: string | null
}

export interface UserData {
  id: string
  email: string
  createdAt: string
  role: string
}

export function useStudentProfile() {
  const [user, setUser] = useState<UserData | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/student/profile")
      const data = await response.json()
      
      if (data.success) {
        setUser(data.data.user)
        setProfile(data.data.profile)
        setStats(data.data.stats)
      } else {
        setError(data.error || "Failed to fetch profile")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = async (updates: { fullName?: string; bio?: string; avatarUrl?: string }) => {
    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProfile(prev => prev ? { ...prev, ...data.data.profile } : data.data.profile)
        return { success: true }
      }
      
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: "Failed to update profile" }
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/student/profile", {
        method: "POST",
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProfile(prev => prev ? { ...prev, avatarUrl: data.data.avatarUrl } : null)
        return { success: true, avatarUrl: data.data.avatarUrl }
      }
      
      return { success: false, error: data.error }
    } catch (err) {
      return { success: false, error: "Failed to upload avatar" }
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const response = await fetch("/api/student/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      })
      
      const data = await response.json()
      return data
    } catch (err) {
      return { success: false, error: "Failed to update password" }
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    user,
    profile,
    stats,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    updatePassword
  }
}