import Link from "next/link"

export default function Page() {
  return (
    <div className="space-y-10 text-sm leading-relaxed">
      <section className="space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Intreview
        </h1>
        <div className="max-w-prose space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p>
            면접이 끝나도 질문과 답은 흩어지기 쉽습니다. Intreview는{" "}
            <strong className="font-medium text-foreground">
              준비 단계·실제 질문·복기
            </strong>
            를 나누어 적고, 나중에 다시 꺼내 쓸 수 있게 모아 두는 도구입니다.
          </p>
          <p>
            계정 전체에 걸친 <strong className="font-medium text-foreground">준비 질문</strong>에 연습 답변을 적어 두고, 회사·날짜별{" "}
            <strong className="font-medium text-foreground">면접 기록</strong> 안에서 실제로 나온 질문을 남깁니다. 질문은 준비 목록에서 가져오거나,{" "}
            <strong className="font-medium text-foreground">문제 은행</strong>에서 고르거나, 그 자리에서 새로 적을 수 있습니다.
          </p>
          <p>
            면접 직후에는 각 질문마다 <strong className="font-medium text-foreground">복기</strong>를 남겨 두면, 다음 면접이나 회고 때 같은 실수를 줄이는 데 도움이 됩니다. 한번 적어 둔 문장은 문제 은행으로 옮겨 두면 다른 면접 준비에서도 재사용할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-border/80 pt-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          한 번에 보는 흐름
        </h2>
        <ol className="max-w-prose list-decimal space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground marker:text-muted-foreground/80">
          <li>
            <span className="text-foreground">문제 은행</span>에 자주 나오는 질문·복기에서 뽑은 문장을 쌓아 둡니다.
          </li>
          <li>
            <span className="text-foreground">면접 기록</span>을 만들고, 그 안에서 준비 질문과 연습 답변을 정리합니다.
          </li>
          <li>
            면접 후 같은 기록에서 실제 질문을 추가하고, 질문별로 복기를 적습니다.
          </li>
          <li>
            쓸 만한 문장은 다시 문제 은행에 넣어 다음 준비에 연결합니다.
          </li>
        </ol>
      </section>

      <section className="space-y-3 border-t border-border/80 pt-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          바로가기
        </h2>
        <ul className="max-w-prose space-y-3 text-[15px] leading-7 text-muted-foreground">
          <li>
            <Link
              href="/question-bank"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              문제 은행
            </Link>
            <span>
              {" "}
              — 질문을 한곳에 모아 두었다가, 준비나 면접 질문 추가할 때 골라
              씁니다. 면접에서 나온 문장도 여기로 옮겨 자산으로 남길 수 있습니다.
            </span>
          </li>
          <li>
            <Link
              href="/interviews"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              면접 기록
            </Link>
            <span>
              {" "}
              — 회사명·직무·면접일별로 카드를 만들고, 그 안에서 준비 / 실제 질문 /
              복기를 이어서 관리합니다.
            </span>
          </li>
        </ul>
      </section>
    </div>
  )
}
