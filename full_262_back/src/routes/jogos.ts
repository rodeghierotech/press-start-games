import { prisma } from "../../lib/prisma"
import { sugerirJogoComGemini } from "../../services/iaServices"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const jogoSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional().nullable(),
  preco: z.coerce.number().positive(),
  estoque: z.coerce.number().int().min(0),
  plataforma: z.string().min(2),
  data_lancamento: z.string().date(),
  id_categoria: z.coerce.number().int(),
})

router.get("/", async (req, res) => {
  try {
    const jogos = await prisma.jogo.findMany({
      include: {
        categoria: true,
        avaliacoes: {
          include: { cliente: { select: { id_cliente: true, nome: true } } },
          orderBy: { data_avaliacao: "desc" },
        },
      },
      orderBy: { nome: "asc" },
    })
    res.status(200).json(jogos)
  } catch {
    res.status(500).json({ erro: "Não foi possível carregar os jogos" })
  }
})

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  try {
    const jogos = await prisma.jogo.findMany({
      include: { categoria: true },
      where: {
        OR: [
          { nome: { contains: termo, mode: "insensitive" } },
          { plataforma: { contains: termo, mode: "insensitive" } },
          { categoria: { nome: { contains: termo, mode: "insensitive" } } },
        ]
      },
      orderBy: { nome: "asc" },
    })
    res.status(200).json(jogos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = jogoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { data_lancamento, ...dadosJogo } = valida.data

  try {
    const jogo = await prisma.jogo.create({
      data: {
        ...dadosJogo,
        data_lancamento: new Date(`${data_lancamento}T00:00:00.000Z`),
      },
      include: { categoria: true },
    })
    res.status(201).json(jogo)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.post("/sugestao-ia", async (req, res) => {
  const schema = z.object({
    preferencia: z.string().trim().min(8).max(500),
  })

  const valida = schema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const jogos = await prisma.jogo.findMany({
      where: { estoque: { gt: 0 } },
      include: { categoria: true },
      orderBy: { nome: "asc" },
    })

    const sugestao = await sugerirJogoComGemini({
      preferencia: valida.data.preferencia,
      jogosDisponiveis: jogos.map(jogo =>
        `${jogo.nome} (${jogo.plataforma}, ${jogo.categoria.nome}): ${jogo.descricao || "sem descricao"}`
      ),
    })

    res.status(200).json({ sugestao })
  } catch (error) {
    res.status(500).json({ erro: "Nao foi possivel consultar a IA", detalhes: error })
  }
})

export default router
