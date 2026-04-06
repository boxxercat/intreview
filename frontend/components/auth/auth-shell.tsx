import Link from "next/link"

import { cn } from "@/lib/utils"

export const authFieldClass = cn(
  "mt-1.5 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

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
    <div className="flex min-h-svh flex-col items-center justify-center bg-linear-to-b from-muted/40 to-background p-6">
      <div className="w-full max-w-[380px] space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
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
