import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import NoiseBackground from "./components/ui/background-snippets-noise-effect11"
import type { AvaliacaoType, ClienteType, VendaType } from "./utils/LojaJogosTypes"
import { cabecalhoAutorizacao, sessaoCliente } from "./utils/sessao"

const apiUrl = import.meta.env.VITE_API_URL

type InteracoesCliente = ClienteType & {
  vendas: Array<Omit<VendaType, "cliente">>
  avaliacoes: AvaliacaoType[]
}

function moeda(valor: number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function dataPtBr(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

export default function CustomerAccount() {
  const navigate = useNavigate()
  const [dados, setDados] = useState<InteracoesCliente | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const sessao = sessaoCliente()
    if (!sessao) {
      navigate("/login", { state: { from: "/minha-conta" }, replace: true })
      return
    }
    const token = sessao.token

    async function carregaInteracoes() {
      try {
        const response = await fetch(`${apiUrl}/clientes/me/interacoes`, { headers: cabecalhoAutorizacao(token) })
        const conteudo = await response.json()
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) navigate("/login", { state: { from: "/minha-conta" }, replace: true })
          else toast.error(conteudo.erro || "Não foi possível carregar sua conta")
          return
        }
        setDados(conteudo as InteracoesCliente)
      } catch {
        toast.error("Não foi possível carregar sua conta")
      } finally {
        setCarregando(false)
      }
    }

    carregaInteracoes()
  }, [navigate])

  return <>
    <NoiseBackground />
    <main className="relative z-10 min-h-[calc(100vh-76px)] bg-slate-950/35 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">← Voltar ao catálogo</Link>
        <section className="mt-6 border border-slate-700/80 bg-slate-900/65 p-6 backdrop-blur-md sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">Sua conta</p>
          <h1 className="mt-2 text-3xl font-bold">Minhas interações</h1>
          <p className="mt-2 text-sm text-slate-300">Acompanhe suas compras, avaliações e retornos da Press Start.</p>
          {dados && <p className="mt-4 text-sm text-slate-400">Cliente: <span className="font-semibold text-white">{dados.nome}</span></p>}
        </section>

        {carregando ? <p className="mt-8 text-sm text-slate-300">Carregando suas interações...</p> : dados && <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="border border-slate-700/80 bg-slate-900/65 p-5 backdrop-blur-md">
            <h2 className="text-xl font-bold">Compras</h2>
            <div className="mt-5 space-y-3">{dados.vendas.length > 0 ? dados.vendas.map(venda => <article key={venda.id_venda} className="border border-slate-700/70 bg-slate-950/35 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">Pedido de {dataPtBr(venda.data_venda)}</p><p className="mt-1 text-xs text-slate-400">{venda.forma_pagamento}</p></div><p className="font-bold text-orange-300">{moeda(Number(venda.valor_total))}</p></div><p className="mt-3 text-sm text-slate-300">{venda.itens.map(item => `${item.quantidade}x ${item.jogo.nome}`).join(", ")}</p></article>) : <p className="text-sm text-slate-400">Você ainda não realizou compras.</p>}</div>
          </section>
          <section className="border border-slate-700/80 bg-slate-900/65 p-5 backdrop-blur-md">
            <h2 className="text-xl font-bold">Avaliações</h2>
            <div className="mt-5 space-y-3">{dados.avaliacoes.length > 0 ? dados.avaliacoes.map(avaliacao => <article key={avaliacao.id_avaliacao} className="border border-slate-700/70 bg-slate-950/35 p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold">{avaliacao.jogo?.nome || "Jogo avaliado"}</p><span className="shrink-0 font-bold text-amber-300">{avaliacao.nota}/5</span></div>{avaliacao.comentario && <p className="mt-2 text-sm text-slate-300">{avaliacao.comentario}</p>}{avaliacao.resposta ? <div className="mt-4 border-l-2 border-orange-300 bg-orange-500/10 px-3 py-2 text-sm"><p className="font-semibold text-orange-200">Resposta da Press Start</p><p className="mt-1 text-slate-200">{avaliacao.resposta.mensagem}</p></div> : <p className="mt-3 text-xs text-slate-500">Aguardando resposta da loja.</p>}</article>) : <p className="text-sm text-slate-400">Você ainda não avaliou jogos.</p>}</div>
          </section>
        </div>}
      </div>
    </main>
  </>
}
