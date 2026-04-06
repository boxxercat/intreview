"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/question-bank", label: "Question Bank" },
  { href: "/interviews", label: "Interview" },
] as const

export function AppNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-background px-4 py-3">
      <nav className="mx-auto flex max-w-3xl flex-wrap gap-x-6 gap-y-2 text-sm">
        {links.map(({ href, label }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={
                active ? "font-medium text-foreground" : "text-muted-foreground"
              }
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
