"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
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
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getStoredUserId } from "@/lib/authApi"
import { uiPageTitle } from "@/lib/ui"
import {
  SOURCE_TYPE_LABEL,
  type QuestionAssetSourceType,
  type QuestionBankSummary,
  createQuestionBankQuestion,
  deleteQuestionBankQuestion,
  listQuestionBankQuestions,
} from "@/lib/questionBankApi"

export default function QuestionBankPage() {
  const [authReady, setAuthReady] = useState(false)
  const [hasUser, setHasUser] = useState(false)
  const [list, setList] = useState<QuestionBankSummary[]>([])
  const [pageInfo, setPageInfo] = useState<{
    number: number
    totalPages: number
    first: boolean
    last: boolean
    totalElements: number
  } | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [draft, setDraft] = useState("")
  const [sourceType, setSourceType] =
    useState<QuestionAssetSourceType>("MANUAL")
  const [creating, setCreating] = useState(false)

  const load = useCallback(async (pageIndex: number) => {
    if (!getStoredUserId()) return
    setLoading(true)
    setError(null)
    try {
      const res = await listQuestionBankQuestions({
        page: pageIndex,
        size: 20,
        sort: "createdAt,desc",
      })
      setList(res.content)
      setPageInfo({
        number: res.page.number,
        totalPages: res.page.totalPages,
        first: res.page.first,
        last: res.page.last,
        totalElements: res.page.totalElements,
      })
      setPage(pageIndex)
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.")
      setList([])
      setPageInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setHasUser(!!getStoredUserId())
    setAuthReady(true)
  }, [])

  useEffect(() => {
    if (!authReady || !hasUser) {
      setLoading(false)
      return
    }
    void load(page)
  }, [authReady, hasUser, load, page])

  async function handleCreate() {
    const text = draft.trim()
    if (!text) return
    setCreating(true)
    setError(null)
    try {
      await createQuestionBankQuestion({
        questionText: text,
        sourceType,
      })
      setDraft("")
      setSourceType("MANUAL")
      if (page === 0) await load(0)
      else setPage(0)
    } catch (e) {
      setError(e instanceof Error ? e.message : "등록에 실패했습니다.")
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("이 질문을 삭제할까요?")) return
    setError(null)
    try {
      await deleteQuestionBankQuestion(id)
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.")
    }
  }

  if (!authReady) {
    return (
      <div className="text-sm text-muted-foreground">불러오는 중…</div>
    )
  }

  if (!hasUser) {
    return (
      <div className="space-y-4 text-sm">
        <h1 className={uiPageTitle}>문제 은행</h1>
        <p className="text-muted-foreground">
          로그인 후 이용할 수 있습니다.
        </p>
        <Button asChild>
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className={uiPageTitle}>문제 은행</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          저장해 둔 질문 · 총 {pageInfo?.totalElements ?? "—"}건
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            새 질문
          </CardTitle>
          <CardDescription className="sr-only">
            출처와 질문을 입력한 뒤 등록합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <Field>
          <FieldLabel
            htmlFor="qb-source"
            className="text-xs font-normal text-muted-foreground"
          >
            출처 유형
          </FieldLabel>
          <Select
            value={sourceType}
            onValueChange={(v) =>
              setSourceType(v as QuestionAssetSourceType)
            }
            disabled={creating}
          >
            <SelectTrigger id="qb-source" className="max-w-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANUAL">{SOURCE_TYPE_LABEL.MANUAL}</SelectItem>
              <SelectItem value="IMPORTED_FROM_INTERVIEW">
                {SOURCE_TYPE_LABEL.IMPORTED_FROM_INTERVIEW}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel
            htmlFor="qb-input"
            className="text-xs font-normal text-muted-foreground"
          >
            질문 내용
          </FieldLabel>
          <Textarea
            id="qb-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="최대 4000자"
            maxLength={4000}
            rows={4}
            disabled={creating}
          />
        </Field>
        <Button
          type="button"
          onClick={() => void handleCreate()}
          disabled={creating || !draft.trim()}
        >
          {creating ? "등록 중…" : "등록"}
        </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          목록
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">등록된 질문이 없습니다.</p>
        ) : (
          <Card className="gap-0 py-0">
            <CardContent className="divide-y divide-border/80 px-0 py-0">
          <ul className="list-none space-y-0 p-0">
            {list.map((q) => (
              <li key={q.id} className="relative p-4">
                <Link
                  href={`/question-bank/${q.id}`}
                  className="block min-w-0 pr-10 transition-colors hover:bg-muted/30"
                >
                  <p
                    className={
                      q.archived ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {q.questionText}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {SOURCE_TYPE_LABEL[q.sourceType]}
                    {q.archived ? " · 보관됨" : ""}
                  </p>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-2 z-10 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  aria-label="삭제"
                  onClick={(e) => void handleDelete(q.id, e)}
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={18}
                    className="pointer-events-none"
                  />
                </Button>
              </li>
            ))}
          </ul>
            </CardContent>
          </Card>
        )}

        {pageInfo && pageInfo.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {pageInfo.number + 1} / {pageInfo.totalPages} 페이지
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pageInfo.first || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pageInfo.last || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
