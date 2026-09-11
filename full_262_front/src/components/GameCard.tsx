import { Link } from "react-router-dom"
import type { JogoType } from "../utils/LojaJogosTypes"
import { Badge } from "./ui/badge"
import { Card } from "./ui/card"

type GameCardProps = {
  jogo: JogoType
}

function moeda(valor: number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function GameCard({ jogo }: GameCardProps) {
  return (
    <Link
      to={`/jogos/${jogo.id_jogo}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e86a17] focus-visible:ring-offset-2"
    >
      <Card className="flex min-h-[222px] flex-col p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#f59e42] group-hover:shadow-lg">
        <Badge>
          {jogo.categoria.nome}
        </Badge>
        <h3 className="mt-3 text-lg font-bold leading-tight text-[#171717]">{jogo.nome}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#78716c]">{jogo.descricao}</p>
        <div className="mt-auto flex items-center gap-3 border-t border-[#eee7df] pt-3 text-xs text-[#78716c]">
          <span className="truncate">{jogo.plataforma}</span>
          <span className="h-3 w-px bg-[#d6cfc6]" aria-hidden="true" />
          <span className="shrink-0">Estoque: {jogo.estoque}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xl font-extrabold tracking-tight text-[#e86a17]">{moeda(Number(jogo.preco))}</p>
          <span className="shrink-0 rounded-lg bg-[#e86a17] px-3 py-2 text-xs font-bold text-white transition-colors group-hover:bg-[#c65310]">
            Ver detalhes
          </span>
        </div>
      </Card>
    </Link>
  )
}
