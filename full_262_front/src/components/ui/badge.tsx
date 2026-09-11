import type { HTMLAttributes } from "react"

type BadgeProps = HTMLAttributes<HTMLSpanElement>

export function Badge({ className = "", ...props }: BadgeProps) {
  return <span className={`inline-flex w-fit items-center rounded-full bg-[#0f4c5c] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${className}`} {...props} />
}
