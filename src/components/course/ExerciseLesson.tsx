"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Code, 
  Download, 
  Play, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Video,
  FileCode,
  Loader2
} from "lucide-react"

interface ExerciseLessonProps {
  id: string
  title: string
  description?: string
  exerciseDescription?: string
  exerciseFilesUrl?: string
  solutionVideoUrl?: string
  isCompleted?: boolean
  onComplete?: () => void
  onCompleteLoading?: boolean
  className?: string
}

function formatMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeContent = ""
  let codeLanguage = ""
  let listItems: string[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key++}`} className="list-disc list-inside space-y-1 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-700 dark:text-gray-300">{item}</li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Code block start/end
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${key++}`} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4">
            <code className="text-sm font-mono">{codeContent}</code>
          </pre>
        )
        codeContent = ""
        codeLanguage = ""
        inCodeBlock = false
      } else {
        flushList()
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeContent += line + "\n"
      continue
    }

    // Headers
    if (line.startsWith("## ")) {
      flushList()
      elements.push(
        <h2 key={`h2-${key++}`} className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">
          {line.slice(3)}
        </h2>
      )
      continue
    }
    if (line.startsWith("### ")) {
      flushList()
      elements.push(
        <h3 key={`h3-${key++}`} className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">
          {line.slice(4)}
        </h3>
      )
      continue
    }

    // List items
    if (line.match(/^[-*]\s/)) {
      listItems.push(line.slice(2))
      continue
    }
    if (line.match(/^\d+\.\s/)) {
      listItems.push(line.replace(/^\d+\.\s/, ""))
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      flushList()
      elements.push(<hr key={`hr-${key++}`} className="my-6 border-gray-200 dark:border-gray-700" />)
      continue
    }

    // Bold text
    if (line.includes("**")) {
      flushList()
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <p key={`p-${key++}`} className="text-gray-700 dark:text-gray-300 my-2">
          {parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
            }
            return part
          })}
        </p>
      )
      continue
    }

    // Empty line
    if (line.trim() === "") {
      flushList()
      continue
    }

    // Regular paragraph
    flushList()
    elements.push(
      <p key={`p-${key++}`} className="text-gray-700 dark:text-gray-300 my-2">
        {line}
      </p>
    )
  }

  flushList()
  return elements
}

export function ExerciseLesson({
  id,
  title,
  description,
  exerciseDescription,
  exerciseFilesUrl,
  solutionVideoUrl,
  isCompleted = false,
  onComplete,
  onCompleteLoading = false,
  className
}: ExerciseLessonProps) {
  const [showSolution, setShowSolution] = useState(false)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Exercise Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Code className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Project Exercise
            </Badge>
            {isCompleted && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-1">{title}</h1>
        </div>
      </div>

      {/* Starter Files Button */}
      {exerciseFilesUrl && (
        <a 
          href={exerciseFilesUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" className="gap-2 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20">
            <FileCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Download Starter Files
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </Button>
        </a>
      )}

      {/* Exercise Description Card */}
      {exerciseDescription && (
        <Card className="border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Exercise Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            {formatMarkdown(exerciseDescription)}
          </CardContent>
        </Card>
      )}

      {/* Solution Section */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-2">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="w-full flex items-center justify-between text-left"
          >
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Solution Walkthrough
            </CardTitle>
            {showSolution ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        
        {showSolution && (
          <CardContent>
            {solutionVideoUrl ? (
              <div className="space-y-4">
                {/* Video Embed */}
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                  <iframe
                    src={getEmbedUrl(solutionVideoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Watch the solution walkthrough above
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Solution coming soon.</p>
                <p className="text-sm mt-1">Check back after completing the exercise!</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Mark Complete Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onComplete}
          disabled={isCompleted || onCompleteLoading}
          className={cn(
            "gap-2 min-w-[200px]",
            isCompleted 
              ? "bg-emerald-500 hover:bg-emerald-600" 
              : "bg-amber-500 hover:bg-amber-600"
          )}
          size="lg"
        >
          {onCompleteLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Completed!
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Mark as Complete
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // Direct video URL - return as is (assumes it's an embeddable URL)
  return url
}
