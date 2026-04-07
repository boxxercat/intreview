"use client"

import { Dialog } from "radix-ui"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  SOURCE_TYPE_LABEL,
  listQuestionBankQuestions,
  type QuestionBankSummary,
} from "@/lib/questionBankApi"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (question: QuestionBankSummary) => void
  title?: string
}

export function QuestionBankPickerDialog({
  open,
  onOpenChange,
  onSelect,
  title = "문제 은행에서 선택",
}: Props) {
  const [rows, setRows] = useState<QuestionBankSummary[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    void listQuestionBankQuestions({
      page: 0,
      size: 200,
      sort: "createdAt,desc",
    })
      .then((res) => {
        if (!cancelled) {
          setRows(res.content.filter((q) => !q.archived))
        }
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  function pick(q: QuestionBankSummary) {
    onSelect(q)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          )}
        />
        <Dialog.Content
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 max-h-[min(85vh,720px)] w-[min(calc(100vw-2rem),720px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/80 bg-card p-5 shadow-[0_8px_30px_rgb(0_0_0/_0.08)] outline-none"
          )}
        >
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            행을 클릭하거나 선택을 누르세요. 보관 항목은 제외됩니다.
          </Dialog.Description>

          <div className="mt-4 max-h-[min(55vh,480px)] overflow-auto rounded-md border border-border">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">불러오는 중…</p>
            ) : rows.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                선택할 질문이 없습니다. Question Bank에 먼저 등록해 주세요.
              </p>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="sticky top-0 px-3 py-2 font-medium">ID</th>
                    <th className="sticky top-0 px-3 py-2 font-medium">질문</th>
                    <th className="sticky top-0 px-3 py-2 font-medium">출처</th>
                    <th className="sticky top-0 px-3 py-2 font-medium w-24" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((q) => (
                    <tr
                      key={q.id}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                      onClick={() => pick(q)}
                    >
                      <td className="align-top px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {q.id}
                      </td>
                      <td className="align-top px-3 py-2">{q.questionText}</td>
                      <td className="align-top px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {SOURCE_TYPE_LABEL[q.sourceType]}
                      </td>
                      <td className="align-top px-2 py-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            pick(q)
                          }}
                        >
                          선택
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                닫기
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
