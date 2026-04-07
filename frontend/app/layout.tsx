import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { AppNav } from "@/components/layout/app-nav"
import { cn } from "@/lib/utils"

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={cn(fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-svh bg-background">
        <AppNav />
        {children}
      </body>
    </html>
  )
}
