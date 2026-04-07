"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePickerField } from "@/components/date-picker-field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getStoredUserId } from "@/lib/authApi"
import { uiPageTitle } from "@/lib/ui"
import { cn } from "@/lib/utils"
import {
  type InterviewSummary,
  createInterview,
  deleteInterview,
  listInterviews,
} from "@/lib/interviewApi"

export default function InterviewsPage() {
  const [authReady, setAuthReady] = useState(false)
  const [hasUser, setHasUser] = useState(false)
  const [list, setList] = useState<InterviewSummary[]>([])
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

  const [companyName, setCompanyName] = useState("")
  const [positionTitle, setPositionTitle] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewRound, setInterviewRound] = useState("")
  const [creating, setCreating] = useState(false)

  const load = useCallback(async (pageIndex: number) => {
    if (!getStoredUserId()) return
    setLoading(true)
    setError(null)
    try {
      const res = await listInterviews({
        page: pageIndex,
        size: 20,
        sort: "interviewDate,desc",
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
    const company = companyName.trim()
    const position = positionTitle.trim()
    if (!company || !position || !interviewDate) return
    setCreating(true)
    setError(null)
    try {
      await createInterview({
        companyName: company,
        positionTitle: position,
        interviewDate,
        interviewRound: interviewRound.trim() || null,
      })
      setCompanyName("")
      setPositionTitle("")
      setInterviewDate("")
      setInterviewRound("")
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
    if (!confirm("이 면접 기록을 삭제할까요? (관련 면접 질문도 함께 삭제될 수 있습니다)"))
      return
    setError(null)
    try {
      await deleteInterview(id)
      await load(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.")
    }
  }

  if (!authReady) {
    return <div className="text-sm text-muted-foreground">불러오는 중…</div>
  }

  if (!hasUser) {
    return (
      <div className="space-y-4 text-sm">
        <h1 className={uiPageTitle}>면접 기록</h1>
        <p className="text-muted-foreground">로그인 후 이용할 수 있습니다.</p>
        <Button asChild>
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className={uiPageTitle}>면접 기록</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          총 {pageInfo?.totalElements ?? "—"}건
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
            새 면접
          </CardTitle>
          <CardDescription className="sr-only">
            면접 정보를 입력한 뒤 등록합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel
              htmlFor="iv-company"
              className="text-xs font-normal text-muted-foreground"
            >
              회사명
            </FieldLabel>
            <Input
              id="iv-company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={120}
              disabled={creating}
            />
          </Field>
          <Field>
            <FieldLabel
              htmlFor="iv-position"
              className="text-xs font-normal text-muted-foreground"
            >
              직무
            </FieldLabel>
            <Input
              id="iv-position"
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              maxLength={120}
              disabled={creating}
            />
          </Field>
          <Field>
            <FieldLabel
              htmlFor="iv-date"
              className="text-xs font-normal text-muted-foreground"
            >
              면접일
            </FieldLabel>
            <DatePickerField
              id="iv-date"
              value={interviewDate}
              onChange={setInterviewDate}
              disabled={creating}
            />
          </Field>
          <Field>
            <FieldLabel
              htmlFor="iv-round"
              className="text-xs font-normal text-muted-foreground"
            >
              면접 구분 (선택)
            </FieldLabel>
            <Input
              id="iv-round"
              type="text"
              value={interviewRound}
              onChange={(e) => setInterviewRound(e.target.value)}
              maxLength={2000}
              disabled={creating}
            />
          </Field>
        </div>
        <Button
          type="button"
          onClick={() => void handleCreate()}
          disabled={
            creating || !companyName.trim() || !positionTitle.trim() || !interviewDate
          }
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
          <p className="text-sm text-muted-foreground">등록된 면접이 없습니다.</p>
        ) : (
          <Card className="gap-0 py-0">
            <CardContent className="divide-y divide-border/80 px-0 py-0">
          <ul className="list-none space-y-0 p-0">
            {list.map((it) => (
              <li key={it.id} className="relative p-4">
                <Link
                  href={`/interviews/${it.id}`}
                  className="block min-w-0 pr-10 transition-colors hover:bg-muted/30"
                >
                  <p className="font-medium text-foreground">{it.companyName}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {it.positionTitle} · {it.interviewDate}
                    {it.interviewRound.trim()
                      ? ` · ${it.interviewRound.trim()}`
                      : ""}
                  </p>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "absolute right-2 top-2 z-10 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                  aria-label="삭제"
                  onClick={(e) => void handleDelete(it.id, e)}
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
