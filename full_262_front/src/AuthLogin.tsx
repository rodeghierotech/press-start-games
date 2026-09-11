import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import NoiseBackground from "./components/ui/background-snippets-noise-effect11"

const apiUrl = import.meta.env.VITE_API_URL

export default function AuthLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [manterConectado, setManterConectado] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const destino = (location.state as { from?: string } | null)?.from || "/"

  async function entrar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviando(true)
    const response = await fetch(`${apiUrl}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, senha }) })
    const dados = await response.json()
    setEnviando(false)
    if (!response.ok) { toast.error(dados.erro || "Login ou senha incorretos"); return }
    const sessao = JSON.stringify(dados.tipo === "admin"
      ? { id_admin: dados.id_admin, nome: dados.nome, email: dados.email, token: dados.token }
      : { id_cliente: dados.id_cliente, nome: dados.nome, email: dados.email, token: dados.token })
    localStorage.removeItem("press-start-cliente")
    sessionStorage.removeItem("press-start-cliente")
    localStorage.removeItem("press-start-admin")
    sessionStorage.removeItem("press-start-admin")
    const armazenamento = manterConectado ? localStorage : sessionStorage
    armazenamento.setItem(dados.tipo === "admin" ? "press-start-admin" : "press-start-cliente", sessao)
    toast.success("Login realizado")
    navigate(destino, { replace: true })
  }

  return <AuthShell title="Entrar na Press Start" subtitle="Acesse sua conta para avaliar seus jogos favoritos."><form className="mt-6 space-y-4" onSubmit={entrar}><input type="email" required placeholder="E-mail" value={email} onChange={event => setEmail(event.target.value)} className="auth-input" /><input type="password" required placeholder="Senha" value={senha} onChange={event => setSenha(event.target.value)} className="auth-input" /><label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={manterConectado} onChange={event => setManterConectado(event.target.checked)} className="h-4 w-4 accent-[#e86a17]" />Manter conectado</label><button type="submit" disabled={enviando} className="auth-primary">{enviando ? "Entrando..." : "Entrar"}</button></form><p className="mt-5 text-center text-sm text-slate-400">Ainda não possui conta? <Link to="/cadastro" state={{ from: destino }} className="font-semibold text-cyan-300 hover:text-cyan-200">Criar conta</Link></p></AuthShell>
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <><NoiseBackground /><main className="relative z-10 flex min-h-[calc(100vh-76px)] items-start justify-center bg-slate-950/35 px-4 py-12 text-white sm:px-6"><section className="w-full max-w-md border border-slate-700/80 bg-slate-900/65 p-6 shadow-sm backdrop-blur-md sm:p-8"><Link to="/" className="text-sm text-cyan-300 hover:text-cyan-200">← Voltar para a loja</Link><h1 className="mt-8 text-2xl font-bold">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>{children}</section></main></>
}
