"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showErrorDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Error caught:", error, errorInfo)
    }
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)
    
    // Report to error tracking service (e.g., Sentry) if configured
    this.reportError(error, errorInfo)
  }

  private async reportError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // Store error in IndexedDB for later reporting
      if (typeof window !== "undefined" && "indexedDB" in window) {
        const { offlineDb } = await import("@/lib/offline/database")
        
        await offlineDb.cache.add({
          key: `error_${Date.now()}`,
          data: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          },
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          category: "GENERAL",
        })
      }
    } catch (e) {
      console.error("[ErrorBoundary] Failed to store error:", e)
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
          <div className="max-w-md w-full">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-400 mb-6">
                We encountered an unexpected error. The page has been preserved 
                from crashes, and your data is safe.
              </p>

              {/* Error Message (in development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 p-4 bg-slate-900/50 rounded-lg text-left">
                  <div className="flex items-center gap-2 text-red-400 text-sm font-mono mb-2">
                    <Bug className="h-4 w-4" />
                    <span>Error Details</span>
                  </div>
                  <pre className="text-xs text-slate-400 overflow-auto max-h-32">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack?.split("\n").slice(0, 5).join("\n")}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Offline notice */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  💡 If you're offline, don't worry! Changes made while offline 
                  are saved and will sync when you reconnect.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling errors in components
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`[ErrorHandler${context ? ` - ${context}` : ""}]:`, error)
    
    // Could trigger global error reporting here
  }

  return handleError
}

// Simple error display component for inline errors
interface InlineErrorProps {
  error: Error | string | null
  onRetry?: () => void
  className?: string
}

export function InlineError({ error, onRetry, className = "" }: InlineErrorProps) {
  if (!error) return null

  const message = typeof error === "string" ? error : error.message

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <AlertTriangle className="h-8 w-8 text-amber-500 mb-3" />
      <p className="text-slate-400 text-sm text-center mb-3">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}

// Loading fallback component
export function LoadingFallback({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  )
}
