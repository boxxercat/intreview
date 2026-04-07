"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(85vh,720px)] w-[min(calc(100vw-2rem),720px)] max-w-none gap-4 sm:max-w-[720px]"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            행을 클릭하거나 선택을 누르세요. 보관 항목은 제외됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(55vh,480px)] overflow-auto rounded-md border border-border">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">불러오는 중…</p>
          ) : rows.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              선택할 질문이 없습니다. Question Bank에 먼저 등록해 주세요.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="sticky top-0 z-10 bg-muted/40">
                    ID
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-muted/40">
                    질문
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 bg-muted/40">
                    출처
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-24 bg-muted/40" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((q) => (
                  <TableRow
                    key={q.id}
                    className="cursor-pointer"
                    onClick={() => pick(q)}
                  >
                    <TableCell className="align-top font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {q.id}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      {q.questionText}
                    </TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
                      {SOURCE_TYPE_LABEL[q.sourceType]}
                    </TableCell>
                    <TableCell className="align-top px-2 py-1.5">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
