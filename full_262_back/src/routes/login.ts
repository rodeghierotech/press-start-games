import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma"
import { Router } from "express"

const router = Router()

router.post("/admin", async (req, res) => {
  const { email, senha } = req.body
  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const admin = await prisma.admin.findFirst({ where: { email } })

    if (!admin || !bcrypt.compareSync(senha, admin.senha)) {
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    const token = jwt.sign({
      adminLogadoId: admin.id_admin,
      adminLogadoNome: admin.nome
    },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" }
    )

    res.status(200).json({
      id_admin: admin.id_admin,
      nome: admin.nome,
      email: admin.email,
      token
    })
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.post("/cliente", async (req, res) => {
  const { email, senha } = req.body
  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const cliente = await prisma.cliente.findFirst({ where: { email } })

    if (!cliente || !bcrypt.compareSync(senha, cliente.senha)) {
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    const token = jwt.sign({
      clienteLogadoId: cliente.id_cliente,
      clienteLogadoNome: cliente.nome
    },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" }
    )

    res.status(200).json({
      id_cliente: cliente.id_cliente,
      nome: cliente.nome,
      email: cliente.email,
      token
    })
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
