type GameSearchProps = {
  value: string
  onChange: (value: string) => void
}

export default function GameSearch({ value, onChange }: GameSearchProps) {
  return (
    <label className="block">
      <span className="sr-only">Buscar jogos</span>
      <input
        className="w-full rounded-lg border border-[#d6cfc6] bg-white/90 px-4 py-3 text-sm text-[#1c1917] shadow-sm placeholder:text-[#78716c] focus:border-[#e86a17]"
        placeholder="Buscar por nome, plataforma ou categoria..."
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </label>
  )
}
