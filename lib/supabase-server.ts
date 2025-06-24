import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cache } from "react"

export const createServerSupabaseClient = cache(() => {
  return createServerComponentClient({ cookies: () => undefined })
})

export async function getSession() {
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getUserDetails() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: userDetails } = await supabase.from("profiles").select("*").single()
    return userDetails
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getRole() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: profile } = await supabase.from("profiles").select("role").single()
    return profile?.role
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export function getUserRole(userEmail: string | null | undefined): "manager" | "promoter_manager" | "worker" {
  if (!userEmail) return "worker"

  if (userEmail === "Mtsand09@gmail.com") return "manager"
  if (userEmail === "promoter.manager@olivemind.com") return "promoter_manager"

  return "worker"
}

export function canEdit(userRole: string): boolean {
  return userRole === "manager"
}

export function canView(userRole: string): boolean {
  return userRole === "manager" || userRole === "promoter_manager"
}
