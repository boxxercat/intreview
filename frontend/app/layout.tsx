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
      lang="en"
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <AppNav />
        <main className="mx-auto min-h-[calc(100svh-3.25rem)] max-w-3xl p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
