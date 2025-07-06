import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CDNLoading from "@/components/cdn-loading"
import "./globals.css"
import { SITE_NAME } from "../lib/siteConfig"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: `${SITE_NAME} - The Ultimate Anime Experience`,
  description: "Discover, track and discuss your favorite anime series and movies",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CDNLoading>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </CDNLoading>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

