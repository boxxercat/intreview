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
      <body>
        <AppNav />
        <main className="mx-auto min-h-[calc(100svh-3.5rem)] w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
