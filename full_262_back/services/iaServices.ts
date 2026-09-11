import { GoogleGenAI } from "@google/genai"

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null

type SugestaoJogoParams = {
  preferencia: string
  jogosDisponiveis: string[]
}

export async function sugerirJogoComGemini(params: SugestaoJogoParams) {
  if (!ai) {
    throw new Error("Configure a variavel GEMINI_API_KEY no arquivo .env")
  }

  const resposta = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `
Voce auxilia clientes de uma loja de jogos.
O cliente descreveu o que deseja jogar: "${params.preferencia}".

Jogos disponiveis: ${params.jogosDisponiveis.join(", ")}

Indique de um a tres jogos exclusivamente da lista disponivel que combinam com o pedido.
Explique brevemente o motivo de cada indicacao.
Responda em portugues do Brasil, de forma objetiva e sem inventar jogos fora da lista.
`,
  })

  return resposta.text || "Nao foi possivel gerar uma sugestao no momento."
}
