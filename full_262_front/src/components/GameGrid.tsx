import type { JogoType } from "../utils/LojaJogosTypes"
import GameCard from "./GameCard"
import { Card } from "./ui/card"

type GameGridProps = {
  jogos: JogoType[]
}

export default function GameGrid({ jogos }: GameGridProps) {
  if (jogos.length === 0) {
    return (
      <Card className="border-dashed bg-white/80 px-6 py-14 text-center">
        <p className="font-semibold text-[#171717]">Nenhum jogo encontrado</p>
        <p className="mt-1 text-sm text-[#78716c]">Tente buscar por outro nome, plataforma ou categoria.</p>
      </Card>
    )
  }

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{jogos.map(jogo => <GameCard key={jogo.id_jogo} jogo={jogo} />)}</div>
}
