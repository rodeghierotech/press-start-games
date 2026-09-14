import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { BrainCircuit, ChevronDown, CircleDollarSign, Gamepad2, RefreshCw, ShoppingBag, Star, Users } from "lucide-react"
import type { AvaliacaoType, CategoriaType, ClienteType, JogoType, VendaType } from "./utils/LojaJogosTypes"
import NoiseBackground from "./components/ui/background-snippets-noise-effect11"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./components/ui/dialog"

const apiUrl = import.meta.env.VITE_API_URL

type AvaliacaoDashboard = AvaliacaoType & { jogo: Pick<JogoType, "nome"> }
type JogoForm = { nome: string; descricao: string; preco: string; estoque: string; plataforma: string; data_lancamento: string; id_categoria: string }
type MetricasIa = { totalConsultas: number }

const jogoInicial: JogoForm = { nome: "", descricao: "", preco: "", estoque: "0", plataforma: "", data_lancamento: "", id_categoria: "" }

function moeda(valor: number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function dataPtBr(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function horaRelativa(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

async function leLista<T>(response: Response, recurso: string): Promise<T[]> {
  if (!response.ok) throw new Error(`Não foi possível carregar ${recurso} (HTTP ${response.status})`)
  const dados = await response.json()
  if (!response.ok || !Array.isArray(dados)) throw new Error(`Não foi possível carregar ${recurso}`)
  return dados
}

async function leObjeto<T>(response: Response, recurso: string): Promise<T> {
  if (!response.ok) throw new Error(`Não foi possível carregar ${recurso} (HTTP ${response.status})`)
  const dados = await response.json()
  if (!response.ok || !dados || typeof dados !== "object" || Array.isArray(dados)) throw new Error(`Não foi possível carregar ${recurso}`)
  return dados as T
}

function StatCard({ label, value, detail, icon: Icon, accent }: { label: string; value: string; detail: string; icon: typeof Gamepad2; accent: string }) {
  return <article className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-5 shadow-sm backdrop-blur-md"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-lg ${accent}`}><Icon className="h-5 w-5" /></span></div><p className="mt-3 text-xs text-slate-500">{detail}</p></article>
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [admin] = useState<{ nome: string } | null>(() => {
    const sessao = localStorage.getItem("press-start-admin") || sessionStorage.getItem("press-start-admin")
    if (!sessao) return null
    try {
      return JSON.parse(sessao) as { nome: string }
    } catch {
      return null
    }
  })
  const [jogos, setJogos] = useState<JogoType[]>([])
  const [categorias, setCategorias] = useState<CategoriaType[]>([])
  const [clientes, setClientes] = useState<ClienteType[]>([])
  const [vendas, setVendas] = useState<VendaType[]>([])
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDashboard[]>([])
  const [metricasIa, setMetricasIa] = useState<MetricasIa | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [jogoForm, setJogoForm] = useState<JogoForm>(jogoInicial)
  const [salvandoJogo, setSalvandoJogo] = useState(false)
  const [modalJogoAberto, setModalJogoAberto] = useState(false)

  const carregaDados = useCallback(async () => {
    setCarregando(true)
    try {
      const respostas = await Promise.all([
        fetch(`${apiUrl}/jogos`),
        fetch(`${apiUrl}/clientes`),
        fetch(`${apiUrl}/vendas`),
        fetch(`${apiUrl}/avaliacoes`),
        fetch(`${apiUrl}/categorias`),
        fetch(`${apiUrl}/jogos/metricas/ia`)
          .then(response => leObjeto<MetricasIa>(response, "as métricas da IA"))
          .then(dados => {
            if (!Number.isSafeInteger(dados.totalConsultas) || dados.totalConsultas < 0) return null
            return dados
          })
          .catch(() => null),
      ])
      const [listaJogos, listaClientes, listaVendas, listaAvaliacoes, listaCategorias, dadosMetricasIa] = await Promise.all([
        leLista<JogoType>(respostas[0], "os jogos"),
        leLista<ClienteType>(respostas[1], "os clientes"),
        leLista<VendaType>(respostas[2], "as vendas"),
        leLista<AvaliacaoDashboard>(respostas[3], "as avaliações"),
        leLista<CategoriaType>(respostas[4], "as categorias"),
        respostas[5],
      ])
      setJogos(listaJogos)
      setClientes(listaClientes)
      setVendas(listaVendas)
      setAvaliacoes(listaAvaliacoes)
      setCategorias(listaCategorias)
      setMetricasIa(dadosMetricasIa)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar o painel. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregaDados() }, [carregaDados])

  useEffect(() => {
    if (!admin) navigate("/login", { state: { from: "/admin" }, replace: true })
  }, [admin, navigate])

  async function cadastraJogo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSalvandoJogo(true)
    try {
      const response = await fetch(`${apiUrl}/jogos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...jogoForm, preco: Number(jogoForm.preco.replace(",", ".")), estoque: Number(jogoForm.estoque), id_categoria: Number(jogoForm.id_categoria) }),
      })
      const dados = await response.json()
      if (!response.ok) {
        toast.error(dados.erro || "Não foi possível cadastrar o jogo")
        return
      }
      toast.success("Jogo cadastrado com sucesso")
      setJogoForm(jogoInicial)
      setModalJogoAberto(false)
      await carregaDados()
    } catch {
      toast.error("Não foi possível cadastrar o jogo")
    } finally {
      setSalvandoJogo(false)
    }
  }

  const faturamento = useMemo(() => vendas.reduce((total, venda) => total + Number(venda.valor_total), 0), [vendas])
  const estoqueBaixo = useMemo(() => jogos.filter(jogo => jogo.estoque <= 5).sort((a, b) => a.estoque - b.estoque), [jogos])
  const maisVendidos = useMemo(() => {
    const resumo = new Map<number, { nome: string; quantidade: number }>()
    vendas.forEach(venda => venda.itens.forEach(item => {
      const atual = resumo.get(item.jogo.id_jogo) || { nome: item.jogo.nome, quantidade: 0 }
      atual.quantidade += item.quantidade
      resumo.set(item.jogo.id_jogo, atual)
    }))
    return [...resumo.values()].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)
  }, [vendas])

  if (!admin) return null

  return <>
    <NoiseBackground />
    <main className="relative z-10 min-h-[calc(100vh-76px)] bg-slate-950/35 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">Press Start</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1><p className="mt-2 text-sm text-slate-300">Acompanhe o desempenho da sua loja de jogos.</p></div>
          <div className="flex flex-wrap items-center justify-end gap-3"><button type="button" onClick={() => setModalJogoAberto(true)} className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition-colors hover:bg-orange-600">+ Adicionar jogo</button><Link to="/" className="rounded-lg border border-slate-500 bg-slate-900/40 px-3 py-2 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-[#0f4c5c] hover:text-white">Voltar para a loja</Link><button type="button" onClick={carregaDados} disabled={carregando} className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`} />Atualizar</button></div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Jogos no catálogo" value={String(jogos.length)} detail={`${jogos.reduce((total, jogo) => total + jogo.estoque, 0)} unidades em estoque`} icon={Gamepad2} accent="bg-cyan-400/15 text-cyan-300" />
          <StatCard label="Clientes" value={String(clientes.length)} detail="Contas cadastradas" icon={Users} accent="bg-orange-400/15 text-orange-300" />
          <StatCard label="Vendas realizadas" value={String(vendas.length)} detail="Pedidos registrados" icon={ShoppingBag} accent="bg-emerald-400/15 text-emerald-300" />
          <StatCard label="Faturamento" value={moeda(faturamento)} detail="Total acumulado em vendas" icon={CircleDollarSign} accent="bg-violet-400/15 text-violet-300" />
          <StatCard label="Requisições à IA" value={metricasIa ? String(metricasIa.totalConsultas) : "—"} detail={metricasIa ? "Desde a inicialização do servidor" : carregando ? "Carregando..." : "Métrica indisponível"} icon={BrainCircuit} accent="bg-orange-400/15 text-orange-300" />
        </section>

        <Dialog open={modalJogoAberto} onOpenChange={setModalJogoAberto}><DialogContent><DialogHeader><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">Catálogo</p><DialogTitle>Adicionar jogo</DialogTitle><DialogDescription>Cadastre um novo título para disponibilizá-lo na loja.</DialogDescription></DialogHeader><form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={cadastraJogo}><input className="rounded-lg border border-[#3a3a3a] bg-[#171717] p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 md:col-span-2" placeholder="Nome do jogo" value={jogoForm.nome} onChange={event => setJogoForm({ ...jogoForm, nome: event.target.value })} required /><input type="text" inputMode="decimal" minLength={1} className="rounded-lg border border-[#3a3a3a] bg-[#171717] p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30" placeholder="Preço (ex.: 199,90)" value={jogoForm.preco} onChange={event => setJogoForm({ ...jogoForm, preco: event.target.value })} required /><input type="number" min="0" className="rounded-lg border border-[#3a3a3a] bg-[#171717] p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30" placeholder="Estoque" value={jogoForm.estoque} onChange={event => setJogoForm({ ...jogoForm, estoque: event.target.value })} required /><input className="rounded-lg border border-[#3a3a3a] bg-[#171717] p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30" placeholder="Plataforma" value={jogoForm.plataforma} onChange={event => setJogoForm({ ...jogoForm, plataforma: event.target.value })} required /><input type="date" className="rounded-lg border border-[#3a3a3a] bg-[#171717] p-3 text-sm text-white outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30" value={jogoForm.data_lancamento} onChange={event => setJogoForm({ ...jogoForm, data_lancamento: event.target.value })} required /><div className="relative"><select className="w-full appearance-none rounded-lg border border-[#3a3a3a] bg-[#171717] p-3 pr-10 text-sm text-white outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30" value={jogoForm.id_categoria} onChange={event => setJogoForm({ ...jogoForm, id_categoria: event.target.value })} required><option value="">Selecione a categoria</option>{categorias.map(categoria => <option key={categoria.id_categoria} value={categoria.id_categoria}>{categoria.nome}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /></div><textarea className="min-h-24 resize-none rounded-lg border border-[#3a3a3a] bg-[#171717] p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 md:col-span-2" placeholder="Descrição do jogo" value={jogoForm.descricao} onChange={event => setJogoForm({ ...jogoForm, descricao: event.target.value })} /><div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end md:col-span-2"><button type="button" onClick={() => setModalJogoAberto(false)} className="rounded-lg border border-[#3a3a3a] px-4 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500">Cancelar</button><button type="submit" disabled={salvandoJogo} className="rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">{salvandoJogo ? "Cadastrando..." : "Adicionar jogo"}</button></div></form></DialogContent></Dialog>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <article className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/70 backdrop-blur-md"><div className="flex items-center justify-between border-b border-slate-700/70 px-5 py-4"><div><h2 className="font-bold">Vendas recentes</h2><p className="mt-1 text-sm text-slate-400">Últimos pedidos registrados na loja.</p></div><ShoppingBag className="h-5 w-5 text-cyan-300" /></div><div className="overflow-x-auto"><div className="min-w-[560px]"><div className="grid grid-cols-[1.2fr_1.5fr_110px_90px] gap-3 border-b border-slate-700/70 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500"><span>Cliente</span><span>Itens</span><span>Data</span><span>Total</span></div>{vendas.slice(0, 6).map(venda => <div key={venda.id_venda} className="grid grid-cols-[1.2fr_1.5fr_110px_90px] gap-3 border-b border-slate-800 px-5 py-4 text-sm last:border-0"><div className="truncate font-semibold">{venda.cliente.nome}<p className="mt-1 text-xs font-normal text-slate-500">{venda.forma_pagamento}</p></div><div className="truncate text-slate-300">{venda.itens.map(item => `${item.quantidade}x ${item.jogo.nome}`).join(", ")}</div><span className="text-slate-400">{horaRelativa(venda.data_venda)}</span><span className="font-bold text-orange-300">{moeda(Number(venda.valor_total))}</span></div>)}{vendas.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">Nenhuma venda registrada.</p>}</div></div></article>

          <article className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-5 backdrop-blur-md"><div className="flex items-center justify-between"><div><h2 className="font-bold">Mais vendidos</h2><p className="mt-1 text-sm text-slate-400">Por quantidade de itens.</p></div><Star className="h-5 w-5 text-orange-300" /></div><div className="mt-5 space-y-4">{maisVendidos.map((jogo, index) => <div key={jogo.nome} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{jogo.nome}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(12, (jogo.quantidade / (maisVendidos[0]?.quantidade || 1)) * 100)}%` }} /></div></div><span className="text-xs text-slate-400">{jogo.quantidade} un.</span></div>)}{maisVendidos.length === 0 && <p className="py-6 text-sm text-slate-500">Ainda não há vendas para classificar.</p>}</div></article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-5 backdrop-blur-md"><div className="flex items-center justify-between"><div><h2 className="font-bold">Estoque baixo</h2><p className="mt-1 text-sm text-slate-400">Jogos que precisam de reposição.</p></div><span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-xs font-bold text-orange-300">{estoqueBaixo.length} alertas</span></div><div className="mt-5 space-y-3">{estoqueBaixo.slice(0, 5).map(jogo => <div key={jogo.id_jogo} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/35 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{jogo.nome}</p><p className="mt-1 text-xs text-slate-500">{jogo.plataforma}</p></div><span className="shrink-0 text-sm font-bold text-orange-300">{jogo.estoque} un.</span></div>)}{estoqueBaixo.length === 0 && <p className="py-6 text-sm text-emerald-300">Todos os jogos possuem estoque suficiente.</p>}</div></article>

          <article className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-5 backdrop-blur-md"><div className="flex items-center justify-between"><div><h2 className="font-bold">Avaliações recentes</h2><p className="mt-1 text-sm text-slate-400">Opinião dos clientes sobre os jogos.</p></div><Star className="h-5 w-5 text-yellow-300" /></div><div className="mt-5 space-y-4">{avaliacoes.slice(0, 4).map(avaliacao => <div key={avaliacao.id_avaliacao} className="border-b border-slate-800 pb-3 last:border-0 last:pb-0"><div className="flex justify-between gap-3"><p className="truncate text-sm font-semibold">{avaliacao.jogo.nome}</p><span className="shrink-0 text-sm text-yellow-300">{avaliacao.nota}/5</span></div><p className="mt-1 text-xs text-slate-500">por {avaliacao.cliente.nome} · {dataPtBr(avaliacao.data_avaliacao)}</p>{avaliacao.comentario && <p className="mt-2 line-clamp-2 text-sm text-slate-300">{avaliacao.comentario}</p>}</div>)}{avaliacoes.length === 0 && <p className="py-6 text-sm text-slate-500">Nenhuma avaliação registrada.</p>}</div></article>
        </section>
      </div>
    </main>
  </>
}
