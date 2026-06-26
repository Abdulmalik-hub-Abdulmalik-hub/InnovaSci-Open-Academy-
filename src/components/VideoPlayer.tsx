"use client"

import { useState, useEffect, useRef } from "react"

interface VideoPlayerProps {
  videoId: string
  videoUrl?: string
  provider?: string
  autoPlay?: boolean
  onProgress?: (progress: number) => void
  onComplete?: () => void
  className?: string
}

export function VideoPlayer({
  videoId,
  videoUrl,
  provider = "url",
  autoPlay = false,
  onProgress,
  onComplete,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // Fetch signed URL on mount
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (videoUrl) {
        // Use direct URL if provided (e.g., YouTube, Vimeo embed URLs)
        setSignedUrl(videoUrl)
        setLoading(false)
        return
      }

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
        
        const response = await fetch(`/api/public/videos/${videoId}/stream`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        const result = await response.json()

        if (!result.success) {
          setError(result.error || "Failed to load video")
          setLoading(false)
          return
        }

        setSignedUrl(result.data.videoUrl)
        setLoading(false)
      } catch (err) {
        console.error("Video fetch error:", err)
        setError("Failed to load video")
        setLoading(false)
      }
    }

    fetchSignedUrl()
  }, [videoId, videoUrl])

  // Handle play/pause events
  const handlePlayPause = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    setCurrentTime(current)
    
    if (onProgress && total > 0) {
      onProgress((current / total) * 100)
    }
  }

  // Handle video ended
  const handleEnded = () => {
    setIsPlaying(false)
    if (onComplete) {
      onComplete()
    }
  }

  // Handle duration loaded
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    
    const newVolume = parseFloat(e.target.value)
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return
    
    if (isMuted) {
      videoRef.current.volume = volume || 1
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    
    const time = parseFloat(e.target.value)
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  // Format time
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return "0:00"
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Render YouTube/Vimeo embeds
  if (provider === "youtube" && videoUrl) {
    const videoId = extractYouTubeId(videoUrl)
    return (
      <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (provider === "vimeo" && videoUrl) {
    const videoId = extractVimeoId(videoUrl)
    return (
      <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // Native video player
  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-white/60 text-sm">Please ensure you are enrolled in this course</p>
          </div>
        </div>
      )}

      {signedUrl && !error && (
        <>
          <video
            ref={videoRef}
            src={signedUrl}
            autoPlay={autoPlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full aspect-video"
            controls={false}
          />

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 mb-3 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
              style={{
                background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>

                {/* Time Display */}
                <span className="text-white/80 text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-purple-400 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" />
                      </svg>
                    ) : volume < 0.5 ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>

                {/* Fullscreen */}
                <button
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Helper functions
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : ""
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(?:channels\/(?:[^\/]+)\/)?(?:video\/)?(\d+)/)
  return match ? match[1] : ""
}

export default VideoPlayer