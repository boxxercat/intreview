"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { getStoredUserId } from "@/lib/authApi"
import {
  uiBackLink,
  uiIconButton,
  uiPageTitle,
} from "@/lib/ui"
import { cn } from "@/lib/utils"
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
        <h1 className={uiPageTitle}>질문 상세</h1>
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/question-bank" className={uiBackLink}>
          ← 문제 은행 목록
        </Link>
      </div>
    )
  }

  if (!detail) return null

  return (
    <div className="space-y-10">
      <p className="text-sm">
        <Link href="/question-bank" className={uiBackLink}>
          ← 문제 은행
        </Link>
      </p>

      <header className="flex items-start justify-between gap-3 border-b border-border/80 pb-6">
        <div className="min-w-0 space-y-1">
          <h1 className={uiPageTitle}>질문 상세</h1>
          <p className="text-sm text-muted-foreground">
            {SOURCE_TYPE_LABEL[detail.sourceType]} · ID {detail.id}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(uiIconButton, "shrink-0")}
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle>질문 내용</CardTitle>
            <CardDescription>
              수정 시 잠시 후 자동 저장됩니다.
            </CardDescription>
          </div>
          {saving ? (
            <span className="text-xs text-muted-foreground">저장 중…</span>
          ) : null}
        </CardHeader>
        <CardContent>
          <Textarea
            id="qb-detail-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4000}
            rows={8}
            disabled={saving}
            className="min-h-48"
            aria-label="질문 내용"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="qb-archived"
            checked={archived}
            disabled={saving}
            onCheckedChange={(v) =>
              void handleToggleArchived(v === true)
            }
          />
          <FieldLabel
            htmlFor="qb-archived"
            className="cursor-pointer text-sm font-normal text-foreground"
          >
            보관(archived)
          </FieldLabel>
        </div>
        <p className="text-xs text-muted-foreground">
          보관된 질문은 목록에서 취소선으로 표시됩니다.
        </p>
        </CardContent>
      </Card>

      <section className="space-y-2 text-xs text-muted-foreground">
        <p>생성: {new Date(detail.createdAt).toLocaleString()}</p>
        <p>수정: {new Date(detail.updatedAt).toLocaleString()}</p>
      </section>
    </div>
  )
}
