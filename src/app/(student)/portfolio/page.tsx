"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Briefcase,
  Globe,
  Lock,
  Users,
  Eye,
  Plus,
  ExternalLink,
  Github,
  Trash2,
  Edit,
  Copy,
  Check,
  Loader2,
  Code2,
  Layers,
  FileText,
  X,
  Upload,
  Link as LinkIcon,
} from "lucide-react"
import toast from "react-hot-toast"

interface PortfolioEntry {
  id: string
  title: string
  description: string | null
  liveUrl: string | null
  githubUrl: string | null
  demoVideoUrl: string | null
  techStack: string[]
  screenshots: string[] | null
  rationale: string | null
  visibility: string
  publicSlug: string | null
  isPublished: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

const visibilityConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PRIVATE: { 
    label: "Private", 
    icon: <Lock className="h-3 w-3" />,
    color: "bg-gray-100 text-gray-700 border-gray-300"
  },
  PUBLIC: { 
    label: "Public", 
    icon: <Globe className="h-3 w-3" />,
    color: "bg-green-100 text-green-700 border-green-300"
  },
  ACADEMY_ONLY: { 
    label: "Academy Only", 
    icon: <Users className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-700 border-blue-300"
  },
}

export default function PortfolioPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<PortfolioEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid")
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<PortfolioEntry | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    liveUrl: "",
    githubUrl: "",
    demoVideoUrl: "",
    techStack: "",
    rationale: "",
    visibility: "PRIVATE",
  })
  
  // Import options
  const [importOptions, setImportOptions] = useState<{
    courseId?: string
    miniProjectId?: string
    capstoneId?: string
  } | null>(null)
  
  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch("/api/student/portfolio")
      const data = await response.json()
      
      if (data.success) {
        setEntries(data.data)
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])
  
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      liveUrl: "",
      githubUrl: "",
      demoVideoUrl: "",
      techStack: "",
      rationale: "",
      visibility: "PRIVATE",
    })
  }
  
  const openEditDialog = (entry: PortfolioEntry) => {
    setSelectedEntry(entry)
    setFormData({
      title: entry.title,
      description: entry.description || "",
      liveUrl: entry.liveUrl || "",
      githubUrl: entry.githubUrl || "",
      demoVideoUrl: entry.demoVideoUrl || "",
      techStack: entry.techStack.join(", "),
      rationale: entry.rationale || "",
      visibility: entry.visibility,
    })
    setEditDialogOpen(true)
  }
  
  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }
    
    setSaving(true)
    
    try {
      const techStackArray = formData.techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      
      const response = await fetch("/api/student/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          techStack: techStackArray,
          ...importOptions,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Portfolio entry created!")
        setCreateDialogOpen(false)
        resetForm()
        setImportOptions(null)
        fetchEntries()
      }
    } catch (error) {
      console.error("Error creating entry:", error)
      toast.error("Failed to create entry")
    } finally {
      setSaving(false)
    }
  }
  
  const handleUpdate = async () => {
    if (!selectedEntry || !formData.title.trim()) {
      toast.error("Title is required")
      return
    }
    
    setSaving(true)
    
    try {
      const techStackArray = formData.techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      
      const response = await fetch(`/api/student/portfolio/${selectedEntry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          techStack: techStackArray,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Portfolio entry updated!")
        setEditDialogOpen(false)
        resetForm()
        fetchEntries()
      }
    } catch (error) {
      console.error("Error updating entry:", error)
      toast.error("Failed to update entry")
    } finally {
      setSaving(false)
    }
  }
  
  const handleDelete = async (entry: PortfolioEntry) => {
    if (!confirm("Are you sure you want to delete this portfolio entry?")) return
    
    try {
      const response = await fetch(`/api/student/portfolio/${entry.id}`, {
        method: "DELETE",
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Entry deleted")
        fetchEntries()
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast.error("Failed to delete entry")
    }
  }
  
  const handleCopyLink = (entry: PortfolioEntry) => {
    if (!entry.publicSlug) {
      toast.error("This entry is not public")
      return
    }
    
    const url = `${window.location.origin}/portfolio/${entry.publicSlug}`
    navigator.clipboard.writeText(url)
    setCopiedId(entry.id)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopiedId(null), 2000)
  }
  
  const handleVisibilityChange = async (entry: PortfolioEntry, newVisibility: string) => {
    try {
      const response = await fetch(`/api/student/portfolio/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Visibility changed to ${visibilityConfig[newVisibility]?.label}`)
        fetchEntries()
      }
    } catch (error) {
      console.error("Error changing visibility:", error)
      toast.error("Failed to update visibility")
    }
  }
  
  const importFromMCCS = (option: "mini_project" | "capstone" | "external") => {
    if (option === "external") {
      setImportOptions({})
      setCreateDialogOpen(true)
    }
    // For MCCS imports, we would fetch available options first
    // This is simplified for demonstration
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Portfolio
          </h1>
          <p className="text-muted-foreground mt-1">
            Showcase your best projects to the world
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "timeline" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("timeline")}
              className="rounded-l-none"
            >
              Timeline
            </Button>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => setImportDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Public</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.visibility === "PUBLIC").length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Private</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.visibility === "PRIVATE").length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {entries.reduce((acc, e) => acc + e.viewCount, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Portfolio Entries */}
      {entries.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-xl font-semibold">Your Portfolio is Empty</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Start building your portfolio by adding your course projects, 
            capstone work, or any external projects you've built.
          </p>
          <Button 
            className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600"
            onClick={() => setImportDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Project
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Screenshots/Cover */}
              <div className="h-40 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                {entry.screenshots?.[0] ? (
                  <img 
                    src={entry.screenshots[0]} 
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Code2 className="h-16 w-16 text-purple-300" />
                )}
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge className={visibilityConfig[entry.visibility]?.color}>
                    {visibilityConfig[entry.visibility]?.icon}
                    <span className="ml-1">{visibilityConfig[entry.visibility]?.label}</span>
                  </Badge>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditDialog(entry)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(entry)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="line-clamp-2 mt-2">{entry.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Tech Stack */}
                {entry.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.techStack.slice(0, 4).map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {entry.techStack.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{entry.techStack.length - 4}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Links */}
                <div className="flex gap-2 pt-2">
                  {entry.githubUrl && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={entry.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3 mr-1" />
                        Code
                      </a>
                    </Button>
                  )}
                  {entry.liveUrl && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={entry.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Live
                      </a>
                    </Button>
                  )}
                </div>
                
                {/* Visibility & Share */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {entry.viewCount} views
                  </span>
                  {entry.visibility === "PUBLIC" && entry.publicSlug && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleCopyLink(entry)}
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Share Link
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Timeline View
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <Card key={entry.id} className="relative overflow-hidden">
              {/* Timeline connector */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500" />
              
              <div className="flex">
                {/* Date indicator */}
                <div className="w-12 flex-shrink-0 flex items-start justify-center pt-4">
                  <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow" />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className={visibilityConfig[entry.visibility]?.color}>
                        {visibilityConfig[entry.visibility]?.icon}
                        <span className="ml-1">{visibilityConfig[entry.visibility]?.label}</span>
                      </Badge>
                      <h3 className="text-lg font-semibold mt-2">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Select
                        value={entry.visibility}
                        onValueChange={(val) => handleVisibilityChange(entry, val)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIVATE">
                            <div className="flex items-center">
                              <Lock className="h-3 w-3 mr-2" />
                              Private
                            </div>
                          </SelectItem>
                          <SelectItem value="PUBLIC">
                            <div className="flex items-center">
                              <Globe className="h-3 w-3 mr-2" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="ACADEMY_ONLY">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-2" />
                              Academy
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {entry.description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                  
                  {entry.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.techStack.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    {entry.githubUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={entry.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3 w-3 mr-1" />
                          View Code
                        </a>
                      </Button>
                    )}
                    {entry.liveUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={entry.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {entry.rationale && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(entry)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Rationale
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project to Portfolio</DialogTitle>
            <DialogDescription>
              Import from your course work or add an external project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-4"
              onClick={() => importFromMCCS("mini_project")}
            >
              <div className="flex items-center gap-3">
                <Code2 className="h-6 w-6 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">Import from Mini-Project</p>
                  <p className="text-xs text-muted-foreground">
                    Add a project from your completed course work
                  </p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-4"
              onClick={() => importFromMCCS("capstone")}
            >
              <div className="flex items-center gap-3">
                <Layers className="h-6 w-6 text-amber-500" />
                <div className="text-left">
                  <p className="font-medium">Import from Capstone</p>
                  <p className="text-xs text-muted-foreground">
                    Add your capstone project to the portfolio
                  </p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-4"
              onClick={() => importFromMCCS("external")}
            >
              <div className="flex items-center gap-3">
                <Plus className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Add External Project</p>
                  <p className="text-xs text-muted-foreground">
                    Add a project you built outside the academy
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Add details about your project to showcase in your portfolio
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="My Awesome Project"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what this project does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">
                  <Github className="h-3 w-3 inline mr-1" />
                  GitHub URL
                </Label>
                <Input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="liveUrl">
                  <ExternalLink className="h-3 w-3 inline mr-1" />
                  Live URL
                </Label>
                <Input
                  id="liveUrl"
                  type="url"
                  placeholder="https://myproject.vercel.app"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="techStack">Technology Stack</Label>
              <Input
                id="techStack"
                placeholder="React, Node.js, PostgreSQL (comma separated)"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Separate technologies with commas
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rationale">Project Rationale</Label>
              <Textarea
                id="rationale"
                placeholder="What problem does this solve? What did you learn from building it?"
                value={formData.rationale}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(val) => setFormData({ ...formData, visibility: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">Private</p>
                        <p className="text-xs text-muted-foreground">Only you can see this</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="PUBLIC">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">Public</p>
                        <p className="text-xs text-muted-foreground">Anyone with the link can see</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACADEMY_ONLY">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">Academy Only</p>
                        <p className="text-xs text-muted-foreground">Only academy members can see</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm() }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={saving || !formData.title.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Entry
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your portfolio entry details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Project Title *</Label>
              <Input
                id="editTitle"
                placeholder="My Awesome Project"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                placeholder="Brief description of what this project does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editGithub">
                  <Github className="h-3 w-3 inline mr-1" />
                  GitHub URL
                </Label>
                <Input
                  id="editGithub"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editLive">
                  <ExternalLink className="h-3 w-3 inline mr-1" />
                  Live URL
                </Label>
                <Input
                  id="editLive"
                  type="url"
                  placeholder="https://myproject.vercel.app"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editTech">Technology Stack</Label>
              <Input
                id="editTech"
                placeholder="React, Node.js, PostgreSQL (comma separated)"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editRationale">Project Rationale</Label>
              <Textarea
                id="editRationale"
                placeholder="What problem does this solve? What did you learn from building it?"
                value={formData.rationale}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(val) => setFormData({ ...formData, visibility: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">Private</p>
                        <p className="text-xs text-muted-foreground">Only you can see this</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="PUBLIC">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">Public</p>
                        <p className="text-xs text-muted-foreground">Anyone with the link can see</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACADEMY_ONLY">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">Academy Only</p>
                        <p className="text-xs text-muted-foreground">Only academy members can see</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm() }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={saving || !formData.title.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
