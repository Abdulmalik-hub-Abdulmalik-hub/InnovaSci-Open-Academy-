"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Award, ExternalLink, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"

interface CertificateTemplate {
  id: string
  name: string
  description?: string
  backgroundUrl: string
  isActive: boolean
  coursesCount: number
}

interface CertificateTemplateSelectorProps {
  value: string | null
  onChange: (templateId: string | null) => void
  disabled?: boolean
}

export function CertificateTemplateSelector({ 
  value, 
  onChange, 
  disabled = false 
}: CertificateTemplateSelectorProps) {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/admin/certificate-templates")
        const data = await response.json()
        
        if (response.ok && data && typeof data.success !== 'undefined') {
          if (data.success) {
            setTemplates(data.data?.templates || [])
          } else {
            // API returned an error response
            console.error("Certificate templates API error:", data.error)
            setError(data.error || "Failed to load templates")
          }
        } else if (response.ok) {
          // API returned 200 but unexpected format - treat as empty
          setTemplates([])
        } else {
          // Non-OK response
          console.error("Certificate templates API status:", response.status)
          setError(`Server error (${response.status})`)
        }
      } catch (err) {
        console.error("Certificate templates fetch error:", err)
        setError("Network error - please try again")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading templates...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
        <Link 
          href="/admin/certificates/templates" 
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Open Certificate Templates
        </Link>
      </div>
    )
  }

  const activeTemplates = templates.filter(t => t.isActive)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/70">Certificate Template</label>
        <Link 
          href="/admin/certificates/templates" 
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Manage Templates
        </Link>
      </div>
      
      <Select 
        value={value || "none"} 
        onValueChange={(val) => onChange(val === "none" ? null : val)}
        disabled={disabled}
      >
        <SelectTrigger className="bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="Select a certificate template" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a2e] border-white/10">
          <SelectItem value="none" className="text-white/60 hover:text-white">
            No Certificate
          </SelectItem>
          {activeTemplates.length === 0 ? (
            <div className="px-2 py-4 text-center text-white/50 text-sm">
              No templates available. 
              <Link href="/admin/certificates/templates" className="text-purple-400 hover:underline ml-1">
                Create one
              </Link>
            </div>
          ) : (
            activeTemplates.map((template) => (
              <SelectItem 
                key={template.id} 
                value={template.id}
                className="text-white hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-400" />
                  <span>{template.name}</span>
                  {template.coursesCount > 0 && (
                    <span className="text-xs text-white/40">
                      ({template.coursesCount} courses)
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {value && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Award className="h-3 w-3" />
          <span>
            Selected: {templates.find(t => t.id === value)?.name || "Unknown"}
          </span>
        </div>
      )}
    </div>
  )
}

export default CertificateTemplateSelector