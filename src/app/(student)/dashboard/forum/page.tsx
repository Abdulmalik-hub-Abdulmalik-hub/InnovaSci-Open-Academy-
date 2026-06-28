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
  DialogDescription,
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
  User,
  ChevronRight,
  X
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
  lastReplyAt: string | null
  createdAt: string
  author: ForumAuthor
}

interface ForumReply {
  id: string
  content: string
  isAccepted: boolean
  createdAt: string
  author: ForumAuthor
}

interface ThreadDetail extends ForumThread {
  replies: ForumReply[]
}

const categories = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "course-help", label: "Course Help" },
  { value: "announcements", label: "Announcements" },
  { value: "off-topic", label: "Off-Topic" }
]

const categoryColors: Record<string, string> = {
  general: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "course-help": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  announcements: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "off-topic": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function ForumPage() {
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewThread, setShowNewThread] = useState(false)
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [newThread, setNewThread] = useState({
    title: "",
    content: "",
    category: "general"
  })

  useEffect(() => {
    fetchThreads()
  }, [selectedCategory, searchQuery])

  const fetchThreads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.set("category", selectedCategory)
      if (searchQuery) params.set("search", searchQuery)
      
      const response = await fetch(`/api/forum?${params}`)
      if (response.ok) {
        const data = await response.json()
        setThreads(data.threads)
      }
    } catch (error) {
      console.error("Error fetching threads:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchThreadDetail = async (threadId: string) => {
    try {
      setThreadLoading(true)
      const response = await fetch(`/api/forum/${threadId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedThread(data)
      }
    } catch (error) {
      console.error("Error fetching thread:", error)
    } finally {
      setThreadLoading(false)
    }
  }

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThread)
      })

      if (response.ok) {
        setShowNewThread(false)
        setNewThread({ title: "", content: "", category: "general" })
        fetchThreads()
      }
    } catch (error) {
      console.error("Error creating thread:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !replyContent.trim()) return

    setSubmitting(true)

    try {
      const response = await fetch(`/api/forum/${selectedThread.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent })
      })

      if (response.ok) {
        setReplyContent("")
        fetchThreadDetail(selectedThread.id)
        fetchThreads()
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground mt-1">
            Connect with other learners and share knowledge
          </p>
        </div>
        
        <Dialog open={showNewThread} onOpenChange={setShowNewThread}>
          <DialogTrigger asChild>
            <Button className="bg-brand-purple hover:bg-brand-purple/90 gap-2">
              <Plus className="h-4 w-4" />
              New Thread
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Thread</DialogTitle>
              <DialogDescription>
                Share your question, idea, or start a discussion with the community.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateThread} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  placeholder="What's your thread about?"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newThread.category}
                  onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="general">General</option>
                  <option value="course-help">Course Help</option>
                  <option value="announcements">Announcements</option>
                  <option value="off-topic">Off-Topic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewThread(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-purple hover:bg-brand-purple/90"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Thread"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={selectedCategory === cat.value ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Thread List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? "No threads match your search" : "No threads yet. Be the first to start a discussion!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          threads.map((thread) => (
            <Card 
              key={thread.id}
              className={cn(
                "hover:shadow-md transition-all cursor-pointer group",
                thread.isPinned && "border-l-4 border-l-purple-500"
              )}
              onClick={() => fetchThreadDetail(thread.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={thread.author.avatarUrl || undefined} />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {getInitials(thread.author.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {thread.isPinned && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 gap-1">
                          <Pin className="h-3 w-3" /> Pinned
                        </Badge>
                      )}
                      <Badge variant="secondary" className={categoryColors[thread.category]}>
                        {thread.category}
                      </Badge>
                      {thread.isResolved && (
                        <Badge variant="outline" className="text-green-600 border-green-200 gap-1">
                          <CheckCircle className="h-3 w-3" /> Resolved
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mt-1 group-hover:text-purple-600 transition-colors">
                      {thread.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {thread.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {thread.author.displayName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(thread.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {thread.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {thread.replyCount} replies
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Thread Detail Dialog */}
      <Dialog open={!!selectedThread} onOpenChange={() => setSelectedThread(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {threadLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : selectedThread ? (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedThread.author.avatarUrl || undefined} />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {getInitials(selectedThread.author.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {selectedThread.isPinned && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 gap-1">
                          <Pin className="h-3 w-3" /> Pinned
                        </Badge>
                      )}
                      <Badge variant="secondary" className={categoryColors[selectedThread.category]}>
                        {selectedThread.category}
                      </Badge>
                      {selectedThread.isResolved && (
                        <Badge variant="outline" className="text-green-600 border-green-200 gap-1">
                          <CheckCircle className="h-3 w-3" /> Resolved
                        </Badge>
                      )}
                    </div>
                    <DialogTitle className="text-xl">{selectedThread.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <span>{selectedThread.author.displayName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(selectedThread.createdAt)}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedThread.content}</p>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {selectedThread.replies.length} Replies
                </h4>

                <div className="space-y-4">
                  {selectedThread.replies.map((reply) => (
                    <div 
                      key={reply.id}
                      className={cn(
                        "p-4 rounded-lg",
                        reply.isAccepted 
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200" 
                          : "bg-slate-50 dark:bg-slate-800/50"
                      )}
                    >
                      {reply.isAccepted && (
                        <Badge className="mb-2 bg-green-500 gap-1">
                          <CheckCircle className="h-3 w-3" /> Accepted Answer
                        </Badge>
                      )}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.author.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                            {getInitials(reply.author.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{reply.author.displayName}</span>
                            <span className="text-muted-foreground">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedThread.replies.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No replies yet. Be the first to respond!
                    </p>
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSubmitReply} className="mt-6">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                    className="mb-3"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-brand-purple hover:bg-brand-purple/90"
                      disabled={submitting || !replyContent.trim()}
                    >
                      {submitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}