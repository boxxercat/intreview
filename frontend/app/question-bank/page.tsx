"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { initialQuestionBankItems } from "@/lib/dummy-data"

let qbId = 100

export default function QuestionBankPage() {
  const [items, setItems] = useState(initialQuestionBankItems)
  const [draft, setDraft] = useState("")

  function handleAdd() {
    const text = draft.trim()
    if (!text) return
    qbId += 1
    setItems((prev) => [...prev, { id: `qb-${qbId}`, text }])
    setDraft("")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Question Bank</h1>

      <ul className="space-y-2 rounded-md border border-border p-4">
        {items.length === 0 ? (
          <li className="text-muted-foreground">질문이 없습니다.</li>
        ) : (
          items.map((q) => (
            <li key={q.id} className="border-b border-border py-2 last:border-0">
              {q.text}
            </li>
          ))
        )}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="qb-input" className="sr-only">
            새 질문
          </label>
          <input
            id="qb-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="새 질문을 입력 (로컬에만 추가)"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <Button type="button" onClick={handleAdd}>
          추가
        </Button>
      </div>
    </div>
  )
}
