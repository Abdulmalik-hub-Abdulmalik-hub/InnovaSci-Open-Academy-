"use client"

import { useState, useEffect, useCallback } from "react"

export interface User {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  profile: {
    id: string
    fullName: string | null
    username: string | null
    avatarUrl: string | null
    phone: string | null
    country: string | null
    bio: string | null
  } | null
  enrollments: number
  certificates: number
}

export interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  fetchUsers: (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }) => Promise<void>
  createUser: (data: {
    email: string
    password: string
    role?: string
    fullName?: string
    username?: string
  }) => Promise<{ success: boolean; error?: string }>
  updateUser: (id: string, data: {
    email?: string
    role?: string
    status?: string
    fullName?: string
    username?: string
    phone?: string
    country?: string
    bio?: string
  }) => Promise<{ success: boolean; error?: string }>
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>
  refresh: () => void
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    role: "all",
    status: "all",
  })

  const fetchUsers = useCallback(async (params?: Partial<typeof queryParams>) => {
    const query = { ...queryParams, ...params }
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      searchParams.set("page", String(query.page || 1))
      searchParams.set("limit", String(query.limit || 20))
      if (query.search) searchParams.set("search", query.search)
      if (query.role && query.role !== "all") searchParams.set("role", query.role)
      if (query.status && query.status !== "all") searchParams.set("status", query.status)

      const response = await fetch(`/api/admin/users?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch users")
      }

      setUsers(result.data.users)
      setPagination(result.data.pagination)
    } catch (err) {
      console.error("Users fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  const createUser = useCallback(async (data: {
    email: string
    password: string
    role?: string
    fullName?: string
    username?: string
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      // Refresh the list
      await fetchUsers()
      return { success: true }
    } catch (err) {
      console.error("Create user error:", err)
      return { success: false, error: "Failed to create user" }
    }
  }, [fetchUsers])

  const updateUser = useCallback(async (id: string, data: {
    email?: string
    role?: string
    status?: string
    fullName?: string
    username?: string
    phone?: string
    country?: string
    bio?: string
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      // Update the user in the local state
      setUsers(prev => prev.map(u => 
        u.id === id 
          ? { ...u, ...result.data.user, profile: { ...u.profile, ...result.data.profile } }
          : u
      ))
      return { success: true }
    } catch (err) {
      console.error("Update user error:", err)
      return { success: false, error: "Failed to update user" }
    }
  }, [])

  const deleteUser = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error }
      }

      // Remove the user from local state
      setUsers(prev => prev.filter(u => u.id !== id))
      return { success: true }
    } catch (err) {
      console.error("Delete user error:", err)
      return { success: false, error: "Failed to delete user" }
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [queryParams])

  const refresh = useCallback(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    refresh,
  }
}
