"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type MockUser = {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
}

type SupabaseContext = {
  user: MockUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(false)

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("olive-mind-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)

    try {
      // Manager credentials
      if (email === "Mtsand09@gmail.com" && password === "DiamondDust$") {
        const mockUser = {
          id: "manager-123",
          email: "Mtsand09@gmail.com",
          user_metadata: { full_name: "Manager" },
        }
        setUser(mockUser)
        localStorage.setItem("olive-mind-user", JSON.stringify(mockUser))
        setLoading(false)
        return
      }

      // Test promoter credentials - using worker ID from database
      if (email === "promoter@test.com" && password === "test123") {
        const mockUser = {
          id: "1", // This matches Hope's ID in the database
          email: "promoter@test.com",
          user_metadata: { full_name: "Test Promoter" },
        }
        setUser(mockUser)
        localStorage.setItem("olive-mind-user", JSON.stringify(mockUser))
        setLoading(false)
        return
      }

      // Additional test worker accounts
      if (email === "hope@olivemind.com" && password === "test123") {
        const mockUser = {
          id: "1", // Hope's ID
          email: "hope@olivemind.com",
          user_metadata: { full_name: "Hope" },
        }
        setUser(mockUser)
        localStorage.setItem("olive-mind-user", JSON.stringify(mockUser))
        setLoading(false)
        return
      }

      if (email === "casey@olivemind.com" && password === "test123") {
        const mockUser = {
          id: "2", // Casey's ID
          email: "casey@olivemind.com",
          user_metadata: { full_name: "Casey New" },
        }
        setUser(mockUser)
        localStorage.setItem("olive-mind-user", JSON.stringify(mockUser))
        setLoading(false)
        return
      }

      setLoading(false)
      throw new Error("Invalid email or password")
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)

    try {
      const mockUser = {
        id: "new-user-123",
        email,
        user_metadata: { full_name: fullName },
      }
      setUser(mockUser)
      localStorage.setItem("olive-mind-user", JSON.stringify(mockUser))
      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem("olive-mind-user")
  }

  return <Context.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
