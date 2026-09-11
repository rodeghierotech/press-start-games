import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import type { JogoType } from "./utils/LojaJogosTypes"
import GameGrid from "./components/GameGrid"
import GameRecommendation from "./components/GameRecommendation"
import AnimatedSearchBar from "./components/ui/animated-search-bar"
import NoiseBackground from "./components/ui/background-snippets-noise-effect11"

const apiUrl = import.meta.env.VITE_API_URL

async function leLista<T>(response: Response, recurso: string): Promise<T[]> {
  const dados = await response.json()

  if (!response.ok || !Array.isArray(dados)) {
    throw new Error(`Não foi possível carregar ${recurso}`)
  }

  return dados
}

export default function App() {
  const [jogos, setJogos] = useState<JogoType[]>([])
  const [termo, setTermo] = useState("")
  const [preferenciaIa, setPreferenciaIa] = useState("")
  const [sugestaoIa, setSugestaoIa] = useState("")
  const [carregandoIa, setCarregandoIa] = useState(false)

  async function carregaDados() {
    try {
      const resJogos = await fetch(`${apiUrl}/jogos`)
      const listaJogos = await leLista<JogoType>(resJogos, "os jogos")
      setJogos(listaJogos)
    } catch {
      setJogos([])
      toast.error("Não foi possível carregar os dados. Verifique se o backend está em execução.")
    }
  }

  useEffect(() => {
    carregaDados()
  }, [])

  const jogosFiltrados = useMemo(() => {
    const busca = termo.trim().toLowerCase()
    if (!busca) return jogos

    return jogos.filter(jogo =>
      jogo.nome.toLowerCase().includes(busca) ||
      jogo.plataforma.toLowerCase().includes(busca) ||
      jogo.categoria.nome.toLowerCase().includes(busca)
    )
  }, [jogos, termo])

  async function consultaIa() {
    if (preferenciaIa.trim().length < 8) {
      toast.error("Descreva brevemente o tipo de jogo que você procura")
      return
    }

    setSugestaoIa("")
    setCarregandoIa(true)
    try {
      const response = await fetch(`${apiUrl}/jogos/sugestao-ia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferencia: preferenciaIa }),
      })

      const dados = await response.json()
      if (!response.ok) {
        toast.error(dados.erro || "Não foi possível consultar a IA")
        return
      }

      setSugestaoIa(dados.sugestao)
    } catch {
      toast.error("Não foi possível consultar a IA")
    } finally {
      setCarregandoIa(false)
    }
  }

  return (
    <>
    <NoiseBackground />
    <main className="relative z-10 min-h-[calc(100vh-76px)] bg-slate-950/35 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Encontre seu próximo jogo</h1>
          <p className="mt-3 text-base leading-7 text-slate-300">Explore nosso catálogo e descubra novos jogos para jogar.</p>
        </section>

        <section id="catalogo" className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">Catálogo de jogos</h2>
              <p className="mt-1 text-sm text-slate-300">{jogosFiltrados.length} jogos disponíveis</p>
            </div>
            <div className="w-full sm:max-w-md"><AnimatedSearchBar value={termo} onChange={setTermo} /></div>
          </div>
          <div className="mt-5"><GameGrid jogos={jogosFiltrados} /></div>
        </section>

        <div id="recomendacao" className="mt-10"><GameRecommendation value={preferenciaIa} result={sugestaoIa} loading={carregandoIa} onChange={setPreferenciaIa} onSubmit={consultaIa} /></div>
      </div>
    </main>
    </>
  )
}
