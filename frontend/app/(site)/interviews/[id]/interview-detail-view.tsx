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
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Accordion } from "radix-ui"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { QuestionBankPickerDialog } from "@/components/question-bank/question-bank-picker-dialog"
import { Button } from "@/components/ui/button"
import { getStoredUserId } from "@/lib/authApi"
import {
  uiBackLink,
  uiErrorBanner,
  uiIconButton,
  uiInput,
  uiListShell,
  uiPanel,
  uiSelect,
  uiTextarea,
} from "@/lib/ui"
import { cn } from "@/lib/utils"
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
  type InterviewDetail,
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
  patchPreparationQuestion,
} from "@/lib/preparationQuestionApi"
import {
  createQuestionBankQuestion,
  type QuestionBankSummary,
} from "@/lib/questionBankApi"

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
  const [interviewRound, setInterviewRound] = useState("")

  const [prepList, setPrepList] = useState<PreparationQuestion[]>([])
  const [prepLoading, setPrepLoading] = useState(false)
  const [prepDraft, setPrepDraft] = useState("")
  const [prepPractice, setPrepPractice] = useState("")
  const [prepBankPick, setPrepBankPick] = useState<QuestionBankSummary | null>(
    null
  )
  const [prepBankDialogOpen, setPrepBankDialogOpen] = useState(false)
  const [prepSubmitting, setPrepSubmitting] = useState(false)

  const [iqBankPick, setIqBankPick] = useState<QuestionBankSummary | null>(null)
  const [iqBankDialogOpen, setIqBankDialogOpen] = useState(false)

  const [orderedIqList, setOrderedIqList] = useState<
    InterviewQuestionSummary[]
  >([])
  const [iqLoading, setIqLoading] = useState(false)
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
      setInterviewRound(d.interviewRound ?? "")
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
        sort: "createdAt,asc",
      })
      setPrepList(res.content)
    } catch {
      setPrepList([])
    } finally {
      setPrepLoading(false)
    }
  }, [])

  const iqOrderPersistedRef = useRef<string | null>(null)

  const fetchIq = useCallback(async () => {
    setIqLoading(true)
    try {
      const res = await listInterviewQuestions(interviewId, {
        page: 0,
        size: 100,
        sort: "sortOrder,asc",
      })
      setOrderedIqList(res.content)
      iqOrderPersistedRef.current = res.content.map((q) => q.id).join(",")
      setIqDetails({})
    } catch {
      setOrderedIqList([])
      iqOrderPersistedRef.current = null
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
    if (iqSource !== "FROM_BANK") setIqBankPick(null)
  }, [iqSource])

  useEffect(() => {
    if (expandedId === null) return
    if (iqDetails[expandedId] !== undefined) return
    let cancelled = false
    void getInterviewQuestion(interviewId, expandedId)
      .then((d) => {
        if (!cancelled) {
          setIqDetails((p) => ({ ...p, [expandedId]: d }))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("면접 질문 상세를 불러오지 못했습니다.")
          setExpandedId(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [expandedId, interviewId, iqDetails])

  const interviewBaselineRef = useRef<string | null>(null)

  useEffect(() => {
    if (!interview) return
    interviewBaselineRef.current = JSON.stringify({
      companyName: interview.companyName,
      positionTitle: interview.positionTitle,
      interviewDate: interview.interviewDate,
      interviewRound: interview.interviewRound ?? "",
    })
  }, [interview])

  useEffect(() => {
    if (!interview || ivLoading) return
    const c = companyName.trim()
    const p = positionTitle.trim()
    if (!c || !p || !interviewDate) return
    const snapshot = JSON.stringify({
      companyName: c,
      positionTitle: p,
      interviewDate,
      interviewRound: interviewRound.trim(),
    })
    if (snapshot === interviewBaselineRef.current) return
    const t = setTimeout(() => {
      void (async () => {
        setIvSaving(true)
        setError(null)
        try {
          const d = await updateInterview(interviewId, {
            companyName: c,
            positionTitle: p,
            interviewDate,
            interviewRound: interviewRound.trim() || null,
          })
          setInterview(d)
          interviewBaselineRef.current = JSON.stringify({
            companyName: d.companyName,
            positionTitle: d.positionTitle,
            interviewDate: d.interviewDate,
            interviewRound: d.interviewRound ?? "",
          })
        } catch (e) {
          setError(e instanceof Error ? e.message : "저장에 실패했습니다.")
        } finally {
          setIvSaving(false)
        }
      })()
    }, 600)
    return () => clearTimeout(t)
  }, [
    companyName,
    positionTitle,
    interviewDate,
    interviewRound,
    interview,
    interviewId,
    ivLoading,
  ])

  async function handleDeleteInterview() {
    if (!confirm("면접 기록을 삭제할까요?")) return
    setError(null)
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
      if (prepBankPick) {
        await createPreparationQuestion({
          sourceType: "FROM_BANK",
          questionBankQuestionId: prepBankPick.id,
          practiceAnswer: prepPractice.trim() || null,
        })
        setPrepBankPick(null)
        setPrepDraft("")
        setPrepPractice("")
      } else {
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

  function handleIqDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrderedIqList((items) => {
      const oldIndex = items.findIndex((q) => String(q.id) === active.id)
      const newIndex = items.findIndex((q) => String(q.id) === over.id)
      if (oldIndex < 0 || newIndex < 0) return items
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  useEffect(() => {
    if (!interview || iqLoading || orderedIqList.length === 0) return
    const ids = orderedIqList.map((q) => q.id).join(",")
    if (iqOrderPersistedRef.current === null) {
      iqOrderPersistedRef.current = ids
      return
    }
    if (ids === iqOrderPersistedRef.current) return
    const t = setTimeout(() => {
      void (async () => {
        setIqOrderSaving(true)
        setError(null)
        try {
          await reorderInterviewQuestions(
            interviewId,
            orderedIqList.map((q) => q.id)
          )
          iqOrderPersistedRef.current = ids
          await fetchIq()
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "순서 저장에 실패했습니다."
          )
        } finally {
          setIqOrderSaving(false)
        }
      })()
    }, 400)
    return () => clearTimeout(t)
  }, [orderedIqList, interviewId, interview, iqLoading, fetchIq])

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

  const handleSaveIqPatch = useCallback(
    async (qid: number, reviewText: string): Promise<void> => {
      setError(null)
      try {
        const updated = await patchInterviewQuestion(interviewId, qid, {
          reviewText,
        })
        setIqDetails((prev) => ({ ...prev, [qid]: updated }))
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장에 실패했습니다.")
      }
    },
    [interviewId]
  )

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
        <p className={uiErrorBanner}>{error}</p>
        <Link href="/interviews" className={uiBackLink}>
          ← 면접 목록
        </Link>
      </div>
    )
  }

  if (!interview) return null

  return (
    <div className="space-y-12">
      <p className="text-sm">
        <Link href="/interviews" className={uiBackLink}>
          ← 면접 목록
        </Link>
      </p>

      {error ? <p className={cn(uiErrorBanner, "text-sm")}>{error}</p> : null}

      <header className="space-y-5 border-b border-border/80 pb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              면접 복기
            </h1>
            {ivSaving ? (
              <span className="text-xs text-muted-foreground">저장 중…</span>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(uiIconButton, "shrink-0")}
            disabled={ivSaving}
            aria-label="면접 삭제"
            onClick={() => void handleDeleteInterview()}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={18}
              className="pointer-events-none"
            />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              회사명
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={120}
              disabled={ivSaving}
              className={cn("mt-1.5", uiInput)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              직무
            </label>
            <input
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              maxLength={120}
              disabled={ivSaving}
              className={cn("mt-1.5", uiInput)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              면접일
            </label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              disabled={ivSaving}
              className={cn("mt-1.5", uiInput)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              면접 구분 (선택)
            </label>
            <input
              type="text"
              value={interviewRound}
              onChange={(e) => setInterviewRound(e.target.value)}
              maxLength={2000}
              disabled={ivSaving}
              className={cn("mt-1.5", uiInput)}
            />
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          준비
        </h2>

        <div className={cn(uiPanel, "space-y-4")}>
          <textarea
            value={prepDraft}
            onChange={(e) => {
              const v = e.target.value
              setPrepDraft(v)
              if (
                prepBankPick &&
                v.trim() !== prepBankPick.questionText.trim()
              ) {
                setPrepBankPick(null)
              }
            }}
            placeholder="준비 질문"
            maxLength={4000}
            rows={3}
            disabled={prepSubmitting}
            className={uiTextarea}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={prepBankPick ? "default" : "outline"}
              size="sm"
              disabled={prepSubmitting}
              onClick={() => setPrepBankDialogOpen(true)}
            >
              문제 은행에서 선택
            </Button>
            {prepBankPick ? (
              <span className="text-xs text-muted-foreground">
                은행 #{prepBankPick.id} ·{" "}
                <button
                  type="button"
                  className="text-foreground underline underline-offset-2 hover:no-underline"
                  disabled={prepSubmitting}
                  onClick={() => setPrepBankPick(null)}
                >
                  해제
                </button>
              </span>
            ) : null}
          </div>
          <textarea
            value={prepPractice}
            onChange={(e) => setPrepPractice(e.target.value)}
            placeholder="연습 답변"
            maxLength={8000}
            rows={3}
            disabled={prepSubmitting}
            className={uiTextarea}
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
          <ul className={cn(uiListShell, "divide-y divide-border/80 p-0 text-sm")}>
            {prepList.map((p) => (
              <PreparationQuestionRow
                key={p.id}
                item={p}
                onPatched={(updated) => {
                  setError(null)
                  setPrepList((list) =>
                    list.map((row) => (row.id === updated.id ? updated : row))
                  )
                }}
                onPatchError={(msg) => setError(msg)}
                onDelete={() => void handleDeletePrep(p.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          면접 질문 · 복기
        </h2>

        <div className={cn(uiPanel, "space-y-4")}>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              출처
            </label>
            <select
              value={iqSource}
              onChange={(e) =>
                setIqSource(e.target.value as InterviewQuestionSourceType)
              }
              disabled={iqSubmitting}
              className={cn("mt-1.5 max-w-md", uiSelect)}
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
              className={uiTextarea}
            />
          ) : null}

          {iqSource === "FROM_PREPARATION" ? (
            <select
              value={iqPrepId}
              onChange={(e) => setIqPrepId(e.target.value)}
              disabled={iqSubmitting || prepList.length === 0}
              className={cn("max-w-md", uiSelect)}
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
            <div className="space-y-3">
              {iqBankPick ? (
                <div className="rounded-lg border border-border/80 bg-muted/40 p-4 text-sm leading-relaxed">
                  <p className="font-mono text-xs text-muted-foreground">
                    선택됨 · ID {iqBankPick.id}
                  </p>
                  <p className="mt-2 text-foreground">{iqBankPick.questionText}</p>
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
                variant={iqBankPick ? "default" : "outline"}
                size="sm"
                disabled={iqSubmitting}
                onClick={() => setIqBankDialogOpen(true)}
              >
                문제 은행에서 선택
              </Button>
            </div>
          ) : null}

          {iqOrderSaving ? (
            <p className="text-xs text-muted-foreground">순서 저장 중…</p>
          ) : null}

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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleIqDragEnd}
            >
              <Accordion.Root
                type="single"
                collapsible
                value={
                  expandedId !== null ? String(expandedId) : undefined
                }
                onValueChange={(v) => {
                  setExpandedId(v ? Number(v) : null)
                }}
              >
                <SortableContext
                  items={orderedIqList.map((q) => String(q.id))}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="list-none space-y-2 p-0">
                    {orderedIqList.map((q, index) => (
                      <SortableIqRow
                        key={q.id}
                        question={q}
                        listIndex={index + 1}
                        iqDetails={iqDetails}
                        onSaveReview={(review) =>
                          handleSaveIqPatch(q.id, review)
                        }
                        onDelete={() => void handleDeleteIq(q.id)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </Accordion.Root>
            </DndContext>
          </div>
        )}
      </section>

      <QuestionBankPickerDialog
        open={prepBankDialogOpen}
        onOpenChange={setPrepBankDialogOpen}
        onSelect={(q) => {
          setPrepBankPick(q)
          setPrepDraft(q.questionText)
        }}
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

function PreparationQuestionRow({
  item,
  onPatched,
  onPatchError,
  onDelete,
}: {
  item: PreparationQuestion
  onPatched: (updated: PreparationQuestion) => void
  onPatchError: (message: string) => void
  onDelete: () => void
}) {
  const [questionText, setQuestionText] = useState(item.questionTextSnapshot)
  const [practiceAnswer, setPracticeAnswer] = useState(
    item.practiceAnswer ?? ""
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setQuestionText(item.questionTextSnapshot)
    setPracticeAnswer(item.practiceAnswer ?? "")
  }, [item.id])

  useEffect(() => {
    const q = questionText.trim()
    if (!q) return
    const body: { questionTextSnapshot?: string; practiceAnswer?: string } =
      {}
    if (q !== item.questionTextSnapshot.trim()) {
      body.questionTextSnapshot = q
    }
    const a = practiceAnswer.trim()
    const prevA = (item.practiceAnswer ?? "").trim()
    if (a !== prevA) {
      body.practiceAnswer = a
    }
    if (Object.keys(body).length === 0) return

    const t = setTimeout(() => {
      void (async () => {
        setSaving(true)
        try {
          const updated = await patchPreparationQuestion(item.id, body)
          onPatched(updated)
        } catch (e) {
          onPatchError(
            e instanceof Error ? e.message : "준비 질문 수정에 실패했습니다."
          )
        } finally {
          setSaving(false)
        }
      })()
    }, 600)
    return () => clearTimeout(t)
  }, [
    questionText,
    practiceAnswer,
    item.id,
    item.questionTextSnapshot,
    item.practiceAnswer,
  ])

  return (
    <li className="flex flex-col gap-4 px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 font-mono text-xs text-muted-foreground">
          #{item.id} · {PREPARATION_SOURCE_LABEL[item.sourceType]}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(uiIconButton, "shrink-0 -mt-1")}
          disabled={saving}
          aria-label="삭제"
          onClick={onDelete}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={18}
            className="pointer-events-none"
          />
        </Button>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          질문
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          maxLength={4000}
          rows={3}
          disabled={saving}
          className={uiTextarea}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          연습 답변
        </label>
        <textarea
          value={practiceAnswer}
          onChange={(e) => setPracticeAnswer(e.target.value)}
          maxLength={8000}
          rows={4}
          disabled={saving}
          placeholder="선택"
          className={uiTextarea}
        />
      </div>
      {saving ? (
        <p className="text-xs text-muted-foreground">저장 중…</p>
      ) : null}
    </li>
  )
}

function SortableIqRow({
  question: q,
  listIndex,
  iqDetails,
  onSaveReview,
  onDelete,
}: {
  question: InterviewQuestionSummary
  listIndex: number
  iqDetails: Record<number, InterviewQuestionDetail | undefined>
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
    <li ref={setNodeRef} style={style} className="list-none">
      <Accordion.Item
        value={String(q.id)}
        className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_0_rgb(0_0_0/_0.04)]"
      >
        <Accordion.Header className="m-0 flex w-full items-stretch">
          <Accordion.Trigger className="group flex min-w-0 flex-1 items-start gap-2 border-r border-border/60 px-3 py-3 text-left text-sm leading-relaxed outline-none hover:bg-muted/35 data-[state=open]:bg-muted/25">
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
            <span className="min-w-0 flex-1">
              <span className="font-mono text-xs text-muted-foreground">
                #{listIndex}
              </span>{" "}
              {q.questionTextSnapshot}
            </span>
          </Accordion.Trigger>
          <button
            type="button"
            className="flex w-10 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground hover:bg-muted/40 active:cursor-grabbing"
            aria-label="순서 변경"
            {...attributes}
            {...listeners}
          >
            <HugeiconsIcon
              icon={Menu01Icon}
              size={20}
              className="pointer-events-none"
            />
          </button>
        </Accordion.Header>
        <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden border-t border-border/60 text-sm">
          <div className="bg-muted/15 px-3 pb-4 pt-3">
            {iqDetails[q.id] ? (
              <InterviewQuestionCard
                detail={iqDetails[q.id]!}
                onSave={onSaveReview}
                onDelete={onDelete}
              />
            ) : (
              <p className="text-xs text-muted-foreground">불러오는 중…</p>
            )}
          </div>
        </Accordion.Content>
      </Accordion.Item>
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
  const [bankSaving, setBankSaving] = useState(false)
  const [bankNotice, setBankNotice] = useState<{
    kind: "ok" | "err"
    text: string
  } | null>(null)

  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  useEffect(() => {
    setReview(detail.reviewText ?? "")
  }, [detail.id])

  useEffect(() => {
    if (review === (detail.reviewText ?? "")) return
    const t = setTimeout(() => {
      void (async () => {
        setSaving(true)
        try {
          await onSaveRef.current(review)
        } finally {
          setSaving(false)
        }
      })()
    }, 600)
    return () => clearTimeout(t)
  }, [review, detail.reviewText, detail.id])

  const fromBank =
    detail.sourceType === "FROM_BANK" &&
    detail.questionBankQuestionId != null

  async function handleAddToQuestionBank() {
    const text = detail.questionTextSnapshot.trim()
    if (!text) return
    if (
      !confirm("이 질문을 문제 은행에 추가할까요?")
    ) {
      return
    }
    setBankSaving(true)
    setBankNotice(null)
    try {
      await createQuestionBankQuestion({
        questionText: text,
        sourceType: "IMPORTED_FROM_INTERVIEW",
      })
      setBankNotice({ kind: "ok", text: "문제 은행에 추가했습니다." })
    } catch (e) {
      setBankNotice({
        kind: "err",
        text: e instanceof Error ? e.message : "추가에 실패했습니다.",
      })
    } finally {
      setBankSaving(false)
    }
  }

  return (
    <div className="space-y-4 px-1 py-1 text-sm sm:px-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <label className="text-xs font-medium text-muted-foreground">
            복기
          </label>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(uiIconButton, "shrink-0 -mt-1")}
          disabled={saving}
          aria-label="삭제"
          onClick={onDelete}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={18}
            className="pointer-events-none"
          />
        </Button>
      </div>
      <div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength={8000}
          rows={7}
          disabled={saving}
          placeholder="면접 직후 느낀 점, 보완할 답변 등"
          className={cn(uiTextarea, "min-h-40")}
        />
      </div>
      {saving ? (
        <p className="text-xs text-muted-foreground">저장 중…</p>
      ) : null}
      {fromBank ? (
        <p className="text-xs text-muted-foreground">
          <Link
            href={`/question-bank/${detail.questionBankQuestionId}`}
            className="text-foreground underline underline-offset-2"
          >
            문제 은행에서 보기
          </Link>
        </p>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving || bankSaving}
            onClick={() => void handleAddToQuestionBank()}
          >
            {bankSaving ? "추가 중…" : "문제 은행에 추가"}
          </Button>
          {bankNotice ? (
            <p
              className={
                bankNotice.kind === "ok"
                  ? "text-xs text-muted-foreground"
                  : "text-xs text-destructive"
              }
            >
              {bankNotice.text}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
