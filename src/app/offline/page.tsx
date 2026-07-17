"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { WifiOff, RefreshCw, Home, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      setCheckingConnection(true)
      
      // Try to fetch a small resource to check connectivity
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-store',
        })
        if (response.ok) {
          setIsOnline(true)
          // Redirect to home if back online
          router.push('/')
          return
        }
      } catch (e) {
        // Still offline
      }
      
      setCheckingConnection(false)
      setIsOnline(false)
    }

    // Initial check
    checkConnection()

    // Listen for online events
    const handleOnline = () => {
      setIsOnline(true)
      // Give a moment for connection to stabilize
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connection check
    const interval = setInterval(checkConnection, 10000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [router])

  const handleRetry = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            {/* Icon */}
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              checkingConnection ? 'bg-blue-500/20' : 'bg-amber-500/20'
            }`}>
              {checkingConnection ? (
                <RefreshCw className="h-10 w-10 text-blue-400 animate-spin" />
              ) : (
                <WifiOff className="h-10 w-10 text-amber-400" />
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-2">
              {checkingConnection ? 'Checking Connection...' : 'You\'re Offline'}
            </h1>

            {/* Description */}
            <p className="text-slate-400 mb-6">
              {checkingConnection ? (
                'Please wait while we check your connection...'
              ) : (
                <>
                  Don't worry! Your cached content is still available, and any 
                  changes you make will sync automatically when you're back online.
                </>
              )}
            </p>

            {/* Available Features */}
            {!checkingConnection && (
              <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-emerald-400 text-sm mb-3">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Available Offline</span>
                </div>
                <ul className="text-left text-sm text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    View previously loaded courses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Continue with saved form drafts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    View enrolled course content
                  </li>
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRetry}
                disabled={checkingConnection}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                {checkingConnection ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                disabled={checkingConnection}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>

          {/* Tips */}
          {!checkingConnection && (
            <div className="border-t border-slate-700 pt-4 mt-4">
              <p className="text-xs text-slate-500 text-center">
                💡 Tip: Enable offline mode in settings to download courses for 
                learning without internet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
