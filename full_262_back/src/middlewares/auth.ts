import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export type UsuarioAutenticado = {
  tipo: "admin" | "cliente"
  id: number
  nome: string
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado
    }
  }
}

function usuarioDoPayload(payload: jwt.JwtPayload | string): UsuarioAutenticado | null {
  if (typeof payload === "string") return null

  if (typeof payload.adminLogadoId === "number" && typeof payload.adminLogadoNome === "string") {
    return { tipo: "admin", id: payload.adminLogadoId, nome: payload.adminLogadoNome }
  }

  if (typeof payload.clienteLogadoId === "number" && typeof payload.clienteLogadoNome === "string") {
    return { tipo: "cliente", id: payload.clienteLogadoId, nome: payload.clienteLogadoNome }
  }

  return null
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const [tipo, token] = req.header("Authorization")?.split(" ") || []
  const chave = process.env.JWT_KEY

  if (tipo !== "Bearer" || !token || !chave) {
    res.status(401).json({ erro: "Sessão inválida ou expirada" })
    return
  }

  try {
    const usuario = usuarioDoPayload(jwt.verify(token, chave))
    if (!usuario) {
      res.status(401).json({ erro: "Sessão inválida ou expirada" })
      return
    }

    req.usuario = usuario
    next()
  } catch {
    res.status(401).json({ erro: "Sessão inválida ou expirada" })
  }
}

function exigirTipo(tipo: UsuarioAutenticado["tipo"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.usuario?.tipo !== tipo) {
      res.status(403).json({ erro: "Você não tem permissão para esta ação" })
      return
    }

    next()
  }
}

export const exigirAdmin = exigirTipo("admin")
export const exigirCliente = exigirTipo("cliente")
