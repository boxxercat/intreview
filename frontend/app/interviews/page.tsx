"use client"

import Link from "next/link"
import { useState } from "react"

import { initialInterviews } from "@/lib/dummy-data"

export default function InterviewsPage() {
  const [interviews] = useState(initialInterviews)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Interview List</h1>

      <ul className="divide-y divide-border rounded-md border border-border">
        {interviews.map((it) => (
          <li key={it.id}>
            <Link
              href={`/interviews/${it.id}`}
              className="block px-4 py-3 hover:bg-muted/50"
            >
              <span className="font-medium">{it.company}</span>
              <span className="text-muted-foreground"> · {it.position}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
