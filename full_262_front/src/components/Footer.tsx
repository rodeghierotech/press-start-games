export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#14213d] px-4 py-5 text-slate-300 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-sm sm:flex-row sm:text-left">
        <p className="brand-font text-xs font-semibold tracking-[0.02em] text-white">Press Start</p>
        <p>© {new Date().getFullYear()} Press Start. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
