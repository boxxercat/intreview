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
    <div className="flex min-h-svh flex-col items-center justify-center bg-linear-to-b from-muted/50 via-background to-background p-6">
      <div className="w-full max-w-[380px] space-y-6 rounded-xl border border-border/80 bg-card p-8 shadow-[0_1px_3px_0_rgb(0_0_0/_0.05)]">
        <header className="space-y-1 text-center sm:text-left">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </header>
        {children}
        {footer}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          홈으로
        </Link>
      </p>
    </div>
  )
}
