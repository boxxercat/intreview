"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { clearStoredUserId, getStoredUserId } from "@/lib/authApi"

export function HomeAuthActions() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  const syncFromStorage = useCallback(() => {
    setLoggedIn(!!getStoredUserId())
  }, [])

  useEffect(() => {
    syncFromStorage()
    setReady(true)
  }, [syncFromStorage])

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

  if (!ready) {
    return <div className="mt-4 h-10" aria-hidden />
  }

  if (loggedIn) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={logout}>
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button asChild>
        <Link href="/login">로그인</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/register">회원가입</Link>
      </Button>
    </div>
  )
}
