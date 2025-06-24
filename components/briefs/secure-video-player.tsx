"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SecureVideoPlayerProps {
  videoUrl: string
  title: string
  onComplete?: () => void
}

export default function SecureVideoPlayer({ videoUrl, title, onComplete }: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [watchedEnough, setWatchedEnough] = useState(false)
  const { toast } = useToast()

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  // Update progress bar
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const duration = videoRef.current.duration
      setCurrentTime(current)
      setProgress((current / duration) * 100)

      // Mark as watched if 90% complete
      if (current / duration > 0.9 && !watchedEnough) {
        setWatchedEnough(true)
        if (onComplete) {
          onComplete()
        }
      }
    }
  }

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = (Number.parseInt(e.target.value) / 100) * videoRef.current.duration
      videoRef.current.currentTime = seekTime
      setProgress(Number.parseInt(e.target.value))
    }
  }

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setLoading(false)
    }
  }

  // Prevent right-click on video
  const preventRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    toast({
      title: "Content Protected",
      description: "Downloading or saving this content is not permitted",
      variant: "destructive",
    })
    return false
  }

  // Prevent download shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common download shortcuts
      if (
        (e.ctrlKey && e.key === "s") || // Ctrl+S
        (e.ctrlKey && e.key === "p") || // Ctrl+P
        e.key === "F12" || // F12 (dev tools)
        (e.ctrlKey && e.shiftKey && e.key === "i") // Ctrl+Shift+I (dev tools)
      ) {
        e.preventDefault()
        toast({
          title: "Action Restricted",
          description: "This content is protected and cannot be downloaded",
          variant: "destructive",
        })
        return false
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [toast])

  return (
    <Card className="overflow-hidden">
      <div className="relative" onContextMenu={preventRightClick}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Secure video element with disabled controls */}
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
        />

        {/* Custom controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-xs">{formatTime(duration)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
