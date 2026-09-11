import { RatingGroup } from "@ark-ui/react/rating-group"
import { StarIcon } from "lucide-react"
import type { FormEvent } from "react"

type RatingGroupProps = {
  value: number
  comentario: string
  onChange: (value: number) => void
  onComentarioChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const ratingLabels = ["Ruim", "Regular", "Bom", "Muito bom", "Excelente"]

export default function GameRating({ value, comentario, onChange, onComentarioChange, onSubmit }: RatingGroupProps) {
  return (
    <form className="mt-5 space-y-5" onSubmit={event => { event.preventDefault(); onSubmit(event) }}>
      <div>
        <RatingGroup.Root count={5} value={value} onValueChange={details => onChange(details.value)}>
          <RatingGroup.Control className="inline-flex gap-1">
            <RatingGroup.Context>
              {({ items }) => items.map(item => (
                <RatingGroup.Item key={item} index={item} className="rounded p-1 text-slate-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:text-slate-500">
                  <RatingGroup.ItemContext>
                    {({ highlighted }) => <StarIcon className={highlighted ? "h-8 w-8 fill-amber-400 text-amber-400" : "h-8 w-8 text-slate-600"} />}
                  </RatingGroup.ItemContext>
                </RatingGroup.Item>
              ))}
            </RatingGroup.Context>
            <RatingGroup.HiddenInput />
          </RatingGroup.Control>
        </RatingGroup.Root>
        {value > 0 && <p className="mt-2 text-sm font-medium text-amber-300">{ratingLabels[value - 1]}</p>}
      </div>
      <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Seu comentário</span><textarea rows={3} value={comentario} onChange={event => onComentarioChange(event.target.value)} placeholder="Conte o que achou do jogo..." className="w-full rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400" /></label>
      <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700">Enviar avaliação</button>
    </form>
  )
}
