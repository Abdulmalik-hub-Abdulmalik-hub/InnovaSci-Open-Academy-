'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Star,
} from 'lucide-react'

interface Rubric {
  id: string
  name: string
  description: string | null
  type: string
  courseId: string | null
  difficultyLevel: string | null
  criteria: any[]
  isActive: boolean
  isDefault: boolean
  createdAt: string
}

const rubricTypeLabels: Record<string, { label: string; color: string }> = {
  MINI_PROJECT: { label: 'Mini Project', color: 'bg-purple-500/20 text-purple-400' },
  DIFFICULTY_CAPSTONE: { label: 'Capstone', color: 'bg-amber-500/20 text-amber-400' },
  PROFESSIONAL_CAPSTONE: { label: 'Professional', color: 'bg-rose-500/20 text-rose-400' },
  PRACTICAL_EXERCISE: { label: 'Practical', color: 'bg-cyan-500/20 text-cyan-400' },
}

export default function RubricsPage() {
  const { toast } = useToast()
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'MINI_PROJECT',
    difficultyLevel: '',
    isDefault: false,
  })
  const [criteria, setCriteria] = useState([
    { name: '', weight: 100, description: '' }
  ])

  useEffect(() => {
    fetchRubrics()
  }, [typeFilter])

  const fetchRubrics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)

      const response = await fetch(`/api/admin/projects/rubrics?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setRubrics(result.data.rubrics)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch rubrics',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching rubrics:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch rubrics',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'MINI_PROJECT',
      difficultyLevel: '',
      isDefault: false,
    })
    setCriteria([{ name: '', weight: 100, description: '' }])
  }

  const handleEdit = (rubric: Rubric) => {
    setEditingRubric(rubric)
    setFormData({
      name: rubric.name,
      description: rubric.description || '',
      type: rubric.type,
      difficultyLevel: rubric.difficultyLevel || '',
      isDefault: rubric.isDefault,
    })
    // Parse criteria if it's a string
    let parsedCriteria = rubric.criteria
    if (typeof rubric.criteria === 'string') {
      try {
        parsedCriteria = JSON.parse(rubric.criteria)
      } catch {
        parsedCriteria = []
      }
    }
    setCriteria(parsedCriteria.length > 0 ? parsedCriteria : [{ name: '', weight: 100, description: '' }])
    setCreateDialogOpen(true)
  }

  const handleDelete = async (rubricId: string) => {
    if (!confirm('Are you sure you want to delete this rubric?')) return

    try {
      const response = await fetch(`/api/admin/projects/rubrics/${rubricId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        toast({ title: 'Success', description: 'Rubric deleted successfully' })
        fetchRubrics()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete rubric',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rubric',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async () => {
    // Validate
    if (!formData.name || formData.name.trim().length < 2) {
      toast({ title: 'Error', description: 'Name must be at least 2 characters', variant: 'destructive' })
      return
    }

    const validCriteria = criteria.filter(c => c.name && c.weight > 0)
    if (validCriteria.length === 0) {
      toast({ title: 'Error', description: 'At least one criteria is required', variant: 'destructive' })
      return
    }

    const totalWeight = validCriteria.reduce((sum, c) => sum + c.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      toast({ title: 'Error', description: 'Criteria weights must sum to 100%', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const url = editingRubric
        ? `/api/admin/projects/rubrics/${editingRubric.id}`
        : '/api/admin/projects/rubrics'
      const method = editingRubric ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          criteria: validCriteria,
          difficultyLevel: formData.difficultyLevel || null,
        }),
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: editingRubric ? 'Rubric updated successfully' : 'Rubric created successfully',
        })
        setCreateDialogOpen(false)
        setEditingRubric(null)
        resetForm()
        fetchRubrics()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save rubric',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save rubric',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const addCriteria = () => {
    setCriteria([...criteria, { name: '', weight: 0, description: '' }])
  }

  const removeCriteria = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index))
    }
  }

  const updateCriteria = (index: number, field: string, value: any) => {
    const updated = [...criteria]
    updated[index] = { ...updated[index], [field]: value }
    setCriteria(updated)
  }

  const filteredRubrics = rubrics.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0)

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Project Rubrics</h1>
          <p className="text-muted-foreground">Create and manage grading rubrics for projects</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setEditingRubric(null)
            setCreateDialogOpen(true)
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Rubric
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rubrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="MINI_PROJECT">Mini Project</option>
          <option value="DIFFICULTY_CAPSTONE">Capstone</option>
          <option value="PROFESSIONAL_CAPSTONE">Professional</option>
          <option value="PRACTICAL_EXERCISE">Practical</option>
        </select>
      </div>

      {/* Rubrics Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : filteredRubrics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rubrics found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter
                ? 'Try adjusting your filters'
                : 'Create your first rubric to get started'}
            </p>
            {!searchQuery && !typeFilter && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rubric
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRubrics.map((rubric) => {
            const typeConfig = rubricTypeLabels[rubric.type] || rubricTypeLabels.MINI_PROJECT
            let criteriaArray = rubric.criteria
            if (typeof rubric.criteria === 'string') {
              try {
                criteriaArray = JSON.parse(rubric.criteria)
              } catch {
                criteriaArray = []
              }
            }

            return (
              <Card key={rubric.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {rubric.name}
                        {rubric.isDefault && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </CardTitle>
                      {rubric.description && (
                        <CardDescription className="mt-2 line-clamp-2">
                          {rubric.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={typeConfig.color}>
                      {typeConfig.label}
                    </Badge>
                    {rubric.difficultyLevel && (
                      <Badge variant="outline">{rubric.difficultyLevel}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {Array.isArray(criteriaArray) ? criteriaArray.length : 0} Criteria
                    </div>
                    {Array.isArray(criteriaArray) && criteriaArray.slice(0, 3).map((c: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate">{c.name}</span>
                        <Badge variant="secondary">{c.weight}%</Badge>
                      </div>
                    ))}
                    {Array.isArray(criteriaArray) && criteriaArray.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{criteriaArray.length - 3} more criteria
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(rubric)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rubric.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRubric ? 'Edit Rubric' : 'Create New Rubric'}
            </DialogTitle>
            <DialogDescription>
              Define the criteria and weights for grading projects
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rubric Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Mini Project Grading Rubric"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this rubric is used for..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="MINI_PROJECT">Mini Project</option>
                  <option value="DIFFICULTY_CAPSTONE">Difficulty Capstone</option>
                  <option value="PROFESSIONAL_CAPSTONE">Professional Capstone</option>
                  <option value="PRACTICAL_EXERCISE">Practical Exercise</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <select
                  id="difficultyLevel"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                >
                  <option value="">Any</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isDefault">Set as default rubric for this type</Label>
            </div>

            {/* Criteria */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Criteria * (Weights must sum to 100%)</Label>
                <div className={`text-sm font-medium ${Math.abs(totalWeight - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                  Total: {totalWeight}%
                </div>
              </div>

              {criteria.map((c, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Criteria name (e.g., Code Quality)"
                      value={c.name}
                      onChange={(e) => updateCriteria(index, 'name', e.target.value)}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={c.description}
                      onChange={(e) => updateCriteria(index, 'description', e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Weight %"
                      value={c.weight}
                      onChange={(e) => updateCriteria(index, 'weight', parseInt(e.target.value) || 0)}
                    />
                    <span className="text-xs text-muted-foreground">Weight %</span>
                  </div>
                  {criteria.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriteria(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addCriteria}>
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || Math.abs(totalWeight - 100) >= 0.01}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingRubric ? 'Update Rubric' : 'Create Rubric'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
