'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  FileText,
  GitBranch,
  Loader2,
  BarChart3,
  ChevronRight,
  MessageSquare,
  Download,
  ExternalLink,
  Star,
  Archive,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'

interface Submission {
  id: string
  title: string
  description: string | null
  status: string
  projectType: string
  grade: number | null
  gradeType: string | null
  rubricScore: number | null
  maxScore: number | null
  submittedAt: string | null
  gradedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    profile: { fullName: string | null }
  }
  course: {
    id: string
    title: string
    slug: string
    category: {
      id: string
      name: string
      domain: { id: string; name: string }
    }
  } | null
  miniProject: { id: string; title: string } | null
  latestVersion: { versionNumber: number; submittedAt: string } | null
  latestReview: {
    id: string
    decision: string
    reviewer: { id: string; email: string; profile: { fullName: string | null } }
  } | null
  versionCount: number
  reviewCount: number
}

interface Statistics {
  byStatus: Record<string, number>
  byProjectType: Record<string, number>
  total: number
  submittedToday: number
  pendingReview: number
  approved: number
  rejected: number
  revisionRequired: number
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400', icon: FileText },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
  REVISION_REQUIRED: { label: 'Revision Required', color: 'bg-orange-500/20 text-orange-400', icon: AlertCircle },
  RESUBMITTED: { label: 'Resubmitted', color: 'bg-indigo-500/20 text-indigo-400', icon: RefreshCw },
  APPROVED: { label: 'Approved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
  ARCHIVED: { label: 'Archived', color: 'bg-slate-500/20 text-slate-400', icon: Archive },
}

const projectTypeConfig: Record<string, { label: string; color: string }> = {
  PRACTICAL_EXERCISE: { label: 'Practical', color: 'bg-cyan-500/20 text-cyan-400' },
  MINI_PROJECT: { label: 'Mini Project', color: 'bg-purple-500/20 text-purple-400' },
  DIFFICULTY_CAPSTONE: { label: 'Capstone', color: 'bg-amber-500/20 text-amber-400' },
  PROFESSIONAL_CAPSTONE: { label: 'Professional', color: 'bg-rose-500/20 text-rose-400' },
}

export default function AdminProjectsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewData, setReviewData] = useState({
    decision: '',
    overallFeedback: '',
    grade: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorDetails, setErrorDetails] = useState<{ message: string; code: string; stack?: string } | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter, projectTypeFilter, page])

  const fetchSubmissions = async () => {
    setLoading(true)
    setErrorDetails(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (projectTypeFilter) params.set('projectType', projectTypeFilter)
      if (search) params.set('search', search)
      params.set('page', page.toString())
      params.set('limit', '20')

      const response = await fetch(`/api/admin/projects?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setSubmissions(result.data.submissions)
        setStatistics(result.data.statistics)
        setTotalPages(result.data.pagination.totalPages)
        setErrorDetails(null)
      } else {
        console.error('API Error:', result.error, result.details)
        const errorInfo = {
          message: result.details?.message || result.error || 'Failed to fetch submissions',
          code: result.details?.code || '',
          stack: result.details?.stack
        }
        setErrorDetails(errorInfo)
        toast({
          title: 'Error',
          description: errorInfo.message,
          variant: 'destructive',
          duration: 10000,
        })
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      const errorInfo = {
        message: 'Network error: Failed to fetch submissions',
        code: '',
      }
      setErrorDetails(errorInfo)
      toast({
        title: 'Error',
        description: errorInfo.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchSubmissions()
  }

  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission)
    setReviewData({
      decision: '',
      overallFeedback: '',
      grade: submission.grade?.toString() || '',
    })
    setReviewDialogOpen(true)
  }

  const submitReview = async () => {
    if (!selectedSubmission || !reviewData.decision) {
      toast({
        title: 'Error',
        description: 'Please select a review decision',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/projects/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          decision: reviewData.decision,
          overallFeedback: reviewData.overallFeedback,
          grade: reviewData.grade ? parseInt(reviewData.grade) : undefined,
          gradeType: 'PERCENTAGE',
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        setReviewDialogOpen(false)
        fetchSubmissions()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit review',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getGradeDisplay = (submission: Submission) => {
    if (submission.rubricScore !== null && submission.maxScore) {
      const percentage = Math.round((submission.rubricScore / submission.maxScore) * 100)
      return `${percentage}%`
    }
    if (submission.grade !== null) {
      return `${submission.grade}%`
    }
    return '-'
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Student Projects</h1>
          <p className="text-muted-foreground">Manage and review student project submissions</p>
        </div>
        <Link href="/admin/projects/rubrics">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Manage Rubrics
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {errorDetails && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-700 mb-2">Database Error</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-red-600">Error Message:</span>
                  <p className="text-red-800 font-mono bg-red-100 p-2 rounded mt-1">{errorDetails.message}</p>
                </div>
                {errorDetails.code && (
                  <div>
                    <span className="font-medium text-red-600">Error Code:</span>
                    <p className="text-red-800 font-mono bg-red-100 p-2 rounded mt-1">{errorDetails.code}</p>
                  </div>
                )}
                {errorDetails.stack && (
                  <details className="mt-2">
                    <summary className="font-medium text-red-600 cursor-pointer">Stack Trace (click to expand)</summary>
                    <pre className="text-xs text-red-700 bg-red-100 p-2 rounded mt-2 overflow-x-auto whitespace-pre-wrap">
                      {errorDetails.stack}
                    </pre>
                  </details>
                )}
              </div>
              <p className="text-xs text-red-500 mt-3">
                This error indicates a problem with the database schema. Check if all required tables and columns exist.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{statistics.pendingReview}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{statistics.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revision Required</p>
                  <p className="text-2xl font-bold">{statistics.revisionRequired}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, student name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="REVISION_REQUIRED">Revision Required</SelectItem>
                <SelectItem value="RESUBMITTED">Resubmitted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="PRACTICAL_EXERCISE">Practical Exercise</SelectItem>
                <SelectItem value="MINI_PROJECT">Mini Project</SelectItem>
                <SelectItem value="DIFFICULTY_CAPSTONE">Difficulty Capstone</SelectItem>
                <SelectItem value="PROFESSIONAL_CAPSTONE">Professional Capstone</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Project Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No submissions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => {
                    const status = statusConfig[submission.status] || statusConfig.DRAFT
                    const projectType = projectTypeConfig[submission.projectType] || projectTypeConfig.MINI_PROJECT
                    const StatusIcon = status.icon

                    return (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {submission.user.profile.fullName || submission.user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {submission.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="font-medium truncate">{submission.title}</p>
                            {submission.latestVersion && (
                              <p className="text-xs text-muted-foreground">
                                v{submission.latestVersion.versionNumber}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={projectType.color}>
                            {projectType.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.course ? (
                            <p className="text-sm truncate max-w-[150px]">
                              {submission.course.title}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.submittedAt ? (
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not submitted</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getGradeDisplay(submission)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/projects/${submission.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {['SUBMITTED', 'RESUBMITTED', 'UNDER_REVIEW'].includes(submission.status) && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => openReviewDialog(submission)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quick Review</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Decision</Label>
              <Select 
                value={reviewData.decision} 
                onValueChange={(value) => setReviewData({ ...reviewData, decision: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approve</SelectItem>
                  <SelectItem value="REJECTED">Reject</SelectItem>
                  <SelectItem value="REVISION_REQUIRED">Request Revision</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Mark Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grade (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Enter grade"
                value={reviewData.grade}
                onChange={(e) => setReviewData({ ...reviewData, grade: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Overall Feedback</Label>
              <Textarea
                placeholder="Provide overall feedback..."
                value={reviewData.overallFeedback}
                onChange={(e) => setReviewData({ ...reviewData, overallFeedback: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
