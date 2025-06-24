"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"

interface SecureBrandGuideProps {
  content: string
  brandName: string
  onComplete?: () => void
}

export default function SecureBrandGuide({ content, brandName, onComplete }: SecureBrandGuideProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Track if user has scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current
        // If scrolled to bottom (with 50px margin)
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          if (onComplete) {
            onComplete()
          }
        }
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [onComplete])

  // Prevent content selection and right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      toast({
        title: "Content Protected",
        description: "Downloading or saving this content is not permitted",
        variant: "destructive",
      })
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common download shortcuts
      if (
        (e.ctrlKey && e.key === "s") || // Ctrl+S
        (e.ctrlKey && e.key === "p") || // Ctrl+P
        (e.ctrlKey && e.key === "c" && window.getSelection()?.toString()) // Ctrl+C with selection
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

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [toast])

  return (
    <Card className="overflow-hidden">
      <div className="bg-blue-50 p-3 flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <div className="text-sm font-medium">Confidential Brand Information • {brandName}</div>
      </div>
      <CardContent className="p-0">
        <div
          ref={contentRef}
          className="prose prose-sm max-w-none p-4 max-h-[500px] overflow-y-auto"
          style={{ userSelect: "none" }}
        >
          {/* Actual content */}
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      </CardContent>
      <div className="bg-gray-50 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertCircle className="h-4 w-4" />
          <span>Scroll to bottom to mark as read</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Protected content</span>
        </div>
      </div>
    </Card>
  )
}
