import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import pressStartLogo from "../../assets/press-start-logo.png"

function clienteSalvo() {
  const sessao = localStorage.getItem("press-start-cliente") || sessionStorage.getItem("press-start-cliente")
  if (!sessao) return null

  try {
    return JSON.parse(sessao) as { nome?: string }
  } catch {
    return null
  }
}

function adminSalvo() {
  const sessao = localStorage.getItem("press-start-admin") || sessionStorage.getItem("press-start-admin")
  if (!sessao) return null

  try {
    return JSON.parse(sessao) as { nome?: string }
  } catch {
    return null
  }
}

export default function PressStartHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cliente, setCliente] = useState<{ nome?: string } | null>(clienteSalvo)
  const [admin, setAdmin] = useState<{ nome?: string } | null>(adminSalvo)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    setCliente(clienteSalvo())
    setAdmin(adminSalvo())
    setOpen(false)
  }, [location.pathname])

  function sairCliente() {
    localStorage.removeItem("press-start-cliente")
    sessionStorage.removeItem("press-start-cliente")
    localStorage.removeItem("press-start-admin")
    sessionStorage.removeItem("press-start-admin")
    setCliente(null)
    setAdmin(null)
    setOpen(false)
    navigate("/")
  }

  return (
    <header className={`relative z-20 sticky top-0 w-full border-b text-white transition-colors ${scrolled ? "border-white/20 bg-[#14213d]/95 backdrop-blur-lg" : "border-[#14213d] bg-[#14213d]"}`}>
      <nav className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-85" onClick={() => setOpen(false)}>
            <img
              src={pressStartLogo}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 rounded-lg object-cover shadow-sm shadow-black/20"
            />
          <span className="brand-font text-base font-semibold tracking-[0.02em] sm:text-lg">Press Start</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {admin?.nome ? <><span className="max-w-52 truncate rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white" title={admin.nome}>{admin.nome}</span><Link to="/admin" className="rounded-lg bg-[#e86a17] px-3 py-2 text-sm font-bold text-white hover:bg-[#c65310]">Painel admin</Link><button type="button" onClick={sairCliente} className="rounded-lg border border-white/50 px-3 py-2 text-sm font-semibold text-white hover:border-orange-300 hover:text-orange-200">Sair</button></> : cliente?.nome ? <><span className="max-w-52 truncate rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white" title={cliente.nome}>{cliente.nome}</span><button type="button" onClick={sairCliente} className="rounded-lg border border-white/50 px-3 py-2 text-sm font-semibold text-white hover:border-orange-300 hover:text-orange-200">Sair</button></> : <><Link to="/login" className="rounded-lg border border-white/50 bg-[#14213d] px-3 py-2 text-sm font-semibold text-white hover:border-white hover:bg-[#0f4c5c]">Login</Link><Link to="/cadastro" className="rounded-lg bg-[#e86a17] px-3 py-2 text-sm font-bold text-white hover:bg-[#c65310]">Cadastre-se</Link></>}
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-lg border border-white/50 bg-[#14213d] text-white transition-colors hover:border-white hover:bg-[#0f4c5c] md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Fechar menu" : "Abrir menu"}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && <div id="mobile-menu" className="border-t border-white/10 bg-[#14213d] px-4 py-4 shadow-xl md:hidden"><div className="mx-auto max-w-7xl">{admin?.nome ? <div className="grid gap-2"><p className="rounded-lg border border-white/30 bg-white/10 px-3 py-3 text-center text-sm font-semibold text-white">{admin.nome}</p><Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg bg-[#e86a17] px-3 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#c65310]">Painel admin</Link><button type="button" onClick={sairCliente} className="rounded-lg border border-white/50 px-3 py-3 text-center text-sm font-semibold text-white hover:border-orange-300 hover:text-orange-200">Sair</button></div> : cliente?.nome ? <div className="grid gap-2"><p className="rounded-lg border border-white/30 bg-white/10 px-3 py-3 text-center text-sm font-semibold text-white">{cliente.nome}</p><button type="button" onClick={sairCliente} className="rounded-lg border border-white/50 px-3 py-3 text-center text-sm font-semibold text-white hover:border-orange-300 hover:text-orange-200">Sair</button></div> : <div className="grid grid-cols-2 gap-2"><Link to="/login" onClick={() => setOpen(false)} className="rounded-lg border border-white/50 px-3 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-white hover:bg-[#0f4c5c]">Login</Link><Link to="/cadastro" onClick={() => setOpen(false)} className="rounded-lg bg-[#e86a17] px-3 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#c65310]">Cadastre-se</Link></div>}</div></div>}
    </header>
  )
}
