import assert from "node:assert/strict"
import { once } from "node:events"
import { after, test } from "node:test"
import express from "express"
import jwt from "jsonwebtoken"

process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test"
process.env.JWT_KEY = "test-secret"

const { prisma } = await import("../lib/prisma.ts")
const { default: jogos } = await import("../src/routes/jogos.ts")
const { default: categorias } = await import("../src/routes/categorias.ts")
const { default: clientes } = await import("../src/routes/clientes.ts")
const { default: avaliacoes } = await import("../src/routes/avaliacoes.ts")
const { default: vendas } = await import("../src/routes/vendas.ts")

const app = express()
app.use(express.json())
app.use("/jogos", jogos)
app.use("/categorias", categorias)
app.use("/clientes", clientes)
app.use("/avaliacoes", avaliacoes)
app.use("/vendas", vendas)
const server = app.listen(0, "127.0.0.1")
await once(server, "listening")
const baseUrl = `http://127.0.0.1:${server.address().port}`

const clienteToken = jwt.sign({ clienteLogadoId: 7, clienteLogadoNome: "Cliente teste" }, process.env.JWT_KEY)
const adminToken = jwt.sign({ adminLogadoId: 3, adminLogadoNome: "Admin teste" }, process.env.JWT_KEY)
const authCliente = { Authorization: `Bearer ${clienteToken}`, "Content-Type": "application/json" }
const authAdmin = { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" }

function replaceMethod(t, target, method, replacement) {
  const original = target[method]
  target[method] = replacement
  t.after(() => { target[method] = original })
}

test("filters games by destaque when requested", async t => {
  replaceMethod(t, prisma.jogo, "findMany", async args => {
    assert.deepEqual(args.where, { destaque: true })
    return []
  })

  const response = await fetch(`${baseUrl}/jogos?destaques=true`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), [])
})

test("requires an administrator token to create a game", async () => {
  const response = await fetch(`${baseUrl}/jogos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Jogo teste", preco: 50, estoque: 1, plataforma: "PC", data_lancamento: "2026-01-01", id_categoria: 1 }),
  })
  assert.equal(response.status, 401)
})

test("requires an administrator token to create a category", async () => {
  const response = await fetch(`${baseUrl}/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "Estratégia" }),
  })
  assert.equal(response.status, 401)
})

test("does not expose internal errors when listing public categories", async t => {
  replaceMethod(t, prisma.categoria, "findMany", async () => {
    throw new Error("database password should stay private")
  })

  const response = await fetch(`${baseUrl}/categorias`)
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { erro: "Não foi possível listar as categorias" })
})

test("creates a sale using the customer from the token instead of a body id", async t => {
  let vendaCriada
  replaceMethod(t, prisma, "$transaction", async callback => callback({
    jogo: {
      findMany: async () => [{ id_jogo: 1, nome: "Jogo teste", estoque: 2, preco: 10 }],
      update: async () => ({}),
    },
    venda: {
      create: async args => {
        vendaCriada = args.data
        return { ...args.data, cliente: { id_cliente: 7, nome: "Cliente teste", email: "teste@example.com", telefone: "12345678" }, itens: [] }
      },
    },
  }))

  const response = await fetch(`${baseUrl}/vendas`, {
    method: "POST",
    headers: authCliente,
    body: JSON.stringify({ id_cliente: 999, forma_pagamento: "PIX", itens: [{ id_jogo: 1, quantidade: 1 }] }),
  })
  assert.equal(response.status, 201)
  assert.equal(vendaCriada.id_cliente, 7)
})

test("allows an administrator to answer an evaluation", async t => {
  replaceMethod(t, prisma.avaliacao, "findUnique", async () => ({ id_avaliacao: 4 }))
  replaceMethod(t, prisma.respostaAvaliacao, "upsert", async args => {
    assert.equal(args.create.id_admin, 3)
    assert.equal(args.create.mensagem, "Obrigado pelo retorno")
    return { id_resposta: 1, mensagem: args.create.mensagem, id_avaliacao: 4, id_admin: 3, admin: { nome: "Admin teste" } }
  })

  const response = await fetch(`${baseUrl}/avaliacoes/4/resposta`, {
    method: "POST",
    headers: authAdmin,
    body: JSON.stringify({ mensagem: "Obrigado pelo retorno" }),
  })
  assert.equal(response.status, 201)
})

test("returns interactions only for the customer represented by the token", async t => {
  replaceMethod(t, prisma.cliente, "findUnique", async args => {
    assert.deepEqual(args.where, { id_cliente: 7 })
    return { id_cliente: 7, nome: "Cliente teste", vendas: [], avaliacoes: [] }
  })

  const response = await fetch(`${baseUrl}/clientes/me/interacoes`, { headers: authCliente })
  assert.equal(response.status, 200)
  assert.equal((await response.json()).id_cliente, 7)
})

after(async () => {
  server.closeAllConnections()
  await new Promise(resolve => server.close(resolve))
  await prisma.$disconnect()
})
