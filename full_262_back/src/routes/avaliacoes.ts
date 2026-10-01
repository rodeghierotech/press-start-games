import { prisma } from "../../lib/prisma"
import { autenticar, exigirAdmin, exigirCliente } from "../middlewares/auth"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const avaliacaoSchema = z.object({
  nota: z.coerce.number().int().min(1).max(5),
  comentario: z.string().optional().nullable(),
  id_jogo: z.coerce.number().int(),
})

const respostaSchema = z.object({
  mensagem: z.string().trim().min(2).max(1000),
})

router.get("/", autenticar, exigirAdmin, async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      include: {
        cliente: { select: { id_cliente: true, nome: true } },
        jogo: true,
        resposta: { include: { admin: { select: { id_admin: true, nome: true } } } },
      },
      orderBy: { data_avaliacao: "desc" },
    })
    res.status(200).json(avaliacoes)
  } catch {
    res.status(500).json({ erro: "Não foi possível carregar as avaliações" })
  }
})

router.post("/", autenticar, exigirCliente, async (req, res) => {
  const valida = avaliacaoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const avaliacao = await prisma.avaliacao.create({
      data: { ...valida.data, id_cliente: req.usuario!.id },
      include: {
        cliente: { select: { id_cliente: true, nome: true } },
        jogo: true,
        resposta: { include: { admin: { select: { id_admin: true, nome: true } } } },
      },
    })
    res.status(201).json(avaliacao)
  } catch {
    res.status(400).json({ erro: "Não foi possível registrar a avaliação" })
  }
})

router.post("/:id_avaliacao/resposta", autenticar, exigirAdmin, async (req, res) => {
  const idAvaliacao = Number(req.params.id_avaliacao)
  const valida = respostaSchema.safeParse(req.body)

  if (!Number.isInteger(idAvaliacao) || !valida.success) {
    res.status(400).json({ erro: "Dados da resposta inválidos" })
    return
  }

  try {
    const avaliacao = await prisma.avaliacao.findUnique({ where: { id_avaliacao: idAvaliacao } })
    if (!avaliacao) {
      res.status(404).json({ erro: "Avaliação não encontrada" })
      return
    }

    const resposta = await prisma.respostaAvaliacao.upsert({
      where: { id_avaliacao: idAvaliacao },
      create: {
        id_avaliacao: idAvaliacao,
        id_admin: req.usuario!.id,
        mensagem: valida.data.mensagem,
      },
      update: {
        id_admin: req.usuario!.id,
        mensagem: valida.data.mensagem,
        data_resposta: new Date(),
      },
      include: { admin: { select: { id_admin: true, nome: true } } },
    })

    res.status(201).json(resposta)
  } catch {
    res.status(500).json({ erro: "Não foi possível registrar a resposta" })
  }
})

export default router
