import Link from "next/link"

import { cn } from "@/lib/utils"
import { uiInput } from "@/lib/ui"

export const authFieldClass = cn(uiInput, "mt-1.5 h-10 py-0 leading-10")

type AuthShellProps = {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex w-full max-w-[400px] flex-col items-stretch">
      <div
        className={cn(
          "w-full space-y-6 rounded-xl border border-border/80 bg-card p-8",
          "shadow-[0_1px_3px_0_rgb(0_0_0/_0.05)]"
        )}
      >
        <header className="space-y-1.5 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </header>
        {children}
        {footer}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link
          href="/"
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          홈으로
        </Link>
      </p>
    </div>
  )
}
