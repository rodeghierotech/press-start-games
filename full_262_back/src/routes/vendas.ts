import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const vendaSchema = z.object({
  id_cliente: z.coerce.number().int(),
  forma_pagamento: z.string().min(2),
  itens: z.array(z.object({
    id_jogo: z.coerce.number().int(),
    quantidade: z.coerce.number().int().positive(),
  })).min(1),
})

router.get("/", async (req, res) => {
  try {
    const vendas = await prisma.venda.findMany({
      include: {
        cliente: true,
        itens: {
          include: { jogo: true },
        },
      },
      orderBy: { data_venda: "desc" },
    })
    res.status(200).json(vendas)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = vendaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const venda = await prisma.$transaction(async (tx) => {
      const jogos = await tx.jogo.findMany({
        where: {
          id_jogo: { in: valida.data.itens.map(item => item.id_jogo) },
        },
      })

      const itens = valida.data.itens.map(item => {
        const jogo = jogos.find(jogoAtual => jogoAtual.id_jogo === item.id_jogo)

        if (!jogo) {
          throw new Error(`Jogo ${item.id_jogo} nao encontrado`)
        }

        if (jogo.estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para ${jogo.nome}`)
        }

        const precoUnitario = Number(jogo.preco)
        const subtotal = precoUnitario * item.quantidade

        return {
          id_jogo: item.id_jogo,
          quantidade: item.quantidade,
          preco_unitario: precoUnitario,
          subtotal,
        }
      })

      const valorTotal = itens.reduce((total, item) => total + item.subtotal, 0)

      const vendaCriada = await tx.venda.create({
        data: {
          id_cliente: valida.data.id_cliente,
          forma_pagamento: valida.data.forma_pagamento,
          valor_total: valorTotal,
          itens: {
            create: itens,
          },
        },
        include: {
          cliente: true,
          itens: { include: { jogo: true } },
        },
      })

      for (const item of itens) {
        await tx.jogo.update({
          where: { id_jogo: item.id_jogo },
          data: { estoque: { decrement: item.quantidade } },
        })
      }

      return vendaCriada
    })

    res.status(201).json(venda)
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Nao foi possivel registrar a venda"
    res.status(400).json({ erro: mensagem })
  }
})

export default router
