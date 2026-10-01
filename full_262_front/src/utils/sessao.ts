export type SessaoCliente = {
  id_cliente: number
  nome: string
  email: string
  token: string
  sessao_id?: string
}

export type SessaoAdmin = {
  id_admin: number
  nome: string
  email: string
  token: string
}

function leSessao<T>(chave: string): T | null {
  const valor = localStorage.getItem(chave) || sessionStorage.getItem(chave)
  if (!valor) return null

  try {
    return JSON.parse(valor) as T
  } catch {
    return null
  }
}

export function sessaoCliente() {
  return leSessao<SessaoCliente>("press-start-cliente")
}

export function sessaoAdmin() {
  return leSessao<SessaoAdmin>("press-start-admin")
}

export function cabecalhoAutorizacao(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {}
}
