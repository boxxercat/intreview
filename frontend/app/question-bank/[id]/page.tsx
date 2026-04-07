"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { getStoredUserId } from "@/lib/authApi"
import {
  SOURCE_TYPE_LABEL,
  deleteQuestionBankQuestion,
  getQuestionBankQuestion,
  patchQuestionBankQuestion,
  type QuestionBankDetail,
} from "@/lib/questionBankApi"

export default function QuestionBankDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rawId = params.id
  const id = typeof rawId === "string" ? Number(rawId) : Number.NaN

  const [authReady, setAuthReady] = useState(false)
  const [hasUser, setHasUser] = useState(false)
  const [detail, setDetail] = useState<QuestionBankDetail | null>(null)
  const [text, setText] = useState("")
  const [archived, setArchived] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) return
    setLoading(true)
    setError(null)
    try {
      const d = await getQuestionBankQuestion(id)
      setDetail(d)
      setText(d.questionText)
      setArchived(d.archived)
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오지 못했습니다.")
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    setHasUser(!!getStoredUserId())
    setAuthReady(true)
  }, [])

  useEffect(() => {
    if (!authReady || !hasUser) {
      setLoading(false)
      return
    }
    if (!Number.isFinite(id) || id <= 0) {
      setLoading(false)
      return
    }
    void fetchDetail()
  }, [authReady, hasUser, id, fetchDetail])

  useEffect(() => {
    if (!detail) return
    const trimmed = text.trim()
    if (!trimmed) return
    if (trimmed === detail.questionText) return
    const t = setTimeout(() => {
      void (async () => {
        setSaving(true)
        setError(null)
        try {
          const updated = await patchQuestionBankQuestion(id, {
            questionText: trimmed,
          })
          setDetail(updated)
          setText(updated.questionText)
          setArchived(updated.archived)
        } catch (e) {
          setError(e instanceof Error ? e.message : "저장에 실패했습니다.")
        } finally {
          setSaving(false)
        }
      })()
    }, 600)
    return () => clearTimeout(t)
  }, [text, id, detail])

  async function handleToggleArchived(next: boolean) {
    const prev = archived
    setArchived(next)
    setSaving(true)
    setError(null)
    try {
      const updated = await patchQuestionBankQuestion(id, { archived: next })
      setDetail(updated)
      setArchived(updated.archived)
    } catch (e) {
      setArchived(prev)
      setError(e instanceof Error ? e.message : "수정에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("이 질문을 삭제할까요?")) return
    setError(null)
    try {
      await deleteQuestionBankQuestion(id)
      router.push("/question-bank")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.")
    }
  }

  if (!authReady) {
    return <p className="text-sm text-muted-foreground">불러오는 중…</p>
  }

  if (!hasUser) {
    return (
      <div className="space-y-4 text-sm">
        <h1 className="text-xl font-semibold">질문 상세</h1>
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
        <Button asChild>
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    )
  }

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <p className="text-sm text-muted-foreground">
        잘못된 질문 ID입니다.{" "}
        <Link href="/question-bank" className="underline">
          목록으로
        </Link>
      </p>
    )
  }

  if (loading && !detail) {
    return <p className="text-sm text-muted-foreground">불러오는 중…</p>
  }

  if (error && !detail) {
    return (
      <div className="space-y-4 text-sm">
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
          {error}
        </p>
        <Link href="/question-bank" className="text-muted-foreground underline">
          ← Question Bank 목록
        </Link>
      </div>
    )
  }

  if (!detail) return null

  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link href="/question-bank" className="text-muted-foreground underline">
          ← Question Bank
        </Link>
      </p>

      <header className="flex items-start justify-between gap-2 border-b border-border pb-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold">질문 상세</h1>
          <p className="text-sm text-muted-foreground">
            {SOURCE_TYPE_LABEL[detail.sourceType]} · ID {detail.id}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-black hover:bg-muted dark:text-neutral-100"
          disabled={saving}
          aria-label="삭제"
          onClick={() => void handleDelete()}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={18}
            className="pointer-events-none"
          />
        </Button>
      </header>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="qb-detail-text" className="text-sm font-medium">
            질문 내용
          </label>
          {saving ? (
            <span className="text-xs text-muted-foreground">저장 중…</span>
          ) : null}
        </div>
        <textarea
          id="qb-detail-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={4000}
          rows={8}
          disabled={saving}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </section>

      <section className="flex flex-wrap items-center gap-4 rounded-md border border-border p-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={archived}
            disabled={saving}
            onChange={(e) => void handleToggleArchived(e.target.checked)}
            className="size-4 rounded border-input"
          />
          보관(archived)
        </label>
        <p className="text-xs text-muted-foreground">
          보관된 질문은 목록에서 취소선으로 표시됩니다.
        </p>
      </section>

      <section className="space-y-2 text-xs text-muted-foreground">
        <p>생성: {new Date(detail.createdAt).toLocaleString()}</p>
        <p>수정: {new Date(detail.updatedAt).toLocaleString()}</p>
      </section>
    </div>
  )
}
