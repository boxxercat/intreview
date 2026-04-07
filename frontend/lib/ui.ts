import { cn } from "@/lib/utils"

/** 폼·본문용: 낮은 채도, 읽기 위주 UI */
export const uiInput = cn(
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm",
  "shadow-[0_1px_2px_0_rgb(0_0_0/_0.03)]",
  "placeholder:text-muted-foreground/60",
  "transition-[border-color,box-shadow]",
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

export const uiTextarea = cn(
  "min-h-[5rem] w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed",
  "shadow-[0_1px_2px_0_rgb(0_0_0/_0.03)]",
  "placeholder:text-muted-foreground/60",
  "transition-[border-color,box-shadow]",
  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

export const uiSelect = cn(
  uiInput,
  "cursor-pointer appearance-none pr-10"
)

export const uiPanel = cn(
  "rounded-xl border border-border/80 bg-card p-5",
  "shadow-[0_1px_3px_0_rgb(0_0_0/_0.04)]"
)

export const uiSectionHeading = cn(
  "text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
)

export const uiPageTitle = "text-xl font-semibold tracking-tight text-foreground"

export const uiBackLink = cn(
  "inline-flex text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground"
)

export const uiListShell = cn(
  "overflow-hidden rounded-xl border border-border/80 bg-card",
  "shadow-[0_1px_3px_0_rgb(0_0_0/_0.04)]"
)

export const uiErrorBanner = cn(
  "rounded-lg border border-destructive/25 bg-destructive/[0.07] px-3 py-2.5 text-sm text-destructive"
)

export const uiIconButton = cn(
  "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
)
