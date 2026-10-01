import { prisma } from "../../lib/prisma"
import { autenticar, exigirAdmin } from "../middlewares/auth"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const categoriaSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve possuir, no minimo, 2 caracteres" }),
})

router.get("/", async (_req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: { jogos: true },
      orderBy: { nome: "asc" },
    })
    res.status(200).json(categorias)
  } catch {
    res.status(500).json({ erro: "Não foi possível listar as categorias" })
  }
})

router.post("/", autenticar, exigirAdmin, async (req, res) => {
  const valida = categoriaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const categoria = await prisma.categoria.create({ data: valida.data })
    res.status(201).json(categoria)
  } catch {
    res.status(400).json({ erro: "Não foi possível cadastrar a categoria" })
  }
})

export default router
