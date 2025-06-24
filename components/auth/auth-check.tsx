"use client"

import type React from "react"

import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
