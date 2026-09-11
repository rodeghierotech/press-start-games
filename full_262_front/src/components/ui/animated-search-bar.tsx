import { AnimatePresence, motion } from "framer-motion"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import { Button } from "./button"
import { Input } from "./input"

type AnimatedSearchBarProps = {
  value: string
  onChange: (value: string) => void
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

export default function AnimatedSearchBar({ value, onChange }: AnimatedSearchBarProps) {
  const [expanded, setExpanded] = useState(Boolean(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  function closeSearch() {
    onChange("")
    setExpanded(false)
  }

  return (
    <div className="flex h-12 w-full justify-end">
      <AnimatePresence mode="wait" initial={false}>
        {!expanded ? (
          <motion.div
            key="trigger"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
          >
            <Button variant="outline" onClick={() => setExpanded(true)} className="h-12 px-4 font-semibold shadow-sm backdrop-blur-md">
              <SearchIcon />
              Buscar jogos
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, width: 140 }}
            animate={{ opacity: 1, width: "100%" }}
            exit={{ opacity: 0, width: 140 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className={clsx("flex h-12 items-center gap-3 rounded-lg border border-[#e86a17] bg-white/95 px-4 shadow-sm backdrop-blur-md", value && "ring-1 ring-[#f59e42]/40")}
          >
            <span className="text-[#0f4c5c]"><SearchIcon /></span>
            <Input
              ref={inputRef}
              type="search"
              aria-label="Buscar jogos"
              placeholder="Buscar por nome, plataforma ou categoria..."
              value={value}
              onChange={event => onChange(event.target.value)}
              onKeyDown={event => { if (event.key === "Escape") closeSearch() }}
              className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 focus:ring-0"
            />
            <button type="button" aria-label="Limpar busca" onClick={closeSearch} className="text-lg leading-none text-[#78716c] hover:text-[#c65310]">&times;</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
