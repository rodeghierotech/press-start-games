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
        cliente: { select: { id_cliente: true, nome: true } },
        jogo: true,
      },
      orderBy: { data_avaliacao: "desc" },
    })
    res.status(200).json(avaliacoes)
  } catch {
    res.status(500).json({ erro: "Não foi possível carregar as avaliações" })
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
        cliente: { select: { id_cliente: true, nome: true } },
        jogo: true,
      },
    })
    res.status(201).json(avaliacao)
  } catch {
    res.status(400).json({ erro: "Não foi possível registrar a avaliação" })
  }
})

export default router
