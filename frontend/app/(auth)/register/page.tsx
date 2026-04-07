"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthShell, authFieldClass } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { login, register, setStoredUserId } from "@/lib/authApi"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const trimmed = username.trim()
      await register({ username: trimmed, password })
      const session = await login({ username: trimmed, password })
      setStoredUserId(session.id)
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.")
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      title="회원가입"
      description="영문·숫자·언더스코어 3~30자, 비밀번호 8자 이상."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            로그인
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="register-username"
            className="text-sm font-medium text-foreground"
          >
            아이디
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
            pattern="^[a-zA-Z0-9_]+$"
            title="영문, 숫자, 언더스코어만 3~30자"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={authFieldClass}
            placeholder="user_name"
            disabled={pending}
          />
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="text-sm font-medium text-foreground"
          >
            비밀번호
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={100}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
            disabled={pending}
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "가입 중…" : "가입하기"}
        </Button>
      </form>
    </AuthShell>
  )
}
