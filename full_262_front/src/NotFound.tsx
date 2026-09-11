import { Home, Search } from "lucide-react"
import { Link } from "react-router-dom"
import NoiseBackground from "./components/ui/background-snippets-noise-effect11"

export default function NotFound() {
  return (
    <>
      <NoiseBackground />
      <main className="relative z-10 grid min-h-[calc(100vh-76px)] place-items-center bg-slate-950/35 px-4 py-12 text-white sm:px-6">
        <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#14213d]/90 p-7 text-center shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-10">
          <p className="brand-font text-6xl font-bold tracking-[0.08em] text-[#e86a17] sm:text-8xl">404</p>
          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">Página não encontrada</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
            O endereço acessado não existe ou pode ter sido movido dentro da Press Start.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e86a17] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c65310] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e42] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14213d]">
              <Home className="h-4 w-4" />
              Voltar à home
            </Link>
            <Link to="/#catalogo" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/45 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-orange-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e42] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14213d]">
              <Search className="h-4 w-4" />
              Ver catálogo
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
