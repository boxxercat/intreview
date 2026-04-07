"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "홈" },
  { href: "/question-bank", label: "문제 은행" },
  { href: "/interviews", label: "면접 기록" },
] as const

export function AppNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <nav
        className="mx-auto flex max-w-3xl flex-wrap items-center gap-1 px-4 py-3 sm:px-6"
        aria-label="주요 메뉴"
      >
        {links.map(({ href, label }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-muted/80 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
