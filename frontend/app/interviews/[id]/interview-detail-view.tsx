"use client"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { QuestionBankPickerDialog } from "@/components/question-bank/question-bank-picker-dialog"
import { Button } from "@/components/ui/button"
import { getStoredUserId } from "@/lib/authApi"
import {
  INTERVIEW_QUESTION_SOURCE_LABEL,
  type InterviewQuestionDetail,
  type InterviewQuestionSourceType,
  type InterviewQuestionSummary,
  createInterviewQuestion,
  deleteInterviewQuestion,
  getInterviewQuestion,
  listInterviewQuestions,
  patchInterviewQuestion,
  reorderInterviewQuestions,
} from "@/lib/interviewQuestionApi"
import {
  INTERVIEW_STATUS_LABEL,
  type InterviewDetail,
  type InterviewStatus,
  deleteInterview,
  getInterview,
  updateInterview,
} from "@/lib/interviewApi"
import {
  PREPARATION_SOURCE_LABEL,
  type PreparationQuestion,
  createPreparationQuestion,
  deletePreparationQuestion,
  listPreparationQuestions,
} from "@/lib/preparationQuestionApi"
import type { QuestionBankSummary } from "@/lib/questionBankApi"

type Props = { interviewId: number }

export function InterviewDetailView({ interviewId }: Props) {
  const router = useRouter()

  const [authReady, setAuthReady] = useState(false)
  const [hasUser, setHasUser] = useState(false)

  const [interview, setInterview] = useState<InterviewDetail | null>(null)
  const [ivLoading, setIvLoading] = useState(true)
  const [ivSaving, setIvSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState("")
  const [positionTitle, setPositionTitle] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [status, setStatus] = useState<InterviewStatus>("DRAFT")
  const [memo, setMemo] = useState("")

  const [prepList, setPrepList] = useState<PreparationQuestion[]>([])
  const [prepLoading, setPrepLoading] = useState(false)
  const [prepDraft, setPrepDraft] = useState("")
  const [prepPractice, setPrepPractice] = useState("")
  const [prepBankPick, setPrepBankPick] = useState<QuestionBankSummary | null>(
    null
  )
  const [prepBankDialogOpen, setPrepBankDialogOpen] = useState(false)
  const [prepMode, setPrepMode] = useState<"CUSTOM" | "FROM_BANK">("CUSTOM")
  const [prepSubmitting, setPrepSubmitting] = useState(false)

  const [iqBankPick, setIqBankPick] = useState<QuestionBankSummary | null>(null)
  const [iqBankDialogOpen, setIqBankDialogOpen] = useState(false)

  const [orderedIqList, setOrderedIqList] = useState<
    InterviewQuestionSummary[]
  >([])
  const [iqLoading, setIqLoading] = useState(false)
  const [iqOrderDirty, setIqOrderDirty] = useState(false)
  const [iqOrderSaving, setIqOrderSaving] = useState(false)
  const [iqDetails, setIqDetails] = useState<
    Record<number, InterviewQuestionDetail | undefined>
  >({})
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [iqSource, setIqSource] =
    useState<InterviewQuestionSourceType>("CUSTOM")
  const [iqCustomText, setIqCustomText] = useState("")
  const [iqPrepId, setIqPrepId] = useState("")
  const [iqSubmitting, setIqSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  /** 새 질문은 항상 맨 아래(sortOrder 최대+1) */
  const nextSortOrder = useMemo(() => {
    if (orderedIqList.length === 0) return 0
    return Math.max(...orderedIqList.map((q) => q.sortOrder)) + 1
  }, [orderedIqList])

  const fetchInterview = useCallback(async () => {
    setIvLoading(true)
    setError(null)
    try {
      const d = await getInterview(interviewId)
      setInterview(d)
      setCompanyName(d.companyName)
      setPositionTitle(d.positionTitle)
      setInterviewDate(d.interviewDate)
      setStatus(d.status)
      setMemo(d.memo ?? "")
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오지 못했습니다.")
      setInterview(null)
    } finally {
      setIvLoading(false)
    }
  }, [interviewId])

  const fetchPrep = useCallback(async () => {
    setPrepLoading(true)
    try {
      const res = await listPreparationQuestions({
        page: 0,
        size: 50,
        sort: "createdAt,desc",
      })
      setPrepList(res.content)
    } catch {
      setPrepList([])
    } finally {
      setPrepLoading(false)
    }
  }, [])

  const fetchIq = useCallback(async () => {
    setIqLoading(true)
    try {
      const res = await listInterviewQuestions(interviewId, {
        page: 0,
        size: 100,
        sort: "sortOrder,asc",
      })
      setOrderedIqList(res.content)
      setIqOrderDirty(false)
      setIqDetails({})
    } catch {
      setOrderedIqList([])
    } finally {
      setIqLoading(false)
    }
  }, [interviewId])

  useEffect(() => {
    setHasUser(!!getStoredUserId())
    setAuthReady(true)
  }, [])

  useEffect(() => {
    if (!authReady || !hasUser) return
    void fetchInterview()
  }, [authReady, hasUser, fetchInterview])

  useEffect(() => {
    if (!authReady || !hasUser || !interview) return
    void fetchPrep()
    void fetchIq()
  }, [authReady, hasUser, interview, fetchPrep, fetchIq])

  useEffect(() => {
    if (prepMode !== "FROM_BANK") setPrepBankPick(null)
  }, [prepMode])

  useEffect(() => {
    if (iqSource !== "FROM_BANK") setIqBankPick(null)
  }, [iqSource])

  async function handleSaveInterview() {
    const c = companyName.trim()
    const p = positionTitle.trim()
    if (!c || !p || !interviewDate) return
    setIvSaving(true)
    setError(null)
    try {
      const d = await updateInterview(interviewId, {
        companyName: c,
        positionTitle: p,
        interviewDate,
        status,
        memo: memo.trim() || null,
      })
      setInterview(d)
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.")
    } finally {
      setIvSaving(false)
    }
  }

  async function handleDeleteInterview() {
    if (!confirm("면접 기록을 삭제할까요?")) return
    try {
      await deleteInterview(interviewId)
      router.push("/interviews")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.")
    }
  }

  async function handleAddPrep() {
    setPrepSubmitting(true)
    setError(null)
    try {
      if (prepMode === "CUSTOM") {
        const t = prepDraft.trim()
        if (!t) {
          setError("준비 질문 내용을 입력해 주세요.")
          return
        }
        await createPreparationQuestion({
          sourceType: "CUSTOM",
          questionTextSnapshot: t,
          practiceAnswer: prepPractice.trim() || null,
        })
        setPrepDraft("")
        setPrepPractice("")
      } else {
        if (!prepBankPick) {
          setError("문제 은행에서 질문을 선택해 주세요.")
          return
        }
        await createPreparationQuestion({
          sourceType: "FROM_BANK",
          questionBankQuestionId: prepBankPick.id,
          practiceAnswer: prepPractice.trim() || null,
        })
        setPrepBankPick(null)
        setPrepPractice("")
      }
      await fetchPrep()
    } catch (e) {
      setError(e instanceof Error ? e.message : "준비 질문 등록에 실패했습니다.")
    } finally {
      setPrepSubmitting(false)
    }
  }

  async function handleDeletePrep(id: number) {
    if (!confirm("준비 질문을 삭제할까요?")) return
    try {
      await deletePreparationQuestion(id)
      await fetchPrep()
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.")
    }
  }

  async function toggleExpand(qid: number) {
    if (expandedId === qid) {
      setExpandedId(null)
      return
    }
    setExpandedId(qid)
    if (iqDetails[qid]) return
    try {
      const d = await getInterviewQuestion(interviewId, qid)
      setIqDetails((prev) => ({ ...prev, [qid]: d }))
    } catch {
      setError("면접 질문 상세를 불러오지 못했습니다.")
    }
  }

  function handleIqDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrderedIqList((items) => {
      const oldIndex = items.findIndex((q) => String(q.id) === active.id)
      const newIndex = items.findIndex((q) => String(q.id) === over.id)
      if (oldIndex < 0 || newIndex < 0) return items
      return arrayMove(items, oldIndex, newIndex)
    })
    setIqOrderDirty(true)
  }

  async function handleSaveIqOrder() {
    if (orderedIqList.length === 0) return
    setIqOrderSaving(true)
    setError(null)
    try {
      await reorderInterviewQuestions(
        interviewId,
        orderedIqList.map((q) => q.id)
      )
      setIqOrderDirty(false)
      await fetchIq()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "순서 저장에 실패했습니다."
      )
    } finally {
      setIqOrderSaving(false)
    }
  }

  async function handleAddInterviewQuestion() {
    const sort = nextSortOrder

    setIqSubmitting(true)
    setError(null)
    try {
      if (iqSource === "CUSTOM") {
        const t = iqCustomText.trim()
        if (!t) {
          setError("질문 내용을 입력해 주세요.")
          return
        }
        await createInterviewQuestion(interviewId, {
          sourceType: "CUSTOM",
          questionTextSnapshot: t,
          sortOrder: sort,
        })
        setIqCustomText("")
      } else if (iqSource === "FROM_PREPARATION") {
        const pid = Number(iqPrepId)
        if (!Number.isFinite(pid) || pid <= 0) {
          setError("준비 질문을 선택해 주세요.")
          return
        }
        await createInterviewQuestion(interviewId, {
          sourceType: "FROM_PREPARATION",
          preparationQuestionId: pid,
          sortOrder: sort,
        })
        setIqPrepId("")
      } else {
        if (!iqBankPick) {
          setError("문제 은행에서 질문을 선택해 주세요.")
          return
        }
        await createInterviewQuestion(interviewId, {
          sourceType: "FROM_BANK",
          questionBankQuestionId: iqBankPick.id,
          sortOrder: sort,
        })
        setIqBankPick(null)
      }
      await fetchIq()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "면접 질문 등록에 실패했습니다."
      )
    } finally {
      setIqSubmitting(false)
    }
  }

  async function handleSaveIqPatch(
    qid: number,
    reviewText: string
  ): Promise<void> {
    setError(null)
    try {
      const updated = await patchInterviewQuestion(interviewId, qid, {
        reviewText,
      })
      setIqDetails((prev) => ({ ...prev, [qid]: updated }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.")
    }
  }

  async function handleDeleteIq(qid: number) {
    if (!confirm("이 면접 질문을 삭제할까요?")) return
    try {
      await deleteInterviewQuestion(interviewId, qid)
      setExpandedId(null)
      await fetchIq()
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
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
        <Button asChild>
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    )
  }

  if (ivLoading && !interview) {
    return <p className="text-sm text-muted-foreground">불러오는 중…</p>
  }

  if (error && !interview) {
    return (
      <div className="space-y-4 text-sm">
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
          {error}
        </p>
        <Link href="/interviews" className="text-muted-foreground underline">
          ← 목록
        </Link>
      </div>
    )
  }

  if (!interview) return null

  return (
    <div className="space-y-10">
      <p className="text-sm">
        <Link href="/interviews" className="text-muted-foreground underline">
          ← Interview List
        </Link>
      </p>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <header className="space-y-4 border-b border-border pb-6">
        <h1 className="text-xl font-semibold">면접 상세</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">회사명</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={120}
              disabled={ivSaving}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">직무</label>
            <input
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              maxLength={120}
              disabled={ivSaving}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">면접일</label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              disabled={ivSaving}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InterviewStatus)}
              disabled={ivSaving}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="DRAFT">{INTERVIEW_STATUS_LABEL.DRAFT}</option>
              <option value="COMPLETED">
                {INTERVIEW_STATUS_LABEL.COMPLETED}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={2000}
            rows={3}
            disabled={ivSaving}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void handleSaveInterview()}
            disabled={ivSaving}
          >
            {ivSaving ? "저장 중…" : "면접 정보 저장"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDeleteInterview()}
          >
            면접 삭제
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Preparation Section</h2>
          <p className="text-xs text-muted-foreground">
            계정 단위 준비 질문입니다. 실제 면접 전에 연습 답변을 여기서
            작성해 두고, 면접 후 복기는 아래 Review에서 작성합니다.
          </p>
        </div>

        <div className="rounded-md border border-border p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={prepMode === "CUSTOM" ? "default" : "outline"}
              size="sm"
              onClick={() => setPrepMode("CUSTOM")}
            >
              직접 입력
            </Button>
            <Button
              type="button"
              variant={prepMode === "FROM_BANK" ? "default" : "outline"}
              size="sm"
              onClick={() => setPrepMode("FROM_BANK")}
            >
              문제 은행에서 선택
            </Button>
          </div>
          {prepMode === "CUSTOM" ? (
            <textarea
              value={prepDraft}
              onChange={(e) => setPrepDraft(e.target.value)}
              placeholder="준비 질문 내용"
              maxLength={4000}
              rows={3}
              disabled={prepSubmitting}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          ) : (
            <div className="space-y-2">
              {prepBankPick ? (
                <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
                  <p className="font-mono text-xs text-muted-foreground">
                    선택됨 · ID {prepBankPick.id}
                  </p>
                  <p className="mt-1">{prepBankPick.questionText}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 px-2"
                    disabled={prepSubmitting}
                    onClick={() => setPrepBankPick(null)}
                  >
                    선택 취소
                  </Button>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={prepSubmitting}
                onClick={() => setPrepBankDialogOpen(true)}
              >
                문제 은행 목록 열기…
              </Button>
            </div>
          )}
          <textarea
            value={prepPractice}
            onChange={(e) => setPrepPractice(e.target.value)}
            placeholder="연습 답변 (면접 전에 작성하는 답변)"
            maxLength={8000}
            rows={3}
            disabled={prepSubmitting}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
          <Button
            type="button"
            size="sm"
            disabled={prepSubmitting}
            onClick={() => void handleAddPrep()}
          >
            준비 질문 추가
          </Button>
        </div>

        {prepLoading ? (
          <p className="text-sm text-muted-foreground">준비 질문 불러오는 중…</p>
        ) : prepList.length === 0 ? (
          <p className="text-sm text-muted-foreground">준비 질문이 없습니다.</p>
        ) : (
          <ul className="space-y-2 rounded-md border border-border p-3 text-sm">
            {prepList.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-2 border-b border-border py-2 last:border-0 sm:flex-row sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">
                    #{p.id} · {PREPARATION_SOURCE_LABEL[p.sourceType]}
                  </p>
                  <p>{p.questionTextSnapshot}</p>
                  {p.practiceAnswer ? (
                    <p className="mt-1 text-muted-foreground">
                      연습: {p.practiceAnswer}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 self-start text-destructive"
                  onClick={() => void handleDeletePrep(p.id)}
                >
                  삭제
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Review Section</h2>
          <p className="text-xs text-muted-foreground">
            실제 면접에서 나온 질문을 기록하고, 면접 후 복기만 작성합니다. 답변
            연습은 Preparation에서 이미 해 둔 내용을 바탕으로 복기를
            정리하세요. (이 면접에만 속함)
          </p>
        </div>

        <div className="rounded-md border border-border p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">출처</label>
            <select
              value={iqSource}
              onChange={(e) =>
                setIqSource(e.target.value as InterviewQuestionSourceType)
              }
              disabled={iqSubmitting}
              className="mt-1 h-9 w-full max-w-md rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="CUSTOM">
                {INTERVIEW_QUESTION_SOURCE_LABEL.CUSTOM}
              </option>
              <option value="FROM_PREPARATION">
                {INTERVIEW_QUESTION_SOURCE_LABEL.FROM_PREPARATION}
              </option>
              <option value="FROM_BANK">
                {INTERVIEW_QUESTION_SOURCE_LABEL.FROM_BANK}
              </option>
            </select>
          </div>

          {iqSource === "CUSTOM" ? (
            <textarea
              value={iqCustomText}
              onChange={(e) => setIqCustomText(e.target.value)}
              placeholder="질문 내용"
              maxLength={4000}
              rows={3}
              disabled={iqSubmitting}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          ) : null}

          {iqSource === "FROM_PREPARATION" ? (
            <select
              value={iqPrepId}
              onChange={(e) => setIqPrepId(e.target.value)}
              disabled={iqSubmitting || prepList.length === 0}
              className="h-9 w-full max-w-md rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">준비 질문 선택</option>
              {prepList.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.questionTextSnapshot.slice(0, 60)}
                  {p.questionTextSnapshot.length > 60 ? "…" : ""}
                </option>
              ))}
            </select>
          ) : null}

          {iqSource === "FROM_BANK" ? (
            <div className="space-y-2">
              {iqBankPick ? (
                <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
                  <p className="font-mono text-xs text-muted-foreground">
                    선택됨 · ID {iqBankPick.id}
                  </p>
                  <p className="mt-1">{iqBankPick.questionText}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 px-2"
                    disabled={iqSubmitting}
                    onClick={() => setIqBankPick(null)}
                  >
                    선택 취소
                  </Button>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={iqSubmitting}
                onClick={() => setIqBankDialogOpen(true)}
              >
                문제 은행 목록 열기…
              </Button>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            새 질문은 목록 맨 아래에 붙습니다. 순서는 아래 목록에서 드래그한 뒤
            &quot;순서 저장&quot;을 눌러 반영하세요.
          </p>

          <Button
            type="button"
            size="sm"
            disabled={iqSubmitting}
            onClick={() => void handleAddInterviewQuestion()}
          >
            면접 질문 추가
          </Button>
        </div>

        {iqLoading ? (
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        ) : orderedIqList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 면접 질문이 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                왼쪽 ⋮⋮ 핸들을 잡고 끌어 순서를 바꿀 수 있습니다.
              </p>
              <Button
                type="button"
                size="sm"
                variant={iqOrderDirty ? "default" : "outline"}
                disabled={!iqOrderDirty || iqOrderSaving}
                onClick={() => void handleSaveIqOrder()}
              >
                {iqOrderSaving ? "저장 중…" : "순서 저장"}
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleIqDragEnd}
            >
              <SortableContext
                items={orderedIqList.map((q) => String(q.id))}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {orderedIqList.map((q, index) => (
                    <SortableIqRow
                      key={q.id}
                      question={q}
                      listIndex={index + 1}
                      expandedId={expandedId}
                      iqDetails={iqDetails}
                      onToggleExpand={() => void toggleExpand(q.id)}
                      onSaveReview={(review) =>
                        handleSaveIqPatch(q.id, review)
                      }
                      onDelete={() => void handleDeleteIq(q.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </section>

      <QuestionBankPickerDialog
        open={prepBankDialogOpen}
        onOpenChange={setPrepBankDialogOpen}
        onSelect={(q) => setPrepBankPick(q)}
      />
      <QuestionBankPickerDialog
        open={iqBankDialogOpen}
        onOpenChange={setIqBankDialogOpen}
        title="면접 질문으로 추가할 문제 선택"
        onSelect={(q) => setIqBankPick(q)}
      />
    </div>
  )
}

function SortableIqRow({
  question: q,
  listIndex,
  expandedId,
  iqDetails,
  onToggleExpand,
  onSaveReview,
  onDelete,
}: {
  question: InterviewQuestionSummary
  listIndex: number
  expandedId: number | null
  iqDetails: Record<number, InterviewQuestionDetail | undefined>
  onToggleExpand: () => void
  onSaveReview: (review: string) => Promise<void>
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(q.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: "relative" as const,
    opacity: isDragging ? 0.85 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-border bg-background"
    >
      <div className="flex min-h-10 items-stretch">
        <button
          type="button"
          className="flex w-9 shrink-0 cursor-grab touch-none items-center justify-center border-r border-border text-muted-foreground hover:bg-muted/50 active:cursor-grabbing"
          aria-label="순서 변경"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 items-start justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/40"
        >
          <span>
            <span className="font-mono text-xs text-muted-foreground">
              #{listIndex}
            </span>{" "}
            {q.questionTextSnapshot}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {INTERVIEW_QUESTION_SOURCE_LABEL[q.sourceType]} ·{" "}
            {expandedId === q.id ? "접기" : "펼치기"}
          </span>
        </button>
      </div>
      {expandedId === q.id && iqDetails[q.id] ? (
        <InterviewQuestionCard
          detail={iqDetails[q.id]!}
          onSave={onSaveReview}
          onDelete={onDelete}
        />
      ) : null}
      {expandedId === q.id && !iqDetails[q.id] ? (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          불러오는 중…
        </p>
      ) : null}
    </li>
  )
}

function InterviewQuestionCard({
  detail,
  onSave,
  onDelete,
}: {
  detail: InterviewQuestionDetail
  onSave: (review: string) => Promise<void>
  onDelete: () => void
}) {
  const [review, setReview] = useState(detail.reviewText ?? "")
  const [saving, setSaving] = useState(false)

  const reviewUnchanged =
    review === (detail.reviewText ?? "")

  useEffect(() => {
    setReview(detail.reviewText ?? "")
  }, [detail.reviewText])

  return (
    <div className="space-y-3 border-t border-border px-3 py-3 text-sm">
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          복기 (면접 후 정리)
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          답변 연습은 Preparation 단계에서 작성한 내용을 떠올리며 복기만
          적어 주세요.
        </p>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength={8000}
          rows={6}
          disabled={saving}
          placeholder="면접 직후 느낀 점, 보완할 답변 등"
          className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={saving || reviewUnchanged}
          onClick={async () => {
            setSaving(true)
            try {
              await onSave(review)
            } finally {
              setSaving(false)
            }
          }}
        >
          {saving ? "저장 중…" : "복기 저장"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive"
          disabled={saving}
          onClick={onDelete}
        >
          삭제
        </Button>
      </div>
    </div>
  )
}
