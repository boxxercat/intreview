"use client"

import { format, parse } from "date-fns"
import { ko } from "date-fns/locale"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type Props = {
  id?: string
  /** `yyyy-MM-dd` (HTML date input과 동일) */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

function parseYmd(s: string): Date | undefined {
  if (!s.trim()) return undefined
  const d = parse(s, "yyyy-MM-dd", new Date())
  return Number.isNaN(d.getTime()) ? undefined : d
}

export function DatePickerField({
  id,
  value,
  onChange,
  disabled,
  placeholder = "날짜 선택",
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const selected = parseYmd(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full min-w-0 justify-start gap-2 rounded-3xl px-3 font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            strokeWidth={2}
            className="size-4 shrink-0 opacity-70"
          />
          {selected ? (
            format(selected, "PPP", { locale: ko })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ko}
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            if (!d) return
            onChange(format(d, "yyyy-MM-dd"))
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
