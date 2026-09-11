import type { HTMLAttributes } from "react"

type CardProps = HTMLAttributes<HTMLElement>

export function Card({ className = "", ...props }: CardProps) {
  return <article className={`rounded-xl border border-[#e7ded4] bg-white/90 shadow-sm backdrop-blur-md ${className}`} {...props} />
}
