"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Pin, 
  CheckCircle, 
  Clock, 
  Eye, 
  Search,
  Plus,
  Filter,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ForumAuthor {
  id: string
  email: string
  displayName: string
  avatarUrl?: string | null
}

interface ForumThread {
  id: string
  title: string
  content: string
  category: string
  isPinned: boolean
  isResolved: boolean
  viewCount: number
  replyCount: number
  createdAt: string
  author: ForumAuthor
}

interface ForumReply {
  id: string
  content: string
  createdAt: string
  author: ForumAuthor
}

const categories = [
  { id: "all", label: "All Discussions" },
  { id: "general", label: "General" },
  { id: "course-help", label: "Course Help" },
  { id: "announcements", label: "Announcements" },
  { id: "off-topic", label: "Off-Topic" },
]

export default function ForumPage() {
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewThread, setShowNewThread] = useState(false)
  const [newThread, setNewThread] = useState({ title: "", content: "", category: "general" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Fetch threads from API
    async function fetchThreads() {
      try {
        const response = await fetch("/api/forum/threads")
        const result = await response.json()
        if (result.success) {
          setThreads(result.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch threads:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchThreads()
  }, [])

  const filteredThreads = threads.filter(thread => {
    const matchesCategory = selectedCategory === "all" || thread.category === selectedCategory
    const matchesSearch = !searchQuery || 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const pinnedThreads = filteredThreads.filter(t => t.isPinned)
  const regularThreads = filteredThreads.filter(t => !t.isPinned)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-500/20 text-blue-400",
      "course-help": "bg-purple-500/20 text-purple-400",
      announcements: "bg-amber-500/20 text-amber-400",
      "off-topic": "bg-gray-500/20 text-gray-400",
    }
    return colors[category] || "bg-gray-500/20 text-gray-400"
  }

  const ThreadCard = ({ thread }: { thread: ForumThread }) => (
    <Link href={`/forum/${thread.id}`}>
      <Card className="bg-white dark:bg-gray-800 border-0 hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 flex-shrink-0">
              {thread.author.avatarUrl ? (
                <AvatarImage src={thread.author.avatarUrl} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-brand-purple to-brand-blue text-white text-sm">
                {thread.author.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                {thread.isPinned && (
                  <Pin className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {thread.title}
                </h3>
                {thread.isResolved && (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                {thread.content}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {thread.author.displayName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(thread.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {thread.viewCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {thread.replyCount}
                </span>
                <Badge className={cn("text-xs", getCategoryBadge(thread.category))}>
                  {categories.find(c => c.id === thread.category)?.label || thread.category}
                </Badge>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-white/10 rounded-lg w-1/3" />
            <div className="h-24 bg-white/10 rounded-lg" />
            <div className="h-24 bg-white/10 rounded-lg" />
            <div className="h-24 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Community Forum</h1>
            <p className="text-white/60 mt-1">Join the discussion with fellow learners</p>
          </div>
          
          <Dialog open={showNewThread} onOpenChange={setShowNewThread}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                New Thread
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a2e] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Start a New Discussion</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault()
                // Handle thread creation
                setShowNewThread(false)
              }}>
                <div>
                  <Input
                    placeholder="Thread title"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <select
                    value={newThread.category}
                    onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  >
                    {categories.filter(c => c.id !== "all").map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Textarea
                    placeholder="Write your post..."
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    className="bg-white/5 border-white/10 text-white min-h-32"
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600">
                  {submitting ? "Posting..." : "Post Thread"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filters */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                      selectedCategory === cat.id
                        ? "bg-purple-500 text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threads List */}
        <div className="space-y-4">
          {pinnedThreads.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned
              </h2>
              {pinnedThreads.map(thread => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
              <div className="h-px bg-white/10" />
            </>
          )}

          {regularThreads.length > 0 ? (
            regularThreads.map(thread => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No discussions yet</h3>
                <p className="text-white/60 mb-4">Be the first to start a conversation!</p>
                <Button onClick={() => setShowNewThread(true)} className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}