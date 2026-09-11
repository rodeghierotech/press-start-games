import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const categoriaSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve possuir, no minimo, 2 caracteres" }),
})

router.get("/", async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: { jogos: true },
      orderBy: { nome: "asc" },
    })
    res.status(200).json(categorias)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = categoriaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const categoria = await prisma.categoria.create({ data: valida.data })
    res.status(201).json(categoria)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
