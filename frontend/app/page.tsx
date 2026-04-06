import Link from "next/link"

import { HomeAuthActions } from "@/components/auth/home-auth-actions"

export default function Page() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <section className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">Intreview</h1>
        <p className="text-muted-foreground">
          면접 준비 질문과 실제 면접에서 나온 질문을 나누어 기록하고, 답변과
          복기까지 한곳에서 관리하는 웹 앱입니다. (현재 UI 뼈대 · 더미 데이터)
        </p>
        <HomeAuthActions />
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <h2 className="font-medium">둘러보기</h2>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>
            <Link href="/question-bank" className="text-foreground underline">
              Question Bank
            </Link>
            — 저장해 둔 질문 모음
          </li>
          <li>
            <Link href="/interviews" className="text-foreground underline">
              Interview
            </Link>
            — 면접별 기록 및 상세(준비 / 복기)
          </li>
        </ul>
      </section>

      <p className="font-mono text-xs text-muted-foreground">
        <kbd className="rounded border border-border px-1 py-0.5">d</kbd> 다크
        모드
      </p>
    </div>
  )
}
