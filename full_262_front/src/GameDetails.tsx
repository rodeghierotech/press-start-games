import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import type { JogoType } from "./utils/LojaJogosTypes"
import NoiseBackground from "./components/ui/background-snippets-noise-effect11"
import GameRating from "./components/ui/rating-group"

const apiUrl = import.meta.env.VITE_API_URL

function moeda(valor: number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function dataPtBr(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

export default function GameDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [jogo, setJogo] = useState<JogoType | null>(null)
  const [clienteLogado] = useState<{ id_cliente: number; nome: string } | null>(() => {
    const sessao = localStorage.getItem("press-start-cliente") || sessionStorage.getItem("press-start-cliente")
    return sessao ? JSON.parse(sessao) as { id_cliente: number; nome: string } : null
  })
  const [quantidade, setQuantidade] = useState("1")
  const [pagamento, setPagamento] = useState("PIX")
  const [compraAberta, setCompraAberta] = useState(false)
  const [nota, setNota] = useState("5")
  const [comentario, setComentario] = useState("")
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    async function carregaPagina() {
      try {
        const resJogos = await fetch(`${apiUrl}/jogos`)
        const jogos = await resJogos.json() as JogoType[]

        if (!resJogos.ok || !Array.isArray(jogos)) throw new Error("Jogo não encontrado")
        setJogo(jogos.find(item => item.id_jogo === Number(id)) || null)
      } catch {
        toast.error("Não foi possível carregar os dados do jogo")
      }
    }

    carregaPagina()
  }, [id])

  async function compraJogo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!jogo || !clienteLogado) {
      navigate("/login", { state: { from: location.pathname } })
      return
    }
    setEnviando(true)

    const response = await fetch(`${apiUrl}/vendas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_cliente: clienteLogado.id_cliente,
        forma_pagamento: pagamento,
        itens: [{ id_jogo: jogo.id_jogo, quantidade }],
      }),
    })

    const dados = await response.json()
    setEnviando(false)
    if (!response.ok) {
      toast.error(dados.erro || "Não foi possível concluir a compra")
      return
    }
    toast.success("Compra registrada com sucesso")
    setQuantidade("1")
    setCompraAberta(false)
  }

  async function avaliaJogo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!jogo || !clienteLogado) {
      navigate("/login", { state: { from: location.pathname } })
      return
    }

    const response = await fetch(`${apiUrl}/avaliacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_cliente: clienteLogado.id_cliente, id_jogo: jogo.id_jogo, nota, comentario }),
    })
    if (!response.ok) {
      const dados = await response.json()
      toast.error(dados.erro || "Não foi possível enviar a avaliação")
      return
    }
    toast.success("Avaliação enviada")
    setComentario("")
  }

  if (!jogo) {
    return <><NoiseBackground /><main className="relative z-10 min-h-[calc(100vh-76px)] bg-slate-950/35 px-4 py-16 text-center text-white"><p className="text-slate-300">Jogo não encontrado.</p><Link to="/" className="mt-4 inline-block text-cyan-300 hover:text-cyan-200">Voltar ao catálogo</Link></main></>
  }

  return (
    <>
    <NoiseBackground />
    <main className="relative z-10 min-h-[calc(100vh-76px)] bg-slate-950/35 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">← Voltar ao catálogo</Link>
        <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <article className="border border-slate-700/80 bg-slate-900/55 p-6 backdrop-blur-md sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-400">{jogo.categoria.nome}</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{jogo.nome}</h1></div>
              <p className="text-2xl font-bold text-cyan-300">{moeda(Number(jogo.preco))}</p>
            </div>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">{jogo.descricao}</p>
            <div className="mt-8 grid gap-4 border-t border-slate-700/70 pt-6 text-sm sm:grid-cols-3"><div><p className="text-slate-500">Plataforma</p><p className="mt-1 font-semibold">{jogo.plataforma}</p></div><div><p className="text-slate-500">Lançamento</p><p className="mt-1 font-semibold">{dataPtBr(jogo.data_lancamento)}</p></div><div><p className="text-slate-500">Estoque</p><p className="mt-1 font-semibold">{jogo.estoque} unidades</p></div></div>
          </article>
          <section className="border border-slate-700/80 bg-slate-900/70 p-6 backdrop-blur-md"><h2 className="text-xl font-bold">Comprar jogo</h2><p className="mt-3 text-sm text-slate-400">Finalize sua compra com a sua conta Press Start.</p><p className="mt-5 text-2xl font-bold text-cyan-300">{moeda(Number(jogo.preco))}</p><button type="button" disabled={jogo.estoque === 0} onClick={() => clienteLogado ? setCompraAberta(true) : navigate("/login", { state: { from: location.pathname } })} className="mt-5 w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50">{jogo.estoque === 0 ? "Fora de estoque" : "Comprar agora"}</button></section>
        </section>
        <section className="mt-8 border border-slate-700/80 bg-slate-900/55 p-6 backdrop-blur-md"><h2 className="text-xl font-bold">Avalie este jogo</h2>{clienteLogado ? <><p className="mt-2 text-sm text-slate-400">Avaliando como {clienteLogado.nome}</p><GameRating value={Number(nota)} comentario={comentario} onChange={value => setNota(String(value))} onComentarioChange={setComentario} onSubmit={avaliaJogo} /></> : <div className="mt-5 border border-slate-700 bg-slate-950/40 p-5"><p className="text-sm text-slate-300">Entre na sua conta para avaliar este jogo.</p><div className="mt-4 flex flex-wrap gap-3"><Link to="/login" state={{ from: location.pathname }} className="rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700">Fazer login</Link><Link to="/cadastro" state={{ from: location.pathname }} className="rounded-lg border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400">Criar conta</Link></div></div>}{jogo.avaliacoes && jogo.avaliacoes.length > 0 && <div className="mt-6 space-y-3 border-t border-slate-700/70 pt-5">{jogo.avaliacoes.map(avaliacao => <div key={avaliacao.id_avaliacao} className="text-sm"><p className="font-semibold">{avaliacao.nota}/5 - {avaliacao.cliente.nome}</p><p className="mt-1 text-slate-400">{avaliacao.comentario}</p></div>)}</div>}</section>
      </div>
    </main>
    {compraAberta && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setCompraAberta(false) }}><section role="dialog" aria-modal="true" aria-labelledby="titulo-compra" className="w-full max-w-md rounded-xl border border-slate-700 bg-[#14213d] p-6 text-white shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">Finalizar compra</p><h2 id="titulo-compra" className="mt-2 text-2xl font-bold">{jogo.nome}</h2></div><button type="button" onClick={() => setCompraAberta(false)} className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Fechar">×</button></div><form className="mt-6 space-y-4" onSubmit={compraJogo}><div className="rounded-lg border border-white/10 bg-slate-950/40 p-4"><p className="text-sm text-slate-300">Compra para</p><p className="mt-1 font-semibold">{clienteLogado?.nome}</p></div><label className="block text-sm font-semibold">Quantidade<input type="number" min="1" max={jogo.estoque} className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950/70 p-3 text-sm text-white" value={quantidade} onChange={event => setQuantidade(event.target.value)} required /></label><label className="block text-sm font-semibold">Forma de pagamento<select className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950/70 p-3 text-sm text-white" value={pagamento} onChange={event => setPagamento(event.target.value)}><option value="PIX">PIX</option><option value="Cartao">Cartao</option><option value="Dinheiro">Dinheiro</option></select></label><p className="rounded-lg bg-slate-950/60 p-4 text-base font-bold">Total: <span className="text-orange-300">{moeda(Number(jogo.preco) * Number(quantidade || 0))}</span></p><button type="submit" disabled={enviando} className="w-full rounded-lg bg-orange-500 px-4 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50">{enviando ? "Processando..." : "Finalizar compra"}</button></form></section></div>}
    </>
  )
}
