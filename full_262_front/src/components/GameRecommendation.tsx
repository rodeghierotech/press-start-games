import playerOnePet from "../assets/player-one-pet.png"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

type GameRecommendationProps = {
  value: string
  result: string
  loading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export default function GameRecommendation({ value, result, loading, onChange, onSubmit }: GameRecommendationProps) {
  return (
    <section className="relative mx-auto w-full overflow-hidden rounded-2xl border border-orange-300/30 bg-[#14213d]/95 p-5 shadow-[0_18px_50px_rgba(232,106,23,0.12)] backdrop-blur-md sm:p-7">
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_210px] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f59e42]"><span className="h-2 w-2 rounded-full bg-[#e86a17] shadow-[0_0_12px_rgba(232,106,23,0.9)]" aria-hidden="true" />Player One recomenda</div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Não sabe o que jogar?</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Conte o que você está procurando e deixe o Player One encontrar uma opção do nosso catálogo.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Descreva o jogo que você procura</span>
              <Textarea
                className="h-24 min-h-24 max-h-24"
                placeholder="Ex.: quero um jogo de mundo aberto com uma história boa"
                value={value}
                onChange={event => onChange(event.target.value)}
              />
            </label>
            <Button onClick={onSubmit} disabled={loading} className="h-fit self-center px-5 py-3 shadow-lg shadow-orange-950/30 sm:min-w-36">
              {loading ? "Pensando..." : "Encontrar jogo"}
            </Button>
          </div>
          {loading && <p className="mt-4 border-l-2 border-[#f59e42] bg-[#0f4c5c]/70 px-4 py-3 text-sm leading-6 text-white">O Player One está pensando...</p>}
          {result && !loading && <div className="mt-4 border-l-2 border-[#f59e42] bg-[#0f4c5c]/70 px-4 py-3 text-sm leading-6 text-white"><p className="mb-2 font-bold text-[#f59e42]">Recomendação do Player One:</p><p>{result}</p></div>}
        </div>
        <div className="relative order-first flex items-center justify-center lg:order-last">
          <img src={playerOnePet} alt="Mascote do Player One" loading="lazy" className="relative h-44 w-44 object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.45)] sm:h-52 sm:w-52" />
        </div>
      </div>
    </section>
  )
}
