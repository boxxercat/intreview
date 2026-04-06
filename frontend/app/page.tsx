import { HomeAuthActions } from "@/components/auth/home-auth-actions"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Intreview</h1>
          <p className="text-muted-foreground">
            면접 질문을 기록하고 복기하는 공간입니다.
          </p>
          <HomeAuthActions />
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          <kbd className="rounded border border-border px-1 py-0.5">d</kbd>{" "}
          로 다크 모드를 전환할 수 있습니다.
        </p>
      </div>
    </div>
  )
}
