import bcrypt from "bcrypt"
import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const clienteSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve possuir, no minimo, 3 caracteres" }),
  email: z.string().email({ message: "Informe um e-mail valido" }),
  telefone: z.string().min(8, { message: "Telefone deve possuir, no minimo, 8 caracteres" }),
  senha: z.string().min(6, { message: "Senha deve possuir, no minimo, 6 caracteres" }),
})

router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id_cliente: true,
        nome: true,
        email: true,
        telefone: true,
      },
      orderBy: { nome: "asc" },
    })
    res.status(200).json(clientes)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = clienteSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, email, telefone, senha } = valida.data
  const hash = bcrypt.hashSync(senha, 12)

  try {
    const cliente = await prisma.cliente.create({
      data: { nome, email, telefone, senha: hash },
      select: {
        id_cliente: true,
        nome: true,
        email: true,
        telefone: true,
      }
    })
    res.status(201).json(cliente)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
