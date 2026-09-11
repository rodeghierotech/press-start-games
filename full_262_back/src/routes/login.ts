import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma"
import { Router } from "express"

const router = Router()

router.post("/", async (req, res) => {
  const { email, senha } = req.body ?? {}
  if (typeof email !== "string" || typeof senha !== "string" || !email.trim() || !senha) {
    res.status(400).json({ erro: "Informe e-mail e senha" })
    return
  }

  try {
    const where = { email: { equals: email.trim(), mode: "insensitive" as const } }
    const admin = await prisma.admin.findFirst({ where })
    const cliente = admin ? null : await prisma.cliente.findFirst({ where })
    const conta = admin ?? cliente
    if (!conta || !await bcrypt.compare(senha, conta.senha)) {
      res.status(401).json({ erro: "Login ou senha incorretos" })
      return
    }

    const chave = process.env.JWT_KEY
    if (!chave) {
      console.error("JWT_KEY nao configurada no backend")
      res.status(500).json({ erro: "Não foi possível iniciar a sessão. Tente novamente mais tarde." })
      return
    }
    const payload = admin
      ? { adminLogadoId: admin.id_admin, adminLogadoNome: admin.nome }
      : { clienteLogadoId: cliente!.id_cliente, clienteLogadoNome: cliente!.nome }
    const token = jwt.sign(payload, chave, { expiresIn: "1h" })
    res.json({
      tipo: admin ? "admin" : "cliente",
      ...(admin ? { id_admin: admin.id_admin } : { id_cliente: cliente!.id_cliente }),
      nome: conta.nome,
      email: conta.email,
      token,
    })
  } catch {
    console.error("Falha ao processar login unificado")
    res.status(500).json({ erro: "Não foi possível realizar o login. Tente novamente mais tarde." })
  }
})

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
