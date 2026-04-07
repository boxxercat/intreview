import Link from "next/link"

import { HomeAuthActions } from "@/components/auth/home-auth-actions"

export default function Page() {
  return (
    <div className="space-y-10 text-sm leading-relaxed">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Intreview
        </h1>
        <p className="max-w-prose text-[15px] text-muted-foreground leading-7">
          면접 준비와 실제 질문을 나누어 적고, 연습 답변과 면접 후 복기까지 한
          흐름으로 정리할 수 있습니다.
        </p>
        <HomeAuthActions />
      </section>

      <section className="space-y-3 border-t border-border/80 pt-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          바로가기
        </h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <Link
              href="/question-bank"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              문제 은행
            </Link>
            <span className="text-muted-foreground"> — 자주 쓰는 질문 보관</span>
          </li>
          <li>
            <Link
              href="/interviews"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              면접 기록
            </Link>
            <span className="text-muted-foreground">
              {" "}
              — 회사·일정별 준비와 복기
            </span>
          </li>
        </ul>
      </section>
    </div>
  )
}
