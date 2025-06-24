import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Olive Mind Marketing",
  description: "Workforce Management Application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className="bg-emerald-700" lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
            <Toaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
