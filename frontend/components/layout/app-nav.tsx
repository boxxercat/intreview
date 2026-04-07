"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { clearStoredUserId, getStoredUserId } from "@/lib/authApi"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "홈" },
  { href: "/question-bank", label: "문제 은행" },
  { href: "/interviews", label: "면접 기록" },
] as const

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  const syncFromStorage = useCallback(() => {
    setLoggedIn(!!getStoredUserId())
  }, [])

  useEffect(() => {
    syncFromStorage()
    setAuthReady(true)
  }, [syncFromStorage])

  /** 레이아웃이 유지된 채 로그인/로그아웃 후 이동할 때 반영 */
  useEffect(() => {
    syncFromStorage()
  }, [pathname, syncFromStorage])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "userId") syncFromStorage()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [syncFromStorage])

  function logout() {
    clearStoredUserId()
    setLoggedIn(false)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <nav
        className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3 sm:px-6"
        aria-label="주요 메뉴"
      >
        <div className="flex flex-wrap items-center gap-1">
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
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2" aria-label="계정">
          {!authReady ? (
            <div
              className="h-8 w-[148px] rounded-md bg-muted/40"
              aria-hidden
            />
          ) : loggedIn ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
            >
              로그아웃
            </Button>
          ) : (
            <>
              <Button size="sm" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/register">회원가입</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
