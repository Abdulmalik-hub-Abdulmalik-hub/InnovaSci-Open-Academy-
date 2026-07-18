"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DollarSign,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Building2,
  Globe,
  Users,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"

const sponsorTypes = [
  { value: "COMPANY", label: "Company" },
  { value: "NGO", label: "NGO" },
  { value: "FOUNDATION", label: "Foundation" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "ISLAMIC_ORG", label: "Islamic Organization" },
]

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400",
  INACTIVE: "bg-gray-500/20 text-gray-400",
  SUSPENDED: "bg-red-500/20 text-red-400",
}

const createSponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  type: z.string(),
  website: z.string().optional(),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  budget: z.string().optional(),
})

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSponsorSchema),
    defaultValues: {
      type: "COMPANY",
    },
  })

  const fetchSponsors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "20")
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)

      const response = await fetch(`/api/admin/sponsors?${params}`)
      const data = await response.json()
      
      setSponsors(data.sponsors || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (error) {
      console.error("Error fetching sponsors:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSponsors()
  }, [page, statusFilter])

  const onCreateSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create sponsor")
      }

      toast({
        title: "Success",
        description: "Sponsor created successfully",
      })
      
      setIsCreateOpen(false)
      reset()
      fetchSponsors()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchSponsors()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            Scholarship Sponsors
          </h1>
          <p className="text-white/60 mt-1">Manage scholarship sponsors and partners</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsor
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search sponsors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-green-500 hover:bg-green-600">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sponsors Table */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Sponsors ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : sponsors.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No sponsors found</p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 bg-green-500 hover:bg-green-600"
              >
                Add your first sponsor
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/60">Sponsor</TableHead>
                    <TableHead className="text-white/60">Type</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Scholarships</TableHead>
                    <TableHead className="text-white/60">Contact</TableHead>
                    <TableHead className="text-white/60 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors.map((sponsor) => (
                    <TableRow key={sponsor.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {sponsor.logo ? (
                            <img src={sponsor.logo} alt={sponsor.name} className="w-10 h-10 rounded" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-green-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{sponsor.name}</p>
                            {sponsor.website && (
                              <a
                                href={sponsor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/50 text-sm flex items-center gap-1 hover:text-green-400"
                              >
                                <Globe className="h-3 w-3" />
                                {sponsor.website.replace(/^https?:\/\//, "")}
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/20 text-white/80">
                          {sponsor.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[sponsor.status]}>
                          {sponsor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {sponsor._count?.scholarships || 0}
                      </TableCell>
                      <TableCell>
                        <div className="text-white/60 text-sm">
                          {sponsor.contactEmail && (
                            <p>{sponsor.contactEmail}</p>
                          )}
                          {sponsor.contactPhone && (
                            <p>{sponsor.contactPhone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4 text-white/60" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                            <DropdownMenuItem asChild>
                              <a href={`/admin/scholarships/sponsors/${sponsor.id}`} className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-white/60 text-sm">
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} sponsors
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-white/10 text-white"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-white/10 text-white"
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Sponsor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Acme Corporation"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name</Label>
                <Input
                  id="shortName"
                  {...register("shortName")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Acme"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="acme-corp"
                />
                {errors.slug && (
                  <p className="text-red-400 text-sm">{errors.slug.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select onValueChange={(v) => {}}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsorTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register("description")}
                className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40"
                placeholder="Brief description of the sponsor..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person</Label>
                <Input
                  id="contactName"
                  {...register("contactName")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register("contactEmail")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-white/10 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? "Creating..." : "Create Sponsor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
