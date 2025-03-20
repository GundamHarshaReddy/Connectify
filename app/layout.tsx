import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import SupabaseProvider from "@/components/supabase-provider"
import { Toaster } from "@/components/ui/toaster"
import ConditionalChatbot from "@/components/conditional-chatbot"
import Header from "@/components/layout/header"
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Service Platform",
  description: "Find and book local services",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SupabaseProvider session={session}>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
              <ConditionalChatbot />
            </SupabaseProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}