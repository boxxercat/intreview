"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { InterviewDetailView } from "./interview-detail-view"

export default function InterviewDetailPage() {
  const params = useParams()
  const raw = params.id
  const id = typeof raw === "string" ? Number(raw) : Number.NaN

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <p className="text-sm text-muted-foreground">
        잘못된 면접 ID입니다.{" "}
        <Link href="/interviews" className="underline">
          목록으로
        </Link>
      </p>
    )
  }

  return <InterviewDetailView interviewId={id} />
}
