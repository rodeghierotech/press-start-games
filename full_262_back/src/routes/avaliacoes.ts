import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const avaliacaoSchema = z.object({
  nota: z.coerce.number().int().min(1).max(5),
  comentario: z.string().optional().nullable(),
  id_cliente: z.coerce.number().int(),
  id_jogo: z.coerce.number().int(),
})

router.get("/", async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      include: {
        cliente: true,
        jogo: true,
      },
      orderBy: { data_avaliacao: "desc" },
    })
    res.status(200).json(avaliacoes)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = avaliacaoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const avaliacao = await prisma.avaliacao.create({
      data: valida.data,
      include: {
        cliente: true,
        jogo: true,
      },
    })
    res.status(201).json(avaliacao)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
