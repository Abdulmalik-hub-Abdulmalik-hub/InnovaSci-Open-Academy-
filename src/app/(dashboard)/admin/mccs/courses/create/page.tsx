"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CourseCreationWizard } from "@/components/admin/mccs/CourseCreationWizard"
import { Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface DifficultyLevel {
  id: string
  name: string
  slug: string
  categoryId?: string
}

interface PrerequisiteCourse {
  id: string
  title: string
}

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([])
  const [prerequisites, setPrerequisites] = useState<PrerequisiteCourse[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch("/api/mccs/categories")
        const categoriesData = await categoriesRes.json()
        if (categoriesData.success) {
          setCategories(categoriesData.data.categories)
        }

        // Fetch difficulty levels
        const levelsRes = await fetch("/api/mccs/difficulty-levels")
        const levelsData = await levelsRes.json()
        if (levelsData.success) {
          setDifficultyLevels(levelsData.data.difficultyLevels)
        }

        // Fetch available courses for prerequisites
        const coursesRes = await fetch("/api/mccs/courses?status=PUBLISHED&limit=100")
        const coursesData = await coursesRes.json()
        if (coursesData.success) {
          setPrerequisites(
            coursesData.data.courses.map((c: { id: string; title: string }) => ({
              id: c.id,
              title: c.title,
            }))
          )
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSave = () => {
    router.push("/admin/mccs/courses")
    router.refresh()
  }

  const handleCancel = () => {
    router.push("/admin/mccs/courses")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <CourseCreationWizard
      categories={categories}
      difficultyLevels={difficultyLevels}
      prerequisites={prerequisites}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
