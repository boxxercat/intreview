"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import {
  interviewDetailsById,
  type InterviewDetail,
} from "@/lib/dummy-data"

const emptyDetail: InterviewDetail = {
  company: "(알 수 없음)",
  position: "—",
  preparation: [],
  review: [],
}

export default function InterviewDetailPage() {
  const params = useParams()
  const id = String(params.id ?? "")

  const resolved = useMemo(
    () => interviewDetailsById[id] ?? emptyDetail,
    [id]
  )

  const [detail, setDetail] = useState<InterviewDetail>(resolved)

  useEffect(() => {
    setDetail(interviewDetailsById[id] ?? emptyDetail)
  }, [id])

  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link href="/interviews" className="text-muted-foreground underline">
          ← Interview List
        </Link>
      </p>

      <header className="space-y-1 border-b border-border pb-4">
        <h1 className="text-xl font-semibold">{detail.company}</h1>
        <p className="text-muted-foreground">{detail.position}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Preparation Section</h2>
        <p className="text-xs text-muted-foreground">준비 질문 리스트</p>
        <ul className="list-inside list-decimal space-y-2 rounded-md border border-border p-4 text-sm">
          {detail.preparation.length === 0 ? (
            <li className="text-muted-foreground">항목 없음</li>
          ) : (
            detail.preparation.map((p) => <li key={p.id}>{p.text}</li>)
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Review Section</h2>
        <p className="text-xs text-muted-foreground">
          실제 질문 · 답변 · 복기
        </p>
        <div className="space-y-4">
          {detail.review.length === 0 ? (
            <p className="text-sm text-muted-foreground">항목 없음</p>
          ) : (
            detail.review.map((r) => (
              <article
                key={r.id}
                className="space-y-2 rounded-md border border-border p-4 text-sm"
              >
                <p className="font-medium">Q. {r.question}</p>
                <p>
                  <span className="text-muted-foreground">답변: </span>
                  {r.answer}
                </p>
                <p>
                  <span className="text-muted-foreground">복기: </span>
                  {r.reflection}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
