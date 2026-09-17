import type { ButtonHTMLAttributes } from "react"

type ButtonVariant = "default" | "outline"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  default: "bg-[#e86a17] text-white shadow-sm shadow-orange-950/25 hover:bg-[#c65310]",
  outline: "border border-[#d6cfc6] bg-white/90 text-[#1c1917] hover:border-[#e86a17] hover:text-[#c65310]",
}

export function Button({ className = "", variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e86a17] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-wait disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
