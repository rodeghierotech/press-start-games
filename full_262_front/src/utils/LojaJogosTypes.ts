export type ClienteType = {
  id_cliente: number
  nome: string
  email: string
  telefone: string
}

export type CategoriaType = {
  id_categoria: number
  nome: string
}

export type AvaliacaoType = {
  id_avaliacao: number
  nota: number
  comentario?: string | null
  data_avaliacao: string
  cliente: ClienteType
  jogo?: Pick<JogoType, "nome">
  resposta?: RespostaAvaliacaoType | null
}

export type RespostaAvaliacaoType = {
  id_resposta: number
  mensagem: string
  data_resposta: string
  admin: Pick<{ id_admin: number; nome: string }, "id_admin" | "nome">
}

export type JogoType = {
  id_jogo: number
  nome: string
  descricao?: string | null
  preco: number
  estoque: number
  plataforma: string
  data_lancamento: string
  destaque: boolean
  id_categoria: number
  categoria: CategoriaType
  avaliacoes?: AvaliacaoType[]
}

export type ItemVendaType = {
  id_item: number
  quantidade: number
  preco_unitario: number
  subtotal: number
  jogo: JogoType
}

export type VendaType = {
  id_venda: number
  data_venda: string
  valor_total: number
  forma_pagamento: string
  cliente: ClienteType
  itens: ItemVendaType[]
}
