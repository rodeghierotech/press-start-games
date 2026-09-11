import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { AuthShell } from "./AuthLogin"

const apiUrl = import.meta.env.VITE_API_URL

export default function AuthRegister() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "" })
  const [enviando, setEnviando] = useState(false)
  const destino = (location.state as { from?: string } | null)?.from || "/"

  async function cadastrar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviando(true)
    const response = await fetch(`${apiUrl}/clientes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    const dados = await response.json()
    setEnviando(false)
    if (!response.ok) { toast.error(dados.erro || "Não foi possível criar a conta"); return }
    toast.success("Conta criada. Entre para continuar.")
    navigate("/login", { state: { from: destino }, replace: true })
  }

  return <AuthShell title="Criar sua conta" subtitle="Cadastre-se para avaliar os jogos da Press Start."><form className="mt-6 space-y-4" onSubmit={cadastrar}><input required placeholder="Nome" value={form.nome} onChange={event => setForm({ ...form, nome: event.target.value })} className="auth-input" /><input type="email" required placeholder="E-mail" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className="auth-input" /><input required placeholder="Telefone" value={form.telefone} onChange={event => setForm({ ...form, telefone: event.target.value })} className="auth-input" /><input type="password" minLength={6} required placeholder="Senha" value={form.senha} onChange={event => setForm({ ...form, senha: event.target.value })} className="auth-input" /><button type="submit" disabled={enviando} className="auth-primary">{enviando ? "Criando..." : "Criar conta"}</button></form><p className="mt-5 text-center text-sm text-slate-400">Já possui conta? <Link to="/login" state={{ from: destino }} className="font-semibold text-cyan-300 hover:text-cyan-200">Fazer login</Link></p></AuthShell>
}
