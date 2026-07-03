"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: "" }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
    this.setState({ 
      errorInfo: errorInfo.componentStack || "" 
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: "" })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <h2 className="text-xl font-bold text-red-400">Application Error</h2>
            </div>
            
            <div className="bg-black/50 rounded-lg p-4 mb-4">
              <p className="text-red-300 text-sm font-mono mb-2">
                {this.state.error?.message || "Unknown error occurred"}
              </p>
              {this.state.error?.stack && (
                <pre className="text-xs text-white/60 overflow-x-auto whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={this.handleReset}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
              <Button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: "" })}
                variant="outline"
                className="border-white/20 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
