import type { TextareaHTMLAttributes } from "react"

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full resize-none rounded-lg border border-cyan-200/30 bg-[#0f4c5c]/70 p-3 text-sm text-white outline-none transition placeholder:text-slate-300 focus:border-orange-300 focus:ring-2 focus:ring-orange-400/30 disabled:cursor-wait disabled:opacity-70 ${className}`}
      {...props}
    />
  )
}
