import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SessionProvider } from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/home/header"
import { CrispChatProvider } from "@/components/providers/CrispChatProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InnovaSci Open Academy | World-Class Scientific Learning Platform",
  description: "Democratizing high-quality scientific and technological education for learners worldwide. Powered by InnovaSci AI Labs.",
  keywords: ["LMS", "e-learning", "scientific education", "AI", "machine learning", "data science"],
  authors: [{ name: "InnovaSci AI Labs" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "InnovaSci Open Academy",
    description: "World-class scientific learning platform powered by AI",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CrispChatProvider />
            <Header />
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
