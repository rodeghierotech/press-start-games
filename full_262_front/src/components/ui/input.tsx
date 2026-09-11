import { forwardRef, type InputHTMLAttributes } from "react"

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-md border border-[#d6cfc6] bg-white/95 px-3 text-sm text-[#1c1917] outline-none transition placeholder:text-[#78716c] focus:border-[#e86a17] focus:ring-2 focus:ring-[#f59e42]/30 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  )
})

Input.displayName = "Input"
